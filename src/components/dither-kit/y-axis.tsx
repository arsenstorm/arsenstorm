"use client";

import { useChartPart } from "./chart-context";

export function YAxis({
	tickFormatter,
	tickCount = 4,
	tickMargin = 8,
}: {
	tickFormatter?: (value: number) => string;
	tickCount?: number;
	tickMargin?: number;
}) {
	const ctx = useChartPart("YAxis");
	if (!ctx.ready) {
		return null;
	}

	return (
		<g className="fill-current font-mono text-[10px] text-muted-foreground">
			{ctx.y.ticks(tickCount).map((t) => (
				<text
					dominantBaseline="central"
					fill="currentColor"
					key={t}
					textAnchor="end"
					x={-tickMargin}
					y={ctx.y(t)}
				>
					{tickFormatter ? tickFormatter(t) : t}
				</text>
			))}
		</g>
	);
}
