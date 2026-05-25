import { createFileRoute, notFound } from "@tanstack/react-router";
import { Controls } from "#/components/controls";
import { writeupComponents } from "#/components/writeup-content";
import { pageMeta } from "#/lib/seo";
import {
	findTechnicalWriteup,
	hasTechnicalWriteups,
	toTechnicalWriteupSummary,
} from "#/writeups";

export const Route = createFileRoute("/technical-writeups/$slug")({
	loader: ({ params }) => {
		if (!hasTechnicalWriteups()) {
			throw notFound();
		}

		const writeup = findTechnicalWriteup(params.slug);
		if (!writeup) {
			throw notFound();
		}
		return { writeup: toTechnicalWriteupSummary(writeup) };
	},
	head: ({ loaderData }) => ({
		meta: pageMeta(
			loaderData?.writeup?.title ?? "",
			loaderData?.writeup?.description ?? ""
		),
	}),
	component: TechnicalWriteup,
});

function TechnicalWriteup() {
	const { writeup } = Route.useLoaderData();
	const fullWriteup = findTechnicalWriteup(writeup.slug);
	if (!fullWriteup) {
		throw notFound();
	}
	const { Content } = fullWriteup;

	return (
		<main className="mx-auto max-w-xl space-y-12 px-6 py-24">
			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-medium text-base text-neutral-950 dark:text-neutral-50">
						{writeup.title}
					</h1>
					<p className="mt-1 max-w-[56ch] text-pretty text-base text-neutral-500 dark:text-neutral-400">
						{writeup.description}
					</p>
				</div>
				<Controls />
			</header>

			<article>
				<Content components={writeupComponents} />
			</article>
		</main>
	);
}
