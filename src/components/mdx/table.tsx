import { cn } from "cnfast";
import type { ComponentPropsWithoutRef } from "react";
import { Frame } from "./frame.tsx";

export function MdxTable({
	children,
	...props
}: ComponentPropsWithoutRef<"table">) {
	return (
		<Frame className="my-4" surfaceClassName="overflow-x-auto">
			<table className="w-full border-collapse text-left text-sm" {...props}>
				{children}
			</table>
		</Frame>
	);
}

export function MdxTableHead(props: ComponentPropsWithoutRef<"thead">) {
	return <thead {...props} />;
}

export function MdxTableBody(props: ComponentPropsWithoutRef<"tbody">) {
	return <tbody {...props} />;
}

export function MdxTableRow(props: ComponentPropsWithoutRef<"tr">) {
	return (
		<tr
			className="border-neutral-200 border-t first:border-t-0 dark:border-neutral-800"
			{...props}
		/>
	);
}

export function MdxTableHeader({
	className,
	...props
}: ComponentPropsWithoutRef<"th">) {
	return (
		<th
			className={cn(
				"whitespace-nowrap px-4 py-2.5 font-medium text-neutral-950 text-xs tracking-tight dark:text-neutral-50",
				className
			)}
			{...props}
		/>
	);
}

export function MdxTableCell({
	className,
	...props
}: ComponentPropsWithoutRef<"td">) {
	return (
		<td
			className={cn(
				"whitespace-nowrap px-4 py-2.5 text-neutral-700 text-sm tabular-nums dark:text-neutral-300",
				className
			)}
			{...props}
		/>
	);
}
