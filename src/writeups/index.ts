import type { MDXComponents } from "mdx/types.js";
import type { ComponentType } from "react";

export interface TechnicalWriteup {
	Content: ComponentType<{ components?: MDXComponents }>;
	description: string;
	href: string;
	params: { slug: string };
	publishedAt: string;
	slug: string;
	tags: string[];
	title: string;
	to: "/technical-writeups/$slug";
}

export type TechnicalWriteupSummary = Omit<TechnicalWriteup, "Content">;

type TechnicalWriteupMetadata = Pick<
	TechnicalWriteup,
	"description" | "publishedAt" | "tags" | "title"
>;

interface TechnicalWriteupModule {
	default: TechnicalWriteup["Content"];
	metadata: TechnicalWriteupMetadata;
}

const writeupModules = import.meta.glob<TechnicalWriteupModule>(
	"./*/index.mdx",
	{ eager: true }
);

const WRITEUP_PATH_PATTERN = /^\.\/([^/]+)\/index\.mdx$/;

function slugFromPath(path: string) {
	const match = WRITEUP_PATH_PATTERN.exec(path);
	if (!match?.[1]) {
		throw new Error(`Unable to infer technical writeup slug from ${path}`);
	}
	return match[1];
}

export const TECHNICAL_WRITEUPS: TechnicalWriteup[] = Object.entries(
	writeupModules
)
	.map(([path, module]) => {
		const slug = slugFromPath(path);
		return {
			...module.metadata,
			slug,
			href: `/technical-writeups/${slug}`,
			params: { slug },
			to: "/technical-writeups/$slug" as const,
			Content: module.default,
		};
	})
	.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getTechnicalWriteupCount() {
	return TECHNICAL_WRITEUPS.length;
}

export function hasTechnicalWriteups() {
	return getTechnicalWriteupCount() > 0;
}

export function findTechnicalWriteup(slug: string) {
	return TECHNICAL_WRITEUPS.find((writeup) => writeup.slug === slug);
}

export function toTechnicalWriteupSummary(
	writeup: TechnicalWriteup
): TechnicalWriteupSummary {
	const { Content: _Content, ...summary } = writeup;
	return summary;
}
