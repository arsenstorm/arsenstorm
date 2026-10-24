"use client";

import { useEffect, useRef } from "react";
import {
	CELL,
	paintColumn,
	prefersReducedMotion,
	staggeredProgress,
} from "./dither-paint";
import { type DitherColor, PALETTE } from "./palette";
import { useChartDimensions } from "./use-chart-dimensions";

export interface BarListItem {
	/** Hue for this row — e.g. `grey` for an "everything else" bucket. */
	color?: DitherColor;
	label: string;
	value: number;
}

const DEFAULT_COLOR: DitherColor = "blue";
const ENTRANCE_MS = 900;
const TRACK_HEIGHT = 16; // css px — 8 dither cells tall

/** The offscreen bar canvas and the row-independent geometry it is painted with. */
interface RowPaint {
	lenCells: number;
	max: number;
	octx: CanvasRenderingContext2D;
	off: HTMLCanvasElement;
	thickCells: number;
}

/** Paints one row's bar vertically offscreen, then blits it rotated into place. */
function paintRow(
	p: RowPaint,
	canvas: HTMLCanvasElement | undefined,
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
	p.octx.clearRect(0, 0, p.thickCells, p.lenCells);
	const top = (1 - grown) * p.lenCells;
	const fill = PALETTE[item.color ?? DEFAULT_COLOR];
	for (let x = 0; x < p.thickCells; x += 1) {
		paintColumn(p.octx, x, top, p.lenCells, fill, {
			dim: 1,
			intensity: 0,
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
 * visible, longest bar = the max. Each bar is painted with the shared
 * {@link paintColumn} dither on an offscreen canvas (as a vertical bar) and
 * blitted rotated 90°, so the baseline lands on the left. Rows grow in a
 * staggered top-to-bottom wave.
 */
export function BarList({ items }: { items: BarListItem[] }) {
	const { ref: trackRef, size } = useChartDimensions<HTMLDivElement>();
	const { width } = size;
	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
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

		const paint: RowPaint = { lenCells, max, octx, off, thickCells };
		const paintAll = (prog: number) => {
			// One canvas per row, in row order.
			const canvases =
				listRef.current?.querySelectorAll<HTMLCanvasElement>("canvas") ?? [];
			for (const [i, item] of items.entries()) {
				paintRow(paint, canvases[i], item, i, items.length, prog);
			}
		};

		if (prefersReducedMotion()) {
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
			paintAll(prog);
			if (prog < 1) {
				raf = requestAnimationFrame(tick);
			}
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [width, items]);

	return (
		// biome-ignore lint/a11y/useSemanticElements: <ul> would need list-style:none, which drops the list role in Safari VoiceOver
		<div className="flex flex-col gap-2" ref={listRef} role="list">
			{items.map((item, i) => (
				// biome-ignore lint/a11y/useSemanticElements: matches the role="list" container above
				<div
					className="grid grid-cols-[8.5rem_1fr_auto] items-center gap-x-3"
					key={item.label}
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
