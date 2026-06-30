import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createMdxPlugin } from "./vite/mdx";
import { shouldPrerenderPath } from "./vite/prerender";

const SITE_URL = "https://arsenstorm.com";

// Hash the source files that determine a page's rendered output, so the worker's
// PDF/OG cache key changes automatically when content changes — no manual bumps.
function resolveFromRoot(path: string) {
	return fileURLToPath(new URL(path, import.meta.url));
}

function contentHash(paths: string[]) {
	const hash = createHash("sha256");
	for (const path of paths) {
		hash.update(readFileSync(path));
	}
	return hash.digest("hex").slice(0, 16);
}

function writeupSourceFiles() {
	const directory = resolveFromRoot("./src/writeups/");
	if (!existsSync(directory)) {
		return [];
	}
	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => `${directory}${entry.name}/index.mdx`)
		.filter((path) => existsSync(path));
}

// The CV PDF embeds the technical-writing list, so the writeups count too.
const CV_CONTENT_HASH = contentHash([
	resolveFromRoot("./src/routes/cv.tsx"),
	...writeupSourceFiles(),
]);
const OG_TEMPLATE_HASH = contentHash([
	resolveFromRoot("./src/components/og-template.tsx"),
]);

const config = defineConfig({
	define: {
		__CV_CONTENT_HASH__: JSON.stringify(CV_CONTENT_HASH),
		__OG_TEMPLATE_HASH__: JSON.stringify(OG_TEMPLATE_HASH),
	},
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		...(process.env.VITEST === "true"
			? []
			: [cloudflare({ viteEnvironment: { name: "ssr" } })]),
		createMdxPlugin(),
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				crawlLinks: true,
				failOnError: true,
				filter: ({ path }) => shouldPrerenderPath(path),
			},
			sitemap: {
				enabled: true,
				host: SITE_URL,
			},
		}),
		viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
	],
});

export default config;
