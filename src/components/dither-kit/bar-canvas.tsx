"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AreaVariant, ChartContextValue } from "./chart-context";
import { useChart } from "./chart-context";
import {
	backingSize,
	bloomLayerStyle,
	paintColumn,
	prefersReducedMotion,
	staggeredProgress,
} from "./dither-paint";
import type { DitherColor, Seed } from "./palette";
import { seedOfColor } from "./palette";

/** Per data index, in backing rows. */
interface Bars {
	base: number[];
	top: number[];
}

/** Everything one repaint of the whole canvas needs, snapshotted for the frame. */
interface Frame {
	animate: boolean;
	c: CanvasRenderingContext2D;
	cols: number;
	fx: number; // plot px → backing column
	intensity: number; // 0–1 hover lift, eased by the loop
	prog: number; // 0–1 entrance progress
	rows: number;
	s: ChartContextValue;
	stacked: boolean;
	targets: Record<string, Bars>;
}

/** One series' paint recipe within a frame. */
interface SeriesPaint {
	colors?: Partial<Record<number, DitherColor>>;
	count: number; // series in this chart — drives the slot split
	index: number; // this series' position among them
	seed: Seed;
	selDim: number; // selection/legend dim multiplier
	targets: Bars;
	variant: AreaVariant;
}

/** Mutable RAF-loop state — what the last frame painted, so the next can skip. */
interface Loop {
	animStart: number;
	intensity: number;
	lastHover: number | null | undefined;
	lastPaintSig: string;
	lastProg: number;
	lastRevision: number;
	lastSelected: string | null | undefined;
	needsFill: boolean;
}

/** Whether the bloom layer should be mirroring the crisp canvas right now. */
function bloomActive(s: ChartContextValue) {
	return (
		s.bloom !== "off" && (!s.bloomOnHover || s.isMouseInChart || s.hovered)
	);
}

function paintBar(frame: Frame, series: SeriesPaint, i: number) {
	const { c, s, rows, fx, stacked } = frame;
	const t = series.targets;
	const bp = frame.animate ? staggeredProgress(i, s.dataLength, frame.prog) : 1;
	const base = t.base[i] ?? rows - 1;
	// A zero-value segment in a stack would still paint its 1px highlight edge on
	// top of the series below — skip it entirely.
	if (stacked && t.top[i] === base) {
		return;
	}
	const grown = base + ((t.top[i] ?? base) - base) * bp;
	// Bars grow from the zero baseline toward the value. Positive values sit above
	// the baseline (smaller pixel), negative ones below it — paintColumn wants the
	// higher edge first, so order the pair.
	const top = Math.min(grown, base);
	const bottom = Math.max(grown, base);
	const active = s.hoverIndex === i;
	const hoverDim =
		s.hoverIndex != null && !active && s.isMouseInChart ? 0.5 : 1;
	const slot = s.barSlot(i, series.index, series.count);
	const c0 = Math.round(slot.x * fx);
	const c1 = Math.round((slot.x + slot.width) * fx);
	const override = series.colors?.[i];
	const barSeed = override ? seedOfColor(override) : series.seed;
	for (let x = c0; x < c1; x++) {
		paintColumn(c, x, top, bottom, barSeed, {
			variant: series.variant,
			intensity: frame.intensity + (active ? 0.4 : 0),
			dim: series.selDim * hoverDim,
			stacked,
		});
	}
}

function paintSeries(frame: Frame, series: SeriesPaint) {
	for (let i = 0; i < frame.s.dataLength; i++) {
		paintBar(frame, series, i);
	}
}

function paintFrame(frame: Frame) {
	const { c, s, cols, rows } = frame;
	c.clearRect(0, 0, cols, rows);
	const keys = s.configKeys;
	const emphasis = s.selectedDataKey ?? s.focusDataKey;
	for (const [si, key] of keys.entries()) {
		const targets = frame.targets[key];
		if (!targets) {
			continue;
		}
		paintSeries(frame, {
			targets,
			index: si,
			count: keys.length,
			seed: s.seedOf(key),
			variant: s.seriesSpecs[key]?.variant ?? "gradient",
			colors: s.seriesSpecs[key]?.colors,
			selDim: emphasis !== null && emphasis !== key ? 0.3 : 1,
		});
	}
}

/** Flags the loop dirty when anything the painted frame depends on has moved. */
function markDirty(
	loop: Loop,
	s: ChartContextValue,
	prog: number,
	reduce: boolean
) {
	if (prog !== loop.lastProg) {
		loop.lastProg = prog;
		loop.needsFill = true;
	}
	const emphasisNow = s.selectedDataKey ?? s.focusDataKey;
	if (emphasisNow !== loop.lastSelected) {
		loop.lastSelected = emphasisNow;
		loop.needsFill = true;
	}
	if (s.hoverIndex !== loop.lastHover) {
		loop.lastHover = s.hoverIndex;
		loop.needsFill = true;
	}
	const itTarget = s.isMouseInChart || s.hovered ? 1 : 0;
	if (Math.abs(loop.intensity - itTarget) > 0.001) {
		loop.intensity += (itTarget - loop.intensity) * (reduce ? 1 : 0.16);
		loop.needsFill = true;
	} else {
		loop.intensity = itTarget;
	}

	// Live tweak repaint (variant, stacking) without replaying the wave.
	const paintSig = `${s.stackType}|${s.configKeys
		.map((k) => s.seriesSpecs[k]?.variant ?? "")
		.join(",")}`;
	if (paintSig !== loop.lastPaintSig) {
		loop.lastPaintSig = paintSig;
		loop.needsFill = true;
	}
}

