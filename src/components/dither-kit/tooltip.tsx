"use client";

import { cn } from "cnfast";
import { useState } from "react";
import type { ChartContextValue } from "./chart-context";
import { useChart } from "./chart-context";
import { rgb } from "./palette";

/** Top px for the card: follows the highest hovered bar, floored so the
 * upward-lifted card never clips the plot's top. */
function tooltipTop(ctx: ChartContextValue, index: number) {
	const floor = ctx.margins.top + 44;
	if (ctx.hoverIndex === null) {
		return floor;
	}
	let minY = Number.POSITIVE_INFINITY;
	for (const key of ctx.configKeys) {
		const band = ctx.bands[key]?.[index];
		if (band) {
			minY = Math.min(minY, ctx.y(band[1]));
		}
	}
	return Number.isFinite(minY)
		? Math.max(floor, ctx.margins.top + minY)
		: floor;
}

/**
 * Floating hover tooltip. It glides between bars and fades in and out via CSS
 * transitions, staying mounted so the fade-out keeps its last content.
 */
export function Tooltip({
	hideZero = false,
}: {
	/** Omit zero-value series — for stacks where series take turns being absent. */
	hideZero?: boolean;
}) {
	const ctx = useChart("Tooltip");
	const show = ctx.ready && ctx.hoverIndex !== null;

	// Retain the last hovered index so the card keeps its content while fading
	// out — adjust-state-during-render (no refs in render).
	const [lastIndex, setLastIndex] = useState(0);
	if (ctx.hoverIndex !== null && ctx.hoverIndex !== lastIndex) {
		setLastIndex(ctx.hoverIndex);
	}
	const index = ctx.hoverIndex ?? lastIndex;
	const row = ctx.data[index];

	const items = ctx.configKeys
		.map((key) => {
			const raw = row?.[key];
			return {
				key,
				label: ctx.config[key]?.label ?? key,
				value: typeof raw === "number" ? raw : 0,
			};
		})
		.filter((item) => !(hideZero && item.value === 0));

	if (items.length === 0) {
		return null;
	}

	const heading = String(row?.[ctx.labelKey] ?? "");
	const left = Math.max(
		48,
		Math.min(ctx.plot.width + ctx.margins.left - 48, ctx.cursorX)
	);

	return (
		<div
			// The chart's hidden table already carries these values.
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[115%] rounded-md border border-border bg-popover px-2 py-1 shadow-sm transition-[top,left,opacity] duration-200 ease-out",
				show ? "opacity-100" : "opacity-0"
			)}
			style={{ left, top: tooltipTop(ctx, index) }}
		>
			{heading ? (
				<div className="mb-0.5 font-mono text-[10px] text-muted-foreground">
					{heading}
				</div>
			) : null}
			<div className="flex flex-col gap-0.5">
				{items.map((item) => (
					<div
						className="flex items-center gap-1.5 font-mono text-[11px] text-popover-foreground tabular-nums"
						key={item.key}
					>
						<span
							className="size-2 rounded-[1px]"
							style={{ backgroundColor: rgb(ctx.colorOf(item.key)) }}
						/>
						<span className="text-muted-foreground">{item.label}</span>
						<span className="ml-auto pl-2 text-foreground">
							{item.value.toLocaleString("en-GB")}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

Tooltip.chartLayer = "dom" as const;
