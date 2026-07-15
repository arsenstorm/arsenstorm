import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypePrettyCode, {
	type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { markCodeBlockOptions } from "./vite/code-block-options";
import { addHeadingSectionIds } from "./vite/heading-ids";

const prettyCodeOptions = {
	keepBackground: false,
	theme: {
		dark: "github-dark",
		light: "github-light",
	},
} satisfies RehypePrettyCodeOptions;

export default defineConfig({
	site: "https://arsenstorm.com",
	// Every page sets `export const prerender = true`, so all HTML is still
	// generated at build time. `output: "server"` is required so the adapter
	// emits the server bundle that our custom Worker's `handle()` fallback
	// imports; `output: "static"` produces an assets-only, no-op-worker deploy.
	output: "server",
	// Astro 7 defaults compressHTML to "jsx", which strips whitespace between
	// inline elements. These pages are screenshot-rendered to OG images and a CV
	// PDF, so keep the v5/v6 HTML-aware behavior to preserve inline spacing.
	compressHTML: true,
	// With the Cloudflare adapter, Astro splits outDir into client/ + server/
	// subdirectories. outDir "./dist" therefore emits the static assets to
	// ./dist/client, matching wrangler.jsonc `assets.directory`.
	outDir: "./dist",
	trailingSlash: "never",
	adapter: cloudflare({
		// Prerender pages in Node, not workerd: the site is fully static and needs
		// no Cloudflare bindings at build time, and the workerd prerenderer chokes
		// on `createRequire` in the rolldown runtime chunk.
		prerenderEnvironment: "node",
		// No `astro:assets` image transforms are used, so skip the Cloudflare
		// Images binding the adapter would otherwise inject.
		imageService: "passthrough",
	}),
	// Astro 7 renders Markdown with its native Sätteri pipeline by default.
	// Opt back into the unified (remark/rehype) processor so our plugin chain
	// keeps working. MDX inherits this processor's plugins (extendMarkdownConfig),
	// which is the non-deprecated home for them in v7 — passing them to mdx()
	// directly now warns. See markdown.processor in the v7 upgrade guide.
	markdown: {
		syntaxHighlight: false,
		processor: unified({
			remarkPlugins: [remarkGfm],
			rehypePlugins: [
				[rehypePrettyCode, prettyCodeOptions],
				addHeadingSectionIds,
				markCodeBlockOptions,
			],
		}),
	},
	integrations: [react(), mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
