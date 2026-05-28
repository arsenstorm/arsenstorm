import handler from "@tanstack/react-start/server-entry";
import { fallback, link, main, top } from "#/lib/render";
import type { Contribution, GitHubResponse, Stats, Year } from "#/lib/types";
import { USERNAME } from "#/lib/variables";
import { formatWeatherCondition, type WeatherSnapshot } from "#/lib/weather";

export type Env = CloudflareBindings;

const MAX_YEARS = 3;
const START_DATE = new Date("2012-09-07T04:00:00.000Z");
const WEATHER_REFRESH_CRON = "0 * * * *";
const GITHUB_STATS_REFRESH_CRON = "0 */6 * * *";
const WEATHERKIT_ENDPOINT =
	"https://weatherkit.apple.com/api/v1/weather/en-GB/51.5074/-0.1278";
const WEATHERKIT_LEGAL_ATTRIBUTION_URL =
	"https://weatherkit.apple.com/legal-attribution.html";
const WEATHER_CACHE_KEY = "weather:london";

const SVG_HEADERS = {
	"content-type": "image/svg+xml",
	"cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
	pragma: "no-cache",
	expires: "0",
};
const JSON_HEADERS = {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "public, max-age=300, stale-while-revalidate=3600",
};
const UNAVAILABLE_JSON_HEADERS = {
	"content-type": "application/json; charset=utf-8",
	"cache-control": "no-store",
};
const BASE64_URL_PADDING_REGEX = /=+$/;
const PEM_PRIVATE_KEY_END_REGEX = /-----END PRIVATE KEY-----/g;
const PEM_PRIVATE_KEY_START_REGEX = /-----BEGIN PRIVATE KEY-----/g;
const WHITESPACE_REGEX = /\s/g;

type JsonRecord = Record<string, unknown>;

interface AppleCredentials {
	keyId: string;
	privateKey: string;
	serviceId: string;
	teamId: string;
}

function levelToInt(level: Contribution["contributionLevel"]): number {
	switch (level) {
		case "NONE":
			return 0;
		case "FIRST_QUARTILE":
			return 1;
		case "SECOND_QUARTILE":
			return 2;
		case "THIRD_QUARTILE":
			return 3;
		case "FOURTH_QUARTILE":
			return 4;
		default:
			return 0;
	}
}

