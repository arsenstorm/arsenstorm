"use client";

import { useEffect, useRef, useState } from "react";
import {
	CELL,
	clamp01,
	easeOutCubic,
	paintColumn,
	prefersReducedMotion,
} from "./dither-paint";
import { cn } from "./lib";
import { type DitherColor, seedOfColor } from "./palette";
import { useChartDimensions } from "./use-chart-dimensions";

export type BarListItem = {
	label: string;
	value: number;
	/** Per-item hue override — e.g. `grey` for an "everything else" bucket. */
	color?: DitherColor;
};

type BarListProps = {
	items: BarListItem[];
	/** Series hue for items without their own `color`. */
	color?: DitherColor;
	/** Set false for a static list: no hover lift/dim. */
	interactive?: boolean;
	className?: string;
};

// Fraction of the entrance spent staggering row starts (mirrors BarCanvas).
const STAGGER = 0.55;
const ENTRANCE_MS = 900;
const TRACK_HEIGHT = 16; // css px — 8 dither cells tall

/**
 * Horizontal dither **bar list** — one labelled row per item, values always
 * visible, longest bar = the max. The cartesian roots are vertical-only, so
 * this paints each bar with the shared {@link paintColumn} dither on an
 * offscreen canvas (as a vertical bar) and blits it rotated 90°: the baseline
 * lands on the left and the soft border outline on the value end. Rows grow in
 * a staggered top-to-bottom wave; hovering a row lifts it and dims the rest.
 */
export function BarList({
	items,
	color = "blue",
	interactive = true,
	className,
}: BarListProps) {
	const { ref: trackRef, size } = useChartDimensions<HTMLDivElement>();
	const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const hoverRef = useRef(hoverIndex);
	const progressRef = useRef(0);
	const paintRef = useRef<(prog: number) => void>(() => {
		// replaced once the paint effect runs
	});

	useEffect(() => {
		const width = size.width;
		if (width <= 0 || items.length === 0) {
			return;
		}
		const lenCells = Math.max(8, Math.round(width / CELL));
		const thickCells = Math.max(2, Math.round(TRACK_HEIGHT / CELL));
		const max = Math.max(...items.map((item) => item.value), 1);
		const off = document.createElement("canvas");
		off.width = thickCells;
		off.height = lenCells;
		const octx = off.getContext("2d");
		if (!octx) {
			return;
		}

		const paintAll = (prog: number) => {
			items.forEach((item, i) => {
				const canvas = canvasRefs.current[i];
				const dctx = canvas?.getContext("2d");
				if (!(canvas && dctx)) {
					return;
				}
				// Setting the size also clears the canvas for this repaint.
				canvas.width = lenCells;
				canvas.height = thickCells;
				const start = items.length > 1 ? (i / (items.length - 1)) * STAGGER : 0;
				const grown =
					(item.value / max) *
					easeOutCubic(clamp01((prog - start) / (1 - STAGGER)));
				if (grown <= 0) {
					return;
				}
				const active = hoverRef.current === i;
				const dim = hoverRef.current !== null && !active ? 0.5 : 1;
				octx.clearRect(0, 0, thickCells, lenCells);
				const top = (1 - grown) * lenCells;
				const seed = seedOfColor(item.color ?? color);
				for (let x = 0; x < thickCells; x++) {
					paintColumn(octx, x, top, lenCells, seed, {
						variant: "gradient",
						intensity: active ? 1 : 0,
						dim,
						stacked: false,
					});
				}
				// Rotate the vertically-painted bar 90° clockwise: offscreen (x, y)
				// lands at (lenCells − y, x), so the baseline maps to the left edge.
				dctx.save();
				dctx.translate(lenCells, 0);
				dctx.rotate(Math.PI / 2);
				dctx.drawImage(off, 0, 0);
				dctx.restore();
			});
		};
		paintRef.current = paintAll;

		if (prefersReducedMotion()) {
			progressRef.current = 1;
			paintAll(1);
			return;
		}
		let raf = 0;
		let startTime = 0;
		const tick = (now: number) => {
			if (!startTime) {
				startTime = now;
			}
			const prog = Math.min(1, (now - startTime) / ENTRANCE_MS);
			progressRef.current = prog;
			paintAll(prog);
			if (prog < 1) {
				raf = requestAnimationFrame(tick);
			}
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [size.width, items, color]);

	// Hover lifts/dims are a repaint at the current progress, not a re-entrance.
	useEffect(() => {
		hoverRef.current = hoverIndex;
		paintRef.current(progressRef.current);
	}, [hoverIndex]);

	return (
		<div className={cn("flex flex-col gap-2", className)} role="list">
			{items.map((item, i) => (
				<div
					className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-x-3"
					key={item.label}
					onPointerEnter={interactive ? () => setHoverIndex(i) : undefined}
					onPointerLeave={interactive ? () => setHoverIndex(null) : undefined}
					role="listitem"
				>
					<span className="truncate text-neutral-500 text-sm dark:text-neutral-400">
						{item.label}
					</span>
					<div
						className="relative"
						ref={i === 0 ? trackRef : undefined}
						style={{ height: TRACK_HEIGHT }}
					>
						<canvas
							aria-hidden
							className="absolute inset-0 h-full w-full"
							ref={(el) => {
								canvasRefs.current[i] = el;
							}}
							style={{ imageRendering: "pixelated" }}
						/>
					</div>
					<span className="text-right text-neutral-950 text-sm tabular-nums dark:text-neutral-50">
						{item.value.toLocaleString("en-GB")}
					</span>
				</div>
			))}
		</div>
	);
}
