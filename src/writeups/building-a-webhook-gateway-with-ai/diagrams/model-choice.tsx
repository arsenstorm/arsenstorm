import { Arrow, Box, Diagram, Label } from "#/components/mdx/diagram.tsx";

const W = 170;
const H = 46;

/** The dispatch decision keys on the spec, not the task: how tightly the spec
 *  defines the work decides which model gets it. */
export function ModelChoice() {
	return (
		<Diagram
			label="A spec branches two ways. A well-defined task goes to the cheaper model. A loosely-defined task goes to the stronger model."
			title="Which model gets the work"
			viewBox="8 12 484 206"
		>
			<Arrow x1={215} x2={105} y1={70} y2={160} />
			<Label x={160} y={115}>
				well-defined task
			</Label>

			<Arrow x1={285} x2={395} y1={70} y2={160} />
			<Label x={340} y={115}>
				loosely-defined task
			</Label>

			<Box h={H} label="spec" variant="solid" w={W} x={165} y={24} />
			<Box h={H} label="cheaper model" w={W} x={20} y={160} />
			<Box h={H} label="stronger model" w={W} x={310} y={160} />
		</Diagram>
	);
}
