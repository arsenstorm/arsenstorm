import clsx from "clsx";

export function Panel({
	children,
	title,
	side = "top",
}: {
	children: React.ReactNode;
	title: string;
	side?: "top" | "bottom";
}) {
	return (
		<div className="not-prose -mx-4 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
			<p
				className={clsx(
					"my-1 ml-4 font-medium text-neutral-950 text-xs tracking-tight dark:text-neutral-50",
					side === "top" ? "order-first" : "order-last"
				)}
			>
				{title}
			</p>
			<div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
				{children}
			</div>
		</div>
	);
}
