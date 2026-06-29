import { Arrow, Box, Diagram, Label } from "#/components/mdx/diagram.tsx";

/** Control plane vs data plane: bytes skip the coordinator. */
export function OlosArchitecture() {
	return (
		<Diagram
			label="OLOS architecture: the publisher uploads bytes straight to object storage while the coordinator manages live state on the control plane, and viewers read media from storage and manifests from the coordinator."
			title="Architecture"
			viewBox="8 32 544 249"
		>
			{/* control plane (dashed) */}
			<Arrow dashed x1={130} x2={223} y1={128} y2={78} />
			<Arrow dashed x1={290} x2={290} y1={96} y2={184} />
			<Arrow dashed x1={357} x2={448} y1={78} y2={128} />

			{/* data plane (solid) — enter/exit storage's sides, mirroring the coordinator */}
			<Arrow x1={130} x2={223} y1={152} y2={202} />
			<Arrow x1={357} x2={448} y1={202} y2={152} />

			<Label x={177} y={100}>
				slots · commits
			</Label>
			<Label x={290} y={143}>
				observe
			</Label>
			<Label x={402} y={100}>
				manifest
			</Label>
			<Label x={177} y={180}>
				bytes
			</Label>
			<Label x={402} y={180}>
				media
			</Label>

			<Box h={56} label="Streamer" w={110} x={20} y={112} />
			<Box h={52} label="Coordinator" variant="solid" w={134} x={223} y={44} />
			<Box h={52} label="Object storage" w={134} x={223} y={184} />
			<Box h={56} label="Viewer" w={92} x={448} y={112} />

			{/* legend */}
			<line
				className="stroke-neutral-400 dark:stroke-neutral-600"
				strokeWidth={1.5}
				x1={20}
				x2={44}
				y1={262}
				y2={262}
			/>
			<Label anchor="start" x={50} y={265}>
				bytes
			</Label>
			<line
				className="stroke-neutral-400 dark:stroke-neutral-600"
				strokeDasharray="4 3"
				strokeWidth={1.5}
				x1={104}
				x2={128}
				y1={262}
				y2={262}
			/>
			<Label anchor="start" x={134} y={265}>
				control
			</Label>
		</Diagram>
	);
}
