import { Arrow, Box, Diagram } from "#/components/mdx/diagram.tsx";

const W = 150;
const H = 40;
const COL = [20, 190, 360];
const ROW1 = 24;
const ROW2 = 104;
const CY1 = ROW1 + H / 2;
const CY2 = ROW2 + H / 2;
const lastCol = COL[2] + W / 2;

/** The streamer's per-object pipeline, wrapped as a snake to fit the column. */
export function PublishLoop() {
	return (
		<Diagram
			arrowPad={0}
			label="The streamer runs one pipeline per object: load cursor, plan the next object, get a grant, upload, commit — then loop to the next part."
			title="The publish loop"
			viewBox="8 12 514 144"
		>
			{/* row 1, left to right */}
			<Arrow x1={COL[0] + W} x2={COL[1]} y1={CY1} y2={CY1} />
			<Arrow x1={COL[1] + W} x2={COL[2]} y1={CY1} y2={CY1} />

			{/* wrap down to row 2 */}
			<Arrow x1={lastCol} x2={lastCol} y1={ROW1 + H} y2={ROW2} />

			{/* row 2, right to left */}
			<Arrow x1={COL[2]} x2={COL[1] + W} y1={CY2} y2={CY2} />
			<Arrow x1={COL[1]} x2={COL[0] + W} y1={CY2} y2={CY2} />

			{/* loop back up to the start */}
			<Arrow x1={COL[0] + W / 2} x2={COL[0] + W / 2} y1={ROW2} y2={ROW1 + H} />

			<Box h={H} label="load cursor" w={W} x={COL[0]} y={ROW1} />
			<Box h={H} label="plan next object" w={W} x={COL[1]} y={ROW1} />
			<Box h={H} label="grant" w={W} x={COL[2]} y={ROW1} />

			<Box h={H} label="upload" w={W} x={COL[2]} y={ROW2} />
			<Box h={H} label="commit" w={W} x={COL[1]} y={ROW2} />
			<Box h={H} label="next part" w={W} x={COL[0]} y={ROW2} />
		</Diagram>
	);
}
