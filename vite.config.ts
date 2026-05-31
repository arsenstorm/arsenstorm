import { existsSync, readdirSync } from "node:fs";
import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import rehypePrettyCode, {
	type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";

const TECHNICAL_WRITEUPS_PATH_PREFIX = "/technical-writeups";
const CODE_BLOCK_ALWAYS_EXPANDED_FLAGS = new Set([
	"always-expanded",
	"alwaysExpanded",
	"expanded",
]);
const CODE_BLOCK_HIDE_HEADER_FLAGS = new Set([
	"hide-header",
	"hideHeader",
	"no-header",
	"noHeader",
]);
const HEADING_TAGS = new Set(["h2", "h3", "h4", "h5", "h6"]);
const EXPLICIT_HEADING_ID_PATTERN = /\s*\{#([A-Za-z0-9][A-Za-z0-9_-]*)\}\s*$/;
const SLUG_APOSTROPHE_PATTERN = /['\u2019]/g;
const SLUG_DASH_PATTERN = /-+/g;
const SLUG_END_DASH_PATTERN = /(^-|-$)/g;
const SLUG_INVALID_CHARACTER_PATTERN = /[^a-z0-9\s-]/g;
const SLUG_WHITESPACE_PATTERN = /\s+/g;
const METADATA_WHITESPACE_PATTERN = /\s/;

interface HastNode {
	children?: HastNode[];
	data?: {
		meta?: unknown;
	};
	properties?: Record<string, unknown>;
	tagName?: string;
	type?: string;
	value?: string;
}

function getTechnicalWriteupFileCount() {
	const writeupsDirectory = new URL("./src/writeups/", import.meta.url);

	if (!existsSync(writeupsDirectory)) {
		return 0;
	}

	return readdirSync(writeupsDirectory, { withFileTypes: true }).filter(
		(entry) =>
			entry.isDirectory() &&
			existsSync(new URL(`./${entry.name}/index.mdx`, writeupsDirectory))
	).length;
}

function hasTechnicalWriteupFiles() {
	return getTechnicalWriteupFileCount() > 0;
}

const shouldPrerenderTechnicalWriteups = hasTechnicalWriteupFiles();
const prettyCodeOptions = {
	keepBackground: false,
	theme: {
		dark: "github-dark",
		light: "github-light",
	},
} satisfies RehypePrettyCodeOptions;

function isHastElement(node: HastNode | undefined, tagName: string) {
	return node?.type === "element" && node.tagName === tagName;
}

function isHeadingElement(node: HastNode) {
	return (
		node.type === "element" &&
		typeof node.tagName === "string" &&
		HEADING_TAGS.has(node.tagName)
	);
}

function getNodeText(node: HastNode): string {
	if (node.type === "text") {
		return node.value ?? "";
	}

	if (!node.children) {
		return "";
	}

	return node.children.map(getNodeText).join("");
}

function extractExplicitHeadingId(node: HastNode): string | null {
	if (!node.children) {
		return null;
	}

	for (let index = node.children.length - 1; index >= 0; index--) {
		const child = node.children[index];

		if (child.type === "text") {
			const value = child.value ?? "";
			const match = value.match(EXPLICIT_HEADING_ID_PATTERN);

			if (!match) {
				continue;
			}

			child.value = value.replace(EXPLICIT_HEADING_ID_PATTERN, "");
			return match[1] ?? null;
		}

		const id = extractExplicitHeadingId(child);

		if (id) {
			return id;
		}
	}

	return null;
}

function slugifyHeading(text: string) {
	const slug = text
		.trim()
		.toLowerCase()
		.replace(SLUG_APOSTROPHE_PATTERN, "")
		.replace(SLUG_INVALID_CHARACTER_PATTERN, "")
		.replace(SLUG_WHITESPACE_PATTERN, "-")
		.replace(SLUG_DASH_PATTERN, "-")
		.replace(SLUG_END_DASH_PATTERN, "");

	return slug || "section";
}

function getUniqueHeadingId(id: string, headingIdCounts: Map<string, number>) {
	const count = headingIdCounts.get(id) ?? 0;
	headingIdCounts.set(id, count + 1);

	if (count === 0) {
		return id;
	}

	return `${id}-${count + 1}`;
}

function addHeadingSectionIds() {
	return (tree: HastNode) => {
		addHeadingSectionId(tree, new Map());
	};
}

function addHeadingSectionId(
	node: HastNode,
	headingIdCounts: Map<string, number>
) {
	if (isHeadingElement(node)) {
		node.properties ??= {};

		const existingId = node.properties.id;
		const explicitId = extractExplicitHeadingId(node);
		const fallbackId =
			typeof existingId === "string"
				? existingId
				: slugifyHeading(getNodeText(node));

		node.properties.id = getUniqueHeadingId(
			explicitId ?? fallbackId,
			headingIdCounts
		);
	}

	if (!node.children) {
		return;
	}

	for (const child of node.children) {
		addHeadingSectionId(child, headingIdCounts);
	}
}

function splitCodeBlockMeta(meta: string) {
	const tokens: string[] = [];
	let currentToken = "";
	let quote: string | null = null;

	for (const character of meta) {
		const isQuote = character === '"' || character === "'";

		if (isQuote && (quote === null || quote === character)) {
			quote = quote === character ? null : character;
			currentToken += character;
			continue;
		}

		if (quote === null && METADATA_WHITESPACE_PATTERN.test(character)) {
			if (currentToken) {
				tokens.push(currentToken);
				currentToken = "";
			}

			continue;
		}

		currentToken += character;
	}

	if (currentToken) {
		tokens.push(currentToken);
	}

	return tokens;
}

function codeBlockShouldAlwaysExpand(meta: string) {
	return splitCodeBlockMeta(meta).some((token) =>
		CODE_BLOCK_ALWAYS_EXPANDED_FLAGS.has(token)
	);
}

function codeBlockShouldHideHeader(meta: string) {
	return splitCodeBlockMeta(meta).some((token) =>
		CODE_BLOCK_HIDE_HEADER_FLAGS.has(token)
	);
}

function getCodeBlockMeta(pre: HastNode) {
	const code = pre.children?.find((child) => isHastElement(child, "code"));
	const meta = code?.data?.meta;

	return typeof meta === "string" ? meta : null;
}

function markCodeBlockOptions() {
	return (tree: HastNode) => {
		markCodeBlockOption(tree);
	};
}

function markCodeBlockOption(node: HastNode) {
	if (isHastElement(node, "pre")) {
		const meta = getCodeBlockMeta(node);

		if (meta && codeBlockShouldAlwaysExpand(meta)) {
			node.properties ??= {};
			node.properties["data-expanded"] = "";
		}

		if (meta && codeBlockShouldHideHeader(meta)) {
			node.properties ??= {};
			node.properties["data-hide-header"] = "";
		}
	}

	if (!node.children) {
		return;
	}

	for (const child of node.children) {
		markCodeBlockOption(child);
	}
}

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		{
			enforce: "pre",
			...mdx({
				rehypePlugins: [
					[rehypePrettyCode, prettyCodeOptions],
					addHeadingSectionIds,
					markCodeBlockOptions,
				],
				remarkPlugins: [remarkGfm],
			}),
		},
		tailwindcss(),
		tanstackStart({
			prerender: {
				enabled: true,
				crawlLinks: true,
				failOnError: true,
				filter: ({ path }) =>
					shouldPrerenderTechnicalWriteups ||
					!path.startsWith(TECHNICAL_WRITEUPS_PATH_PREFIX),
			},
		}),
		viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
	],
});

export default config;
