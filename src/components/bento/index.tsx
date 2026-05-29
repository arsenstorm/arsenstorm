import clsx from "clsx";

export function BentoBlock({
	size,
	className,
	style,
	children,
}: {
	size: "small" | "medium" | "large";
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={clsx(
				"relative isolate flex aspect-square flex-col rounded-3xl bg-neutral-100 p-4 dark:bg-neutral-900",
				size === "small" && "col-span-1 row-span-1", // 0.5x0.5
				size === "medium" && "col-span-2 row-span-2", // 1x1
				size === "large" && "col-span-4 row-span-4", // 2x2
				className
			)}
			style={style}
		>
			{children}
		</div>
	);
}

export function CustomBentoBlock({
	className,
	style,
	children,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={clsx(
				"relative isolate flex flex-col rounded-3xl bg-neutral-100 p-4 dark:bg-neutral-900",
				className
			)}
			style={style}
		>
			{children}
		</div>
	);
}

export function EmptyBentoBlock({
	size,
	className,
}: {
	size: "small" | "medium" | "large";
	className?: string;
}) {
	return (
		<div
			className={clsx(
				"relative isolate flex aspect-square flex-col rounded-3xl bg-transparent dark:bg-transparent",
				size === "small" && "col-span-1 row-span-1", // 0.5x0.5
				size === "medium" && "col-span-2 row-span-2", // 1x1
				size === "large" && "col-span-4 row-span-4", // 2x2
				className
			)}
		/>
	);
}

export function BentoBlockSkeleton({
	size,
}: {
	size: "small" | "medium" | "large";
}) {
	return (
		<div
			className={clsx(
				"relative isolate flex aspect-square animate-pulse flex-col rounded-3xl bg-neutral-100 p-4 dark:bg-neutral-900",
				size === "small" && "col-span-1 row-span-1", // 0.5x0.5
				size === "medium" && "col-span-2 row-span-2", // 1x1
				size === "large" && "col-span-4 row-span-4" // 2x2
			)}
		/>
	);
}

export function BentoAppBlock({
	app,
	className,
}: {
	app: {
		name: string;
		href: string;
		image: string;
	};
	className?: string;
}) {
	return (
		<BentoBlock
			className={clsx(
				"overflow-clip border border-neutral-200 dark:border-neutral-800",
				className
			)}
			size="small"
		>
			<a
				className="absolute inset-0 size-full"
				href={app.href}
				rel="noopener noreferrer"
				target="_blank"
			>
				<img
					alt={app.name}
					className="size-full object-cover"
					height={100}
					src={app.image}
					width={100}
				/>
				<span className="sr-only">{app.name}</span>
			</a>
		</BentoBlock>
	);
}

export function BentoGrid({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={clsx(
				"@container grid grid-cols-4 gap-4 md:grid-cols-6",
				className
			)}
		>
			{children}
		</div>
	);
}
