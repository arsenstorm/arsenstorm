import { cn } from "cnfast";

type BentoSize = "small" | "medium" | "large";

const SIZE_CLASS: Record<BentoSize, string> = {
	small: "col-span-1 row-span-1 aspect-square", // 0.5x0.5
	medium: "col-span-2 row-span-2 aspect-square", // 1x1
	large: "col-span-4 row-span-4 aspect-square", // 2x2
};

export function BentoBlock({
	size,
	className,
	style,
	children,
}: {
	size?: BentoSize;
	children?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) {
	return (
		<div
			className={cn(
				"relative isolate flex flex-col rounded-3xl bg-neutral-100 p-4 dark:bg-neutral-900",
				size && SIZE_CLASS[size],
				className
			)}
			style={style}
		>
			{children}
		</div>
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
			className={cn(
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
			className={cn(
				"@container grid grid-cols-4 gap-4 md:grid-cols-6",
				className
			)}
		>
			{children}
		</div>
	);
}
