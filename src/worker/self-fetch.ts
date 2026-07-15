import type { Env } from "./types";

// Same-zone fetch() from a Worker never re-invokes the Worker itself
// (Cloudflare loop prevention), so requests to our own pages must go
// through the asset handler directly instead of the network. The site is
// fully static, so ASSETS answers everything — including 404s, via the
// not_found_handling: "404-page" setting in wrangler.jsonc.
export function fetchSelf(request: Request, env: Env): Promise<Response> {
	return env.ASSETS.fetch(request);
}
