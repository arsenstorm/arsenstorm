import { useEffect, useRef, useState } from "react";
import { Panel } from "#/components/mdx/panel";
import { inputClass, labelClass, primaryButtonClass, sandboxClass } from "./ui";

// How long the Save button takes to "lazy-load" after the form opens: long
// enough that a replayed click has to wait for it, short enough not to bore.
const LATE_RENDER_MS = 1500;

type Stage = "idle" | "editing" | "saved";

/**
 * A deliberately dynamic page: the Save button renders late, like a widget
 * behind a lazy import. Record this flow with the extension, replay it, and
 * the third step has to wait the render out.
 */
export function DynamicPageDemo() {
	const [stage, setStage] = useState<Stage>("idle");
	const [saveReady, setSaveReady] = useState(false);
	const [name, setName] = useState("");
	const lateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (lateTimerRef.current) {
				clearTimeout(lateTimerRef.current);
			}
		},
		[]
	);

	const openEditor = () => {
		setStage("editing");
		setSaveReady(false);
		lateTimerRef.current = setTimeout(() => setSaveReady(true), LATE_RENDER_MS);
	};

	const reset = () => {
		if (lateTimerRef.current) {
			clearTimeout(lateTimerRef.current);
		}
		setStage("idle");
		setSaveReady(false);
		setName("");
	};

	return (
		<Panel
			demo="dynamic"
			onReset={reset}
			title="Try it: a page that renders late"
		>
			<div className={sandboxClass}>
				{stage === "idle" ? (
					<button
						className={primaryButtonClass}
						id="replay-edit"
						onClick={openEditor}
						type="button"
					>
						Edit profile
					</button>
				) : null}
				{/* Deliberately not a form: a click-then-submit pair collapses to
				    the submit when the workflow is built, and replaying a submit
				    finds the form (which renders immediately) instead of waiting
				    for the late Save button. A plain click has to wait it out. */}
				{stage === "editing" ? (
					<div className="flex w-full max-w-56 flex-col items-start gap-2">
						<div className="flex w-full flex-col gap-1">
							<label className={labelClass} htmlFor="replay-name">
								Name
							</label>
							<input
								className={inputClass}
								id="replay-name"
								onChange={(event) => setName(event.target.value)}
								type="text"
								value={name}
							/>
						</div>
						{saveReady ? (
							<button
								className={primaryButtonClass}
								id="replay-save"
								onClick={() => setStage("saved")}
								type="button"
							>
								Save changes
							</button>
						) : (
							<p className="flex h-8 items-center text-neutral-400 text-xs italic dark:text-neutral-500">
								widget loading…
							</p>
						)}
					</div>
				) : null}
				{stage === "saved" ? (
					<p className="text-neutral-950 text-xs dark:text-neutral-50">
						Profile saved{name ? ` for ${name}` : ""} ✓
					</p>
				) : null}
			</div>
		</Panel>
	);
}
