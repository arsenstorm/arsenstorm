import { useState } from "react";
import { Panel } from "#/components/mdx/panel";

/**
 * A working widget in a same-origin iframe: its own document, its own
 * elements — the extension records inside it and stamps every step with
 * this frame's URL.
 */
export function IframeSameOriginDemo() {
	// Reset by remounting: reloading the frame is the parent-side reset.
	const [run, setRun] = useState(0);

	return (
		<Panel
			onReset={() => setRun((count) => count + 1)}
			title="Try it: a same-origin iframe"
		>
			<iframe
				className="h-24 w-full rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
				key={run}
				src="/writeup-demos/newsletter.html"
				title="Newsletter widget (same origin)"
			/>
		</Panel>
	);
}
