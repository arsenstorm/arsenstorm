import clsx from "clsx";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { AnimatePresence } from "motion/react";
import {
	type ComponentPropsWithoutRef,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import Clipboard from "#/icons/clipboard.tsx";
import ClipboardCheck from "#/icons/clipboard-check.tsx";
import { SoundButton } from "./sound";

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

type CodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
	"data-expanded"?: string;
	"data-hide-header"?: string;
	"data-language"?: string;
};

type CodeProps = ComponentPropsWithoutRef<"code"> & {
	"data-language"?: string;
};

function formatLanguageLabel(language: string | null): string {
	if (!language) {
		return "Code";
	}

	const normalized = language.toLowerCase();
	return LANGUAGE_LABELS[normalized] ?? normalized.toUpperCase();
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
		<div className="not-prose -mx-4 my-4 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
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
						isCollapsed && "overflow-hidden!"
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

export { MdxCodeBlock, MdxInlineCode };
