import { cn } from "cnfast";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const INSET = {
	sm: { frame: "rounded-xl p-0.5", surface: "rounded-[12px]" },
	lg: { frame: "rounded-[20px] p-2", surface: "rounded-[12px]" },
} as const;

export function Frame({
	caption,
	children,
	className,
	header,
	inset = "sm",
	surfaceClassName,
	...props
}: ComponentPropsWithoutRef<"div"> & {
	caption?: ReactNode;
	header?: ReactNode;
	inset?: keyof typeof INSET;
	surfaceClassName?: string;
}) {
	return (
		<div
			className={cn(
				"not-prose -mx-4 flex flex-col bg-neutral-200 dark:bg-neutral-800",
				INSET[inset].frame,
				className
			)}
			{...props}
		>
			{header}
			<div
				className={cn(
					"bg-neutral-100 dark:bg-neutral-900",
					INSET[inset].surface,
					surfaceClassName
				)}
			>
				{children}
			</div>
			{caption ? (
				<p className="order-last mt-1.5 mb-0.5 ml-4 font-medium text-neutral-600 text-xs tracking-tight dark:text-neutral-400">
					{caption}
				</p>
			) : null}
		</div>
	);
}
