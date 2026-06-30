// Content hash of the OG template (vite.config.ts) — busts every cached OG
// image automatically whenever the template changes.
export const OG_CACHE_VERSION = __OG_TEMPLATE_HASH__;
export const OG_DEFAULT_WIDTH = 1200;
export const OG_DEFAULT_HEIGHT = 630;
export const OG_FAILURE_COOLDOWN_MS = 60_000;
export const OG_PAGE_LOAD_TIMEOUT_MS = 15_000;
export const OG_READY_TIMEOUT_MS = 25_000;
export const OG_TEMPLATE_SELECTOR = "[data-og-template]";
export const SITE_ORIGIN = "https://arsenstorm.com";

const TRAILING_SLASH_REGEX = /\/$/;

export interface OgDimensions {
	height: number;
	width: number;
}

export interface OgRenderRequest {
	cacheKey: string;
	format: "png" | "pdf";
	url: string;
}

export function isAllowedOgOrigin(origin: string): boolean {
	const { hostname } = new URL(origin);
	return (
		origin === SITE_ORIGIN ||
		hostname === "localhost" ||
		hostname === "127.0.0.1"
	);
}

export function normalizeOgPath(
	rawPath: string | null,
	origin = SITE_ORIGIN
): string | null {
	if (!rawPath) {
		return "/";
	}

	if (!rawPath.startsWith("/")) {
		return null;
	}

	if (!isAllowedOgOrigin(origin)) {
		return null;
	}

	const targetUrl = new URL(rawPath, origin);
	if (targetUrl.origin !== origin) {
		return null;
	}

	return targetUrl.pathname === "/"
		? "/"
		: targetUrl.pathname.replace(TRAILING_SLASH_REGEX, "");
}

export function createOgTargetUrl(path: string, origin = SITE_ORIGIN) {
	return new URL(path, origin).toString();
}

export function readOgRenderRequest(request: Request): OgRenderRequest | null {
	const url = new URL(request.url);
	if (url.pathname !== "/render") {
		return null;
	}

	const targetUrl = url.searchParams.get("url");
	const cacheKey = url.searchParams.get("cacheKey");
	if (!(targetUrl && cacheKey)) {
		return null;
	}

	const parsedTarget = new URL(targetUrl);
	if (!isAllowedOgOrigin(parsedTarget.origin)) {
		return null;
	}

	const format = url.searchParams.get("format") === "pdf" ? "pdf" : "png";

	return { cacheKey, format, url: parsedTarget.toString() };
}
