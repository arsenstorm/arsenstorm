export interface WeatherSnapshot {
	attributionUrl: string;
	current: {
		asOf: string;
		condition: string;
		conditionCode: string;
		temperatureCelsius: number;
	};
	daily: {
		highCelsius: number;
		lowCelsius: number;
	};
	fetchedAt: string;
	location: string;
	sun?: {
		sunrise: string;
		sunset: string;
	};
}

const CONDITION_LABELS: Record<string, string> = {
	Blizzard: "Blizzard",
	BlowingSnow: "Blowing snow",
	Breezy: "Breezy",
	Clear: "Clear",
	Cloudy: "Cloudy",
	Drizzle: "Drizzle",
	Flurries: "Flurries",
	Foggy: "Foggy",
	FreezingDrizzle: "Freezing drizzle",
	FreezingRain: "Freezing rain",
	Frigid: "Frigid",
	Hail: "Hail",
	Haze: "Hazy",
	HeavyRain: "Heavy rain",
	HeavySnow: "Heavy snow",
	Hot: "Hot",
	Hurricane: "Hurricane",
	IsolatedThunderstorms: "Isolated thunderstorms",
	MostlyClear: "Mostly clear",
	MostlyCloudy: "Mostly cloudy",
	PartlyCloudy: "Partly cloudy",
	Rain: "Rain",
	ScatteredThunderstorms: "Scattered thunderstorms",
	Sleet: "Sleet",
	Smoky: "Smoky",
	Snow: "Snow",
	SunFlurries: "Sun flurries",
	SunShowers: "Sun showers",
	Thunderstorms: "Thunderstorms",
	Tornado: "Tornado",
	TropicalStorm: "Tropical storm",
	Windy: "Windy",
	WintryMix: "Wintry mix",
};

const CAMEL_CASE_BOUNDARY_REGEX = /([a-z])([A-Z])/g;

export function formatWeatherCondition(conditionCode: string): string {
	return (
		CONDITION_LABELS[conditionCode] ??
		conditionCode.replace(CAMEL_CASE_BOUNDARY_REGEX, "$1 $2")
	);
}

export function roundTemperature(value: number): number {
	return Math.round(value);
}
