import { Arrow, Box, Diagram } from "#/components/mdx/diagram.tsx";

/** issued → upload_observed → committed, with terminal drops. */
export function SlotStateMachine() {
	return (
		<Diagram
			label="A slot moves one way: issued, then upload_observed, then committed. Along the way it can drop to a terminal state instead — expired or rejected before commit, and revoked either before commit or after it once the slot has fallen out of the live window. But nothing is committed without first being observed."
			title="Slot state machine"
			viewBox="8 20 544 168"
		>
			{/* happy path */}
			<Arrow x1={172} x2={202} y1={56} y2={56} />
			<Arrow x1={358} x2={388} y1={56} y2={56} />

			<Box h={48} label="issued" w={150} x={20} y={32} />
			<Box h={48} label="upload_observed" w={154} x={204} y={32} />
			<Box h={48} label="committed" variant="solid" w={150} x={390} y={32} />

			{/* drops to terminal states */}
			<Arrow dashed x1={90} x2={112} y1={80} y2={138} />
			<Arrow dashed x1={281} x2={281} y1={80} y2={138} />
			<Arrow dashed x1={465} x2={447} y1={80} y2={138} />

			<Box h={36} label="expired" variant="dashed" w={110} x={58} y={140} />
			<Box h={36} label="rejected" variant="dashed" w={110} x={226} y={140} />
			<Box h={36} label="revoked" variant="dashed" w={110} x={392} y={140} />
		</Diagram>
	);
}
