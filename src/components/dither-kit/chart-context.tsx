import type { ScaleLinear } from "d3-scale";
import { createContext, use, useState } from "react";
import type { CommonChart } from "./common-context";
import type { BloomInput } from "./dither-paint";
import type { DitherColor, Seed } from "./palette";
import type { StackType } from "./scales";

/** Which chart root a part is composed under — drives the boundary guards. */
export type ChartType = "area" | "bar" | "line" | "pie" | "radar";

export type ChartConfig = Record<
	string,
	{ label?: string; color: DitherColor }
>;

export interface Margins {
	bottom: number;
	left: number;
	right: number;
	top: number;
}

type Row = Record<string, unknown>;

export type AreaVariant = "gradient" | "dotted" | "hatched" | "solid";
export type StrokeVariant = "solid" | "dashed";
export type SeriesKind = "area" | "line" | "bar";

/** What each series part (<Area />, <Line />, <Bar />) registers so the canvas
 * knows which series to paint and how. */
export interface SeriesSpec {
	// Per-datum colour overrides, keyed by data index (bar series only).
	colors?: Partial<Record<number, DitherColor>>;
	dataKey: string;
	kind: SeriesKind;
	strokeVariant: StrokeVariant;
	variant: AreaVariant;
}

export interface ChartContextValue {
	// Entrance animation (prop-driven). `revision` bumps when the data changes or
	// the replay token advances, so the canvas can re-play its entrance.
	animate: boolean;
	animationDuration: number;
	bands: Record<string, [number, number][]>; // per-series [y0, y1] per row
	bandwidth: number; // category slot width (0 for point/area scales)
	// Bar geometry in plot px — one source of truth for the canvas + click rects.
	barSlot: (
		index: number,
		seriesIndex: number,
		seriesCount: number
	) => { x: number; width: number };
	bloom: BloomInput; // glow on the dither canvas
	bloomOnHover: boolean; // only bloom while hovered
	chartType: ChartType; // which root this part is under
	common: CommonChart; // shared surface for <Legend> / <Tooltip>
	config: ChartConfig;
	configKeys: string[]; // series order — drives stacking + legend
	cursorX: number;
	data: Row[];
	dataLength: number;
	entranceDone: boolean; // true once the entrance has played — gates SVG markers
	/** Legend-hover spotlight — dims every series but this one while set. */
	focusDataKey: string | null;
	hovered: boolean; // parent-driven hover (e.g. the whole card) — lifts the fill
	hoverIndex: number | null;
	indexAtX: (px: number) => number; // nearest category for a pointer x
	isMouseInChart: boolean;

	margins: Margins;
	markEntranceDone: () => void; // the canvas calls this when its reveal completes
	max: number;
	min: number; // most-negative value (0 when nothing dips below the baseline)
	plot: { width: number; height: number }; // inner drawing area
	ready: boolean; // true once measured (width > 0)
	registerSeries: (spec: SeriesSpec) => void;
	revision: number;

	// Helpers.
	seedOf: (key: string) => Seed;
	selectDataKey: (key: string | null) => void;

	// Interaction state, shared by every part.
	selectedDataKey: string | null;

	// Series register themselves so the canvas knows what (and how) to paint.
	seriesSpecs: Record<string, SeriesSpec>;
	setCursorX: (px: number) => void;
	setFocusDataKey: (key: string | null) => void;
	setHoverIndex: (index: number | null) => void;
	setMouseInChart: (over: boolean) => void;
	stackType: StackType;
	unregisterSeries: (dataKey: string) => void;

	xCenter: (index: number) => number; // category centre px within the plot
	y: ScaleLinear<number, number>; // value → px within the plot
}

const ChartContext = createContext<ChartContextValue | null>(null);

const ROOT_OF: Record<ChartType, string> = {
	area: "<AreaChart />",
	bar: "<BarChart />",
	line: "<LineChart />",
	pie: "<PieChart />",
	radar: "<RadarChart />",
};

/** Generic accessor for internal layers (canvas/overlay) that work for any root. */
export function useChart() {
	const ctx = use(ChartContext);
	if (!ctx) {
		throw new Error(
			"Chart parts must be used within a chart root (e.g. <AreaChart />)."
		);
	}
	return ctx;
}

/**
 * Boundary guard for a composable part. Throws a precise error when used outside
 * a root, or inside the wrong chart type — e.g. `<Bar />` placed in an area
 * chart. `kind` omitted means the part works under any root (grid, axes, …).
 */
export function useChartPart(
	part: string,
	kind?: ChartType | ChartType[]
): ChartContextValue {
	const ctx = use(ChartContext);
	if (!ctx) {
		const where = kind
			? ROOT_OF[Array.isArray(kind) ? kind[0] : kind]
			: "a chart root";
		throw new Error(`<${part} /> must be used within ${where}.`);
	}
	if (kind) {
		const allowed = Array.isArray(kind) ? kind : [kind];
		if (!allowed.includes(ctx.chartType)) {
			throw new Error(
				`<${part} /> is not valid inside ${ROOT_OF[ctx.chartType]} — it belongs in ${allowed
					.map((k) => ROOT_OF[k])
					.join(" or ")}.`
			);
		}
	}
	return ctx;
}

export { ChartContext };

/** A counter that advances whenever `data` changes identity or `token` advances
 * — drives entrance replays without remounting. Uses the adjust-state-during-
 * render pattern (https://react.dev/reference/react/useState) instead of a ref:
 * the revision is derived purely from render inputs, so it stays consistent
 * across the memoized values below rather than lagging a render behind. */
export function useRevision(data: unknown, token: number) {
	const [prev, setPrev] = useState({ data, token, revision: 0 });
	if (prev.data !== data || prev.token !== token) {
		const next = { data, token, revision: prev.revision + 1 };
		setPrev(next);
		return next.revision;
	}
	return prev.revision;
}
