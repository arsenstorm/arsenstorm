import { createFileRoute, notFound } from "@tanstack/react-router";
import { ItemGroup } from "#/components/item-group";
import { PageHeading } from "#/components/page-heading.tsx";
import { pageLinks, pageMeta } from "#/lib/seo";
import { hasTechnicalWriteups, TECHNICAL_WRITEUPS } from "#/writeups";

const TITLE = "Technical Writeups";
const DESCRIPTION = "Writing about interesting technical topics.";

export const Route = createFileRoute("/technical-writeups/")({
	loader: () => {
		if (!hasTechnicalWriteups()) {
			throw notFound();
		}
	},
	head: () => ({
		links: pageLinks("/technical-writeups"),
		meta: pageMeta(TITLE, DESCRIPTION, "/technical-writeups"),
	}),
	component: TechnicalWriteups,
});

function TechnicalWriteups() {
	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<PageHeading description={DESCRIPTION} title={TITLE} />

			<section>
				<ItemGroup groupBy="month" items={TECHNICAL_WRITEUPS} />
			</section>
		</main>
	);
}
