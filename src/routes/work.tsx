import { createFileRoute } from "@tanstack/react-router";
import { Controls } from "#/components/controls";
import { HapticLink } from "#/components/haptic-link.tsx";
import { ItemGroup } from "#/components/item-group.tsx";
import { PROJECTS } from "#/lib/projects.ts";
import { pageMeta } from "#/lib/seo";

const TITLE = "My Work";
const DESCRIPTION = "These are the things I've worked on.";

export const Route = createFileRoute("/work")({
	head: () => ({
		meta: pageMeta(TITLE, DESCRIPTION),
	}),
	component: Work,
});

function Work() {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-medium text-base text-neutral-950 dark:text-neutral-50">
						{TITLE}
					</h1>
					<p className="mt-1 max-w-[56ch] text-pretty text-base text-neutral-500 dark:text-neutral-400">
						{DESCRIPTION}
					</p>
				</div>
				<Controls />
			</header>

			<section>
				<div className="mb-4 flex flex-row items-center justify-between">
					<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
						All of my work
					</h2>
					<HapticLink
						className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						to="/"
					>
						Go back
					</HapticLink>
				</div>
				<ItemGroup id="projects-list" items={PROJECTS} />
			</section>
		</main>
	);
}
