import { createFileRoute, notFound } from "@tanstack/react-router";
import { writeupComponents } from "#/components/mdx";
import { PageHeading } from "#/components/page-heading.tsx";
import { pageLinks, pageMeta, technicalWriteupJsonLd } from "#/lib/seo";
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
		links: pageLinks(loaderData?.writeup?.href ?? "/technical-writeups"),
		meta: pageMeta(
			loaderData?.writeup?.title ?? "",
			loaderData?.writeup?.description ?? "",
			loaderData?.writeup?.href ?? "/technical-writeups",
			{ type: "article" }
		),
		scripts: loaderData?.writeup
			? [technicalWriteupJsonLd(loaderData.writeup)]
			: [],
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
