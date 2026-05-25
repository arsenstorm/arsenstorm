import { existsSync, readdirSync } from "node:fs";
import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const TECHNICAL_WRITEUPS_PATH_PREFIX = "/technical-writeups";

function getTechnicalWriteupFileCount() {
	const writeupsDirectory = new URL("./src/writeups/", import.meta.url);

	if (!existsSync(writeupsDirectory)) {
		return 0;
	}

	return readdirSync(writeupsDirectory, { withFileTypes: true }).filter(
		(entry) =>
			entry.isDirectory() &&
			existsSync(new URL(`./${entry.name}/index.mdx`, writeupsDirectory))
	).length;
}

function hasTechnicalWriteupFiles() {
	return getTechnicalWriteupFileCount() > 0;
}

const shouldPrerenderTechnicalWriteups = hasTechnicalWriteupFiles();

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		{ enforce: "pre", ...mdx() },
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				crawlLinks: true,
				failOnError: true,
				filter: ({ path }) =>
					shouldPrerenderTechnicalWriteups ||
					!path.startsWith(TECHNICAL_WRITEUPS_PATH_PREFIX),
			},
		}),
		viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
	],
});

export default config;
