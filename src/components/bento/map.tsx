import clsx from "clsx";
import {
	ImageGeneration,
	type ImageGenerationCycleEvent,
	type ImageGenerationHandle,
} from "img-fx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "#/lib/theme";
import { BentoBlock } from ".";

const MAP_SURFACE_CLASS = "bg-[#f5f5f5] dark:bg-[#0f0f0f]";
const MAP_SURFACE_STYLE = {
	backgroundColor: "var(--map-surface, #f5f5f5)",
} as const;
const MAP_GENERATION_STYLE = {
	background: "var(--map-surface, #f5f5f5)",
} as const;
const MAP_SNAPSHOT_SRC = {
	light: "/map/london-light.png",
	dark: "/map/london-dark.png",
} as const;
const MARKER_FADE_TRANSITION = {
	duration: 0.36,
	ease: [0.23, 1, 0.32, 1],
} as const;
const MARKER_REVEAL_DELAY_MS = 900;
const REDUCED_MOTION_TRANSITION = { duration: 0 } as const;

function getDocumentTheme(): keyof typeof MAP_SNAPSHOT_SRC | null {
	if (typeof document === "undefined") {
		return null;
	}

	const theme = document.documentElement.dataset.theme;
	return theme === "dark" || theme === "light" ? theme : null;
}

export function BentoMap({ className }: { className?: string }) {
	const theme = useTheme();
	const snapshotSrc = MAP_SNAPSHOT_SRC[theme];
	const images = useMemo(() => [snapshotSrc], [snapshotSrc]);
	const shouldReduceMotion = useReducedMotion();
	const generationRef = useRef<ImageGenerationHandle>(null);
	const markerTimerRef = useRef<number | null>(null);
	const [markerVisible, setMarkerVisible] = useState(false);
	const markerTransition = shouldReduceMotion
		? REDUCED_MOTION_TRANSITION
		: MARKER_FADE_TRANSITION;

	const clearMarkerTimer = useCallback(() => {
		if (markerTimerRef.current === null) {
			return;
		}

		window.clearTimeout(markerTimerRef.current);
		markerTimerRef.current = null;
	}, []);

	const handleCycle = useCallback(
		(event: ImageGenerationCycleEvent) => {
			if (event.phase === "reveal") {
				setMarkerVisible(false);
				clearMarkerTimer();
				markerTimerRef.current = window.setTimeout(() => {
					markerTimerRef.current = null;
					setMarkerVisible(true);
				}, MARKER_REVEAL_DELAY_MS);
				return;
			}

			if (event.phase === "visible") {
				clearMarkerTimer();
				setMarkerVisible(true);
				return;
			}

			clearMarkerTimer();
			setMarkerVisible(false);
		},
		[clearMarkerTimer]
	);

	useEffect(() => {
		if (getDocumentTheme() !== theme) {
			return;
		}

		clearMarkerTimer();
		setMarkerVisible(false);
		const frame = window.requestAnimationFrame(() => {
			if (snapshotSrc) {
				generationRef.current?.triggerReveal({ hold: "manual" });
			}
		});

		return () => {
			window.cancelAnimationFrame(frame);
			clearMarkerTimer();
		};
	}, [snapshotSrc, clearMarkerTimer, theme]);

	return (
		<BentoBlock
			className={clsx(
				"col-span-2! row-span-2! md:col-span-4! md:row-span-4!",
				className
			)}
			size="large"
			style={MAP_SURFACE_STYLE}
		>
			<figure
				aria-label="Apple Maps snapshot showing a location pin in London"
				className={clsx(
					"absolute inset-0 overflow-hidden rounded-3xl",
					MAP_SURFACE_CLASS
				)}
				style={MAP_SURFACE_STYLE}
			>
				<ImageGeneration
					aria-hidden="true"
					className="map-generation absolute inset-0 z-10 scale-110"
					images={images}
					key={snapshotSrc}
					onCycle={handleCycle}
					preset="pixels-organic"
					ref={generationRef}
					strength={1}
					style={MAP_GENERATION_STYLE}
					suppressHydrationWarning
					theme="auto"
				>
					<div
						className={clsx("size-full rounded-3xl", MAP_SURFACE_CLASS)}
						style={MAP_SURFACE_STYLE}
					/>
				</ImageGeneration>
				<AnimatePresence initial={false}>
					{markerVisible ? (
						<motion.div
							animate={{ opacity: 1 }}
							aria-hidden="true"
							className="pointer-events-none absolute inset-0 z-20"
							exit={{ opacity: 0 }}
							initial={{ opacity: 0 }}
							transition={markerTransition}
						>
							<div className="absolute top-[53%] left-[60%] size-5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-blue-500" />
							<div className="absolute top-[53%] left-[60%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-blue-500" />
						</motion.div>
					) : null}
				</AnimatePresence>
			</figure>
		</BentoBlock>
	);
}
