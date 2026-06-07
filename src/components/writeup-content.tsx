import clsx from "clsx";
import { ChevronsDownUp, ChevronsUpDown, Link as LinkIcon } from "lucide-react";
import type { MDXComponents } from "mdx/types.js";
import { AnimatePresence } from "motion/react";
import {
	type ComponentPropsWithoutRef,
	type PointerEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { Anchor } from "#/components/link";
import Clipboard from "#/icons/clipboard.tsx";
import ClipboardCheck from "#/icons/clipboard-check.tsx";
import { useInterfaceSounds } from "#/lib/interface-sounds";
import {
	Caution,
	Danger,
	Info,
	Note,
	Success,
	Tip,
	Warning,
} from "#/writeups/components/callouts.tsx";
import { Panel } from "#/writeups/components/panel";

const listClass =
	"my-4 space-y-2 pl-5 text-neutral-600 text-sm leading-6 dark:text-neutral-400";
const codeBlockActionClass =
	"flex size-5 items-center justify-center rounded-md text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-400 dark:focus-visible:ring-white/30 dark:hover:text-neutral-50";

const COLLAPSED_CODE_BLOCK_MAX_HEIGHT = 192;
const COPY_STATE_MS = 1200;
const LANGUAGE_LABELS: Record<string, string> = {
	bash: "Shell",
	css: "CSS",
	diff: "Diff",
	html: "HTML",
	js: "JavaScript",
	json: "JSON",
	jsx: "JSX",
	md: "Markdown",
	mdx: "MDX",
	sh: "Shell",
	sql: "SQL",
	ts: "TypeScript",
	tsx: "TSX",
	yaml: "YAML",
	yml: "YAML",
	zsh: "Shell",
};

type CodeProps = ComponentPropsWithoutRef<"code"> & {
	"data-language"?: string;
};

type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
	"data-expanded"?: string;
	"data-hide-header"?: string;
	"data-language"?: string;
};

type MdxImageProps = ComponentPropsWithoutRef<"img"> & {
	invertInDarkMode?: boolean;
};

type SoundButtonProps = ComponentPropsWithoutRef<"button">;

type SectionHeadingProps = ComponentPropsWithoutRef<"h2"> & {
	level: "h2" | "h3" | "h4" | "h5" | "h6";
	levelClassName: string;
};

function formatLanguageLabel(language: string | null): string {
	if (!language) {
		return "Code";
	}

	const normalized = language.toLowerCase();
	return LANGUAGE_LABELS[normalized] ?? normalized.toUpperCase();
}

function shouldOpenInNewTab(href: string | undefined) {
	return href?.startsWith("http://") || href?.startsWith("https://");
}

function SoundButton({
	onPointerDown,
	onPointerEnter,
	...props
}: SoundButtonProps) {
	const { playClick, playHover } = useInterfaceSounds();

	return (
		<button
			onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
				playClick();
				onPointerDown?.(event);
			}}
			onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
				playHover();
				onPointerEnter?.(event);
			}}
			{...props}
		/>
	);
}

