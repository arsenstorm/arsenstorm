import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	duoOpacity?: number | string;
};

export default function MediaPause({ duoOpacity = 0.4, ...props }: IconProps) {
	return (
		<svg
			aria-hidden="true"
			height={18}
			viewBox="0 0 18 18"
			width={18}
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				clipRule="evenodd"
				d="M2 3.75C2 2.78334 2.78393 2 3.75 2H5.25C6.21607 2 7 2.78334 7 3.75V14.25C7 15.2167 6.21607 16 5.25 16H3.75C2.78393 16 2 15.2167 2 14.25V3.75Z"
				data-color="color-2"
				fill="currentColor"
				fillRule="evenodd"
				opacity={duoOpacity}
			/>{" "}
			<path
				clipRule="evenodd"
				d="M11 3.75C11 2.78334 11.7839 2 12.75 2H14.25C15.2161 2 16 2.78334 16 3.75V14.25C16 15.2167 15.2161 16 14.25 16H12.75C11.7839 16 11 15.2167 11 14.25V3.75Z"
				fill="currentColor"
				fillRule="evenodd"
			/>
		</svg>
	);
}
