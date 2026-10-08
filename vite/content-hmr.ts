import type { AstroIntegration } from "astro";

const DATA_STORE_FILE_REGEX = /[\\/]data-store\.json$/;

// Dev-only workaround for workerd SSR. On every content MDX save Astro resyncs
// the data store, invalidates its virtual module in the Vite module graph, and
// reloads the browser, but it drops the *runner's* cached evaluation only for
// runnable (Node) environments. workerd is not one, so getCollection() keeps
// serving the old snapshot until a program reload. A `full-reload` with no
// `triggeredBy` is the one remote-runner message that clears that cache.
//
// Trigger on the data-store file, which Astro writes after the sync, so the
// runner reload is sent in the same tick as Astro's browser reload. Sending it
// later (e.g. after awaiting refreshContent) lands it under the render the
// browser just started, re-instantiates React mid-render, and every island
// throws "Invalid hook call". See withastro/astro#16248.
export function contentHmr(): AstroIntegration {
	return {
		name: "content-hmr",
		hooks: {
			"astro:server:setup": ({ server }) => {
				server.watcher.on("change", (path) => {
					if (!DATA_STORE_FILE_REGEX.test(path)) {
						return;
					}
					server.environments.ssr?.hot.send({ type: "full-reload", path: "*" });
				});
			},
		},
	};
}
