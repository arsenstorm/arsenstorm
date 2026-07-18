import { Anchor } from "#/components/link";
import type { ExperienceSummary } from "#/lib/experience";

function LogoMark({ flipped, logo }: { flipped: boolean; logo?: string }) {
	const className = `mr-1 inline-block size-4 rounded-[5px] align-[-0.1875em] ${flipped ? "-rotate-6" : "rotate-6"}`;

	if (logo) {
		return (
			<img
				alt=""
				className={`${className} object-cover`}
				height={16}
				src={logo}
				width={16}
			/>
		);
	}

	return <span className={`${className} bg-blue-500`} />;
}

export function ExperienceList({ items }: { items: ExperienceSummary[] }) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className="-mx-4 flex flex-col gap-3">
			{items.map((item, index) => (
				<Anchor
					className="group flex flex-col gap-0.5 rounded-xl bg-neutral-100 px-4 py-3 transition-colors hover:bg-neutral-200/70 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
					href={item.href}
					key={item.slug}
				>
					<span className="flex flex-wrap items-baseline justify-between gap-x-4">
						<span className="text-neutral-950 text-sm dark:text-neutral-50">
							{item.role} at{" "}
							<span className="inline-block">
								<LogoMark flipped={index % 2 === 1} logo={item.logo} />
								{item.company}
							</span>
						</span>
						<span className="text-neutral-400 text-xs tabular-nums max-sm:hidden dark:text-neutral-600">
							{item.period}
						</span>
					</span>
					<span className="text-pretty text-neutral-500 text-sm dark:text-neutral-400">
						{item.summary}
					</span>
				</Anchor>
			))}
		</div>
	);
}
