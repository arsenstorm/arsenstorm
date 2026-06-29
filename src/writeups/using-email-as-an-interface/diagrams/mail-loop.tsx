import {
	Arrow,
	Box,
	Diagram,
	Label,
	MarkedPath,
} from "#/components/mdx/diagram.tsx";

const W = 150;
const H = 44;

/** Reply → auto-responder → new inbound → reply… The automated-mail guard is
 *  the only thing that breaks the cycle. */
export function MailLoop() {
	return (
		<Diagram
			label="The mail loop. The service replies to a sender whose mailbox has an auto-responder; that auto-reply arrives as a new inbound email, which would trigger another reply, and so on. Detecting automated mail diverts it to a silent drop, breaking the cycle."
			title="The mail loop — and where it breaks"
			viewBox="28 12 494 240"
		>
			{/* the loop: service replies to the auto-responder */}
			<Arrow x1={40 + W} x2={360} y1={46} y2={46} />
			<Label x={275} y={38}>
				replies
			</Label>

			{/* auto-reply comes back in as a new inbound, routed through the guard */}
			<MarkedPath d="M435,68 V142 H356" />
			<Label x={435} y={104}>
				auto-reply
			</Label>

			{/* guard lets human mail continue back to the service */}
			<MarkedPath d="M200,142 H115 V74" />
			<Label x={115} y={104}>
				not automated
			</Label>

			{/* the break: automated mail is dropped, ending the cycle */}
			<Arrow dashed x1={275} x2={275} y1={164} y2={196} />
			<Label anchor="start" x={283} y={184}>
				automated
			</Label>

			<Box h={H} label="service" variant="solid" w={W} x={40} y={24} />
			<Box h={H} label="auto-responder" w={W} x={360} y={24} />
			<Box h={H} label="detect automated" w={W} x={200} y={120} />
			<Box
				h={H}
				label="drop"
				sub="silently"
				variant="dashed"
				w={W}
				x={200}
				y={196}
			/>
		</Diagram>
	);
}
