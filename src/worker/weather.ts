import type { WeatherSnapshot } from "#/lib/weather";
import {
	type Env,
	isLocalRequest,
	JSON_HEADERS,
	MINUTE_MS,
	UNAVAILABLE_JSON_HEADERS,
} from "./types";
import { createWeatherSnapshot } from "./weather-parser";
import { createWeatherKitToken } from "./weather-token";

const WEATHERKIT_ENDPOINT =
	"https://weatherkit.apple.com/api/v1/weather/en-GB/51.5074/-0.1278";
const WEATHER_CACHE_MAX_AGE_MS = 90 * MINUTE_MS;
const WEATHER_CACHE_KEY = "weather:london";

async function fetchWeatherSnapshot(env: Env): Promise<WeatherSnapshot> {
	const token = await createWeatherKitToken(env);
	const params = new URLSearchParams({
		countryCode: "GB",
		dataSets: "currentWeather,forecastDaily",
		timezone: "Europe/London",
	});
	const response = await fetch(`${WEATHERKIT_ENDPOINT}?${params.toString()}`, {
		headers: { accept: "application/json", authorization: `Bearer ${token}` },
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`WeatherKit returned ${response.status}: ${body.slice(0, 200)}`
		);
	}

	return createWeatherSnapshot(await response.json(), new Date().toISOString());
}

function isFreshWeatherSnapshot(raw: string, now = Date.now()): boolean {
	try {
		const weather = JSON.parse(raw) as Partial<WeatherSnapshot>;
		const fetchedAt = new Date(weather.fetchedAt ?? "").getTime();

		return (
			Number.isFinite(fetchedAt) && now - fetchedAt < WEATHER_CACHE_MAX_AGE_MS
		);
	} catch {
		return false;
	}
}

async function getLocalWeatherSnapshot(
	request: Request
): Promise<Response | null> {
	const response = await fetch(new URL("/weather/london.json", request.url));
	return response.ok
		? new Response(response.body, { headers: JSON_HEADERS })
		: null;
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

export async function refreshWeather(env: Env): Promise<void> {
	const weather = await fetchWeatherSnapshot(env);
	await env.STATS.put(WEATHER_CACHE_KEY, JSON.stringify(weather));
}

export async function handleWeather(
	request: Request,
	env: Env
): Promise<Response> {
	const raw = await env.STATS.get(WEATHER_CACHE_KEY);
	if (raw && isFreshWeatherSnapshot(raw)) {
		return new Response(raw, { headers: JSON_HEADERS });
	}

	try {
		const weather = await fetchWeatherSnapshot(env);
		const body = JSON.stringify(weather);
		await env.STATS.put(WEATHER_CACHE_KEY, body);

		return new Response(body, { headers: JSON_HEADERS });
	} catch (error) {
		if (raw) {
			return new Response(raw, { headers: JSON_HEADERS });
		}

		if (isLocalRequest(request)) {
			const localWeather = await getLocalWeatherSnapshot(request);
			if (localWeather) {
				return localWeather;
			}
		}

		return weatherErrorResponse(error, request);
	}
}
