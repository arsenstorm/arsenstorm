import type React from "react";
import { Controls } from "./controls";
import { DefaultOGTemplate, OGTemplate } from "./og-template";

export function PageHeading({
	title,
	description,
	noHomeLink = false,
	children,
}: {
	title: string;
	description: string;
	noHomeLink?: boolean;
	children?: React.ReactNode;
}) {
	return (
		<>
			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 className="font-medium text-base text-neutral-950 dark:text-neutral-50">
						{title}
					</h1>
					<p className="mt-1 max-w-[56ch] text-pretty text-base text-neutral-500 dark:text-neutral-400">
						{description}
					</p>
				</div>
				<Controls noHomeLink={noHomeLink} />
			</header>
			{children ? (
				<OGTemplate>{children}</OGTemplate>
			) : (
				<DefaultOGTemplate description={description} title={title} />
			)}
		</>
	);
}
