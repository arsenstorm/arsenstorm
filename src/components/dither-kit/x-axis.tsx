import { useChart } from "./chart-context";

const TICK_MARGIN = 8;

export function XAxis({
	dataKey,
	maxTicks = 8,
}: {
	dataKey: string;
	maxTicks?: number;
}) {
	const ctx = useChart("XAxis");
	if (!ctx.ready) {
		return null;
	}

	const step = Math.max(1, Math.ceil(ctx.data.length / maxTicks));
	const y = ctx.plot.height + TICK_MARGIN;

	return (
		<g className="fill-current font-mono text-[10px] text-muted-foreground">
			{ctx.data.map((row, i) => {
				if (i % step !== 0) {
					return null;
				}
				return (
					<text
						dominantBaseline="hanging"
						fill="currentColor"
						// biome-ignore lint/suspicious/noArrayIndexKey: index is the stable x position
						key={i}
						textAnchor="middle"
						x={ctx.xCenter(i)}
						y={y}
					>
						{String(row[dataKey] ?? "")}
					</text>
				);
			})}
		</g>
	);
}