async function fetchContributions(
	token: string,
	from: Date,
	to: Date
): Promise<{
	weeks: GitHubResponse["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"];
	contributions: number;
}> {
	const body = {
		query: `query ($username: String!, $from: DateTime, $to: DateTime) {
			user(login: $username) {
				contributionsCollection(from: $from, to: $to) {
					contributionCalendar {
						totalContributions
						weeks {
							contributionDays {
								contributionCount
								date
								contributionLevel
							}
						}
					}
				}
			}
		}`,
		variables: {
			username: USERNAME,
			from: from.toISOString(),
			to: to.toISOString(),
		},
	};

	const response = await fetch("https://api.github.com/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": `${USERNAME}/readme`,
			Authorization: `bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	const json = (await response.json()) as GitHubResponse;
	const calendar = json.data.user.contributionsCollection.contributionCalendar;
	return { weeks: calendar.weeks, contributions: calendar.totalContributions };
}

async function getAllContributions(
	token: string,
	start: Date,
	end: Date = new Date()
): Promise<[Year[], number]> {
	const years: Year[] = [];
	let cursor = start;
	let totalContributions = 0;

	while (cursor < end) {
		let next = new Date(cursor.getFullYear() + 1, 0, 1);
		if (next > end) {
			next = end;
		}

		const data = await fetchContributions(token, cursor, next);
		totalContributions += data.contributions;
		years.push({
			from: cursor.toISOString(),
			to: next.toISOString(),
			days: data.weeks
				.flatMap((week) =>
					week.contributionDays.map((day) => levelToInt(day.contributionLevel))
				)
				.reverse(),
		});
		cursor = next;
	}

	return [years.reverse(), totalContributions];
}

function asRecord(value: unknown, name: string): JsonRecord {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error(`${name} was missing from the WeatherKit response.`);
	}

	return value as JsonRecord;
}

function readNumber(record: JsonRecord, key: string, name: string): number {
	const value = record[key];
	if (typeof value !== "number" || Number.isNaN(value)) {
		throw new Error(`${name}.${key} was missing from the WeatherKit response.`);
	}

	return value;
}

function readString(record: JsonRecord, key: string, name: string): string {
	const value = record[key];
	if (typeof value !== "string" || value.length === 0) {
		throw new Error(`${name}.${key} was missing from the WeatherKit response.`);
	}

	return value;
}

function readRecord(record: JsonRecord, key: string, name: string): JsonRecord {
	return asRecord(record[key], `${name}.${key}`);
}

function readFirstRecord(
	record: JsonRecord,
	key: string,
	name: string
): JsonRecord {
	const value = record[key];
	if (!Array.isArray(value) || value.length === 0) {
		throw new Error(`${name}.${key} was missing from the WeatherKit response.`);
	}

	return asRecord(value[0], `${name}.${key}[0]`);
}

function getAppleCredentials(env: Env): AppleCredentials {
	return {
		keyId: env.APPLE_KEY_ID,
		privateKey: env.APPLE_PRIVATE_KEY,
		serviceId: env.APPLE_SERVICE_ID,
		teamId: env.APPLE_TEAM_ID,
	};
}

function privateKeyToArrayBuffer(privateKey: string): ArrayBuffer {
	const base64 = privateKey
		.replaceAll("\\n", "\n")
		.replace(PEM_PRIVATE_KEY_START_REGEX, "")
		.replace(PEM_PRIVATE_KEY_END_REGEX, "")
		.replace(WHITESPACE_REGEX, "");
	const bytes = Uint8Array.from(atob(base64), (character) =>
		character.charCodeAt(0)
	);

	return bytes.buffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}

	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(BASE64_URL_PADDING_REGEX, "");
}

function base64UrlEncodeJson(value: JsonRecord): string {
	return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
}

function normalizeP256Signature(signature: Uint8Array): Uint8Array {
	if (signature.byteLength === 64) {
		return signature;
	}

	if (signature[0] !== 0x30) {
		throw new Error("Unexpected ECDSA signature format.");
	}

	let offset = 2;
	if (signature[1] === 0x81) {
		offset = 3;
	}

	if (signature[offset] !== 0x02) {
		throw new Error("Unexpected ECDSA signature format.");
	}
	const rLength = signature[offset + 1];
	const rStart = offset + 2;
	const rEnd = rStart + rLength;

	if (signature[rEnd] !== 0x02) {
		throw new Error("Unexpected ECDSA signature format.");
	}
	const sLength = signature[rEnd + 1];
	const sStart = rEnd + 2;
	const sEnd = sStart + sLength;

	const r = signature.slice(rStart, rEnd);
	const s = signature.slice(sStart, sEnd);
	const raw = new Uint8Array(64);
	raw.set(r.slice(-32), 32 - Math.min(r.byteLength, 32));
	raw.set(s.slice(-32), 64 - Math.min(s.byteLength, 32));

	return raw;
}

async function signApplePayload(
	payload: string,
	privateKey: string
): Promise<string> {
	const key = await crypto.subtle.importKey(
		"pkcs8",
		privateKeyToArrayBuffer(privateKey),
		{ name: "ECDSA", namedCurve: "P-256" },
		false,
		["sign"]
	);
	const signature = await crypto.subtle.sign(
		{ hash: "SHA-256", name: "ECDSA" },
		key,
		new TextEncoder().encode(payload)
	);

	return base64UrlEncode(normalizeP256Signature(new Uint8Array(signature)));
}

async function createWeatherKitToken(
	credentials: AppleCredentials
): Promise<string> {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + 30 * 60;
	const fullServiceId = `${credentials.teamId}.${credentials.serviceId}`;
	const header = base64UrlEncodeJson({
		alg: "ES256",
		kid: credentials.keyId,
		id: fullServiceId,
	});
	const payload = base64UrlEncodeJson({
		iss: credentials.teamId,
		iat: issuedAt,
		exp: expiresAt,
		sub: credentials.serviceId,
	});
	const unsignedToken = `${header}.${payload}`;
	const signature = await signApplePayload(
		unsignedToken,
		credentials.privateKey
	);

	return `${unsignedToken}.${signature}`;
}

function createWeatherSnapshot(
	value: unknown,
	fetchedAt: string
): WeatherSnapshot {
	const weather = asRecord(value, "WeatherKit response");
	const currentWeather = readRecord(
		weather,
		"currentWeather",
		"WeatherKit response"
	);
	const forecastDaily = readRecord(
		weather,
		"forecastDaily",
		"WeatherKit response"
	);
	const today = readFirstRecord(forecastDaily, "days", "forecastDaily");
	const currentMetadata = readRecord(
		currentWeather,
		"metadata",
		"weather.currentWeather"
	);
	const attributionValue = currentMetadata.attributionURL;
	const attributionUrl =
		typeof attributionValue === "string" && attributionValue.length > 0
			? attributionValue
			: WEATHERKIT_LEGAL_ATTRIBUTION_URL;
	const conditionCode = readString(
		currentWeather,
		"conditionCode",
		"weather.currentWeather"
	);

	return {
		location: "London",
		current: {
			asOf: readString(currentWeather, "asOf", "weather.currentWeather"),
			condition: formatWeatherCondition(conditionCode),
			conditionCode,
			temperatureCelsius: readNumber(
				currentWeather,
				"temperature",
				"weather.currentWeather"
			),
		},
		daily: {
			highCelsius: readNumber(
				today,
				"temperatureMax",
				"weather.forecastDaily.days[0]"
			),
			lowCelsius: readNumber(
				today,
				"temperatureMin",
				"weather.forecastDaily.days[0]"
			),
		},
		attributionUrl,
		fetchedAt,
		sun: {
			sunrise: readString(today, "sunrise", "weather.forecastDaily.days[0]"),
			sunset: readString(today, "sunset", "weather.forecastDaily.days[0]"),
		},
	};
}

async function fetchWeatherSnapshot(env: Env): Promise<WeatherSnapshot> {
	const token = await createWeatherKitToken(getAppleCredentials(env));
	const params = new URLSearchParams({
		countryCode: "GB",
		dataSets: "currentWeather,forecastDaily",
		timezone: "Europe/London",
	});
	const response = await fetch(`${WEATHERKIT_ENDPOINT}?${params.toString()}`, {
		headers: {
			accept: "application/json",
			authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`WeatherKit returned ${response.status}: ${body.slice(0, 200)}`
		);
	}

	return createWeatherSnapshot(await response.json(), new Date().toISOString());
}

async function refreshWeather(env: Env): Promise<void> {
	const weather = await fetchWeatherSnapshot(env);
	await env.STATS.put(WEATHER_CACHE_KEY, JSON.stringify(weather));
}

async function refreshGitHubStats(env: Env): Promise<void> {
	const [years, contributions] = await getAllContributions(
		env.GITHUB_TOKEN,
		START_DATE
	);

	const stats: Stats = { years, contributions };
	await env.STATS.put("stats", JSON.stringify(stats));
}

async function getLocalWeatherSnapshot(
	request: Request
): Promise<Response | null> {
	const url = new URL("/weather/london.json", request.url);
	const response = await fetch(url);
	if (!response.ok) {
		return null;
	}

	return new Response(response.body, { headers: JSON_HEADERS });
}

function isLocalRequest(request: Request): boolean {
	const hostname = new URL(request.url).hostname;
	return hostname === "localhost" || hostname === "127.0.0.1";
}

function weatherErrorResponse(error: unknown, request: Request): Response {
	const message =
		isLocalRequest(request) && error instanceof Error
			? error.message
			: "Unable to fetch weather.";

	return new Response(JSON.stringify({ error: message }), {
		headers: UNAVAILABLE_JSON_HEADERS,
		status: 503,
	});
}

async function handleWeather(request: Request, env: Env): Promise<Response> {
	const raw = await env.STATS.get(WEATHER_CACHE_KEY);
	if (raw) {
		return new Response(raw, { headers: JSON_HEADERS });
	}

	try {
		const weather = await fetchWeatherSnapshot(env);
		const body = JSON.stringify(weather);
		await env.STATS.put(WEATHER_CACHE_KEY, body);

		return new Response(body, { headers: JSON_HEADERS });
	} catch (error) {
		if (isLocalRequest(request)) {
			const localWeather = await getLocalWeatherSnapshot(request);
			if (localWeather) {
				return localWeather;
			}
		}

		return weatherErrorResponse(error, request);
	}
}

function noData(theme: "light" | "dark"): Response {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="60" fill="none">
		<rect width="420" height="60" rx="6" fill="${theme === "dark" ? "#161b22" : "#ebedf0"}"/>
		<text x="210" y="34" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif"
			font-size="13" fill="${theme === "dark" ? "#fff" : "#000"}" opacity="0.5">
			Stats not yet available — cron hasn't run.
		</text>
	</svg>`;
	return new Response(svg, { headers: SVG_HEADERS });
}

async function handleSvg(request: Request, env: Env): Promise<Response> {
	const { searchParams } = new URL(request.url);
	const theme = (searchParams.get("theme") ?? "light") as "light" | "dark";
	const section = searchParams.get("section") ?? "";

	let data: Stats | null = null;
	try {
		const raw = await env.STATS.get("stats");
		data = raw ? (JSON.parse(raw) as Stats) : null;
	} catch {
		return noData(theme);
	}

	if (!data) {
		return noData(theme);
	}

	let content: string;

	if (section === "top") {
		content = top({ height: 20, contributions: data.contributions, theme });
	} else if (section === "link-website") {
		const index = Number(searchParams.get("i"));
		content = link({ height: 18, width: 100, index, theme })("Website");
	} else if (section === "link-twitter") {
		const index = Number(searchParams.get("i"));
		content = link({ height: 18, width: 100, index, theme })("Twitter");
	} else if (section === "link-instagram") {
		const index = Number(searchParams.get("i"));
		content = link({ height: 18, width: 100, index, theme })("Instagram");
	} else if (section === "fallback") {
		content = fallback({ height: 180, width: 420, theme });
	} else {
		const years = data.years.slice(0, MAX_YEARS);
		const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
		const location = {
			city: cf?.city ?? "",
			country: cf?.country ?? "",
		};
		const options = {
			dots: { rows: 6, size: 24, gap: 5 },
			year: { gap: 5 },
		};

		const sizes = years.map((year) => {
			const columns = Math.ceil(year.days.length / options.dots.rows);
			const width =
				columns * options.dots.size + (columns - 1) * options.dots.gap;
			const height =
				options.dots.rows * options.dots.size +
				(options.dots.rows - 1) * options.dots.gap;
			return [width, height];
		});

		const length =
			sizes.reduce((acc, size) => acc + (size[0] ?? 0) + options.year.gap, 0) -
			options.year.gap;

		content = main({
			height: 290,
			years,
			sizes,
			length,
			location,
			theme,
			...options,
		});
	}

	return new Response(content, { headers: SVG_HEADERS });
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		if (url.pathname === "/readme") {
			return await handleSvg(request, env);
		}

		if (url.pathname === "/api/weather") {
			return await handleWeather(request, env);
		}

		const assetResponse = await env.ASSETS.fetch(request);
		if (assetResponse.status !== 404) {
			return assetResponse;
		}

		return await handler.fetch(request);
	},

	async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
		switch (event.cron) {
			case WEATHER_REFRESH_CRON:
				await refreshWeather(env);
				return;
			case GITHUB_STATS_REFRESH_CRON:
				await refreshGitHubStats(env);
				return;
			default:
				throw new Error(`Unexpected scheduled cron: ${event.cron}`);
		}
	},
};
