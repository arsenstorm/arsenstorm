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

export function markCodeBlockOptions() {
	return (tree: HastNode) => {
		markCodeBlockOption(tree);
	};
}
