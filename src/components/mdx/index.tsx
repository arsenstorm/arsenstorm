import type { MDXComponents } from "mdx/types.js";
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
	MdxSeparator,
	MdxStrikethrough,
	MdxStrong,
	MdxUnorderedList,
} from "./text";
import { Video } from "./video";

export const writeupComponents: MDXComponents = {
	a: MdxAnchor,
	blockquote: MdxBlockquote,
	Caution,
	code: MdxInlineCode,
	Danger,
	del: MdxStrikethrough,
	h2: MdxHeading2,
	h3: MdxHeading3,
	h4: MdxHeading4,
	h5: MdxHeading5,
	h6: MdxHeading6,
	hr: MdxSeparator,
	Image: MdxImage,
	Info,
	img: MdxImage,
	li: MdxListItem,
	Note,
	ol: MdxOrderedList,
	Panel,
	p: MdxParagraph,
	pre: MdxCodeBlock,
	Success,
	strong: MdxStrong,
	Tip,
	table: MdxTable,
	tbody: MdxTableBody,
	td: MdxTableCell,
	th: MdxTableHeader,
	thead: MdxTableHead,
	tr: MdxTableRow,
	ul: MdxUnorderedList,
	Video,
	Warning,
};
