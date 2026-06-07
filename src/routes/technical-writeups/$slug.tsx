import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeading } from "#/components/page-heading.tsx";
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
			loaderData?.writeup?.description ?? "",
			loaderData?.writeup?.href ?? "/technical-writeups"
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
			<PageHeading description={writeup.description} title={writeup.title} />

			<article>
				<Content components={writeupComponents} />
			</article>
		</main>
	);
}
