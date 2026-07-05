import { useState } from "react";
import { Panel } from "#/components/mdx/panel";
import { inputClass, labelClass, primaryButtonClass, sandboxClass } from "./ui";

/**
 * A billing form for testing redaction: the card field's `autocomplete`
 * marks it sensitive, so the extension records the step without its value.
 */
export function SecretsDemo() {
	const [saved, setSaved] = useState(false);
	const [run, setRun] = useState(0);

	const reset = () => {
		setSaved(false);
		// Remount the form so the uncontrolled fields clear too.
		setRun((count) => count + 1);
	};

	return (
		<Panel onReset={reset} title="Try it: secret fields">
			<div className={sandboxClass}>
				{saved ? (
					<p className="text-neutral-950 text-xs dark:text-neutral-50">
						Card saved ✓
					</p>
				) : (
					<form
						className="flex w-full max-w-56 flex-col gap-2"
						id="secret-card-form"
						key={run}
						onSubmit={(event) => {
							event.preventDefault();
							setSaved(true);
						}}
					>
						<div className="flex flex-col gap-1">
							<label className={labelClass} htmlFor="secret-name">
								Cardholder
							</label>
							<input
								autoComplete="off"
								className={inputClass}
								id="secret-name"
								placeholder="recorded as typed"
								type="text"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className={labelClass} htmlFor="secret-card">
								Card number
							</label>
							<input
								autoComplete="cc-number"
								className={inputClass}
								id="secret-card"
								inputMode="numeric"
								placeholder="never recorded"
								type="text"
							/>
						</div>
						<button
							className={primaryButtonClass}
							id="secret-save"
							type="submit"
						>
							Save card
						</button>
					</form>
				)}
			</div>
		</Panel>
	);
}
