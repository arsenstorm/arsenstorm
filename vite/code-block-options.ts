import type { HastNode } from "./mdx-types";
import { isHastElement } from "./mdx-types";

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
const METADATA_WHITESPACE_PATTERN = /\s/;

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

interface MdastNode {
	children?: MdastNode[];
	data?: { hProperties?: Record<string, unknown> };
	meta?: unknown;
	type?: string;
}

// The MDX pipeline drops `code.data.meta` during mdast->hast conversion, so
// smuggle the fence meta through as an hProperties attribute (which survives)
// and restore it to `data.meta` before rehype-pretty-code runs.
export function preserveCodeMeta() {
	return (tree: MdastNode) => {
		const visit = (node: MdastNode) => {
			if (node.type === "code" && typeof node.meta === "string" && node.meta) {
				node.data ??= {};
				node.data.hProperties = {
					...node.data.hProperties,
					metastring: node.meta,
				};
			}
			for (const child of node.children ?? []) {
				visit(child);
			}
		};
		visit(tree);
	};
}

export function restoreCodeMeta() {
	return (tree: HastNode) => {
		const visit = (node: HastNode) => {
			if (isHastElement(node, "code")) {
				const metastring = node.properties?.metastring;
				if (typeof metastring === "string") {
					node.data ??= {};
					node.data.meta ??= metastring;
					delete node.properties?.metastring;
				}
			}
			for (const child of node.children ?? []) {
				visit(child);
			}
		};
		visit(tree);
	};
}

export function markCodeBlockOptions() {
	return (tree: HastNode) => {
		markCodeBlockOption(tree);
	};
}
