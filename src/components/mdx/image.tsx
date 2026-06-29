import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

type MdxImageProps = ComponentPropsWithoutRef<"img"> & {
	invertInDarkMode?: boolean;
};

function MdxImage({
	alt,
	className,
	height,
	invertInDarkMode = false,
	src,
	width,
	...props
}: MdxImageProps) {
	return (
		<div className="not-prose relative -mx-4 my-4 flex flex-col rounded-[14px] bg-neutral-200 p-0.5 dark:bg-neutral-800">
			<p className="order-last mt-1 mb-0.5 ml-4 font-medium text-neutral-600 text-xs tracking-tight dark:text-neutral-400">
				{alt ?? "Image"}
			</p>
			<div className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
				<img
					alt={alt ?? "Image"}
					className={clsx(
						"pointer-events-none select-none",
						invertInDarkMode && "dark:invert",
						className
					)}
					height={height}
					src={src}
					width={width}
					{...props}
				/>
			</div>
		</div>
	);
}

export { MdxImage };
