"use client";

import { cn } from "cnfast";
import { useEffect, useRef, useState } from "react";
import {
	CELL,
	paintColumn,
	prefersReducedMotion,
	staggeredProgress,
} from "./dither-paint";
import { type DitherColor, seedOfColor } from "./palette";
import { useChartDimensions } from "./use-chart-dimensions";

export interface BarListItem {
	/** Per-item hue override — e.g. `grey` for an "everything else" bucket. */
	color?: DitherColor;
	label: string;
	value: number;
}

interface BarListProps {
	className?: string;
	/** Series hue for items without their own `color`. */
	color?: DitherColor;
	/** Set false for a static list: no hover lift/dim. */
	interactive?: boolean;
	items: BarListItem[];
}

const ENTRANCE_MS = 900;
const TRACK_HEIGHT = 16; // css px — 8 dither cells tall

/** The offscreen bar canvas and the row-independent geometry it is painted with. */
interface RowPaint {
	color: DitherColor;
	hoverIndex: number | null;
	lenCells: number;
	max: number;
	octx: CanvasRenderingContext2D;
	off: HTMLCanvasElement;
	thickCells: number;
}

/** Paints one row's bar vertically offscreen, then blits it rotated into place. */
function paintRow(
	p: RowPaint,
	canvas: HTMLCanvasElement | null,
	item: BarListItem,
	i: number,
	count: number,
	prog: number
) {
	const dctx = canvas?.getContext("2d");
	if (!(canvas && dctx)) {
		return;
	}
	// Setting the size also clears the canvas for this repaint.
	canvas.width = p.lenCells;
	canvas.height = p.thickCells;
	const grown = (item.value / p.max) * staggeredProgress(i, count, prog);
	if (grown <= 0) {
		return;
	}
	const active = p.hoverIndex === i;
	const dim = p.hoverIndex !== null && !active ? 0.5 : 1;
	p.octx.clearRect(0, 0, p.thickCells, p.lenCells);
	const top = (1 - grown) * p.lenCells;
	const seed = seedOfColor(item.color ?? p.color);
	for (let x = 0; x < p.thickCells; x++) {
		paintColumn(p.octx, x, top, p.lenCells, seed, {
			variant: "gradient",
			intensity: active ? 1 : 0,
			dim,
			stacked: false,
		});
	}
	// Rotate the vertically-painted bar 90° clockwise: offscreen (x, y) lands at
	// (lenCells − y, x), so the baseline maps to the left edge.
	dctx.save();
	dctx.translate(p.lenCells, 0);
	dctx.rotate(Math.PI / 2);
	dctx.drawImage(p.off, 0, 0);
	dctx.restore();
}

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
			const p: RowPaint = {
				color,
				hoverIndex: hoverRef.current,
				lenCells,
				max,
				octx,
				off,
				thickCells,
			};
			for (const [i, item] of items.entries()) {
				paintRow(p, canvasRefs.current[i], item, i, items.length, prog);
			}
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
		// biome-ignore lint/a11y/useSemanticElements: <ul> would need list-style:none, which drops the list role in Safari VoiceOver
		<div className={cn("flex flex-col gap-2", className)} role="list">
			{items.map((item, i) => (
				// biome-ignore lint/a11y/useSemanticElements: matches the role="list" container above
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
