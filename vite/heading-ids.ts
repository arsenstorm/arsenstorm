import type { HastNode } from "./mdx-types";

const HEADING_TAGS = new Set(["h2", "h3", "h4", "h5", "h6"]);
const EXPLICIT_HEADING_ID_PATTERN = /\s*\{#([A-Za-z0-9][A-Za-z0-9_-]*)\}\s*$/;
const SLUG_APOSTROPHE_PATTERN = /['\u2019]/g;
const SLUG_DASH_PATTERN = /-+/g;
const SLUG_END_DASH_PATTERN = /(^-|-$)/g;
const SLUG_INVALID_CHARACTER_PATTERN = /[^a-z0-9\s-]/g;
const SLUG_WHITESPACE_PATTERN = /\s+/g;

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

export function addHeadingSectionIds() {
	return (tree: HastNode) => {
		addHeadingSectionId(tree, new Map());
	};
}
