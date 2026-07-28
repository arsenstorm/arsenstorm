import { describe, expect, it } from "vitest";
import { acceptsMarkdown, isContentPath, withVaryAccept } from "./markdown";

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
