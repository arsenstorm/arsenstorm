import { useState } from "react";
import { Panel } from "#/components/mdx/panel";
import { inputClass, labelClass, primaryButtonClass, sandboxClass } from "./ui";

/**
 * A plain newsletter subscribe form — the first workflow a reader records.
 * Stable hand-written ids (framework-generated ids are rejected by the
 * selector ladder), no secret fields, so the recording replays clean without
 * pausing for re-entry.
 */
export function NewsletterDemo() {
	const [email, setEmail] = useState("");
	const [subscribed, setSubscribed] = useState(false);
	const [run, setRun] = useState(0);

	const reset = () => {
		setEmail("");
		setSubscribed(false);
		setRun((count) => count + 1);
	};

	return (
		<Panel demo="newsletter" onReset={reset} title="Try it: a newsletter form">
			<div className={sandboxClass}>
				{subscribed ? (
					<p className="text-neutral-950 text-xs dark:text-neutral-50">
						Subscribed as <strong>{email || "guest"}</strong> ✓
					</p>
				) : (
					<form
						className="flex w-full max-w-56 flex-col gap-2"
						id="demo-newsletter-form"
						key={run}
						onSubmit={(event) => {
							event.preventDefault();
							setSubscribed(true);
						}}
					>
						<div className="flex flex-col gap-1">
							<label className={labelClass} htmlFor="demo-email">
								Email
							</label>
							<input
								autoComplete="off"
								className={inputClass}
								id="demo-email"
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
								required
								type="email"
								value={email}
							/>
						</div>
						<button
							className={primaryButtonClass}
							id="demo-subscribe"
							type="submit"
						>
							Subscribe
						</button>
					</form>
				)}
			</div>
		</Panel>
	);
}
