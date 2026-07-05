import { base64UrlEncode } from "./base64";
import {
	createOgTargetUrl,
	normalizeOgPath,
	OG_CACHE_VERSION,
} from "./og-shared";
import { fetchSelf } from "./self-fetch";
import { type Env, PNG_HEADERS } from "./types";

type CloudflareCacheStorage = CacheStorage & { readonly default: Cache };

function getDefaultCache(): Cache {
	return (caches as CloudflareCacheStorage).default;
}

function createOgCacheRequest(request: Request, cacheKey: string) {
	return new Request(new URL(`/__og-cache/${cacheKey}`, request.url));
}

async function hashOgTarget(targetUrl: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(`${OG_CACHE_VERSION}:${targetUrl}`)
	);

	return `og/${OG_CACHE_VERSION}/${base64UrlEncode(new Uint8Array(digest))}.png`;
}

async function getOgFromCache(
	request: Request,
	env: Env,
	cacheKey: string,
	ctx: ExecutionContext
): Promise<Response | null> {
	const cache = getDefaultCache();
	const cacheRequest = createOgCacheRequest(request, cacheKey);
	const cached = await cache.match(cacheRequest);
	if (cached) {
		return cached;
	}

	const object = await env.OG_IMAGES.get(cacheKey);
	if (!object) {
		return null;
	}

	const response = new Response(object.body, { headers: PNG_HEADERS });
	ctx.waitUntil(cache.put(cacheRequest, response.clone()));

	return response;
}

async function preflightOgTarget(
	targetUrl: string,
	env: Env
): Promise<boolean> {
	// Must go through fetchSelf: a plain fetch() to our own hostname never
	// re-invokes this Worker (Cloudflare same-zone loop prevention).
	const response = await fetchSelf(
		new Request(targetUrl, { headers: { accept: "text/html" } }),
		env
	);
	if (!response.ok) {
		return false;
	}

	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("text/html")) {
		return false;
	}

	return (await response.text()).includes("data-og-template");
}

async function renderOgImage(
	env: Env,
	targetUrl: string,
	cacheKey: string
): Promise<ArrayBuffer> {
	const rendererId = env.OG_RENDERER.idFromName("singleton");
	const renderer = env.OG_RENDERER.get(rendererId);
	const renderUrl = new URL("https://og-renderer.local/render");
	renderUrl.searchParams.set("url", targetUrl);
	renderUrl.searchParams.set("cacheKey", cacheKey);
	const response = await renderer.fetch(renderUrl);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`OG renderer returned ${response.status}: ${message}`);
	}

	return await response.arrayBuffer();
}

function ogErrorResponse(message: string, status: number): Response {
	return new Response(message, {
		headers: {
			"cache-control": "no-store",
			"content-type": "text/plain; charset=utf-8",
		},
		status,
	});
}

export async function handleOgImage(
	request: Request,
	env: Env,
	ctx: ExecutionContext
): Promise<Response> {
	const url = new URL(request.url);
	const path = normalizeOgPath(url.searchParams.get("path"), url.origin);
	if (!path) {
		return ogErrorResponse("Invalid OG image path.", 400);
	}

	const targetUrl = createOgTargetUrl(path, url.origin);
	const cacheKey = await hashOgTarget(targetUrl);
	const cached = await getOgFromCache(request, env, cacheKey, ctx);
	if (cached) {
		return cached;
	}

	if (!(await preflightOgTarget(targetUrl, env))) {
		return ogErrorResponse("Page does not expose an OG template.", 404);
	}

	const image = await renderOgImage(env, targetUrl, cacheKey);
	const response = new Response(image, { headers: PNG_HEADERS });
	await env.OG_IMAGES.put(cacheKey, image, {
		httpMetadata: { contentType: "image/png" },
	});
	ctx.waitUntil(
		getDefaultCache().put(
			createOgCacheRequest(request, cacheKey),
			response.clone()
		)
	);

	return response;
}
