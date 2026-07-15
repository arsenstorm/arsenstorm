import type { MDXComponents } from "mdx/types.js";
import type { ComponentPropsWithoutRef } from "react";
import {
	Caution,
	Danger,
	Info,
	Note,
	Success,
	Tip,
	Warning,
} from "@/components/mdx/callouts.tsx";
import { Panel } from "@/components/mdx/panel.tsx";
import { MdxCodeBlock, MdxInlineCode } from "./code";
import { MdxImage } from "./image";
import {
	MdxTable,
	MdxTableBody,
	MdxTableCell,
	MdxTableHead,
	MdxTableHeader,
	MdxTableRow,
} from "./table";
import {
	MdxAnchor,
	MdxBlockquote,
	MdxHeading2,
	MdxHeading3,
	MdxHeading4,
	MdxHeading5,
	MdxHeading6,
	MdxListItem,
	MdxOrderedList,
	MdxParagraph,
	MdxStrikethrough,
	MdxStrong,
	MdxUnorderedList,
} from "./text";
import { Video } from "./video";

function MdxSeparator(props: ComponentPropsWithoutRef<"hr">) {
	return (
		<hr
			className="my-6 border-neutral-200 dark:border-neutral-800"
			{...props}
		/>
	);
}

export const writeupComponents: MDXComponents = {
	Caution,
	Danger,
	Image: MdxImage,
	Info,
	Note,
	Success,
	Tip,
	Warning,
	Panel,
	Video,
	a: MdxAnchor,
	blockquote: MdxBlockquote,
	code: MdxInlineCode,
	del: MdxStrikethrough,
	h2: MdxHeading2,
	h3: MdxHeading3,
	h4: MdxHeading4,
	h5: MdxHeading5,
	h6: MdxHeading6,
	li: MdxListItem,
	ol: MdxOrderedList,
	p: MdxParagraph,
	pre: MdxCodeBlock,
	ul: MdxUnorderedList,
	hr: MdxSeparator,
	strong: MdxStrong,
	img: MdxImage,
	table: MdxTable,
	thead: MdxTableHead,
	tbody: MdxTableBody,
	tr: MdxTableRow,
	th: MdxTableHeader,
	td: MdxTableCell,
};
