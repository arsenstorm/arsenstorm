import type { ScaleLinear } from "d3-scale";
import { useCallback, useMemo, useState } from "react";
import type {
	ChartConfig,
	ChartContextValue,
	ChartType,
	Margins,
	SeriesSpec,
} from "./chart-context";
import { useRevision } from "./chart-context";
import type { CommonChart } from "./common-context";
import type { BloomInput } from "./dither-paint";
import type { Seed } from "./palette";
import { seedOfColor } from "./palette";
import {
	buildBandScale,
	buildXScale,
	buildYScale,
	computeBands,
	indexAtBand,
	nearestIndex,
	type StackType,
} from "./scales";
import type { Dimensions } from "./use-chart-dimensions";

// Mirrors the private row shape in chart-context.tsx — an opaque bag of columns
// the controller only ever reads through the configured series keys.
type Row = Record<string, unknown>;

/** Whether a part re-registering `next` would change what is already recorded.
 * Compares only the paint-affecting fields, as the original registry did. */
function sameSpec(cur: SeriesSpec | undefined, next: SeriesSpec) {
	return Boolean(
		cur &&
			cur.kind === next.kind &&
			cur.variant === next.variant &&
			cur.strokeVariant === next.strokeVariant
	);
}

/** The specs each `<Area>` / `<Line>` / `<Bar>` part registers, plus the stable
 * callbacks it registers through. */
function useSeriesRegistry() {
	const [seriesSpecs, setSeriesSpecs] = useState<Record<string, SeriesSpec>>(
		{}
	);
	// useCallback because the series effects in area.tsx/bar.tsx list these as
	// deps — without stable identities the unregister/register effect re-fires
	// every render and its setState pair loops ("Maximum update depth exceeded").
	const registerSeries = useCallback((spec: SeriesSpec) => {
		setSeriesSpecs((prev) =>
			sameSpec(prev[spec.dataKey], spec)
				? prev
				: { ...prev, [spec.dataKey]: spec }
		);
	}, []);
	const unregisterSeries = useCallback((dataKey: string) => {
		setSeriesSpecs((prev) => {
			if (!(dataKey in prev)) {
				return prev;
			}
			const next = { ...prev };
			delete next[dataKey];
			return next;
		});
	}, []);
	return { seriesSpecs, registerSeries, unregisterSeries };
}

/** The stack bands and the x/y scale helpers derived from them — everything that
 * turns a row index or a value into plot pixels. */
function useChartScales({
	chartType,
	data,
	configKeys,
	stackType,
	plotWidth,
	plotHeight,
}: {
	chartType: ChartType;
	data: Row[];
	configKeys: string[];
	stackType: StackType;
	plotWidth: number;
	plotHeight: number;
}) {
	// Memoized: the priciest derivation in the render path — it walks every
	// row × series to build the stack bands. Hover/cursor state changes must not
	// recompute it, only a real data/series/stack change.
	const { bands, max, min } = useMemo(
		() => computeBands(data, configKeys, stackType),
		[data, configKeys, stackType]
	);

	const isBar = chartType === "bar";
	// The d3 scale factories are memoized so `y` keeps a stable identity: the
	// canvas `targets` memo (cartesian-canvas / bar-canvas) deps on ctx.y, and
	// xCenter/indexAtX/barSlot below close over these.
	const xPoint = useMemo(
		() => buildXScale(data.length, plotWidth),
		[data.length, plotWidth]
	);
	const xBand = useMemo(
		() => buildBandScale(data.length, plotWidth),
		[data.length, plotWidth]
	);
	const bandwidth = isBar ? xBand.bandwidth() : 0;
	const xCenter = useCallback(
		(i: number) =>
			isBar ? (xBand(i) ?? 0) + xBand.bandwidth() / 2 : (xPoint(i) ?? 0),
		[isBar, xBand, xPoint]
	);
	const indexAtX = useCallback(
		(px: number) =>
			isBar
				? indexAtBand(px, data.length, plotWidth)
				: nearestIndex(px, data.length, plotWidth),
		[isBar, data.length, plotWidth]
	);
	const stacked = stackType === "stacked" || stackType === "percent";
	const barSlot = useCallback(
		(i: number, si: number, n: number) => {
			const center = xCenter(i);
			if (stacked) {
				const w = bandwidth * 0.9;
				return { x: center - w / 2, width: w };
			}
			const slot = bandwidth / Math.max(n, 1);
			return {
				x: center - bandwidth / 2 + si * slot + slot * 0.08,
				width: slot * 0.84,
			};
		},
		[xCenter, stacked, bandwidth]
	);
	const y = useMemo(
		() => buildYScale(min, max, plotHeight),
		[min, max, plotHeight]
	);
	return { bands, max, min, bandwidth, xCenter, indexAtX, barSlot, y };
}

