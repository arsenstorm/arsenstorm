import { createFileRoute } from "@tanstack/react-router";
import { Controls } from "#/components/controls";
import { ItemGroup } from "#/components/item-group.tsx";
import { Anchor, Link } from "#/components/link";
import { TechnicalWriteups } from "#/components/technical-writeups.tsx";
import { PROJECTS } from "#/lib/projects.ts";

export const Route = createFileRoute("/")({ component: Home });

const ELSEWHERE = [
	{ label: "GitHub", href: "https://github.com/arsenstorm" },
	{ label: "Twitter", href: "https://x.com/arsenstorm" },
	{ label: "Email", href: "mailto:arsen@shkrumelyak.com" },
];

function Home() {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-medium text-base text-neutral-950 dark:text-neutral-50">
						Arsen Shkrumelyak
					</h1>
					<p className="mt-1 max-w-[56ch] text-pretty text-base text-neutral-500 dark:text-neutral-400">
						I build software with care.
					</p>
				</div>
				<Controls noHomeLink />
			</header>

			<section>
				<div className="mb-4 flex flex-row items-center justify-between">
					<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
						Work
					</h2>
					<Link
						className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						to="/work"
					>
						View all
					</Link>
				</div>
				<ItemGroup id="projects-list" items={PROJECTS} showAll={false} />
			</section>

			<TechnicalWriteups />

			{/* TODO: Add back Experiments */}

			<section>
				<h2 className="mb-4 font-medium text-neutral-950 text-sm dark:text-neutral-50">
					Elsewhere
				</h2>
				<ul className="flex flex-col gap-2">
					{ELSEWHERE.map((item) => (
						<li className="text-sm" key={item.label}>
							<Anchor
								className="text-neutral-500 underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
								href={item.href}
							>
								{item.label}
							</Anchor>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
