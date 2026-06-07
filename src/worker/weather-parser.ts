import { formatWeatherCondition, type WeatherSnapshot } from "#/lib/weather";
import type { JsonRecord } from "./types";

const WEATHERKIT_LEGAL_ATTRIBUTION_URL =
	"https://weatherkit.apple.com/legal-attribution.html";

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

export function createWeatherSnapshot(
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
		attributionUrl,
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
		fetchedAt,
		location: "London",
		sun: {
			sunrise: readString(today, "sunrise", "weather.forecastDaily.days[0]"),
			sunset: readString(today, "sunset", "weather.forecastDaily.days[0]"),
		},
	};
}