/**
 * Dither canvas for bar charts. Each category owns a band; grouped series split
 * it into side-by-side bars, stacked series share its full width and pile in y.
 * Every bar is filled with the shared {@link paintColumn} ordered dither. Bars
 * grow up from their base in a staggered left-to-right wave (eased), and the
 * hovered category lifts while the rest dim.
 */
export function BarCanvas() {
	const ctx = useChart();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const bloomRef = useRef<HTMLCanvasElement>(null);

	const { width, height } = ctx.plot;
	const { cols, rows } = backingSize(width, height);
	const { ready, configKeys, bands, y } = ctx;

	// Memoized: per-series bar tops/bases (backing rows) over the data indices.
	// The canvas re-renders on every hover/cursor tick, so pin this map to the
	// exact ctx fields it reads plus the backing geometry — a bar hover must not
	// rebuild every band's geometry.
	const targets = useMemo(() => {
		const out: Record<string, Bars> = {};
		if (!ready) {
			return out;
		}
		const h = height || 1;
		for (const key of configKeys) {
			const band = bands[key];
			if (!band) {
				continue;
			}
			out[key] = {
				top: band.map((b) => (y(b[1]) / h) * (rows - 1)),
				base: band.map((b) => (y(b[0]) / h) * (rows - 1)),
			};
		}
		return out;
	}, [ready, configKeys, bands, y, height, rows]);

	// The RAF loop reads these through refs so it always sees the latest values;
	// refs are written in an effect (never during render) — mutating a ref
	// mid-render tears under Strict Mode / concurrent rendering.
	const state = useRef(ctx);
	const targetsRef = useRef(targets);
	useEffect(() => {
		state.current = ctx;
		targetsRef.current = targets;
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		const c = canvas?.getContext("2d");
		if (!(canvas && c)) {
			return;
		}
		if (cols <= 0 || rows <= 0) {
			return;
		}
		canvas.width = cols;
		canvas.height = rows;

		const bloomCanvas = bloomRef.current;
		const bloomCtx = bloomCanvas?.getContext("2d") ?? null;
		if (bloomCanvas) {
			bloomCanvas.width = cols;
			bloomCanvas.height = rows;
		}

		const reduce = prefersReducedMotion();
		const animate = state.current.animate && !reduce;
		const duration = state.current.animationDuration;
		const fx = cols / Math.max(width, 1);

		let raf = 0;
		const loop: Loop = {
			animStart: 0,
			intensity: 0,
			// Sentinels no real emphasis / hover index can equal, so the first frame
			// always records its starting values.
			lastHover: Symbol("unset") as never,
			lastPaintSig: "",
			lastProg: -1,
			lastRevision: state.current.revision,
			lastSelected: Symbol("unset") as never,
			needsFill: true,
		};

		const draw = (now: number) => {
			raf = requestAnimationFrame(draw);
			const s = state.current;
			if (!s.ready) {
				return;
			}
			if (bloomCtx && bloomActive(s)) {
				bloomCtx.clearRect(0, 0, cols, rows);
				bloomCtx.drawImage(canvas, 0, 0);
			}
			if (s.revision !== loop.lastRevision) {
				loop.lastRevision = s.revision;
				loop.animStart = 0; // re-play the wave on data change / replay
				loop.lastProg = -1;
			}
			if (!loop.animStart) {
				loop.animStart = now;
			}
			const prog = animate ? Math.min(1, (now - loop.animStart) / duration) : 1;
			markDirty(loop, s, prog, reduce);

			if (!loop.needsFill) {
				return;
			}
			paintFrame({
				animate,
				c,
				cols,
				fx,
				intensity: loop.intensity,
				prog,
				rows,
				s,
				stacked: s.stackType === "stacked" || s.stackType === "percent",
				targets: targetsRef.current,
			});
			loop.needsFill = false;
		};

		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	}, [cols, rows, width]);

	const bloom = bloomLayerStyle(ctx.bloom, bloomActive(ctx));
	const pos = {
		left: ctx.margins.left,
		top: ctx.margins.top,
		width,
		height,
	} as const;

	return (
		<>
			<canvas
				className="pointer-events-none absolute"
				ref={canvasRef}
				style={{ ...pos, imageRendering: "pixelated" }}
			/>
			<canvas
				className="pointer-events-none absolute"
				ref={bloomRef}
				style={{
					...pos,
					transition: "opacity 220ms ease",
					...(bloom ?? { opacity: 0 }),
				}}
			/>
		</>
	);
}
