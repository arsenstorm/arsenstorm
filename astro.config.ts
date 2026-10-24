import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypePrettyCode, {
	type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import {
	markCodeBlockOptions,
	preserveCodeMeta,
	restoreCodeMeta,
} from "./vite/code-block-options";
import { addHeadingSectionIds } from "./vite/heading-ids";

const prettyCodeOptions = {
	keepBackground: false,
	theme: {
		dark: "github-dark",
		light: "github-light",
	},
} satisfies RehypePrettyCodeOptions;

export default defineConfig({
	// Emit `work.html` instead of `work/index.html`: links are slashless, so
	// directory output made every internal navigation pay a 307 redirect to the
	// trailing-slash form before the page was served.
	build: { format: "file" },
	// Astro 7 defaults compressHTML to "jsx", which strips whitespace between
	// inline elements. These pages are screenshot-rendered to OG images, so
	// keep the v5/v6 HTML-aware behavior to preserve inline spacing.
	compressHTML: true,
	// In Chromium, upgrade prefetch to full Speculation Rules prerendering: the
	// next page is rendered in a hidden renderer on hover, so navigation commits
	// instantly. Other browsers fall back to plain prefetch.
	experimental: { clientPrerender: true },
	integrations: [
		preact({ compat: true }),
		mdx(),
		sitemap({
			filter: (page) =>
				!(
					page.endsWith("/experience/betterstack") ||
					page.endsWith("/a-lil-note")
				),
		}),
	],
	// Astro 7 renders Markdown with its native Sätteri pipeline by default.
	// Opt back into the unified (remark/rehype) processor so our plugin chain
	// keeps working. MDX inherits this processor's plugins (extendMarkdownConfig),
	// which is the non-deprecated home for them in v7 — passing them to mdx()
	// directly now warns. See markdown.processor in the v7 upgrade guide.
	markdown: {
		processor: unified({
			rehypePlugins: [
				restoreCodeMeta,
				[rehypePrettyCode, prettyCodeOptions],
				addHeadingSectionIds,
				markCodeBlockOptions,
			],
			remarkPlugins: [remarkGfm, preserveCodeMeta],
		}),
		syntaxHighlight: false,
	},
	// A fully static build; src/index.ts serves it through the ASSETS binding.
	outDir: "./dist",
	// Prefetch every internal link as it enters the viewport — unlike hover,
	// this also covers touch devices, which never fire hover at all.
	prefetch: { defaultStrategy: "viewport", prefetchAll: true },
	site: "https://arsenstorm.com",
	trailingSlash: "ignore",
	vite: {
		plugins: [
			tailwindcss(),
			// With preact compat, any dependency that imports "react" must be
			// bundled into the server builds so the alias applies to it. Left
			// external, media-chrome would load the real React kept for the
			// markdown script and hand preact forwardRef objects as tag names.
			{
				configEnvironment(name: string) {
					if (name !== "ssr" && name !== "prerender") {
						return;
					}
					return {
						resolve: {
							noExternal: [
								"react",
								"react-dom",
								"react/jsx-runtime",
								"media-chrome",
								"hls-video-element",
							],
						},
					};
				},
				name: "bundle-react-consumers",
			},
		],
	},
});
