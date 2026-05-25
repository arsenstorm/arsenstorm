import type { MDXComponents } from "mdx/types.js";
import type { ComponentPropsWithoutRef } from "react";

const linkClass =
	"text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-950 dark:text-neutral-50 dark:decoration-neutral-700 dark:hover:decoration-neutral-50";

function MdxAnchor(props: ComponentPropsWithoutRef<"a">) {
	return <a className={linkClass} {...props} />;
}

function MdxHeading2(props: ComponentPropsWithoutRef<"h2">) {
	return (
		<h2
			className="mt-10 mb-3 font-medium text-base text-neutral-950 dark:text-neutral-50"
			{...props}
		/>
	);
}

function MdxParagraph(props: ComponentPropsWithoutRef<"p">) {
	return (
		<p
			className="my-4 text-neutral-600 text-sm leading-6 dark:text-neutral-400"
			{...props}
		/>
	);
}

function MdxList(props: ComponentPropsWithoutRef<"ul">) {
	return (
		<ul
			className="my-4 list-disc space-y-2 pl-5 text-neutral-600 text-sm leading-6 dark:text-neutral-400"
			{...props}
		/>
	);
}

function MdxInlineCode(props: ComponentPropsWithoutRef<"code">) {
	return (
		<code
			className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-950 text-xs dark:bg-neutral-900 dark:text-neutral-50"
			{...props}
		/>
	);
}

export const writeupComponents: MDXComponents = {
	a: MdxAnchor,
	code: MdxInlineCode,
	h2: MdxHeading2,
	p: MdxParagraph,
	ul: MdxList,
};
