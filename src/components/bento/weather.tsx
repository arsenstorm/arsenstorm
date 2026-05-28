import clsx from "clsx";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { roundTemperature, type WeatherSnapshot } from "#/lib/weather";
import { BentoBlock, BentoBlockSkeleton } from ".";

const WEATHER_ENDPOINT = "/api/weather";
const MINUTE_MS = 60_000;
const FIRST_LIGHT_WINDOW_MS = 90 * MINUTE_MS;
const GOLDEN_HOUR_WINDOW_MS = 75 * MINUTE_MS;
const LAST_LIGHT_WINDOW_MS = 90 * MINUTE_MS;
const SUNRISE_ORANGE_WINDOW_MS = 30 * MINUTE_MS;
const SUNSET_ORANGE_WINDOW_MS = 30 * MINUTE_MS;
const SUNSET_BRIGHT_TEXT_OFFSET_MS = 45 * MINUTE_MS;

type WeatherState =
	| { status: "loading"; weather: null }
	| { status: "ready"; weather: WeatherSnapshot }
	| { status: "unavailable"; weather: null };

interface WeatherVisual {
	background?: string;
	borderClassName: string;
	primaryClassName: string;
	secondaryClassName: string;
	surfaceClassName: string;
}

interface SkyKeyframe {
	at: number;
	bottom: string;
	top: string;
}

const BRIGHT_TEXT_CLASSES = {
	borderClassName: "border-sky-100 dark:border-sky-900/50",
	primaryClassName: "text-slate-950",
	secondaryClassName: "text-slate-700",
} as const;
const DARK_TEXT_CLASSES = {
	borderClassName: "border-indigo-950/60",
	primaryClassName: "text-white",
	secondaryClassName: "text-white/80",
} as const;
const FALLBACK_VISUAL: WeatherVisual = {
	borderClassName: "border-neutral-200 dark:border-neutral-800",
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

	const preDawnStart = sunrise - FIRST_LIGHT_WINDOW_MS;
	const sunriseGlowEnd = sunrise + GOLDEN_HOUR_WINDOW_MS;
	const sunsetGlowStart = sunset - GOLDEN_HOUR_WINDOW_MS;
	const twilightEnd = sunset + LAST_LIGHT_WINDOW_MS;
	const skyKeyframes = [
		{ at: preDawnStart, top: "#070b18", bottom: "#18244a" },
		{ at: sunrise - 30 * MINUTE_MS, top: "#080d1f", bottom: "#35306b" },
		{ at: sunrise, top: "#344182", bottom: "#f59e8b" },
		{
			at: sunrise + SUNRISE_ORANGE_WINDOW_MS,
			top: "#9ddcf9",
			bottom: "#ffd08a",
		},
		{ at: sunriseGlowEnd, top: "#dff5ff", bottom: "#f8fbff" },
		{ at: sunsetGlowStart, top: "#dff5ff", bottom: "#f8fbff" },
		{
			at: sunset - SUNSET_ORANGE_WINDOW_MS,
			top: "#8fcdf6",
			bottom: "#ffd08a",
		},
		{ at: sunset, top: "#f59e52", bottom: "#9f3a6d" },
		{ at: sunset + 45 * MINUTE_MS, top: "#24184f", bottom: "#9b496c" },
		{ at: twilightEnd, top: "#070b18", bottom: "#18244a" },
	] satisfies SkyKeyframe[];
	const isBright =
		now >= sunrise + SUNRISE_ORANGE_WINDOW_MS &&
		now < sunset - SUNSET_BRIGHT_TEXT_OFFSET_MS;

	return {
		background: getInterpolatedGradient(skyKeyframes, now),
		surfaceClassName: "",
		...(isBright ? BRIGHT_TEXT_CLASSES : DARK_TEXT_CLASSES),
	};
}

export function BentoWeather() {
	const [state, setState] = useState<WeatherState>({
		status: "loading",
		weather: null,
	});
	const [now, setNow] = useState(() => Date.now());
	const visual = getWeatherVisual(state.weather, now);

	useEffect(() => {
		const controller = new AbortController();

		async function loadWeather() {
			const response = await fetch(WEATHER_ENDPOINT, {
				signal: controller.signal,
			});

			if (!response.ok) {
				setState({ status: "unavailable", weather: null });
				return;
			}

			const weather = (await response.json()) as WeatherSnapshot;
			setState({ status: "ready", weather });
		}

		loadWeather().catch(() => {
			if (controller.signal.aborted) {
				return;
			}

			setState({ status: "unavailable", weather: null });
		});

		return () => {
			controller.abort();
		};
	}, []);

	useEffect(() => {
		setNow(Date.now());
		const interval = window.setInterval(() => {
			setNow(Date.now());
		}, MINUTE_MS);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	return (
		<AnimatePresence initial={false} mode="wait">
			{state.status === "ready" ? (
				<BentoBlock
					className={clsx(
						"overflow-hidden border",
						visual.borderClassName,
						visual.surfaceClassName
					)}
					size="medium"
					style={
						visual.background ? { background: visual.background } : undefined
					}
				>
					<div className="flex h-full flex-col justify-between">
						<p
							className={clsx("font-medium text-xs", visual.secondaryClassName)}
						>
							London
						</p>

						<div>
							<p
								className={clsx(
									"font-medium text-5xl tracking-normal",
									visual.primaryClassName
								)}
							>
								{state?.weather?.current?.temperatureCelsius &&
									formatTemperature(
										state?.weather?.current?.temperatureCelsius
									)}
							</p>
							<p className={clsx("mt-2 text-sm", visual.secondaryClassName)}>
								{state?.weather?.current?.condition}
							</p>
							<p
								className={clsx(
									"mt-1 font-medium text-sm",
									visual.primaryClassName
								)}
							>
								H{" "}
								{state?.weather?.daily?.highCelsius &&
									formatTemperature(state?.weather?.daily?.highCelsius)}{" "}
								/ L{" "}
								{state?.weather?.daily?.lowCelsius &&
									formatTemperature(state?.weather?.daily?.lowCelsius)}
							</p>
						</div>
					</div>
				</BentoBlock>
			) : (
				<BentoBlockSkeleton size="medium" />
			)}
		</AnimatePresence>
	);
}
