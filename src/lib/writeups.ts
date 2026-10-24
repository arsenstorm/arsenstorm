import { getCollection } from "astro:content";

export interface WriteupSummary {
	description: string;
	href: string;
	metaDescription?: string;
	publishedAt: string;
	readingTime: number;
	slug: string;
	tags: string[];
	title: string;
}

export async function getWriteups() {
	const entries = await getCollection("writeups");
	return entries
		.map((entry) => ({
			entry,
			href: `/writing/${entry.id}`,
			slug: entry.id,
			...entry.data,
		}))
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
