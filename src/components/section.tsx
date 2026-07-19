import { Anchor, textLinkClass } from "./link";

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
					<Anchor className={textLinkClass} href={cta.href}>
						{cta.label}
					</Anchor>
				) : null}
			</div>
			{children}
		</section>
	);
}
