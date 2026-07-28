import type { Env } from "#/worker/types";

const MD_TOKEN = "text/markdown";
const MD_HEADERS = {
	"cache-control": "public, max-age=300, stale-while-revalidate=3600",
	"content-type": "text/markdown; charset=utf-8",
	vary: "Accept",
};
const TXT_HEADERS = {
	...MD_HEADERS,
	"content-type": "text/plain; charset=utf-8",
};
const CONTENT_BASES = ["/writing", "/projects", "/experience", "/cv"];
const TRAILING_SLASH_REGEX = /\/$/;

/** True only for an explicit text/markdown entry with q > 0 — never for `*​/*` or `text/*`. */
export function acceptsMarkdown(accept: string | null): boolean {
	if (!accept) {
		return false;
	}
	for (const part of accept.split(",")) {
		const [type, ...params] = part.trim().split(";");
		if (type?.trim().toLowerCase() !== MD_TOKEN) {
			continue;
		}
		const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
		return q ? Number.parseFloat(q.slice(2)) > 0 : true;
	}
	return false;
}

export function isContentPath(pathname: string): boolean {
	if (pathname === "/" || pathname === "/work" || pathname === "/index.md") {
		return true;
	}
	return CONTENT_BASES.some(
		(base) =>
			pathname === base ||
			pathname === `${base}.md` ||
			pathname.startsWith(`${base}/`)
	);
}

function markdownAssetPath(pathname: string): string {
	if (pathname === "/") {
		return "/index.md";
	}
	return `${pathname.replace(TRAILING_SLASH_REGEX, "")}.md`;
}

function countMarkdownResponse(
	env: Env,
	pathname: string,
	trigger: "accept" | "suffix"
) {
	env.MARKDOWN_STATS?.writeDataPoint({
		blobs: [pathname, trigger],
		doubles: [1],
		indexes: [pathname],
	});
}

/** Returns a markdown Response, or null when the request should proceed as HTML. */
export async function handleMarkdown(
	request: Request,
	env: Env
): Promise<Response | null> {
	if (request.method !== "GET" && request.method !== "HEAD") {
		return null;
	}
	const url = new URL(request.url);
	const { pathname } = url;

	if (pathname === "/llms.txt") {
		const asset = await env.ASSETS.fetch(request);
		if (!asset.ok) {
			return null;
		}
		countMarkdownResponse(env, pathname, "suffix");
		return new Response(asset.body, { headers: TXT_HEADERS });
	}

	const direct = pathname.endsWith(".md");
	if (!(direct || acceptsMarkdown(request.headers.get("accept")))) {
		return null;
	}
	if (!isContentPath(pathname)) {
		return null;
	}

	const assetPath = direct ? pathname : markdownAssetPath(pathname);
	const asset = await env.ASSETS.fetch(new URL(assetPath, url.origin));
	if (!asset.ok) {
		return null;
	}
	countMarkdownResponse(env, pathname, direct ? "suffix" : "accept");
	return new Response(asset.body, { headers: MD_HEADERS });
}

/** Adds `vary: Accept` to negotiated HTML responses so caches key correctly. */
export function withVaryAccept(response: Response): Response {
	const varied = new Response(response.body, response);
	const existing = varied.headers.get("vary");
	if (!existing) {
		varied.headers.set("vary", "Accept");
	} else if (!existing.toLowerCase().includes("accept")) {
		varied.headers.set("vary", `${existing}, Accept`);
	}
	return varied;
}
