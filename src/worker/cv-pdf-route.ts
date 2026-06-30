import { createOgTargetUrl } from "./og-shared";
import { type Env, isLocalRequest } from "./types";

const CV_PDF_FILENAME = "Arsen-Shkrumelyak-CV.pdf";
const CV_PDF_HEADERS = {
	"cache-control": "public, max-age=3600, stale-while-revalidate=86400",
	"content-disposition": `inline; filename="${CV_PDF_FILENAME}"`,
	"content-type": "application/pdf",
};

type CloudflareCacheStorage = CacheStorage & { readonly default: Cache };

function getDefaultCache(): Cache {
	return (caches as CloudflareCacheStorage).default;
}

async function hashHtml(html: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(html)
	);
	return [...new Uint8Array(digest)]
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("")
		.slice(0, 16);
}

// In production the cache key is the build-time content hash (vite.config.ts).
// In dev that hash is frozen when the dev server starts, so editing the CV
// wouldn't re-render the PDF — there we hash the live HTML instead, so any edit
// produces a new key and rebuilds, while an unchanged page is served from cache.
async function resolveCacheKey(
	request: Request,
	targetUrl: string
): Promise<string> {
	if (!isLocalRequest(request)) {
		return `cv/${__CV_CONTENT_HASH__}.pdf`;
	}

	const response = await fetch(targetUrl, { headers: { accept: "text/html" } });
	return `cv/dev-${await hashHtml(await response.text())}.pdf`;
}

function createCvCacheRequest(origin: string, cacheKey: string) {
	return new Request(new URL(`/__cv-pdf/${cacheKey}`, origin));
}

async function renderCvPdf(
	env: Env,
	targetUrl: string,
	cacheKey: string
): Promise<ArrayBuffer> {
	const rendererId = env.OG_RENDERER.idFromName("singleton");
	const renderer = env.OG_RENDERER.get(rendererId);
	const renderUrl = new URL("https://og-renderer.local/render");
	renderUrl.searchParams.set("url", targetUrl);
	renderUrl.searchParams.set("cacheKey", cacheKey);
	renderUrl.searchParams.set("format", "pdf");
	const response = await renderer.fetch(renderUrl);

	if (!response.ok) {
		const message = await response.text();
		throw new Error(`CV renderer returned ${response.status}: ${message}`);
	}

	return await response.arrayBuffer();
}

export async function handleCvPdf(
	request: Request,
	env: Env,
	ctx: ExecutionContext
): Promise<Response> {
	const { origin } = new URL(request.url);
	const targetUrl = createOgTargetUrl("/cv", origin);
	const cache = getDefaultCache();

	try {
		const cacheKey = await resolveCacheKey(request, targetUrl);
		const cacheRequest = createCvCacheRequest(origin, cacheKey);

		const edgeCached = await cache.match(cacheRequest);
		if (edgeCached) {
			return edgeCached;
		}

		const stored = await env.OG_IMAGES.get(cacheKey);
		if (stored) {
			const response = new Response(stored.body, { headers: CV_PDF_HEADERS });
			ctx.waitUntil(cache.put(cacheRequest, response.clone()));
			return response;
		}

		const pdf = await renderCvPdf(env, targetUrl, cacheKey);
		await env.OG_IMAGES.put(cacheKey, pdf, {
			httpMetadata: { contentType: "application/pdf" },
		});
		const response = new Response(pdf, { headers: CV_PDF_HEADERS });
		ctx.waitUntil(cache.put(cacheRequest, response.clone()));
		return response;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unable to render the CV PDF.";
		return new Response(message, {
			headers: { "cache-control": "no-store", "content-type": "text/plain" },
			status: 500,
		});
	}
}
