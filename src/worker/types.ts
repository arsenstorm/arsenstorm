export type Env = CloudflareBindings;

export type JsonRecord = Record<string, unknown>;

export const MINUTE_MS = 60_000;
export const JSON_HEADERS = {
	"cache-control": "public, max-age=300, stale-while-revalidate=3600",
	"content-type": "application/json; charset=utf-8",
};
export const PNG_HEADERS = {
	"cache-control": "public, max-age=31536000, immutable",
	"content-type": "image/png",
};
export const SVG_HEADERS = {
	"cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
	"content-type": "image/svg+xml",
	expires: "0",
	pragma: "no-cache",
};
export const UNAVAILABLE_JSON_HEADERS = {
	"cache-control": "no-store",
	"content-type": "application/json; charset=utf-8",
};

export function isLocalRequest(request: Request): boolean {
	const hostname = new URL(request.url).hostname;
	return hostname === "localhost" || hostname === "127.0.0.1";
}
