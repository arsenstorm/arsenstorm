import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import process, { env, stderr, stdout } from "node:process";
import { fileURLToPath } from "node:url";
import { formatWeatherCondition, type WeatherSnapshot } from "#/lib/weather";

const WEATHERKIT_ENDPOINT =
	"https://weatherkit.apple.com/api/v1/weather/en-GB/51.5074/-0.1278";
const WEATHERKIT_LEGAL_ATTRIBUTION_URL =
	"https://weatherkit.apple.com/legal-attribution.html";
const WEATHER_OUTPUT_DIRECTORY = fileURLToPath(
	new URL("../public/weather/", import.meta.url)
);
const WEATHER_OUTPUT_PATH = fileURLToPath(
	new URL("../public/weather/london.json", import.meta.url)
);
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

function getRequiredEnvironmentVariable(name: string): string {
	const value = env[name];
	if (!value) {
		throw new Error(`${name} is required to generate Apple Weather snapshots.`);
	}

	return value;
}

function getAppleCredentials(): AppleCredentials {
	return {
		keyId: getRequiredEnvironmentVariable("APPLE_KEY_ID"),
		privateKey: getRequiredEnvironmentVariable("APPLE_PRIVATE_KEY"),
		serviceId: getRequiredEnvironmentVariable("APPLE_SERVICE_ID"),
		teamId: getRequiredEnvironmentVariable("APPLE_TEAM_ID"),
	};
}

function privateKeyToArrayBuffer(privateKey: string): ArrayBuffer {
	const base64 = privateKey
		.replaceAll("\\n", "\n")
		.replace(PEM_PRIVATE_KEY_START_REGEX, "")
		.replace(PEM_PRIVATE_KEY_END_REGEX, "")
		.replace(WHITESPACE_REGEX, "");
	const bytes = Buffer.from(base64, "base64");

	return Uint8Array.from(bytes).buffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
	return Buffer.from(bytes)
		.toString("base64")
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(BASE64_URL_PADDING_REGEX, "");
}

function base64UrlEncodeJson(value: JsonRecord): string {
	return base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
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

	return base64UrlEncode(new Uint8Array(signature));
}

async function createWeatherKitToken(
	credentials: AppleCredentials
): Promise<string> {
	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + 30 * 60;
	const fullServiceId = `${credentials.teamId}.${credentials.serviceId}`;
	const header = base64UrlEncodeJson({
		alg: "ES256",
		id: fullServiceId,
		kid: credentials.keyId,
	});
	const payload = base64UrlEncodeJson({
		exp: expiresAt,
		iat: issuedAt,
		iss: credentials.teamId,
		sub: credentials.serviceId,
	});
	const unsignedToken = `${header}.${payload}`;
	const signature = await signApplePayload(
		unsignedToken,
		credentials.privateKey
	);

	return `${unsignedToken}.${signature}`;
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
		"currentWeather"
	);
	const attributionValue = currentMetadata.attributionURL;
	const attributionUrl =
		typeof attributionValue === "string" && attributionValue.length > 0
			? attributionValue
			: WEATHERKIT_LEGAL_ATTRIBUTION_URL;
	const conditionCode = readString(
		currentWeather,
		"conditionCode",
		"currentWeather"
	);

	return {
		attributionUrl,
		current: {
			asOf: readString(currentWeather, "asOf", "currentWeather"),
			condition: formatWeatherCondition(conditionCode),
			conditionCode,
			temperatureCelsius: readNumber(
				currentWeather,
				"temperature",
				"currentWeather"
			),
		},
		daily: {
			highCelsius: readNumber(today, "temperatureMax", "forecastDaily.days[0]"),
			lowCelsius: readNumber(today, "temperatureMin", "forecastDaily.days[0]"),
		},
		fetchedAt,
		location: "London",
		sun: {
			sunrise: readString(today, "sunrise", "forecastDaily.days[0]"),
			sunset: readString(today, "sunset", "forecastDaily.days[0]"),
		},
	};
}

async function fetchWeatherSnapshot(): Promise<WeatherSnapshot> {
	const token = await createWeatherKitToken(getAppleCredentials());
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

async function main(): Promise<void> {
	const weather = await fetchWeatherSnapshot();
	await mkdir(WEATHER_OUTPUT_DIRECTORY, { recursive: true });
	await writeFile(WEATHER_OUTPUT_PATH, JSON.stringify(weather, null, 2));
	stdout.write(`Generated ${relative(process.cwd(), WEATHER_OUTPUT_PATH)}\n`);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : "Unknown error";
	stderr.write(`${message}\n`);
	process.exitCode = 1;
});
