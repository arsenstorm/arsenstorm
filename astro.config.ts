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
import {
	markCodeBlockOptions,
	preserveCodeMeta,
	restoreCodeMeta,
} from "./vite/code-block-options";
import { contentHmr } from "./vite/content-hmr";
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
	trailingSlash: "ignore",
	redirects: { "/work": "/projects" },
	// Emit `work.html` instead of `work/index.html`: links are slashless, so
	// directory output made every internal navigation pay a 307 redirect to the
	// trailing-slash form before the page was served.
	build: { format: "file" },
	// Prefetch every internal link as it enters the viewport — unlike hover,
	// this also covers touch devices, which never fire hover at all.
	prefetch: { defaultStrategy: "viewport", prefetchAll: true },
	// In Chromium, upgrade prefetch to full Speculation Rules prerendering: the
	// next page is rendered in a hidden renderer on hover, so navigation commits
	// instantly. Other browsers fall back to plain prefetch.
	experimental: { clientPrerender: true },
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
			remarkPlugins: [remarkGfm, preserveCodeMeta],
			rehypePlugins: [
				restoreCodeMeta,
				[rehypePrettyCode, prettyCodeOptions],
				addHeadingSectionIds,
				markCodeBlockOptions,
			],
		}),
	},
	integrations: [react(), mdx(), sitemap(), contentHmr()],
	vite: {
		plugins: [
			tailwindcss(),
			// The Cloudflare adapter's SSR environment discovers island deps
			// lazily; each discovery re-runs the optimizer and reloads the
			// program, and react/react-dom/server can land in different optimize
			// passes — two React instances, null hook dispatcher, "Invalid hook
			// call". Pre-bundle every SSR dep in one startup pass instead. Add
			// new island packages here. Scoped to "ssr" only: extending it to
			// other environments (prerender) hangs dev startup.
			// See withastro/astro#16248.
			{
				name: "optimize-ssr-deps",
				configEnvironment(name: string) {
					if (name !== "ssr") {
						return;
					}
					return {
						optimizeDeps: {
							include: [
								"react",
								"react/jsx-runtime",
								"react/jsx-dev-runtime",
								"react-dom",
								"react-dom/server",
								"astro/zod",
								"astro/assets/services/noop",
								"@web-kits/audio",
								"cnfast",
								"d3-scale",
								"d3-shape",
								"hls-video-element/react",
								"img-fx",
								"lucide-react",
								"media-chrome/react",
								"motion/react",
							],
						},
					};
				},
			},
		],
		resolve: { dedupe: ["react", "react-dom"] },
		ssr: { noExternal: ["react", "react-dom"] },
	},
});
