import type { ReactNode } from "react";
import { Anchor } from "#/components/link";

export interface LinkCardItem {
	description: ReactNode;
	href: string;
	key: string;
	meta: ReactNode;
	title: ReactNode;
}

export function LinkCardList({ items }: { items: LinkCardItem[] }) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className="-mx-4 flex flex-col gap-3">
			{items.map((item) => (
				<Anchor
					className="group flex flex-col gap-0.5 rounded-xl bg-neutral-100 px-4 py-3 hover:bg-neutral-200/70 focus-visible:bg-neutral-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 focus-visible:ring-inset dark:bg-neutral-900 dark:focus-visible:bg-neutral-800/70 dark:focus-visible:ring-white/30 dark:hover:bg-neutral-800/70"
					href={item.href}
					key={item.key}
				>
					<span className="flex flex-wrap items-baseline justify-between gap-x-4">
						<span className="text-neutral-950 text-sm dark:text-neutral-50">
							{item.title}
						</span>
						<span className="text-neutral-500 text-xs tabular-nums max-sm:hidden">
							{item.meta}
						</span>
					</span>
					<span className="max-w-md text-pretty text-neutral-500 text-sm dark:text-neutral-400">
						{item.description}
					</span>
				</Anchor>
			))}
		</div>
	);
}