/** Top px for the tooltip card: follows the highest hovered node so it rides the
 * data path, floored so the upward-lifted card never clips the plot's top. */
function tooltipTopFor(
	hoverIndex: number | null,
	configKeys: string[],
	bands: Record<string, [number, number][]>,
	y: ScaleLinear<number, number>,
	mTop: number
) {
	const floor = mTop + 44;
	if (hoverIndex == null) {
		return floor;
	}
	let minY = Number.POSITIVE_INFINITY;
	for (const key of configKeys) {
		const b = bands[key]?.[hoverIndex];
		if (b) {
			minY = Math.min(minY, y(b[1]));
		}
	}
	if (!Number.isFinite(minY)) {
		return floor;
	}
	return Math.max(floor, mTop + minY);
}

/** The `<Legend>` / `<Tooltip>` surface: the same selection and hover state as
 * the chart context, reshaped into the family-agnostic {@link CommonChart}. */
function useCommonChart({
	config,
	configKeys,
	data,
	bands,
	y,
	seedOf,
	selectedDataKey,
	selectDataKey,
	focusDataKey,
	setFocusDataKey,
	hoverIndex,
	ready,
	plotWidth,
	mLeft,
	mTop,
	cursorX,
}: {
	config: ChartConfig;
	configKeys: string[];
	data: Row[];
	bands: Record<string, [number, number][]>;
	y: ScaleLinear<number, number>;
	seedOf: (key: string) => Seed;
	selectedDataKey: string | null;
	selectDataKey: (key: string | null) => void;
	focusDataKey: string | null;
	setFocusDataKey: (key: string | null) => void;
	hoverIndex: number | null;
	ready: boolean;
	plotWidth: number;
	mLeft: number;
	mTop: number;
	cursorX: number;
}): CommonChart {
	// Memoized: this is the value handed to CommonChartContext (Legend/Tooltip),
	// so it needs its own stable identity independent of the parent value.
	return useMemo(
		() => ({
			names: configKeys,
			labelOf: (n) => config[n]?.label ?? n,
			seedOf,
			selectedDataKey,
			selectDataKey,
			focusDataKey,
			setFocusDataKey,
			hoverIndex,
			ready,
			tooltipLeft: Math.max(48, Math.min(plotWidth + mLeft - 48, cursorX)),
			tooltipTop: tooltipTopFor(hoverIndex, configKeys, bands, y, mTop),
			heading: (i, labelKey) =>
				labelKey ? String(data[i]?.[labelKey] ?? "") : null,
			itemsAt: (i) =>
				configKeys.map((name) => {
					const raw = data[i]?.[name];
					return {
						name,
						label: config[name]?.label ?? name,
						value: typeof raw === "number" ? raw : 0,
						seed: seedOf(name),
						dimmed: (() => {
							const emphasis = selectedDataKey ?? focusDataKey;
							return emphasis !== null && emphasis !== name;
						})(),
					};
				}),
		}),
		[
			configKeys,
			config,
			seedOf,
			selectedDataKey,
			selectDataKey,
			focusDataKey,
			setFocusDataKey,
			hoverIndex,
			ready,
			plotWidth,
			mLeft,
			mTop,
			cursorX,
			bands,
			y,
			data,
		]
	);
}

/**
 * Builds the shared context value: resolves the plot rect from the measured
 * size minus margins, computes the x/y scales and the per-series stack bands,
 * and owns the selection + hover state every part reads.
 */
