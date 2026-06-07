import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { createMdxPlugin } from "./vite/mdx";
import { shouldPrerenderPath } from "./vite/prerender";

const SITE_URL = "https://arsenstorm.com";

const config = defineConfig({
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
