import { Arrow, Box, Diagram } from "#/components/mdx/diagram.tsx";

const W = 150;
const H = 46;
const COL = [20, 190, 360];
const ROW1 = 24;
const ROW2 = 110;
const CY1 = ROW1 + H / 2;
const CY2 = ROW2 + H / 2;
const lastCol = COL[2] + W / 2;

/** The request flows in as an email and out as one — the work sits in between. */
export function EmailPipeline() {
	return (
		<Diagram
			arrowPad={0}
			label="The img-to-pdf pipeline: an inbound email is received, the sender is identified and authorized, the MIME body is parsed, the images are converted into a PDF, and the result is sent back as a reply. The first and last steps — both emails — are the entire interface."
			title="The email pipeline"
			viewBox="8 12 514 156"
		>
			{/* row 1, left to right */}
			<Arrow x1={COL[0] + W} x2={COL[1]} y1={CY1} y2={CY1} />
			<Arrow x1={COL[1] + W} x2={COL[2]} y1={CY1} y2={CY1} />

			{/* wrap down to row 2 */}
			<Arrow x1={lastCol} x2={lastCol} y1={ROW1 + H} y2={ROW2} />

			{/* row 2, right to left */}
			<Arrow x1={COL[2]} x2={COL[1] + W} y1={CY2} y2={CY2} />
			<Arrow x1={COL[1]} x2={COL[0] + W} y1={CY2} y2={CY2} />

			<Box
				h={H}
				label="receive"
				sub="inbound email"
				variant="solid"
				w={W}
				x={COL[0]}
				y={ROW1}
			/>
			<Box h={H} label="identify" sub="From header" w={W} x={COL[1]} y={ROW1} />
			<Box h={H} label="authorize" sub="tier check" w={W} x={COL[2]} y={ROW1} />

			<Box h={H} label="parse" sub="MIME body" w={W} x={COL[2]} y={ROW2} />
			<Box h={H} label="convert" sub="images → PDF" w={W} x={COL[1]} y={ROW2} />
			<Box
				h={H}
				label="reply"
				sub="PDF attached"
				variant="solid"
				w={W}
				x={COL[0]}
				y={ROW2}
			/>
		</Diagram>
	);
}
