import { ItemGroup } from "#/components/item-group.tsx";
import { LinkCardList } from "#/components/link-card.tsx";
import { Section } from "#/components/section.tsx";
import type { WriteupSummary } from "#/lib/writeups";

export function WriteupList({ items }: { items: WriteupSummary[] }) {
	return (
		<LinkCardList
			items={items.map((item) => ({
				description: item.description,
				href: item.href,
				key: item.slug,
				meta: (
					<time dateTime={item.publishedAt}>
						{new Date(item.publishedAt).toLocaleDateString("en-GB", {
							month: "short",
							timeZone: "UTC",
							year: "numeric",
						})}
					</time>
				),
				title: item.title,
			}))}
		/>
	);
}

export function Writing({ items }: { items: WriteupSummary[] }) {
	if (items.length === 0) {
		return null;
	}

	return (
		<Section
			cta={
				items.length > 3 ? { label: "View all", href: "/writing" } : undefined
			}
			title="Technical Writing"
		>
			<ItemGroup
				groupBy="all"
				id="writeups-list"
				items={items}
				showAll={false}
			/>
		</Section>
	);
}
