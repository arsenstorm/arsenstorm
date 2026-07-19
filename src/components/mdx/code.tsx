import { cn } from "cnfast";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { type ComponentPropsWithoutRef, useId } from "react";
import Clipboard from "#/icons/clipboard.tsx";
import ClipboardCheck from "#/icons/clipboard-check.tsx";

const codeBlockActionClass =
	"flex size-5 items-center justify-center rounded-md text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-400 dark:focus-visible:ring-white/30 dark:hover:text-neutral-50";

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
				className={cn("font-mono text-inherit text-xs leading-6", className)}
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

	return (
		<div
			className="group/code not-prose -mx-4 my-4 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800"
			data-code-block=""
			{...(alwaysExpanded ? { "data-open": "" } : {})}
		>
			{hideHeader ? null : (
				<div className="my-1 flex items-center justify-between gap-2 pr-2 pl-4">
					<p className="font-medium text-neutral-950 text-xs tracking-tight dark:text-neutral-50">
						{formatLanguageLabel(language ?? null)}
					</p>
					<div className="flex items-center gap-1">
						{alwaysExpanded ? null : (
							<button
								aria-controls={codeBlockId}
								aria-expanded="false"
								aria-label="Expand code"
								className={cn(
									codeBlockActionClass,
									"hidden group-data-can-expand/code:flex"
								)}
								data-code-action="toggle"
								type="button"
							>
								<ChevronsUpDown
									aria-hidden="true"
									className="size-3.5 group-data-open/code:hidden"
									strokeWidth={2}
								/>
								<ChevronsDownUp
									aria-hidden="true"
									className="hidden size-3.5 group-data-open/code:block"
									strokeWidth={2}
								/>
							</button>
						)}
						<button
							aria-label="Copy code"
							className={codeBlockActionClass}
							data-code-action="copy"
							type="button"
						>
							<Clipboard className="group-data-copied/code:hidden" />
							<ClipboardCheck className="hidden group-data-copied/code:block" />
						</button>
					</div>
				</div>
			)}
			<div className="relative">
				<pre
					className="overflow-x-auto rounded-xl bg-neutral-100 p-4 text-neutral-700 text-xs leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 focus-visible:ring-inset dark:bg-neutral-900 dark:text-neutral-300 dark:focus-visible:ring-white/30"
					data-language={language}
					id={codeBlockId}
					style={
						alwaysExpanded
							? style
							: { maxHeight: 192, overflow: "hidden", ...style }
					}
					{...props}
				>
					{children}
				</pre>
				{alwaysExpanded ? null : (
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-20 items-end justify-center rounded-b-xl bg-linear-to-b from-neutral-100/0 via-neutral-100/90 to-neutral-100 pb-3 group-data-can-expand/code:group-not-data-open/code:flex dark:via-neutral-900/90 dark:to-neutral-900"
						data-code-overlay=""
					>
						<button
							aria-controls={codeBlockId}
							aria-expanded="false"
							className="pointer-events-auto h-6 rounded-md px-3 font-medium text-neutral-600 text-xs transition-colors hover:bg-neutral-950/2.5 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-400 dark:focus-visible:ring-white/30 dark:hover:bg-white/5 dark:hover:text-neutral-50"
							data-code-action="toggle"
							type="button"
						>
							Click to Expand
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export { MdxCodeBlock, MdxInlineCode };
