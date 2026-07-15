import { getCollection } from "astro:content";

export interface WriteupSummary {
	description: string;
	href: string;
	publishedAt: string;
	slug: string;
	tags: string[];
	title: string;
}

export async function getWriteups() {
	const entries = await getCollection("writeups");
	return entries
		.map((entry) => ({
			entry,
			slug: entry.id,
			href: `/technical-writeups/${entry.id}`,
			...entry.data,
		}))
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
