import { createFileRoute } from "@tanstack/react-router";
import { ItemGroup } from "#/components/item-group.tsx";
import { Anchor } from "#/components/link";
import { PageHeading } from "#/components/page-heading.tsx";
import { Section } from "#/components/section.tsx";
import { TechnicalWriteups } from "#/components/technical-writeups.tsx";
import { PROJECTS } from "#/lib/projects.ts";
import { pageMeta } from "#/lib/seo";

const TITLE = "Arsen Shkrumelyak";
const DESCRIPTION = "I build software with care.";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: pageMeta(TITLE, DESCRIPTION),
	}),
	component: Home,
});

const ELSEWHERE = [
	{ label: "GitHub", href: "https://github.com/arsenstorm" },
	{ label: "Twitter", href: "https://x.com/arsenstorm" },
	{ label: "Email", href: "mailto:arsen@shkrumelyak.com" },
];

function Home() {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<PageHeading description={DESCRIPTION} noHomeLink title={TITLE} />

			<Section cta={{ label: "View all", to: "/work" }} title="Work">
				<ItemGroup id="projects-list" items={PROJECTS} showAll={false} />
			</Section>

			<TechnicalWriteups />

			{/* TODO: Add back Experiments */}

			<Section title="Elsewhere">
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
			</Section>
		</main>
	);
}
