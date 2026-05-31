import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string;
	strokewidth?: number;
	title?: string;
};

function Danger({ fill = "currentColor", secondaryfill, ...props }: IconProps) {
	secondaryfill = secondaryfill || fill;

	return (
		<svg
			aria-hidden="true"
			height="18"
			viewBox="0 0 18 18"
			width="18"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g fill={fill}>
				<path
					d="m15.6943,5.0879l-2.7822-2.7822c-.5195-.5195-1.21-.8057-1.9443-.8057h-3.9346c-.7344,0-1.4248.2861-1.9443.8057l-2.7822,2.7822c-.5117.5117-.8057,1.2202-.8057,1.9438v3.9351c0,.7344.2861,1.4248.8057,1.9443l2.7822,2.7822c.5195.5195,1.21.8057,1.9443.8057h3.9346c.7344,0,1.4248-.2861,1.9443-.8057l2.7822-2.7822c.5195-.5195.8057-1.21.8057-1.9443v-3.9351c0-.7236-.2939-1.4321-.8057-1.9438Z"
					fill={secondaryfill}
					opacity=".4"
					strokeWidth="0"
				/>
				<rect
					fill={fill}
					height="3"
					rx=".75"
					ry=".75"
					strokeWidth="0"
					width="8"
					x="5"
					y="7.5"
				/>
			</g>
		</svg>
	);
}

export default Danger;
