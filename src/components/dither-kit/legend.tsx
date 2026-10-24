"use client";

import { cn } from "cnfast";
import { useCallback } from "react";
import { useCommonChart } from "./common-context";
import { rgb } from "./palette";

/** Series/slice legend. With `isClickable`, each entry toggles its selection.
 * Works in every chart family via the shared common context.
 *
 * Note: this is an absolute overlay pinned to the top of the plot, so it's best
 * for ≤2–3 entries. With more entries (or a narrow container) it wraps onto
 * extra rows that overlay the chart — reach for the in-flow `<BlockLegend>`
 * instead, which renders as a sibling and can't overlap at any width. */
export function Legend({
	isClickable = false,
	align = "right",
}: {
	isClickable?: boolean;
	align?: "left" | "center" | "right";
}) {
	const chart = useCommonChart();

	return (
		<div
			className={cn(
				"pointer-events-none absolute inset-x-0 top-0 flex flex-wrap gap-3 px-1",
				align === "right" && "justify-end",
				align === "center" && "justify-center",
				align === "left" && "justify-start"
			)}
		>
			{chart.names.map((name) => (
				<LegendItem isClickable={isClickable} key={name} name={name} />
			))}
		</div>
	);
}

Legend.chartLayer = "dom" as const;

function LegendItem({
	isClickable,
	name,
}: {
	isClickable: boolean;
	name: string;
}) {
	const chart = useCommonChart();
	const { selectDataKey, selectedDataKey, setFocusDataKey } = chart;
	const seed = chart.seedOf(name);
	const emphasis = selectedDataKey ?? chart.focusDataKey;
	const dimmed = emphasis !== null && emphasis !== name;

	const focus = useCallback(
		() => setFocusDataKey(name),
		[setFocusDataKey, name]
	);
	const unfocus = useCallback(() => setFocusDataKey(null), [setFocusDataKey]);
	const toggle = useCallback(
		() => selectDataKey(selectedDataKey === name ? null : name),
		[selectDataKey, selectedDataKey, name]
	);

	return (
		<button
			className={cn(
				"flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-opacity",
				isClickable &&
					"pointer-events-auto cursor-pointer hover:text-foreground",
				dimmed && "opacity-40"
			)}
			disabled={!isClickable}
			onBlur={unfocus}
			onClick={toggle}
			onFocus={focus}
			// Hovering an entry spotlights its series so overlapping layers
			// (e.g. two meshed radar polygons) can be told apart at a glance.
			onPointerEnter={focus}
			onPointerLeave={unfocus}
			type="button"
		>
			<span
				className="size-2 rounded-[1px]"
				style={{ backgroundColor: rgb(seed.fill) }}
			/>
			{chart.labelOf(name)}
		</button>
	);
}
