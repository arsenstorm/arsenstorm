"use client";

import { useEffect, useMemo, useRef } from "react";
import type { ChartContextValue } from "./chart-context";
import { useChart } from "./chart-context";
import {
	backingSize,
	paintColumn,
	prefersReducedMotion,
	staggeredProgress,
} from "./dither-paint";

const ENTRANCE_MS = 900;

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
	targets: Record<string, Bars>;
}

/** Mutable RAF-loop state — what the last frame painted, so the next can skip. */
interface Loop {
	animStart: number;
	intensity: number;
	lastHover: number | null | undefined;
	lastProg: number;
	needsFill: boolean;
}

function paintBar(
	frame: Frame,
	key: string,
	seriesIndex: number,
	targets: Bars,
	i: number
) {
	const { c, s, rows, fx } = frame;
	const bp = frame.animate
		? staggeredProgress(i, s.data.length, frame.prog)
		: 1;
	const base = targets.base[i] ?? rows - 1;
	// A zero-value segment in a stack would still paint its 1px highlight edge on
	// top of the series below — skip it entirely.
	if (s.stacked && targets.top[i] === base) {
		return;
	}
	const grown = base + ((targets.top[i] ?? base) - base) * bp;
	// Bars grow from the zero baseline toward the value; paintColumn wants the
	// higher edge first, so order the pair.
	const top = Math.min(grown, base);
	const bottom = Math.max(grown, base);
	const active = s.hoverIndex === i;
	const dim = s.hoverIndex !== null && !active && s.isMouseInChart ? 0.5 : 1;
	const slot = s.barSlot(i, seriesIndex, s.configKeys.length);
	const c0 = Math.round(slot.x * fx);
	const c1 = Math.round((slot.x + slot.width) * fx);
	for (let x = c0; x < c1; x += 1) {
		paintColumn(c, x, top, bottom, s.colorOf(key), {
			dim,
			intensity: frame.intensity + (active ? 0.4 : 0),
			stacked: s.stacked,
		});
	}
}

function paintFrame(frame: Frame) {
	const { c, s, cols, rows } = frame;
	c.clearRect(0, 0, cols, rows);
	for (const [seriesIndex, key] of s.configKeys.entries()) {
		const targets = frame.targets[key];
		if (!targets) {
			continue;
		}
		for (let i = 0; i < s.data.length; i += 1) {
			paintBar(frame, key, seriesIndex, targets, i);
		}
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
	if (s.hoverIndex !== loop.lastHover) {
		loop.lastHover = s.hoverIndex;
		loop.needsFill = true;
	}
	const target = s.isMouseInChart ? 1 : 0;
	if (Math.abs(loop.intensity - target) > 0.001) {
		loop.intensity += (target - loop.intensity) * (reduce ? 1 : 0.16);
		loop.needsFill = true;
	} else {
		loop.intensity = target;
	}
}

/**
 * Dither canvas for bar charts. Each category owns a band; grouped series split
 * it into side-by-side bars, stacked series share its full width and pile in y.
 * Bars grow up from their base in a staggered left-to-right wave, and the
 * hovered category lifts while the rest dim.
 */
export function BarCanvas() {
	const ctx = useChart("BarCanvas");
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { width, height } = ctx.plot;
	const { cols, rows } = backingSize(width, height);
	const { ready, configKeys, bands, y } = ctx;

	// Memoized: the canvas re-renders on every hover tick, which must not rebuild
	// every band's geometry.
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
				base: band.map((b) => (y(b[0]) / h) * (rows - 1)),
				top: band.map((b) => (y(b[1]) / h) * (rows - 1)),
			};
		}
		return out;
	}, [ready, configKeys, bands, y, height, rows]);

	// The RAF loop reads these through refs so it always sees the latest values;
	// refs are written in an effect (never during render), since mutating a ref
	// mid-render tears under Strict Mode and concurrent rendering.
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

		const reduce = prefersReducedMotion();
		const animate = !reduce;
		const fx = cols / Math.max(width, 1);

		let raf = 0;
		const loop: Loop = {
			animStart: 0,
			intensity: 0,
			// A sentinel no real hover index can equal, so the first frame always
			// records its starting value.
			lastHover: Symbol("unset") as never,
			lastProg: -1,
			needsFill: true,
		};

		const draw = (now: number) => {
			raf = requestAnimationFrame(draw);
			const s = state.current;
			if (!s.ready) {
				return;
			}
			if (!loop.animStart) {
				loop.animStart = now;
			}
			const prog = animate
				? Math.min(1, (now - loop.animStart) / ENTRANCE_MS)
				: 1;
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
				targets: targetsRef.current,
			});
			loop.needsFill = false;
		};

		raf = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(raf);
	}, [cols, rows, width]);

	return (
		<canvas
			className="pointer-events-none absolute"
			ref={canvasRef}
			style={{
				height,
				imageRendering: "pixelated",
				left: ctx.margins.left,
				top: ctx.margins.top,
				width,
			}}
		/>
	);
}
