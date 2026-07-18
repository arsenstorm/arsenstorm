import type { AstroIntegration } from "astro";

const CONTENT_MDX_REGEX = /[\\/]src[\\/](?:experience|writeups)[\\/].+\.mdx$/;

// Dev-only workaround: frontmatter-only MDX edits resync the content store but
// the SSR module cache keeps serving the old getCollection() snapshot, so
// pages render stale data until a server restart. Force the store refresh and
// drop the module cache whenever a content MDX file changes.
export function contentHmr(): AstroIntegration {
	return {
		name: "content-hmr",
		hooks: {
			"astro:server:setup": ({ server, refreshContent }) => {
				server.watcher.on("change", async (path) => {
					if (!CONTENT_MDX_REGEX.test(path)) {
						return;
					}
					await refreshContent?.({});
					// `path: "*"` is what makes remote module runners (workerd)
					// clear their evaluation cache — same mechanism as Astro's
					// vite-plugin-hmr-reload fix for non-runnable environments.
					for (const environment of Object.values(server.environments)) {
						environment.moduleGraph.invalidateAll();
						environment.hot.send({
							type: "full-reload",
							path: "*",
							triggeredBy: path,
						});
					}
				});
			},
		},
	};
}
