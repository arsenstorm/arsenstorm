import { Bar } from "#/components/dither-kit/bar";
import { BarChart } from "#/components/dither-kit/bar-chart";
import type { ChartConfig } from "#/components/dither-kit/chart-context";
import { Grid } from "#/components/dither-kit/grid";
import { Tooltip } from "#/components/dither-kit/tooltip";
import { XAxis } from "#/components/dither-kit/x-axis";
import { YAxis } from "#/components/dither-kit/y-axis";

const MONTHS = [
	{ month: "Aug", signups: 134 },
	{ month: "Sep", signups: 453 },
	{ month: "Oct", signups: 335 },
	{ month: "Nov", signups: 164 },
	{ month: "Dec", signups: 140 },
	{ month: "Jan", signups: 1052 },
	{ month: "Feb", signups: 45 },
];

const CONFIG: ChartConfig = {
	signups: { label: "Signups", color: "blue" },
};

export function SignupsChart() {
	return (
		<figure className="my-8 flex flex-col gap-4">
			<div className="h-56">
				<BarChart config={CONFIG} data={MONTHS}>
					<Grid />
					<XAxis dataKey="month" maxTicks={12} />
					<YAxis />
					<Tooltip labelKey="month" />
					<Bar dataKey="signups" />
				</BarChart>
			</div>
			<figcaption className="text-neutral-500 text-xs dark:text-neutral-400">
				Signups per month, August 2023 to February 2024. Nearly half of all
				users arrived in January, driven by the UCAS deadline and a viral
				TikTok.
			</figcaption>
		</figure>
	);
}
