import { TanStackDevtools } from "@tanstack/react-devtools";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Link } from "#/components/link";
import { PageHeading } from "#/components/page-heading.tsx";
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
			{ href: "/manifest.json", id: "app-manifest", rel: "manifest" },
			{ rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
	errorComponent: ErrorPage,
});

const THEME_INIT_SCRIPT = `(function(){try{var r=document.documentElement;var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var h=d?"dark":"light";var m=function(){var l=document.getElementById("app-manifest");if(l){l.setAttribute("href",r.dataset.theme==="dark"?"/manifest.dark.json":"/manifest.json")}};r.dataset.theme=h;r.style.setProperty("--map-surface",d?"#0f0f0f":"#f5f5f5");if(d){r.classList.add("dark");r.style.background="rgb(9 9 11)";r.style.colorScheme="dark"}m();new MutationObserver(m).observe(r,{attributes:true,attributeFilter:["data-theme"]})}catch(e){}})();`;

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html
			className="scrollbar-gutter-stable"
			lang="en"
			suppressHydrationWarning
		>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: inline script needed to set theme and manifest before first paint
					dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
				/>
				<HeadContent />
			</head>
			<body>
				<div className="isolate min-h-dvh bg-white font-sans text-neutral-950 antialiased dark:bg-neutral-950 dark:text-neutral-50">
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
	"text-neutral-500 underline underline-offset-4 decoration-neutral-200 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50";

function NotFound() {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<PageHeading
				description="This page doesn't exist — or it never did."
				title="404"
			/>
			<p className="text-sm">
				<Link className={LINK_STYLE} to="/">
					← Back home
				</Link>
			</p>
		</main>
	);
}

function ErrorPage({ error, reset }: ErrorComponentProps) {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<PageHeading
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
				<Link className={LINK_STYLE} to="/">
					Back home
				</Link>
			</div>
		</main>
	);
}
