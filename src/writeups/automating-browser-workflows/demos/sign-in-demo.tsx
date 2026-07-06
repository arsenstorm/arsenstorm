import { useState } from "react";
import { Panel } from "#/components/mdx/panel";
import { inputClass, labelClass, primaryButtonClass, sandboxClass } from "./ui";

/**
 * A plain sign-in form for the extension to record: stable hand-written ids
 * (framework-generated ids are rejected by the selector ladder), a password
 * field for redaction, and a real submit.
 *
 * First sign-in with an email registers its password in-memory; later
 * attempts must match. Reset clears the store.
 */
export function SignInDemo() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [accounts, setAccounts] = useState<Record<string, string>>({});
	const [error, setError] = useState("");
	const [signedIn, setSignedIn] = useState(false);
	const [run, setRun] = useState(0);

	const reset = () => {
		setEmail("");
		setPassword("");
		setAccounts({});
		setError("");
		setSignedIn(false);
		setRun((count) => count + 1);
	};

	return (
		<Panel onReset={reset} title="Try it: a sign-in form">
			<div className={sandboxClass}>
				{signedIn ? (
					<p className="text-neutral-950 text-xs dark:text-neutral-50">
						Signed in as <strong>{email || "guest"}</strong> ✓
					</p>
				) : (
					<form
						className="flex w-full max-w-56 flex-col gap-2"
						id="demo-signin-form"
						key={run}
						onSubmit={(event) => {
							event.preventDefault();
							if (!password) {
								setError("Password is required.");
								return;
							}
							const known = accounts[email];
							if (known !== undefined && known !== password) {
								setError("Wrong password for this email.");
								return;
							}
							setAccounts((prev) => ({ ...prev, [email]: password }));
							setError("");
							setSignedIn(true);
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
								type="email"
								value={email}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className={labelClass} htmlFor="demo-password">
								Password
							</label>
							<input
								autoComplete="current-password"
								className={inputClass}
								id="demo-password"
								onChange={(event) => setPassword(event.target.value)}
								type="password"
								value={password}
							/>
						</div>
						{error ? (
							<p className="text-red-600 text-xs dark:text-red-400">{error}</p>
						) : null}
						<button
							className={primaryButtonClass}
							id="demo-signin"
							type="submit"
						>
							Sign in
						</button>
					</form>
				)}
			</div>
		</Panel>
	);
}
