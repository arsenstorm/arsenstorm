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

const experience = defineCollection({
	loader: glob({
		pattern: "*/index.mdx",
		base: "./src/experience",
		generateId: ({ entry }) => entry.split("/")[0] ?? entry,
	}),
	schema: z.object({
		company: z.string(),
		logo: z.string().optional(),
		role: z.string(),
		start: z.string(),
		end: z.string().nullable(),
		summary: z.string(),
		kind: z.enum(["experience", "earlier"]).default("experience"),
		highlights: z.array(z.string()).default([]),
		facts: z
			.array(z.object({ label: z.string(), value: z.string() }))
			.default([]),
	}),
});

export const collections = { writeups, experience };
