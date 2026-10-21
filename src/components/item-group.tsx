import { cn } from "cnfast";
import { Anchor } from "#/components/link";

interface ItemGroupItem {
	description: string;
	href?: string;
	publishedAt?: string;
	status?: "archived" | "decommissioned";
	statusNote?: string;
	title: string;
	year?: string;
}

interface ItemGroupProps {
	groupBy?: "year" | "month" | "all";
	id?: string;
	items: ItemGroupItem[];
	limit?: number;
	showAll?: boolean;
}

function groupByDate(
	items: ItemGroupProps["items"],
	groupBy: ItemGroupProps["groupBy"]
): [string, ItemGroupProps["items"]][] {
	const map = new Map<string, ItemGroupProps["items"]>();

	if (groupBy === "all") {
		return [[items[0]?.publishedAt ?? "", items]];
	}

	for (const item of items) {
		// Months key on year and month, so the same month in different years
		// stays apart.
		const key =
			groupBy === "year"
				? (item.year ?? item.publishedAt?.split("-")[0] ?? "")
				: (item.publishedAt?.slice(0, 7) ?? "");
		const bucket = map.get(key) ?? [];
		bucket.push(item);
		map.set(key, bucket);
	}
	return [...map.entries()].sort((a, b) => {
		const dateA = a[1][0]?.publishedAt ?? a[0];
		const dateB = b[1][0]?.publishedAt ?? b[0];
		return dateB.localeCompare(dateA);
	});
}

// The year is implied for the newest year's months and spelled out for older
// ones. Relative to the content, not today, so a rebuild never changes it.
function monthLabel(yearMonth: string, newestYear: string | undefined): string {
	const month = new Date(`${yearMonth}-01T00:00:00Z`).toLocaleString("en-GB", {
		month: "long",
		timeZone: "UTC",
	});
	const year = yearMonth.slice(0, 4);
	return year === newestYear ? month : `${month} ${year}`;
}

export function ItemGroup({
	id,
	items,
	groupBy = "year",
	limit,
	showAll = true,
}: ItemGroupProps) {
	const visibleItems = showAll ? items : items.slice(0, limit ?? 3);

	const grouped = groupByDate(visibleItems, groupBy);
	const newestYear = grouped[0]?.[0].slice(0, 4);

	return (
		<div className="flex flex-col gap-6" id={id}>
			{grouped.map(([date, groupedItems]) => (
				<div className="relative -mx-4" key={date}>
					{showAll ? (
						<h3 className="mb-2 px-4 text-neutral-400 text-sm tabular-nums md:absolute md:top-0 md:right-full md:mr-4 md:mb-0 md:px-0 md:pt-3 dark:text-neutral-500">
							<time dateTime={date}>
								{groupBy === "month" ? monthLabel(date, newestYear) : date}
							</time>
						</h3>
					) : null}
					<ul className="flex flex-col rounded-xl bg-neutral-100 dark:bg-neutral-900">
						{groupedItems.map((item) => {
							const title = (
								<span className="flex items-center gap-2">
									<span className="text-neutral-950 text-sm decoration-neutral-300 underline-offset-4 group-hover:underline dark:text-neutral-50 dark:decoration-neutral-700">
										{item.title}
									</span>
									{item.status ? (
										<span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500 uppercase tracking-wide dark:bg-neutral-800 dark:text-neutral-400">
											{item.status}
										</span>
									) : null}
								</span>
							);
							const description = (
								<span className="text-pretty text-neutral-500 text-sm dark:text-neutral-400">
									{item.description}
								</span>
							);
							const statusNote = item.statusNote ? (
								<span className="text-pretty text-neutral-500 text-sm italic dark:text-neutral-400">
									{item.statusNote}
								</span>
							) : null;
							const itemClass =
								"flex flex-col gap-0.5 px-4 py-1.5 group-first/item:rounded-t-xl group-first/item:pt-3 group-last/item:rounded-b-xl group-last/item:pb-3";

							let content = (
								<div className={itemClass}>
									{title}
									{description}
									{statusNote}
								</div>
							);

							if (item.href) {
								content = (
									<Anchor
										className={cn(
											"group",
											itemClass,
											"hover:bg-neutral-200/70 focus-visible:bg-neutral-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 focus-visible:ring-inset active:bg-neutral-200/70 dark:active:bg-neutral-800/70 dark:focus-visible:bg-neutral-800/70 dark:focus-visible:ring-white/30 dark:hover:bg-neutral-800/70"
										)}
										href={item.href}
									>
										{title}
										{description}
										{statusNote}
									</Anchor>
								);
							}

							return (
								<li className="group/item" key={item.title}>
									{content}
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</div>
	);
}
