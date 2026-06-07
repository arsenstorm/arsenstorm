import mdx from "@mdx-js/rollup";
import rehypePrettyCode, {
	type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { markCodeBlockOptions } from "./code-block-options";
import { addHeadingSectionIds } from "./heading-ids";

const prettyCodeOptions = {
	keepBackground: false,
	theme: {
		dark: "github-dark",
		light: "github-light",
	},
} satisfies RehypePrettyCodeOptions;

export function createMdxPlugin() {
	return {
		enforce: "pre" as const,
		...mdx({
			rehypePlugins: [
				[rehypePrettyCode, prettyCodeOptions],
				addHeadingSectionIds,
				markCodeBlockOptions,
			],
			remarkPlugins: [remarkGfm],
		}),
	};
}
