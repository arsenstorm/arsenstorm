"use client";

import { useChart } from "./chart-context";
import { rgb } from "./palette";

/** Series legend, pinned to the top right of the plot. Best for two or three
 * entries: more wrap onto extra rows that overlay the chart. */
export function Legend() {
	const ctx = useChart("Legend");

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap justify-end gap-3 px-1"
		>
			{ctx.configKeys.map((key) => (
				<span
					className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
					key={key}
				>
					<span
						className="size-2 rounded-[1px]"
						style={{ backgroundColor: rgb(ctx.colorOf(key)) }}
					/>
					{ctx.config[key]?.label ?? key}
				</span>
			))}
		</div>
	);
}

Legend.chartLayer = "dom" as const;
