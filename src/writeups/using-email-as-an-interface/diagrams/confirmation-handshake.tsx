import {
	Arrow,
	Box,
	Diagram,
	Label,
	MarkedPath,
} from "#/components/mdx/diagram.tsx";

const ATTACKER = 90;
const SERVICE = 290;
const VICTIM = 480;
const LIFELINE_TOP = 54;
const LIFELINE_BOTTOM = 278;

/** A spoofer can start a destructive action — but the confirmation only ever
 *  reaches the real account, so they can never complete it. */
export function ConfirmationHandshake() {
	return (
		<Diagram
			arrowPad={0}
			label="The confirmation handshake. An attacker spoofs the victim's address to request a destructive action. The service creates a pending action and sends a confirmation to the canonical victim address — never the attacker. Only a reply that references the confirmation's Message-ID completes the action, so the spoofer can start it but never receive the confirmation needed to finish it."
			title="The confirmation handshake"
			viewBox="26 2 518 288"
		>
			{/* lifelines */}
			{[ATTACKER, SERVICE, VICTIM].map((x) => (
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

			<Box h={36} label="Attacker" w={104} x={ATTACKER - 52} y={14} />
			<Box
				h={36}
				label="Service"
				variant="solid"
				w={104}
				x={SERVICE - 52}
				y={14}
			/>
			<Box h={36} label="Victim" w={104} x={VICTIM - 52} y={14} />

			{/* 1. spoofed request */}
			<Label anchor="start" x={ATTACKER + 6} y={78}>
				1. "delete account" · spoofed From
			</Label>
			<Arrow x1={ATTACKER} x2={SERVICE} y1={86} y2={86} />

			{/* 2. create pending (self) */}
			<MarkedPath d={`M${SERVICE},108 h28 v16 h-22`} />
			<Label anchor="start" x={SERVICE + 34} y={120}>
				2. create pending action
			</Label>

			{/* 3. confirmation to the canonical address */}
			<Label anchor="start" x={SERVICE + 6} y={150}>
				3. confirmation · Message-ID
			</Label>
			<Arrow x1={SERVICE} x2={VICTIM} y1={158} y2={158} />

			{/* 4. reply referencing the confirmation (return) */}
			<Label anchor="start" x={SERVICE + 6} y={182}>
				4. reply · In-Reply-To
			</Label>
			<Arrow dashed x1={VICTIM} x2={SERVICE} y1={190} y2={190} />

			{/* 5. verify + execute (self) */}
			<MarkedPath d={`M${SERVICE},214 h28 v16 h-22`} />
			<Label anchor="start" x={SERVICE + 34} y={226}>
				5. verify reference · execute
			</Label>

			{/* the cut: the confirmation never reaches the attacker */}
			<Label x={ATTACKER} y={262}>
				✗ no inbox
			</Label>
		</Diagram>
	);
}
