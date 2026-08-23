import { cn } from "cnfast";
import { LinkCardList } from "#/components/link-card.tsx";
import type { ExperienceSummary } from "#/lib/experience";

function LogoMark({ logo }: { logo?: string }) {
	const className = "mr-1 inline-block size-4 rounded-[5px] align-[-0.1875em]";

	if (logo) {
		return (
			<img
				alt=""
				className={cn(className, "object-cover")}
				height={16}
				src={logo}
				width={16}
			/>
		);
	}

	return <span className={cn(className, "bg-blue-500")} />;
}

export function ExperienceList({ items }: { items: ExperienceSummary[] }) {
	return (
		<LinkCardList
			items={items.map((item) => ({
				description: item.summary,
				href: item.href,
				key: item.slug,
				meta: item.period,
				title: (
					<>
						{item.role} at{" "}
						<span className="inline-block">
							<LogoMark logo={item.logo} />
							{item.company}
						</span>
					</>
				),
			}))}
		/>
	);
}
