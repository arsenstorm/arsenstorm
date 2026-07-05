import clsx from "clsx";
import { RotateCcw } from "lucide-react";

export function Panel({
	children,
	title,
	side = "top",
	onReset,
}: {
	children: React.ReactNode;
	title: string;
	side?: "top" | "bottom";
	onReset?: () => void;
}) {
	return (
		<div className="not-prose -mx-4 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
			<div
				className={clsx(
					"flex items-center justify-between",
					side === "top" ? "order-first" : "order-last"
				)}
			>
				<p className="my-2 ml-4 font-medium text-neutral-950 text-xs tracking-tight dark:text-neutral-50">
					{title}
				</p>
				{onReset ? (
					<button
						className="my-1 mr-3 flex items-center gap-1 font-medium text-neutral-500 text-xs tracking-tight transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
						onClick={onReset}
						type="button"
					>
						Reset
						<RotateCcw aria-hidden="true" className="size-3" />
					</button>
				) : null}
			</div>
			<div className="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900">
				{children}
			</div>
		</div>
	);
}
