import { Diagram, Label } from "#/components/mdx/diagram.tsx";

// Median stage times from the local benchmark (1000 samples, real H.264).
const STAGES = [
	{ label: "encode fill", ms: 121.7, text: "122 ms" },
	{ label: "publish", ms: 1.02, text: "1.0 ms" },
	{ label: "wake", ms: 0.16, text: "0.16 ms" },
	{ label: "fetch", ms: 0.3, text: "0.30 ms" },
];
const TICKS = [0, 50, 100];

const AX_X = 132;
const AX_W = 320;
const MAX_MS = 130;
const BAR_H = 20;
const ROW_PITCH = 40;
const ROW_TOP = 30;
const GRID_TOP = 12;
const GRID_BOTTOM = 162;
const ms = (value: number) => (value / MAX_MS) * AX_W;
const rowCenter = (i: number) => ROW_TOP + i * ROW_PITCH;

/** Where a part's latency goes: the media pipeline dominates, OLOS adds ~1ms. */
export function LatencyBreakdown() {
	return (
		<Diagram
			label="Median latency breakdown from the local benchmark. Encode fill (about 122 ms) is the media pipeline; the OLOS coordinator path — commit and manifest wake — adds about 1.2 ms; fetch is the player reading the part back."
			title="Latency breakdown (median, local benchmark)"
			viewBox="42 0 448 194"
		>
			{/* gridlines */}
			{TICKS.map((t) => (
				<line
					className="stroke-neutral-200 dark:stroke-neutral-800"
					key={t}
					strokeWidth={1}
					x1={AX_X + ms(t)}
					x2={AX_X + ms(t)}
					y1={GRID_TOP}
					y2={GRID_BOTTOM}
				/>
			))}

			{/* bars */}
			{STAGES.map((stage, i) => {
				const cy = rowCenter(i);
				return (
					<g key={stage.label}>
						<Label anchor="end" muted={false} x={AX_X - 10} y={cy + 3}>
							{stage.label}
						</Label>
						{stage.ms > 0 ? (
							<rect
								className="fill-neutral-900 dark:fill-neutral-100"
								height={BAR_H}
								rx={3}
								width={Math.max(ms(stage.ms), 2)}
								x={AX_X}
								y={cy - BAR_H / 2}
							/>
						) : null}
						<Label anchor="start" x={AX_X + ms(stage.ms) + 7} y={cy + 3}>
							{stage.text}
						</Label>
					</g>
				);
			})}

			{/* axis ticks */}
			{TICKS.map((t) => (
				<Label key={t} x={AX_X + ms(t)} y={GRID_BOTTOM + 16}>
					{t === 100 ? "100 ms" : String(t)}
				</Label>
			))}
		</Diagram>
	);
}
