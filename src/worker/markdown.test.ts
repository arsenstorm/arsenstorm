import { describe, expect, it } from "vitest";
import {
	acceptsMarkdown,
	handleMarkdown,
	isContentPath,
	markdownAssetPath,
	withVaryAccept,
} from "./markdown";
import type { Env } from "./types";

describe("acceptsMarkdown", () => {
	it.each([
		"text/markdown",
		"text/html, text/markdown;q=0.9",
		"TEXT/MARKDOWN",
	])("returns true for %s", (accept) => {
		expect(acceptsMarkdown(accept)).toBe(true);
	});

	it.each([
		null,
		"*/*",
		"text/*",
		"text/html",
		"text/markdown;q=0",
	])("returns false for %s", (accept) => {
		expect(acceptsMarkdown(accept)).toBe(false);
	});
});

describe("isContentPath", () => {
	it.each([
		"/",
		"/writing",
		"/writing/foo",
		"/writing/foo.md",
		"/projects",
		"/experience/afinity",
		"/cv",
		"/cv.md",
		"/work",
		"/work.md",
		"/index.md",
	])("returns true for %s", (pathname) => {
		expect(isContentPath(pathname)).toBe(true);
	});

	it.each([
		"/cv.pdf",
		"/api/weather",
		"/readme",
		"/og",
		"/fonts/InterVariable.woff2",
		"/404",
	])("returns false for %s", (pathname) => {
		expect(isContentPath(pathname)).toBe(false);
	});
});

describe("withVaryAccept", () => {
	it("sets vary: Accept when absent", () => {
		const response = withVaryAccept(new Response("body"));
		expect(response.headers.get("vary")).toBe("Accept");
	});

	it("appends when an unrelated Vary exists", () => {
		const response = withVaryAccept(
			new Response("body", { headers: { vary: "Origin" } })
		);
		expect(response.headers.get("vary")).toBe("Origin, Accept");
	});

	it("leaves an existing Accept untouched", () => {
		const response = withVaryAccept(
			new Response("body", { headers: { vary: "Accept" } })
		);
		expect(response.headers.get("vary")).toBe("Accept");
	});
});

describe("markdownAssetPath", () => {
	it.each([
		["/", "/index.md"],
		["/work", "/projects.md"],
		["/work.md", "/projects.md"],
		["/cv", "/cv.md"],
		["/cv.md", "/cv.md"],
		["/writing/foo/", "/writing/foo.md"],
	])("maps %s to %s", (pathname, expected) => {
		expect(markdownAssetPath(pathname)).toBe(expected);
	});
});

describe("handleMarkdown", () => {
	const assets = new Map([
		["/cv.md", "# CV"],
		["/projects.md", "# Projects"],
	]);
	const env = {
		ASSETS: {
			fetch: (input: URL | Request) => {
				const { pathname } = new URL(
					input instanceof Request ? input.url : input.toString()
				);
				const body = assets.get(pathname);
				return Promise.resolve(
					body ? new Response(body) : new Response(null, { status: 404 })
				);
			},
		},
	} as unknown as Env;
	const get = (path: string, accept?: string) =>
		handleMarkdown(
			new Request(`https://example.com${path}`, {
				headers: accept ? { accept } : {},
			}),
			env
		);

	it("returns null for HTML clients on known pages", async () => {
		expect(await get("/cv")).toBeNull();
	});

	it("serves markdown for negotiated content paths", async () => {
		const response = await get("/cv", "text/markdown");
		expect(response?.status).toBe(200);
		expect(await response?.text()).toBe("# CV");
	});

	it("aliases /work to the projects markdown", async () => {
		expect(await (await get("/work.md"))?.text()).toBe("# Projects");
	});

	it("returns null when no markdown asset exists", async () => {
		expect(await get("/writing/nope", "text/markdown")).toBeNull();
		expect(await get("/writing/nope.md")).toBeNull();
	});

	it("leaves unknown paths to HTML when markdown is not wanted", async () => {
		expect(await get("/nope")).toBeNull();
	});
});
