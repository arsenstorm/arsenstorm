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
