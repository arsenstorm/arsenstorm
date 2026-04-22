import { TanStackDevtools } from "@tanstack/react-devtools";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Controls } from "#/components/controls";
import { HapticLink } from "#/components/haptic-link";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Arsen Shkrumelyak" },
		],
		links: [
			{ rel: "preconnect", href: "https://rsms.me" },
			{ rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
	errorComponent: ErrorPage,
});

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: inline script needed to set theme class before first paint
					dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
				/>
			</head>
			<body>
				<div className="isolate min-h-dvh bg-white font-sans text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50">
					{children}
				</div>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

const LINK_STYLE =
	"text-zinc-500 underline underline-offset-4 decoration-zinc-200 transition-colors hover:text-zinc-950 hover:decoration-zinc-950 dark:text-zinc-400 dark:decoration-zinc-800 dark:hover:text-zinc-50 dark:hover:decoration-zinc-50";

function PageHeader({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<header className="mb-12 flex items-start justify-between gap-4">
			<div>
				<h1 className="font-medium text-base text-zinc-950 dark:text-zinc-50">
					{title}
				</h1>
				<p className="mt-1 max-w-[56ch] text-pretty text-base text-zinc-500 dark:text-zinc-400">
					{description}
				</p>
			</div>
			<Controls />
		</header>
	);
}

function NotFound() {
	return (
		<main className="mx-auto max-w-xl px-6 py-24">
			<PageHeader
				description="This page doesn't exist — or it never did."
				title="404"
			/>
			<p className="text-sm">
				<HapticLink className={LINK_STYLE} to="/">
					← Back home
				</HapticLink>
			</p>
		</main>
	);
}

function ErrorPage({ error, reset }: ErrorComponentProps) {
	return (
		<main className="mx-auto max-w-xl px-6 py-24">
			<PageHeader
				description={
					error instanceof Error && error.message
						? error.message
						: "An unexpected error occurred. You can try again or head home."
				}
				title="Something broke"
			/>
			<div className="flex gap-6 text-sm">
				<button className={LINK_STYLE} onClick={reset} type="button">
					Try again
				</button>
				<HapticLink className={LINK_STYLE} to="/">
					Back home
				</HapticLink>
			</div>
		</main>
	);
}
