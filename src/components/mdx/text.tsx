import { cn } from "cnfast";
import { Link as LinkIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { Anchor } from "../link";

const listClass =
	"my-4 space-y-2 pl-5 text-neutral-600 text-sm leading-6 dark:text-neutral-400";

type SectionHeadingProps = ComponentPropsWithoutRef<"h2"> & {
	level: "h2" | "h3" | "h4" | "h5" | "h6";
	levelClassName: string;
};

function shouldOpenInNewTab(href: string | undefined) {
	return href?.startsWith("http://") || href?.startsWith("https://");
}

function MdxAnchor({
	className,
	href,
	...props
}: ComponentPropsWithoutRef<"a">) {
	const opensInNewTab = shouldOpenInNewTab(href);

	return (
		<Anchor
			className={cn(
				"rounded-sm text-neutral-950 underline decoration-neutral-300 underline-offset-4 outline-neutral-950/30 outline-offset-2 transition-colors hover:decoration-neutral-950 focus-visible:decoration-neutral-950 focus-visible:outline-[1.5px] dark:text-neutral-50 dark:decoration-neutral-700 dark:outline-white/30 dark:focus-visible:decoration-neutral-50 dark:hover:decoration-neutral-50",
				className
			)}
			href={href}
			rel={opensInNewTab ? "noopener noreferrer" : undefined}
			target={opensInNewTab ? "_blank" : undefined}
			{...props}
		/>
	);
}

function MdxStrong(props: ComponentPropsWithoutRef<"strong">) {
	return (
		<strong
			className="font-semibold text-neutral-950 dark:text-neutral-50"
			{...props}
		/>
	);
}

function MdxSectionHeading({
	children,
	className,
	id,
	level,
	levelClassName,
	...props
}: SectionHeadingProps) {
	const Heading = level;

	return (
		<Heading
			className={cn(
				"group flex scroll-mt-24 items-start gap-1 text-neutral-950 dark:text-neutral-50",
				levelClassName,
				className
			)}
			id={id}
			{...props}
		>
			<span className="min-w-0">{children}</span>
			{id ? (
				<Anchor
					aria-label="Link to section"
					className="hidden size-[1lh] shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 group-hover:flex dark:text-neutral-700 dark:focus-visible:ring-white/30 dark:hover:text-neutral-50"
					href={`#${id}`}
				>
					<LinkIcon
						aria-hidden="true"
						className="size-[0.58lh]"
						strokeWidth={2}
					/>
				</Anchor>
			) : null}
		</Heading>
	);
}

function MdxHeading2(props: ComponentPropsWithoutRef<"h2">) {
	return (
		<MdxSectionHeading
			level="h2"
			levelClassName="mt-10 mb-3 font-medium text-base"
			{...props}
		/>
	);
}

function MdxHeading3(props: ComponentPropsWithoutRef<"h3">) {
	return (
		<MdxSectionHeading
			level="h3"
			levelClassName="mt-8 mb-2 font-medium text-sm"
			{...props}
		/>
	);
}

function MdxHeading4(props: ComponentPropsWithoutRef<"h4">) {
	return (
		<MdxSectionHeading
			level="h4"
			levelClassName="mt-6 mb-2 font-medium text-sm"
			{...props}
		/>
	);
}

function MdxHeading5(props: ComponentPropsWithoutRef<"h5">) {
	return (
		<MdxSectionHeading
			level="h5"
			levelClassName="mt-6 mb-2 font-medium text-xs"
			{...props}
		/>
	);
}

function MdxHeading6(props: ComponentPropsWithoutRef<"h6">) {
	return (
		<MdxSectionHeading
			level="h6"
			levelClassName="mt-6 mb-2 font-medium text-xs"
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

function MdxBlockquote(props: ComponentPropsWithoutRef<"blockquote">) {
	return (
		<blockquote
			className="my-6 border-neutral-200 border-l-2 pl-4 text-neutral-500 text-sm leading-6 dark:border-neutral-800 dark:text-neutral-400 [&>p+p]:mt-3 [&>p]:my-0 [&>p]:text-neutral-500 dark:[&>p]:text-neutral-400"
			{...props}
		/>
	);
}

function MdxStrikethrough(props: ComponentPropsWithoutRef<"del">) {
	return (
		<del
			className="text-neutral-400 decoration-neutral-400 dark:text-neutral-500 dark:decoration-neutral-500"
			{...props}
		/>
	);
}

function MdxUnorderedList(props: ComponentPropsWithoutRef<"ul">) {
	return <ul className={cn(listClass, "list-disc")} {...props} />;
}

function MdxOrderedList(props: ComponentPropsWithoutRef<"ol">) {
	return <ol className={cn(listClass, "list-decimal")} {...props} />;
}

function MdxListItem(props: ComponentPropsWithoutRef<"li">) {
	return (
		<li
			className="pl-1 marker:text-neutral-400 dark:marker:text-neutral-600 [&>p]:my-0"
			{...props}
		/>
	);
}

function MdxSeparator(props: ComponentPropsWithoutRef<"hr">) {
	return (
		<hr
			className="my-6 border-neutral-200 dark:border-neutral-800"
			{...props}
		/>
	);
}

export {
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
};
