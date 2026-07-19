import { ItemGroup } from "#/components/item-group.tsx";
import { Anchor } from "#/components/link";
import type { WriteupSummary } from "#/lib/writeups";

export function Writing({ items }: { items: WriteupSummary[] }) {
	if (items.length === 0) {
		return null;
	}

	return (
		<section>
			<div className="mb-4 flex flex-row items-center justify-between">
				<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
					Technical Writing
				</h2>
				{items.length > 3 ? (
					<Anchor
						className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						href="/writing"
					>
						View all
					</Anchor>
				) : null}
			</div>
			<ItemGroup
				groupBy="all"
				id="writeups-list"
				items={items}
				showAll={false}
			/>
		</section>
	);
}
