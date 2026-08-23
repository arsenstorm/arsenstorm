import { cn } from "cnfast";
import { AnimatePresence } from "motion/react";
import { type CSSProperties, useEffect, useState } from "react";
import { useJsonResource } from "#/lib/use-json-resource";
import { roundTemperature, type WeatherSnapshot } from "#/lib/weather";
import { BentoBlock } from ".";

const WEATHER_ENDPOINT = "/api/weather";
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const FIRST_LIGHT_WINDOW_MS = 90 * MINUTE_MS;
const GOLDEN_HOUR_WINDOW_MS = 75 * MINUTE_MS;
const LAST_LIGHT_WINDOW_MS = 90 * MINUTE_MS;
const SUNRISE_ORANGE_WINDOW_MS = 30 * MINUTE_MS;
const SUNSET_ORANGE_WINDOW_MS = 30 * MINUTE_MS;
const SUNSET_BRIGHT_TEXT_OFFSET_MS = 45 * MINUTE_MS;
const PRE_SUNRISE_WINDOW_MS = 30 * MINUTE_MS;
const POST_SUNSET_WINDOW_MS = 45 * MINUTE_MS;

interface WeatherVisual {
	background?: string;
	darkBackground?: string;
	primaryClassName: string;
	secondaryClassName: string;
	surfaceClassName: string;
}

interface SkyKeyframe {
	at: number;
	bottom: string;
	top: string;
}

type WeatherStyle = CSSProperties & {
	"--weather-background"?: string;
	"--weather-background-dark"?: string;
};

const BRIGHT_TEXT_CLASSES = {
	primaryClassName: "text-slate-950 dark:text-white",
	secondaryClassName: "text-slate-700 dark:text-white/75",
} as const;
const DARK_TEXT_CLASSES = {
	primaryClassName: "text-white",
	secondaryClassName: "text-white/80",
} as const;
const FALLBACK_VISUAL: WeatherVisual = {
	primaryClassName: "text-neutral-950 dark:text-neutral-50",
	secondaryClassName: "text-neutral-500 dark:text-neutral-400",
	surfaceClassName: "bg-neutral-50 dark:bg-neutral-900",
};

function formatTemperature(value: number): string {
	return `${roundTemperature(value)}°C`;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string): [number, number, number] {
	return [
		Number.parseInt(hex.slice(1, 3), 16),
		Number.parseInt(hex.slice(3, 5), 16),
		Number.parseInt(hex.slice(5, 7), 16),
	];
}

function rgbToHex([red, green, blue]: [number, number, number]): string {
	return `#${[red, green, blue]
		.map((channel) =>
			clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0")
		)
		.join("")}`;
}

function interpolateColor(from: string, to: string, progress: number): string {
	const start = hexToRgb(from);
	const end = hexToRgb(to);
	const amount = clamp(progress, 0, 1);

	return rgbToHex([
		start[0] + (end[0] - start[0]) * amount,
		start[1] + (end[1] - start[1]) * amount,
		start[2] + (end[2] - start[2]) * amount,
	]);
}

function getProgress(start: number, end: number, value: number): number {
	return clamp((value - start) / (end - start), 0, 1);
}

function alignSunTimesToCurrentDay(
	sunrise: number,
	sunset: number,
	now: number
): { sunrise: number; sunset: number } {
	const daylightMidpoint = sunrise + (sunset - sunrise) / 2;
	const dayOffset = Math.round((now - daylightMidpoint) / DAY_MS);
	const offset = dayOffset * DAY_MS;

	return { sunrise: sunrise + offset, sunset: sunset + offset };
}

function getInterpolatedGradient(
	keyframes: SkyKeyframe[],
	now: number
): string | undefined {
	const first = keyframes[0];
	const last = keyframes.at(-1);

	if (!(first && last)) {
		return;
	}

	if (now <= first.at) {
		return `linear-gradient(155deg, ${first.top} 0%, ${first.bottom} 100%)`;
	}

	if (now >= last.at) {
		return `linear-gradient(155deg, ${last.top} 0%, ${last.bottom} 100%)`;
	}

	for (let index = 0; index < keyframes.length - 1; index += 1) {
		const current = keyframes[index];
		const next = keyframes[index + 1];
		if (!(current && next) || now < current.at || now > next.at) {
			continue;
		}

		const progress = getProgress(current.at, next.at, now);
		const top = interpolateColor(current.top, next.top, progress);
		const bottom = interpolateColor(current.bottom, next.bottom, progress);

		return `linear-gradient(155deg, ${top} 0%, ${bottom} 100%)`;
	}
}

