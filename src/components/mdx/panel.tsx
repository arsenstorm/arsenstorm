import { cn } from "cnfast";
import { RotateCcw } from "lucide-react";
import { Frame } from "./frame.tsx";

export function Panel({
	children,
	title,
	side = "top",
	onReset,
	demo,
}: {
	children: React.ReactNode;
	title?: string;
	side?: "top" | "bottom";
	onReset?: () => void;
	demo?: string;
}) {
	return (
		<Frame
			className="my-4"
			data-demo={demo}
			header={
				title ? (
					<div
						className={cn(
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
								data-demo-reset={demo ? "" : undefined}
								onClick={onReset}
								type="button"
							>
								Reset
								<RotateCcw aria-hidden="true" className="size-3" />
							</button>
						) : null}
					</div>
				) : null
			}
			surfaceClassName={cn("p-4", !title && "py-0!")}
		>
			{children}
		</Frame>
	);
}