function MdxAnchor({
	className,
	href,
	...props
}: ComponentPropsWithoutRef<"a">) {
	const opensInNewTab = shouldOpenInNewTab(href);

	return (
		<Anchor
			className={clsx(
				"text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-950 dark:text-neutral-50 dark:decoration-neutral-700 dark:hover:decoration-neutral-50",
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
			className={clsx(
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
	return <ul className={clsx(listClass, "list-disc")} {...props} />;
}

function MdxOrderedList(props: ComponentPropsWithoutRef<"ol">) {
	return <ol className={clsx(listClass, "list-decimal")} {...props} />;
}

function MdxListItem(props: ComponentPropsWithoutRef<"li">) {
	return (
		<li
			className="pl-1 marker:text-neutral-400 dark:marker:text-neutral-600 [&>p]:my-0"
			{...props}
		/>
	);
}

function MdxInlineCode({
	className,
	"data-language": language,
	...props
}: CodeProps) {
	if (language) {
		return (
			<code
				className={clsx("font-mono text-inherit text-xs leading-6", className)}
				data-language={language}
				{...props}
			/>
		);
	}

	return (
		<code
			className="rounded bg-neutral-100 px-1 py-0.5 text-neutral-950 text-xs dark:bg-neutral-900 dark:text-neutral-50"
			{...props}
		/>
	);
}

function MdxCodeBlock({
	children,
	className: _className,
	"data-expanded": expandedAttribute,
	"data-hide-header": hideHeaderAttribute,
	"data-language": language,
	style,
	...props
}: CodeBlockProps) {
	const alwaysExpanded = expandedAttribute !== undefined;
	const hideHeader = hideHeaderAttribute !== undefined;
	const codeBlockId = useId();
	const codeRef = useRef<HTMLPreElement>(null);
	const resetTimerRef = useRef<number | null>(null);
	const [canExpand, setCanExpand] = useState(false);
	const [copied, setCopied] = useState(false);
	const [expanded, setExpanded] = useState(alwaysExpanded);

	const clearResetTimer = useCallback(() => {
		if (resetTimerRef.current === null) {
			return;
		}

		window.clearTimeout(resetTimerRef.current);
		resetTimerRef.current = null;
	}, []);

	const copyCode = useCallback(async () => {
		const code = codeRef.current?.textContent;
		if (!code) {
			return;
		}

		await window.navigator.clipboard.writeText(code);
		clearResetTimer();
		setCopied(true);
		resetTimerRef.current = window.setTimeout(() => {
			resetTimerRef.current = null;
			setCopied(false);
		}, COPY_STATE_MS);
	}, [clearResetTimer]);

	const toggleExpanded = useCallback(() => {
		setExpanded((current) => !current);
	}, []);

	useEffect(() => clearResetTimer, [clearResetTimer]);

	useEffect(() => {
		if (alwaysExpanded) {
			setCanExpand(false);
			setExpanded(true);
			return;
		}

		const codeBlock = codeRef.current;

		if (!codeBlock) {
			return;
		}

		setCanExpand(codeBlock.scrollHeight > COLLAPSED_CODE_BLOCK_MAX_HEIGHT + 1);
	}, [alwaysExpanded]);

	const isCollapsed = !(alwaysExpanded || expanded);
	const ExpandIcon = expanded ? ChevronsDownUp : ChevronsUpDown;
	const codeBlockStyle = isCollapsed
		? { ...style, maxHeight: COLLAPSED_CODE_BLOCK_MAX_HEIGHT }
		: style;

	return (
		<div className="not-prose -mx-4 my-6 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
			{hideHeader ? null : (
				<div className="my-1 flex items-center justify-between gap-2 pr-2 pl-4">
					<p className="font-medium text-neutral-950 text-xs tracking-tight dark:text-neutral-50">
						{formatLanguageLabel(language ?? null)}
					</p>
					<div className="flex items-center gap-1">
						{canExpand ? (
							<SoundButton
								aria-controls={codeBlockId}
								aria-expanded={expanded}
								aria-label={expanded ? "Collapse code" : "Expand code"}
								className={codeBlockActionClass}
								onClick={toggleExpanded}
								type="button"
							>
								<ExpandIcon
									aria-hidden="true"
									className="size-3.5"
									strokeWidth={2}
								/>
							</SoundButton>
						) : null}
						<SoundButton
							aria-label={copied ? "Copied code" : "Copy code"}
							className={codeBlockActionClass}
							onClick={copyCode}
							type="button"
						>
							<AnimatePresence>
								{copied ? <ClipboardCheck /> : <Clipboard />}
							</AnimatePresence>
						</SoundButton>
					</div>
				</div>
			)}
			<div className="relative">
				<pre
					className={clsx(
						"overflow-x-auto rounded-xl bg-neutral-100 p-4 text-neutral-700 text-xs leading-6 dark:bg-neutral-900 dark:text-neutral-300",
						isCollapsed && "overflow-y-hidden"
					)}
					data-language={language}
					id={codeBlockId}
					ref={codeRef}
					style={codeBlockStyle}
					{...props}
				>
					{children}
				</pre>
				{isCollapsed && canExpand ? (
					<div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end justify-center rounded-b-xl bg-linear-to-b from-neutral-100/0 via-neutral-100/90 to-neutral-100 pb-3 dark:via-neutral-900/90 dark:to-neutral-900">
						<SoundButton
							aria-controls={codeBlockId}
							aria-expanded={expanded}
							className="pointer-events-auto h-6 rounded-md px-3 font-medium text-neutral-600 text-xs transition-colors hover:bg-neutral-950/2.5 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-400 dark:focus-visible:ring-white/30 dark:hover:bg-white/5 dark:hover:text-neutral-50"
							onClick={toggleExpanded}
							type="button"
						>
							Click to Expand
						</SoundButton>
					</div>
				) : null}
			</div>
		</div>
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

function MdxImage({
	alt,
	className,
	height,
	invertInDarkMode = false,
	src,
	width,
	...props
}: MdxImageProps) {
	return (
		<div className="not-prose relative -mx-4 my-6 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
			<p className="order-last mt-1 mb-0.5 ml-4 font-medium text-neutral-600 text-xs tracking-tight dark:text-neutral-400">
				{alt ?? "Image"}
			</p>
			<div className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
				<img
					alt={alt ?? "Image"}
					className={clsx(
						"pointer-events-none select-none",
						invertInDarkMode && "dark:invert",
						className
					)}
					height={height}
					src={src}
					width={width}
					{...props}
				/>
			</div>
		</div>
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
	a: MdxAnchor,
	blockquote: MdxBlockquote,
	button: SoundButton,
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
};