export function useChartController({
	chartType,
	data,
	config,
	stackType,
	dimensions,
	margins,
	animate = true,
	animationDuration = 900,
	replayToken = 0,
	hovered = false,
	bloom = "off",
	bloomOnHover = false,
	defaultSelectedDataKey = null,
	onSelectionChange,
}: {
	chartType: ChartType;
	data: Row[];
	config: ChartConfig;
	stackType: StackType;
	dimensions: Dimensions;
	margins: Margins;
	animate?: boolean;
	animationDuration?: number;
	replayToken?: number;
	hovered?: boolean;
	bloom?: BloomInput;
	bloomOnHover?: boolean;
	defaultSelectedDataKey?: string | null;
	onSelectionChange?: (key: string | null) => void;
}): ChartContextValue {
	// This object becomes the ChartContext value, so its identity — and the
	// identity of every function/object it carries — must stay stable across
	// renders that don't change the underlying inputs. Otherwise every consumer
	// (axes, legend, tooltip, dots) re-renders on every parent render. So the
	// expensive derivations, the exposed callbacks, and the returned value are
	// memoized below; only cheap scalars (bandwidth, ready, plot sizes) are left
	// bare, since they're just recomputed reads, not identities anyone depends on.

	// Memoized: configKeys is the dep that drives `bands`, `common` and the
	// canvas `targets` memo — a fresh array each render would bust all of them.
	const configKeys = useMemo(() => Object.keys(config), [config]);
	const revision = useRevision(data, replayToken);

	const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
		defaultSelectedDataKey
	);
	const [focusDataKey, setFocusDataKey] = useState<string | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [cursorX, setCursorX] = useState(0);
	const [isMouseInChart, setMouseInChart] = useState(false);
	const { seriesSpecs, registerSeries, unregisterSeries } = useSeriesRegistry();

	// Stable so the memoized value keeps its identity; only re-created when the
	// caller's selection handler does.
	const selectDataKey = useCallback(
		(key: string | null) => {
			setSelectedDataKey(key);
			onSelectionChange?.(key);
		},
		[onSelectionChange]
	);

	// The root spreads `{ ...DEFAULT_MARGINS, ...marginsProp }` fresh every
	// render, so `margins` never keeps its identity. Pin one off the four numbers
	// so it doesn't, on its own, invalidate the value or the plot geometry.
	const { top: mTop, right: mRight, bottom: mBottom, left: mLeft } = margins;
	const stableMargins = useMemo(
		() => ({ top: mTop, right: mRight, bottom: mBottom, left: mLeft }),
		[mTop, mRight, mBottom, mLeft]
	);

	const plotWidth = Math.max(0, dimensions.width - mLeft - mRight);
	const plotHeight = Math.max(0, dimensions.height - mTop - mBottom);
	const ready = plotWidth > 0 && plotHeight > 0;

	// The entrance gate flips true when the canvas reveal completes (via
	// `markEntranceDone`) so DOM markers fade in with the fill, and re-arms on
	// each replay. Adjust-state-during-render instead of an effect, so the reset
	// lands in the same render as the revision bump.
	const [entrance, setEntrance] = useState({ revision, done: !animate });
	if (entrance.revision !== revision) {
		setEntrance({ revision, done: !animate });
	}
	const entranceDone =
		entrance.revision === revision ? entrance.done : !animate;
	// Stable across renders at the same revision; the canvas holds this in a ref.
	const markEntranceDone = useCallback(
		() => setEntrance({ revision, done: true }),
		[revision]
	);

	const { bands, max, min, bandwidth, xCenter, indexAtX, barSlot, y } =
		useChartScales({
			chartType,
			data,
			configKeys,
			stackType,
			plotWidth,
			plotHeight,
		});

	// Stable so `common` and the value stay stable; re-created only on config.
	const seedOf = useCallback(
		(key: string) => seedOfColor(config[key]?.color ?? "grey"),
		[config]
	);

	const common = useCommonChart({
		config,
		configKeys,
		data,
		bands,
		y,
		seedOf,
		selectedDataKey,
		selectDataKey,
		focusDataKey,
		setFocusDataKey,
		hoverIndex,
		ready,
		plotWidth,
		mLeft,
		mTop,
		cursorX,
	});

	// Memoized: this is the ChartContext value. A fresh object here would
	// re-render every consumer on every parent render — the whole reason the
	// pieces above are stabilized. Rebuilds only when a listed input changes
	// (which is exactly when a consumer needs the update). The useState setters
	// it carries never change identity, so they are left out of the deps.
	return useMemo<ChartContextValue>(
		() => ({
			chartType,
			config,
			configKeys,
			data,
			dataLength: data.length,
			stackType,
			margins: stableMargins,
			plot: { width: plotWidth, height: plotHeight },
			ready,
			xCenter,
			bandwidth,
			indexAtX,
			barSlot,
			y,
			bands,
			max,
			min,
			selectedDataKey,
			selectDataKey,
			focusDataKey,
			setFocusDataKey,
			hoverIndex,
			setHoverIndex,
			cursorX,
			setCursorX,
			isMouseInChart,
			setMouseInChart,
			hovered,
			bloom,
			bloomOnHover,
			seriesSpecs,
			registerSeries,
			unregisterSeries,
			animate,
			animationDuration,
			revision,
			entranceDone,
			markEntranceDone,
			seedOf,
			common,
		}),
		[
			chartType,
			config,
			configKeys,
			data,
			stackType,
			stableMargins,
			plotWidth,
			plotHeight,
			ready,
			xCenter,
			bandwidth,
			indexAtX,
			barSlot,
			y,
			bands,
			max,
			min,
			selectedDataKey,
			selectDataKey,
			focusDataKey,
			hoverIndex,
			cursorX,
			isMouseInChart,
			hovered,
			bloom,
			bloomOnHover,
			seriesSpecs,
			registerSeries,
			unregisterSeries,
			animate,
			animationDuration,
			revision,
			entranceDone,
			markEntranceDone,
			seedOf,
			common,
		]
	);
}
