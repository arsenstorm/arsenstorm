import { describe, expect, it } from "vitest";
import {
	mapSvgClasses,
	parseFrontmatter,
	transformMdxToMarkdown,
} from "./generate-markdown-assets";

const FIXTURE = `---
title: "Fixture"
description: "A fixture writeup."
publishedAt: "2026-01-01"
tags: ["Testing"]
---

import { FooDemo } from "./demos/foo-demo.tsx";

{/* a comment */}

Intro paragraph.

<Tip>
  Use the \`/prd\` skill first.
</Tip>

<Note title="X">
  Something worth knowing.
</Note>

<Panel title="Y">
  1. First step
  2. Second step
</Panel>

\`\`\`rb expanded
puts "hello"
\`\`\`

<FooDemo />
`;

describe("transformMdxToMarkdown", () => {
	it("lowers MDX to plain markdown", async () => {
		const output = await transformMdxToMarkdown(FIXTURE, "/fixture/index.mdx");

		expect(output.startsWith('---\ntitle: "Fixture"')).toBe(true);
		expect(output).toContain('tags: ["Testing"]');

		expect(output).toContain("> [!TIP]");
		expect(output).toContain("`/prd`");

		expect(output).toContain("> [!NOTE]");
		expect(output).toContain("**X**");

		expect(output).toContain("**Y**");
		expect(output).toContain("1. First step");
		expect(output).toContain("2. Second step");

		expect(output).toContain("```rb\n");
		expect(output).not.toContain("```rb expanded");

		expect(output).toContain(
			"[Interactive content — see the web version of this page.]"
		);

		expect(output).not.toContain("import ");
		expect(output).not.toContain("<Tip");
		expect(output).not.toContain("a comment");
	});
});

describe("mapSvgClasses", () => {
	it("replaces Tailwind classes with presentation attributes", () => {
		const output = mapSvgClasses(
			'<svg class="h-auto w-full"><rect class="fill-neutral-100 stroke-neutral-300 dark:fill-neutral-900"/><text class="font-mono fill-neutral-950">x</text></svg>'
		);

		expect(output).toContain('fill="#f5f5f5"');
		expect(output).toContain('stroke="#d4d4d4"');
		expect(output).toContain('fill="#0a0a0a"');
		expect(output).toContain('font-family="ui-monospace, monospace"');
		expect(output).not.toContain("#171717");
		expect(output).not.toContain("class=");
	});
});

describe("parseFrontmatter", () => {
	it("reads strings, arrays, block lists and null", () => {
		const fields = parseFrontmatter(
			'---\ncompany: "Acme"\nend: null\ntags: ["a", "b"]\nhighlights:\n  - "One"\n  - "Two"\n---\n\nBody.\n'
		);

		expect(fields.company).toBe("Acme");
		expect(fields.end).toBeNull();
		expect(fields.tags).toEqual(["a", "b"]);
		expect(fields.highlights).toEqual(["One", "Two"]);
	});
});
