import { Box, Diagram, Label } from "#/components/mdx/diagram.tsx";

const SLOT_W = 42;
const SLOT_GAP = 8;
const SLOT_X0 = 18;
const SLOT_Y = 84;
const SLOT_H = 40;
const slotX = (i: number) => SLOT_X0 + i * (SLOT_W + SLOT_GAP);

const COMMITTED = [2, 3, 4, 5, 6];
const BRACKET = "stroke-neutral-400 dark:stroke-neutral-600";

/** A bracket embracing a span of slots, with a label, above or below them. */
function GroupBracket({
	from,
	to,
	label,
	below,
}: {
	from: number;
	to: number;
	label: string;
	below?: boolean;
}) {
	const d = below
		? `M${from},134 v8 h${to - from} v-8`
		: `M${from},66 v-8 h${to - from} v8`;
	return (
		<>
			<path className={BRACKET} d={d} fill="none" strokeWidth={1.25} />
			<Label x={(from + to) / 2} y={below ? 156 : 50}>
				{label}
			</Label>
		</>
	);
}

/** Committed prefix, cursor at the live edge, gap, and retired objects. */
export function LiveWindow() {
	const retiredEnd = slotX(1) + SLOT_W + SLOT_GAP / 2;
	const windowEnd = slotX(6) + SLOT_W;
	const cursorX = windowEnd + SLOT_GAP / 2;

	return (
		<Diagram
			label="The live window is the contiguous prefix of committed objects. The cursor sits at the live edge and only moves forward. Objects committed out of order wait behind a gap until it fills; objects that fall out of the window are retired and deleted."
			title="The cursor & live window"
			viewBox="1 27 474 145"
		>
			<GroupBracket
				below
				from={slotX(0)}
				label="retired → deleted"
				to={retiredEnd}
			/>
			<GroupBracket from={retiredEnd} label="live window" to={cursorX} />

			{/* retired */}
			<Box
				h={SLOT_H}
				label="0"
				variant="dashed"
				w={SLOT_W}
				x={slotX(0)}
				y={SLOT_Y}
			/>
			<Box
				h={SLOT_H}
				label="1"
				variant="dashed"
				w={SLOT_W}
				x={slotX(1)}
				y={SLOT_Y}
			/>

			{/* committed window */}
			{COMMITTED.map((i) => (
				<Box
					h={SLOT_H}
					key={i}
					label={String(i)}
					variant="solid"
					w={SLOT_W}
					x={slotX(i)}
					y={SLOT_Y}
				/>
			))}

			{/* gap + out-of-order commit */}
			<Box
				h={SLOT_H}
				label="7"
				variant="outline"
				w={SLOT_W}
				x={slotX(7)}
				y={SLOT_Y}
			/>
			<Box
				h={SLOT_H}
				label="8"
				variant="solid"
				w={SLOT_W}
				x={slotX(8)}
				y={SLOT_Y}
			/>

			<Label x={slotX(7) + SLOT_W / 2} y={SLOT_Y - 16}>
				gap
			</Label>
			<Label x={slotX(8) + SLOT_W / 2} y={SLOT_Y - 16}>
				waiting
			</Label>

			{/* cursor */}
			<line
				className="stroke-neutral-950 dark:stroke-neutral-50"
				strokeWidth={1.75}
				x1={cursorX}
				x2={cursorX}
				y1={SLOT_Y - 10}
				y2={SLOT_Y + SLOT_H + 10}
			/>
			<Label muted={false} x={cursorX} y={SLOT_Y + SLOT_H + 26}>
				cursor — live edge
			</Label>
		</Diagram>
	);
}
