import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	duoOpacity?: number | string;
};

export default function Envelope({ duoOpacity = 0.4, ...props }: IconProps) {
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
				d="M4.25 3H13.75C15.2688 3 16.5 4.23122 16.5 5.75V12.25C16.5 13.7688 15.2688 15 13.75 15H4.25C2.73122 15 1.5 13.7688 1.5 12.25V5.75C1.5 4.23122 2.73122 3 4.25 3Z"
				data-color="color-2"
				fill="currentColor"
				opacity={duoOpacity}
			/>
			<path
				d="M2.25 5.75L8.15 9.48C8.67 9.81 9.33 9.81 9.85 9.48L15.75 5.75"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	);
}
