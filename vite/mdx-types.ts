import type { Root } from "hast";

export interface HastNode {
	children?: HastNode[];
	data?: {
		meta?: unknown;
	};
	properties?: Record<string, unknown>;
	tagName?: string;
	type?: string;
	value?: string;
}

export function isHastElement(node: HastNode | undefined, tagName: string) {
	return node?.type === "element" && node.tagName === tagName;
}

// hast node `data` interfaces (CommentData, MdxFlowExpressionHastData, …) are
// not structurally assignable to HastNode's loose `data` shape, so plugin
// transformers accept the real `Root` and convert once here instead of typing
// every walker against the full hast union.
export function asHastNode(tree: Root): HastNode {
	return tree as unknown as HastNode;
}
