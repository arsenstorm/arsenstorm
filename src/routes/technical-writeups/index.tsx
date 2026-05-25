import { createFileRoute, notFound } from "@tanstack/react-router";
import { Controls } from "#/components/controls";
import { ItemGroup } from "#/components/item-group";
import { pageMeta } from "#/lib/seo";
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
		meta: pageMeta(TITLE, DESCRIPTION),
	}),
	component: TechnicalWriteups,
});

function TechnicalWriteups() {
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
				<ItemGroup groupBy="month" items={TECHNICAL_WRITEUPS} />
			</section>
		</main>
	);
}
