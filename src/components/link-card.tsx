import { cn } from "cnfast";
import type { ReactNode } from "react";
import { Anchor } from "#/components/link";
import Clipboard from "#/icons/clipboard";
import ClipboardCheck from "#/icons/clipboard-check";
import Envelope from "#/icons/envelope";

export interface LinkCardAction {
	/** Copies this text through the `data-copy` script in copy-button.astro. */
	copy?: string;
	href?: string;
	label: string;
}

export interface LinkCardItem {
	actions?: LinkCardAction[];
	description: ReactNode;
	href: string;
	key: string;
	meta: ReactNode;
	title: ReactNode;
}

const cardClass =
	"group flex flex-col gap-0.5 rounded-xl bg-neutral-100 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 focus-visible:ring-inset dark:bg-neutral-900 dark:focus-visible:ring-white/30";
const cardHoverClass =
	"hover:bg-neutral-200/70 focus-visible:bg-neutral-200/70 active:bg-neutral-200/70 dark:active:bg-neutral-800/70 dark:focus-visible:bg-neutral-800/70 dark:hover:bg-neutral-800/70";
// The actions sit over the card, so the card darkens from the wrapper's hover:
// the pointer is on the actions, not on the card itself.
const cardActionsHoverClass =
	"group-hover/actions:bg-neutral-200/70 group-has-focus-visible/actions:bg-neutral-200/70 dark:group-hover/actions:bg-neutral-800/70 dark:group-has-focus-visible/actions:bg-neutral-800/70";
// The card's text and its actions crossfade, each blurring as it leaves so the
// two never read at once. Exits run faster than enters, keyboard focus swaps
// instantly, and reduced motion keeps the fade but drops the blur.
const swapClass =
	"transition-[opacity,filter] duration-100 ease-out group-hover/actions:duration-150 group-has-focus-visible/actions:duration-0";
const cardTextSwapClass = `${swapClass} group-hover/actions:opacity-0 group-has-focus-visible/actions:opacity-0 motion-safe:group-hover/actions:blur-xs motion-safe:group-has-focus-visible/actions:blur-xs`;

// Inset 6px with a 6px radius, concentric with the card's 12px corners.
const actionClass =
	"group/copy flex cursor-pointer items-center justify-center gap-2 rounded-md bg-white text-neutral-950 text-sm transition-[background-color,scale] duration-150 ease-out hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 motion-safe:active:scale-[0.97] dark:bg-neutral-950 dark:text-neutral-50 dark:focus-visible:ring-white/30 dark:hover:bg-neutral-900";

// The leaving label or icon stays visible until its fade ends, then turns
// invisible so screen readers only read the current one.
const labelSwapClass =
	"whitespace-nowrap transition-[opacity,filter,visibility] duration-150 ease-out";
const iconSwapClass =
	"col-start-1 row-start-1 size-4 text-neutral-500 transition-[opacity,scale,filter,visibility] duration-150 ease-out dark:text-neutral-400";

function CardAction({ action }: { action: LinkCardAction }) {
	if (action.copy) {
		return (
			<button className={actionClass} data-copy={action.copy} type="button">
				<span className="grid">
					<Clipboard
						aria-hidden="true"
						className={cn(
							iconSwapClass,
							"group-data-copied/copy:invisible group-data-copied/copy:opacity-0 motion-safe:group-data-copied/copy:scale-50 motion-safe:group-data-copied/copy:blur-xs"
						)}
					/>
					<ClipboardCheck
						aria-hidden="true"
						className={cn(
							iconSwapClass,
							"invisible opacity-0 group-data-copied/copy:visible group-data-copied/copy:scale-100 group-data-copied/copy:opacity-100 motion-safe:scale-50 motion-safe:blur-xs motion-safe:group-data-copied/copy:blur-none"
						)}
					/>
				</span>
				{/* The current label sets the width; the other sits over it, centred
				    by the flex container, while it fades. copy-button.astro
				    animates the width between the two. */}
				<span className="relative flex justify-center" data-copy-labels>
					<span
						className={cn(
							labelSwapClass,
							"group-data-copied/copy:invisible group-data-copied/copy:absolute group-data-copied/copy:opacity-0 motion-safe:group-data-copied/copy:blur-xs"
						)}
					>
						{action.label}
					</span>
					<span
						className={cn(
							labelSwapClass,
							"invisible absolute opacity-0 group-data-copied/copy:visible group-data-copied/copy:static group-data-copied/copy:opacity-100 motion-safe:blur-xs motion-safe:group-data-copied/copy:blur-none"
						)}
					>
						Copied
					</span>
				</span>
			</button>
		);
	}
	return (
		<Anchor className={actionClass} href={action.href}>
			<Envelope
				aria-hidden="true"
				className="size-4 text-neutral-500 dark:text-neutral-400"
			/>
			{action.label}
		</Anchor>
	);
}

export function LinkCardList({ items }: { items: LinkCardItem[] }) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className="-mx-4 flex flex-col gap-3">
			{items.map((item) => {
				const textClass = item.actions ? cardTextSwapClass : "";
				const card = (
					<Anchor
						className={cn(
							cardClass,
							item.actions ? cardActionsHoverClass : cardHoverClass
						)}
						href={item.href}
						key={item.key}
						// The actions repeat the card's link, so Tab goes straight to them.
						// Touch and screen readers still reach the card itself.
						tabIndex={item.actions ? -1 : undefined}
					>
						<span
							className={cn(
								"flex flex-wrap items-baseline justify-between gap-x-4",
								textClass
							)}
						>
							<span className="text-neutral-950 text-sm dark:text-neutral-50">
								{item.title}
							</span>
							<span className="text-neutral-500 text-xs tabular-nums max-sm:hidden">
								{item.meta}
							</span>
						</span>
						<span
							className={cn(
								"max-w-md text-pretty text-neutral-500 text-sm dark:text-neutral-400",
								textClass
							)}
						>
							{item.description}
						</span>
					</Anchor>
				);

				if (!item.actions) {
					return card;
				}

				// The actions cover the card on hover or keyboard focus. Touch has
				// neither, so there the card stays a plain link.
				return (
					<div className="group/actions relative" key={item.key}>
						{card}
						<div
							className={cn(
								"pointer-events-none absolute inset-0 grid grid-cols-2 gap-1.5 p-1.5 opacity-0 group-hover/actions:pointer-events-auto group-hover/actions:opacity-100 group-has-focus-visible/actions:pointer-events-auto group-has-focus-visible/actions:opacity-100 motion-safe:blur-xs motion-safe:group-has-focus-visible/actions:blur-none motion-safe:group-hover/actions:blur-none",
								swapClass
							)}
						>
							{item.actions.map((action) => (
								<CardAction action={action} key={action.label} />
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
