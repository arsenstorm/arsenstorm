import { createFileRoute } from "@tanstack/react-router";
import { ItemGroup } from "#/components/item-group.tsx";
import { PageHeading } from "#/components/page-heading";
import { Section } from "#/components/section.tsx";
import { PROJECTS } from "#/lib/projects.ts";
import { pageMeta } from "#/lib/seo";

const TITLE = "My Work";
const DESCRIPTION = "These are the things I've worked on.";

export const Route = createFileRoute("/work")({
	head: () => ({
		meta: pageMeta(TITLE, DESCRIPTION, "/work"),
	}),
	component: Work,
});

function Work() {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<PageHeading description={DESCRIPTION} title={TITLE} />

			<Section cta={{ label: "Go back", to: "/" }} title="All of my work">
				<ItemGroup id="projects-list" items={PROJECTS} />
			</Section>
		</main>
	);
}
