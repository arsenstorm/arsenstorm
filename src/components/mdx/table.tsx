import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

export function MdxTable({
	children,
	...props
}: ComponentPropsWithoutRef<"table">) {
	return (
		<div className="not-prose -mx-4 my-4 rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
			<div className="overflow-x-auto rounded-xl bg-neutral-100 dark:bg-neutral-900">
				<table className="w-full border-collapse text-left text-sm" {...props}>
					{children}
				</table>
			</div>
		</div>
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
			className={clsx(
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
			className={clsx(
				"whitespace-nowrap px-4 py-2.5 text-neutral-700 text-sm tabular-nums dark:text-neutral-300",
				className
			)}
			{...props}
		/>
	);
}
