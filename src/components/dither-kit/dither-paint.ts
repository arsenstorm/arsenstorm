import { type Rgb, rgb } from "./palette";

// 4×4 ordered (Bayer) matrix, normalized to 0–1 thresholds.
const BAYER = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

export const CELL = 2; // css px per dither cell — chunky enough to read pixelated
const MAX_COLS = 520;
const MAX_ROWS = 200;
// Opacity of the top border outline (just under solid, so it reads as a soft
// edge rather than a hard line). See the note on colour vs opacity below.
const BORDER_ALPHA = 0.72;
// Opacity of a dither "off" cell relative to an "on" cell. The scatter modulates
// between these two tiers of the *same* colour instead of leaving holes, so the
// background never shows through as stark white on a light theme.
const OFF_TIER = 0.4;

interface PaintOpts {
	dim: number; // hover dim multiplier (0.5 dimmed, 1 normal)
	intensity: number; // 0–1 hover lift
	stacked: boolean; // denser + solid floor when layers stack
}

// Colour vs opacity — the guiding rule for the whole engine: every pixel is the
// series' single fill colour and only its alpha varies, so the fade reads
// correctly against both light and dark backgrounds.

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * Fill one backing-canvas column `x` from row `top` down to `floor` with the
 * ordered-dither scatter — solid at the floor, dissolving upward so it fades
 * out toward the value — then cap the top with a soft border outline.
 */
export function paintColumn(
	octx: CanvasRenderingContext2D,
	x: number,
	top: number,
	floor: number,
	fill: Rgb,
	{ intensity, dim, stacked }: PaintOpts
) {
	const t = Math.round(top);
	const f = Math.round(floor);
	const depth = f - t;
	if (depth <= 0) {
		octx.fillStyle = rgb(fill, 1, BORDER_ALPHA * dim);
		octx.fillRect(x, t, 1, 1);
		return;
	}
	const bias = stacked ? 0.2 : 0;
	for (let y = t; y < f; y += 1) {
		// Inverted falloff: 0 at the top line, 1 at the floor — dense at the
		// bottom, thinning as it rises toward the outline.
		let density = (y - t) / depth;
		if (stacked) {
			density = 0.5 + 0.5 * density;
		}
		const lit =
			// biome-ignore lint/suspicious/noBitwiseOperators: integer hash
			density > BAYER[y & 3][x & 3] - 0.1 * intensity - bias;
		// Every cell is covered; the dither rides the alpha (on = full tier,
		// off = a faint tint) so nothing shows the background through as white.
		const k = (0.3 + density * 0.7) * (1 + 0.22 * intensity);
		const alpha = clamp01((lit ? k : k * OFF_TIER) * dim);
		octx.fillStyle = rgb(fill, 1, alpha);
		octx.fillRect(x, y, 1, 1);
	}
	// Top border outline, with a faint feather row beneath, so it reads as a
	// soft edge rather than a hard line floating over the fade.
	octx.fillStyle = rgb(fill, 1, BORDER_ALPHA * dim);
	octx.fillRect(x, t, 1, 1);
	if (depth > 1) {
		octx.fillStyle = rgb(fill, 1, BORDER_ALPHA * 0.5 * dim);
		octx.fillRect(x, t + 1, 1, 1);
	}
}

/** Backing-canvas resolution for a plot rect — low-res, scaled up `pixelated`. */
export function backingSize(width: number, height: number) {
	return {
		cols: Math.min(MAX_COLS, Math.max(8, Math.round(width / CELL))),
		rows: Math.min(MAX_ROWS, Math.max(8, Math.round(height / CELL))),
	};
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

// Fraction of an entrance spent staggering item starts — the rest is each item's
// own grow window, so the rise sweeps across the chart as a wave.
const STAGGER = 0.55;

/**
 * Eased 0–1 grow factor for item `index` of `count` at global `progress`. Shared
 * by the vertical bars (BarCanvas) and the horizontal rows (BarList) so both
 * entrances sweep with the same wave.
 */
export const staggeredProgress = (
	index: number,
	count: number,
	progress: number
) => {
	const start = count > 1 ? (index / (count - 1)) * STAGGER : 0;
	return easeOutCubic(clamp01((progress - start) / (1 - STAGGER)));
};

/** Whether the OS asks for reduced motion. */
export function prefersReducedMotion() {
	return (
		window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
	);
}