function getWeatherVisual(weather: WeatherSnapshot | null, now: number) {
	const sunrise = new Date(weather?.sun?.sunrise ?? "").getTime();
	const sunset = new Date(weather?.sun?.sunset ?? "").getTime();

	if (!(Number.isFinite(sunrise) && Number.isFinite(sunset))) {
		return FALLBACK_VISUAL;
	}

	const alignedSun = alignSunTimesToCurrentDay(sunrise, sunset, now);
	const preDawnStart = alignedSun.sunrise - FIRST_LIGHT_WINDOW_MS;
	const sunriseGlowEnd = alignedSun.sunrise + GOLDEN_HOUR_WINDOW_MS;
	const sunsetGlowStart = alignedSun.sunset - GOLDEN_HOUR_WINDOW_MS;
	const twilightEnd = alignedSun.sunset + LAST_LIGHT_WINDOW_MS;
	const keyframes = [
		{
			at: preDawnStart,
			light: ["#070b18", "#18244a"],
			dark: ["#050712", "#111827"],
		},
		{
			at: alignedSun.sunrise - PRE_SUNRISE_WINDOW_MS,
			light: ["#080d1f", "#35306b"],
			dark: ["#070a18", "#211f45"],
		},
		{
			at: alignedSun.sunrise,
			light: ["#344182", "#f59e8b"],
			dark: ["#172554", "#5b2b4f"],
		},
		{
			at: alignedSun.sunrise + SUNRISE_ORANGE_WINDOW_MS,
			light: ["#9ddcf9", "#ffd08a"],
			dark: ["#123047", "#5a3c25"],
		},
		{
			at: sunriseGlowEnd,
			light: ["#dff5ff", "#f8fbff"],
			dark: ["#122236", "#203342"],
		},
		{
			at: sunsetGlowStart,
			light: ["#dff5ff", "#f8fbff"],
			dark: ["#122236", "#203342"],
		},
		{
			at: alignedSun.sunset - SUNSET_ORANGE_WINDOW_MS,
			light: ["#8fcdf6", "#ffd08a"],
			dark: ["#143149", "#63442a"],
		},
		{
			at: alignedSun.sunset,
			light: ["#f59e52", "#9f3a6d"],
			dark: ["#5f3527", "#4b2443"],
		},
		{
			at: alignedSun.sunset + POST_SUNSET_WINDOW_MS,
			light: ["#24184f", "#9b496c"],
			dark: ["#181338", "#4b2540"],
		},
		{
			at: twilightEnd,
			light: ["#070b18", "#18244a"],
			dark: ["#050712", "#111827"],
		},
	] as const;
	const skyKeyframes = keyframes.map(
		({ at, light: [top, bottom] }): SkyKeyframe => ({ at, top, bottom })
	);
	const darkSkyKeyframes = keyframes.map(
		({ at, dark: [top, bottom] }): SkyKeyframe => ({ at, top, bottom })
	);
	const isBright =
		now >= alignedSun.sunrise + SUNRISE_ORANGE_WINDOW_MS &&
		now < alignedSun.sunset - SUNSET_BRIGHT_TEXT_OFFSET_MS;

	return {
		background: getInterpolatedGradient(skyKeyframes, now),
		darkBackground: getInterpolatedGradient(darkSkyKeyframes, now),
		surfaceClassName: "",
		...(isBright ? BRIGHT_TEXT_CLASSES : DARK_TEXT_CLASSES),
	};
}

function useNow(intervalMs: number): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		setNow(Date.now());
		const interval = window.setInterval(() => {
			setNow(Date.now());
		}, intervalMs);

		return () => {
			window.clearInterval(interval);
		};
	}, [intervalMs]);

	return now;
}

export function BentoWeather({ className }: { className?: string }) {
	const weather = useJsonResource<WeatherSnapshot>(WEATHER_ENDPOINT);
	const now = useNow(MINUTE_MS);
	const visual = getWeatherVisual(weather.data, now);
	const weatherStyle: WeatherStyle | undefined =
		visual.background || visual.darkBackground
			? {
					"--weather-background":
						visual.background ?? visual.darkBackground ?? "",
					"--weather-background-dark":
						visual.darkBackground ?? visual.background ?? "",
				}
			: undefined;

	return (
		<AnimatePresence initial={false} mode="wait">
			{weather.status === "ready" ? (
				<BentoBlock
					className={cn(
						"weather-card overflow-hidden",
						className,
						visual.surfaceClassName
					)}
					size="medium"
					style={weatherStyle}
				>
					<div className="flex h-full flex-col justify-between">
						<p className={cn("font-medium text-xs", visual.secondaryClassName)}>
							London
						</p>

						<div>
							<p
								className={cn(
									"font-medium text-5xl tracking-normal",
									visual.primaryClassName
								)}
							>
								{weather.data?.current?.temperatureCelsius &&
									formatTemperature(weather.data?.current?.temperatureCelsius)}
							</p>
							<p className={cn("mt-2 text-sm", visual.secondaryClassName)}>
								{weather.data?.current?.condition}
							</p>
							<p
								className={cn(
									"mt-1 font-medium text-sm",
									visual.primaryClassName
								)}
							>
								H{" "}
								{weather.data?.daily?.highCelsius &&
									formatTemperature(weather.data?.daily?.highCelsius)}{" "}
								/ L{" "}
								{weather.data?.daily?.lowCelsius &&
									formatTemperature(weather.data?.daily?.lowCelsius)}
							</p>
						</div>
					</div>
				</BentoBlock>
			) : (
				<BentoBlock className="animate-pulse" size="medium" />
			)}
		</AnimatePresence>
	);
}
