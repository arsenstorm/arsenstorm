import { cn } from "cnfast";
import type { ComponentPropsWithoutRef } from "react";
import { Frame } from "./frame.tsx";

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
		<Frame
			caption={alt ?? "Image"}
			className="relative my-4"
			surfaceClassName="overflow-hidden"
		>
			<img
				alt={alt ?? "Image"}
				className={cn(
					"pointer-events-none select-none",
					invertInDarkMode && "dark:invert",
					className
				)}
				height={height}
				src={src}
				width={width}
				{...props}
			/>
		</Frame>
	);
}

export { MdxImage };
