import { scaleBand, scaleLinear } from "d3-scale";

type Row = Record<string, unknown>;

const num = (v: unknown) =>
	typeof v === "number" && Number.isFinite(v) ? v : 0;

/**
 * Per-series [y0, y1] bands for every row. Unstacked, every series sits on the
 * zero baseline (y0 = 0); stacked, each series starts where the one before it
 * ends, in config order. `max`/`min` bound the value range for the y-scale.
 */
export function computeBands(
	data: Row[],
	keys: string[],
	stacked: boolean
): { bands: Record<string, [number, number][]>; max: number; min: number } {
	const bands: Record<string, [number, number][]> = {};
	let max = 0;
	let min = 0;
	if (stacked) {
		const totals = data.map(() => 0);
		for (const key of keys) {
			bands[key] = data.map((row, i) => {
				const low = totals[i] ?? 0;
				const high = low + num(row[key]);
				totals[i] = high;
				max = Math.max(max, high);
				min = Math.min(min, low);
				return [low, high];
			});
		}
	} else {
		for (const key of keys) {
			bands[key] = data.map((row) => {
				const v = num(row[key]);
				max = Math.max(max, v);
				min = Math.min(min, v);
				return [0, v];
			});
		}
	}
	// Fall back to a unit span only when there is no range at all.
	const flat = max === 0 && min === 0;
	return { bands, max: flat ? 1 : max, min };
}

/** Banded x for bar categories — each index owns a slot of `bandwidth` width. */
export function buildBandScale(length: number, plotWidth: number) {
	return scaleBand<number>()
		.domain(Array.from({ length }, (_, i) => i))
		.range([0, plotWidth])
		.paddingInner(0.28)
		.paddingOuter(0.18);
}

/** Index of the category whose band a horizontal pixel offset falls in. */
export function indexAtBand(px: number, length: number, plotWidth: number) {
	if (length <= 0 || plotWidth <= 0) {
		return 0;
	}
	const t = Math.max(0, Math.min(0.999, px / plotWidth));
	return Math.min(length - 1, Math.floor(t * length));
}

/** value → vertical pixel. The domain always includes zero. */
export function buildYScale(min: number, max: number, plotHeight: number) {
	const lo = Math.min(0, min);
	const hi = Math.max(0, max);
	// Guard a zero-width domain so `nice()` and the range map stay finite.
	return scaleLinear()
		.domain([lo, hi === lo ? lo + 1 : hi])
		.nice()
		.range([plotHeight, 0]);
}
