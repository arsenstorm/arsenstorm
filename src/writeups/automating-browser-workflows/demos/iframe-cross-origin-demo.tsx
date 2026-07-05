import { useRef, useState } from "react";
import { Panel } from "#/components/mdx/panel";
import { secondaryButtonClass } from "./ui";

/**
 * `sandbox="allow-scripts"` without `allow-same-origin` gives the frame an
 * opaque origin — to this page it is as unreachable as any third-party
 * widget, but the extension's per-frame content script still records inside.
 */
const FRAME_HTML = `<!doctype html>
<html lang="en">
<head>
<meta name="color-scheme" content="light dark" />
<style>
	body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
		font: 12px InterVariable, ui-sans-serif, system-ui, sans-serif; color: #171717; }
	.row { display: flex; align-items: center; gap: 8px; padding: 12px; }
	button { height: 32px; padding: 0 12px; font: inherit; font-weight: 500; cursor: pointer;
		border: 0; border-radius: 6px; background: #171717; color: #fafafa; }
	code { font-family: ui-monospace, monospace; }
	[hidden] { display: none; }
	@media (prefers-color-scheme: dark) {
		body { color: #fafafa; }
		button { background: #f5f5f5; color: #171717; }
	}
</style>
</head>
<body>
	<div class="row" id="frame-shop">
		<button id="frame-buy">Buy now</button>
	</div>
	<div class="row" id="frame-receipt" hidden>
		<p>Purchased ✓ — this frame's own script saw the click on <code>#frame-buy</code></p>
	</div>
	<script>
		const shop = document.getElementById("frame-shop");
		const receipt = document.getElementById("frame-receipt");
		document.getElementById("frame-buy").addEventListener("click", () => {
			shop.hidden = true;
			receipt.hidden = false;
		});
	</script>
</body>
</html>`;

export function IframeCrossOriginDemo() {
	const frameRef = useRef<HTMLIFrameElement>(null);
	const [verdict, setVerdict] = useState<string | null>(null);
	// The parent can't reset an opaque-origin document — remounting the
	// frame is the only reset it has, which is rather the point.
	const [run, setRun] = useState(0);

	const reset = () => {
		setVerdict(null);
		setRun((count) => count + 1);
	};

	const tryToReachInside = () => {
		try {
			const doc = frameRef.current?.contentDocument;
			if (!doc) {
				throw new Error("contentDocument is null");
			}
			setVerdict(`Reached inside: ${doc.title || "untitled document"}`);
		} catch (error) {
			setVerdict(
				`Blocked: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	};

	return (
		<Panel onReset={reset} title="Try it: a cross-origin iframe">
			<div className="flex flex-col gap-3">
				<iframe
					className="h-24 w-full rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
					key={run}
					ref={frameRef}
					sandbox="allow-scripts"
					srcDoc={FRAME_HTML}
					title="Checkout widget (opaque origin)"
				/>
				<div className="flex flex-wrap items-center gap-3">
					<button
						className={secondaryButtonClass}
						onClick={tryToReachInside}
						type="button"
					>
						Try to reach inside from this article
					</button>
					{verdict ? (
						<p className="font-mono text-neutral-500 text-xs dark:text-neutral-400">
							{verdict}
						</p>
					) : null}
				</div>
			</div>
		</Panel>
	);
}
