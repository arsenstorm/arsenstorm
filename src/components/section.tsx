import { Anchor } from "./link";

export function Section({
	children,
	cta,
	title,
}: {
	children: React.ReactNode;
	cta?: { label: string; href: string };
	title: string;
}) {
	return (
		<section id={title.toLowerCase().replace(/ /g, "-")}>
			<div className="mb-4 flex flex-row items-center justify-between">
				<h2 className="font-medium text-neutral-950 text-sm dark:text-neutral-50">
					{title}
				</h2>
				{cta ? (
					<Anchor
						className="text-neutral-500 text-sm underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-400 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						href={cta.href}
					>
						{cta.label}
					</Anchor>
				) : null}
			</div>
			{children}
		</section>
	);
}
