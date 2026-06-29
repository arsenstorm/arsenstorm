import {
	Arrow,
	Box,
	Diagram,
	Label,
	MarkedPath,
} from "#/components/mdx/diagram.tsx";

const PUB = 90;
const COORD = 290;
const STORE = 480;
const LIFELINE_TOP = 54;
const LIFELINE_BOTTOM = 312;

/** The four phases — slot, upload, observe, commit — traced as wire messages. */
export function CommitSequence() {
	return (
		<Diagram
			arrowPad={0}
			label="The commit handshake. The publisher gets a slot, uploads bytes directly to storage, then tells the coordinator. The coordinator observes what actually landed, then commits and advances the cursor. The bytes never pass through the coordinator."
			title="The life of an object"
			viewBox="26 2 518 322"
		>
			{/* lifelines */}
			{[PUB, COORD, STORE].map((x) => (
				<line
					className="stroke-neutral-400 dark:stroke-neutral-600"
					key={x}
					strokeDasharray="3 4"
					strokeWidth={1}
					x1={x}
					x2={x}
					y1={LIFELINE_TOP}
					y2={LIFELINE_BOTTOM}
				/>
			))}

			<Box h={36} label="Publisher" w={104} x={PUB - 52} y={14} />
			<Box
				h={36}
				label="Coordinator"
				variant="solid"
				w={104}
				x={COORD - 52}
				y={14}
			/>
			<Box h={36} label="Storage" w={104} x={STORE - 52} y={14} />

			{/* 1. request slot */}
			<Label anchor="start" x={PUB + 6} y={78}>
				1. request slot
			</Label>
			<Arrow x1={PUB} x2={COORD} y1={86} y2={86} />

			{/* 2. grant (return) */}
			<Label anchor="start" x={PUB + 6} y={110}>
				2. grant · issued
			</Label>
			<Arrow dashed x1={COORD} x2={PUB} y1={118} y2={118} />

			{/* 3. PUT bytes */}
			<Label anchor="start" x={PUB + 6} y={148}>
				3. PUT bytes · IfNoneMatch:*
			</Label>
			<Arrow x1={PUB} x2={STORE} y1={156} y2={156} />

			{/* 4. completion hint */}
			<Label anchor="start" x={PUB + 6} y={186}>
				4. completion hint
			</Label>
			<Arrow x1={PUB} x2={COORD} y1={194} y2={194} />

			{/* 5. observe */}
			<Label anchor="start" x={COORD + 6} y={224}>
				5. HeadObject · observe
			</Label>
			<Arrow x1={COORD} x2={STORE} y1={232} y2={232} />

			{/* 6. observed facts (return) */}
			<Label anchor="start" x={COORD + 6} y={256}>
				6. size · type · etag
			</Label>
			<Arrow dashed x1={STORE} x2={COORD} y1={264} y2={264} />

			{/* 7. commit (self) — end 6px (ARROW_LEN) short so the tip lands on the lifeline */}
			<MarkedPath d={`M${COORD},288 h28 v16 h-22`} />
			<Label anchor="start" x={COORD + 34} y={300}>
				7. commit · update cursor
			</Label>
		</Diagram>
	);
}
