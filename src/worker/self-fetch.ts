import handler from "@tanstack/react-start/server-entry";
import type { Env } from "./types";

// Same-zone fetch() from a Worker never re-invokes the Worker itself
// (Cloudflare loop prevention), so requests to our own pages must go
// through the asset/SSR handlers directly instead of the network.
export async function fetchSelf(request: Request, env: Env): Promise<Response> {
	const assetResponse = await env.ASSETS.fetch(request);
	if (assetResponse.status !== 404) {
		return assetResponse;
	}

	return await handler.fetch(request);
}
