import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	duoOpacity?: number | string;
};

export default function Loader({ duoOpacity = 0.4, ...props }: IconProps) {
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
				d="M17 9C17 4.58172 13.4183 1 9 1V2.5C12.5899 2.5 15.5 5.41015 15.5 9C15.5 12.5899 12.5899 15.5 9 15.5V17C13.4183 17 17 13.4183 17 9Z"
				fill="url(#nc-loader-2-fill-duo-gradient-1)"
			/>{" "}
			<path
				d="M2.5 9C2.5 5.41015 5.41015 2.5 9 2.5V1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17V15.5C5.41015 15.5 2.5 12.5899 2.5 9Z"
				fill="url(#nc-loader-2-fill-duo-gradient-2)"
			/>{" "}
			<circle
				cx="9"
				cy="16.25"
				data-color="color-2"
				fill="currentColor"
				r="0.75"
			/>{" "}
			<circle
				cx="9"
				cy="9"
				data-color="color-2"
				fill="currentColor"
				opacity={duoOpacity}
				r="5"
			/>{" "}
			<defs>
				{" "}
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="nc-loader-2-fill-duo-gradient-1"
					x1="9"
					x2="9"
					y1="2.5"
					y2="16.25"
				>
					{" "}
					<stop stopOpacity="0.5" /> <stop offset="1" />{" "}
				</linearGradient>{" "}
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="nc-loader-2-fill-duo-gradient-2"
					x1="9"
					x2="9"
					y1="2.5"
					y2="16.25"
				>
					{" "}
					<stop stopColor="#000" stopOpacity="0.5" />{" "}
					<stop offset="1" stopColor="#000" stopOpacity="0" />{" "}
				</linearGradient>{" "}
			</defs>
		</svg>
	);
}
