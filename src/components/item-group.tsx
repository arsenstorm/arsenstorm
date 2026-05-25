import { HapticAnchor, HapticLink } from "#/components/haptic-link";

interface InternalItemLink {
	params?: { slug: string };
	to: "/technical-writeups/$slug";
}

type ItemGroupItem = {
	description: string;
	href?: string;
	publishedAt?: string;
	title: string;
	year?: string;
} & Partial<InternalItemLink>;

interface ItemGroupProps {
	groupBy?: "year" | "month";
	id?: string;
	items: ItemGroupItem[];
	showAll?: boolean;
}

function groupByDate(
	items: ItemGroupProps["items"],
	groupBy: ItemGroupProps["groupBy"]
): [string, ItemGroupProps["items"]][] {
	const map = new Map<string, ItemGroupProps["items"]>();
	for (const item of items) {
		const key =
			groupBy === "year"
				? (item.year ?? item.publishedAt?.split("-")[0] ?? "")
				: new Date(item.publishedAt ?? "").toLocaleString("en-US", {
						month: "long",
					});
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

export function ItemGroup({
	id,
	items,
	groupBy = "year",
	showAll = true,
}: ItemGroupProps) {
	const visibleItems = showAll ? items : items.slice(0, 3);

	const grouped = groupByDate(visibleItems, groupBy);

	return (
		<div className="flex flex-col gap-6" id={id}>
			{grouped.map(([date, groupedItems]) => (
				<div className="relative -mx-4" key={date}>
					{showAll ? (
						<h3 className="mb-2 px-4 text-neutral-400 text-sm tabular-nums md:absolute md:top-0 md:right-full md:mr-4 md:mb-0 md:px-0 md:pt-3 dark:text-neutral-500">
							{date}
						</h3>
					) : null}
					<ul className="flex flex-col gap-3 rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-900">
						{groupedItems.map((item) => {
							const title = (
								<span className="text-neutral-950 text-sm decoration-neutral-300 underline-offset-4 group-hover:underline dark:text-neutral-50 dark:decoration-neutral-700">
									{item.title}
								</span>
							);
							const description = (
								<span className="text-pretty text-neutral-500 text-sm dark:text-neutral-400">
									{item.description}
								</span>
							);
							let content = (
								<div className="flex flex-col gap-0.5">
									{title}
									{description}
								</div>
							);

							if (item.href) {
								content = (
									<HapticAnchor
										className="group flex flex-col gap-0.5"
										href={item.href}
									>
										{title}
										{description}
									</HapticAnchor>
								);
							}

							if (item.to) {
								content = (
									<HapticLink
										className="group flex flex-col gap-0.5"
										params={item.params}
										to={item.to}
									>
										{title}
										{description}
									</HapticLink>
								);
							}

							return <li key={item.title}>{content}</li>;
						})}
					</ul>
				</div>
			))}
		</div>
	);
}
