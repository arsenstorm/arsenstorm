import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writeups = defineCollection({
	loader: glob({
		pattern: "*/index.mdx",
		base: "./src/writeups",
		generateId: ({ entry }) => entry.split("/")[0] ?? entry,
	}),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		publishedAt: z.string(),
		tags: z.array(z.string()),
	}),
});

export const collections = { writeups };
