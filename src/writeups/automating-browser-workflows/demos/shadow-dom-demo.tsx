import { useEffect, useRef } from "react";
import { Panel } from "#/components/mdx/panel";
import { labelClass, sandboxClass } from "./ui";

declare module "react" {
	// biome-ignore lint/style/noNamespace: augmenting JSX.IntrinsicElements has no module-syntax equivalent
	namespace JSX {
		interface IntrinsicElements {
			// Inside the augmentation these names resolve to React's own exports.
			"demo-widget": DetailedHTMLProps<
				HTMLAttributes<HTMLElement>,
				HTMLElement
			>;
		}
	}
}

/**
 * Tailwind can't style inside a shadow root, but custom properties inherit
 * straight through the boundary — so the host carries the theme.
 */
const HOST_THEME_CLASS =
	"[--sbtn-bg:#171717] [--sbtn-fg:#fafafa] dark:[--sbtn-bg:#f5f5f5] dark:[--sbtn-fg:#171717]";

const WIDGET_STYLE = `
	<style>
		button {
			all: initial;
			font: 500 12px InterVariable, sans-serif;
			cursor: pointer;
			border-radius: 6px;
			padding: 9px 12px;
			background: var(--sbtn-bg);
			color: var(--sbtn-fg);
		}
		span { font-variant-numeric: tabular-nums; opacity: 0.7; }
	</style>
`;

/** A working like-button inside the given shadow root; returns its reset. */
const buildWidget = (root: ShadowRoot, label: string): (() => void) => {
	root.innerHTML = `${WIDGET_STYLE}<button>${label} <span>0</span></button>`;
	const count = root.querySelector("span");
	let clicks = 0;
	root.addEventListener("click", () => {
		clicks += 1;
		if (count) {
			count.textContent = String(clicks);
		}
	});
	return () => {
		clicks = 0;
		if (count) {
			count.textContent = "0";
		}
	};
};

export function ShadowDomDemo() {
	const openHostRef = useRef<HTMLDivElement>(null);
	const closedHostRef = useRef<HTMLElement>(null);
	const resettersRef = useRef<(() => void)[]>([]);

	useEffect(() => {
		// Real shadow roots can only exist client-side; SSR ships empty hosts.
		// try/catch guards double-attach on HMR/StrictMode re-runs (a closed
		// root is invisible from out here, so there's nothing to check).
		try {
			const open = openHostRef.current?.attachShadow({ mode: "open" });
			if (open) {
				resettersRef.current.push(buildWidget(open, "Count: "));
			}
		} catch {
			// already attached
		}
		try {
			const closed = closedHostRef.current?.attachShadow({ mode: "closed" });
			if (closed) {
				resettersRef.current.push(buildWidget(closed, "Count: "));
			}
		} catch {
			// already attached
		}
	}, []);

	const reset = () => {
		for (const resetWidget of resettersRef.current) {
			resetWidget();
		}
	};

	return (
		<Panel onReset={reset} title="Try it: shadow DOM">
			<div className={sandboxClass}>
				<div className="flex flex-wrap gap-6">
					<div className="flex flex-col items-center justify-center gap-1.5">
						<p className={labelClass}>Open Shadow Root</p>
						<div
							className={HOST_THEME_CLASS}
							id="shadow-open-host"
							ref={openHostRef}
						/>
					</div>
					<div className="flex flex-col items-center justify-center gap-1.5">
						<p className={labelClass}>Closed Shadow Root</p>
						<demo-widget
							aria-label="Closed shadow root"
							className={HOST_THEME_CLASS}
							id="shadow-closed-host"
							ref={closedHostRef}
							role="button"
							tabIndex={0}
						/>
					</div>
				</div>
			</div>
		</Panel>
	);
}
