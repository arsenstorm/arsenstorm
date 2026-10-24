import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writeups = defineCollection({
	loader: glob({
		base: "./src/writeups",
		generateId: ({ entry }) => entry.split("/")[0] ?? entry,
		pattern: "*/index.mdx",
	}),
	schema: z.object({
		description: z.string(),
		metaDescription: z.string().optional(),
		publishedAt: z.string(),
		tags: z.array(z.string()),
		title: z.string(),
	}),
});

const experience = defineCollection({
	loader: glob({
		base: "./src/experience",
		generateId: ({ entry }) => entry.split("/")[0] ?? entry,
		pattern: "*/index.mdx",
	}),
	schema: ({ image }) =>
		z.object({
			company: z.string(),
			end: z.string().nullable(),
			facts: z
				.array(z.object({ label: z.string(), value: z.string() }))
				.default([]),
			hidden: z.boolean().default(false),
			highlights: z.array(z.string()).default([]),
			kind: z.enum(["experience", "earlier"]).default("experience"),
			logo: image().optional(),
			role: z.string(),
			start: z.string(),
			summary: z.string(),
		}),
});

export const collections = { experience, writeups };
