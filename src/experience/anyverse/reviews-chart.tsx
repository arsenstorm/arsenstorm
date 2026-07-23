import { Bar } from "#/components/dither-kit/bar";
import { BarChart } from "#/components/dither-kit/bar-chart";
import type { ChartConfig } from "#/components/dither-kit/chart-context";
import { Grid } from "#/components/dither-kit/grid";
import { Tooltip } from "#/components/dither-kit/tooltip";
import { XAxis } from "#/components/dither-kit/x-axis";
import { YAxis } from "#/components/dither-kit/y-axis";

const MONTHS = [
	{ month: "Aug", statements: 207 },
	{ month: "Sep", statements: 1272 },
	{ month: "Oct", statements: 1208 },
	{ month: "Nov", statements: 40 },
	{ month: "Dec", statements: 137 },
	{ month: "Jan", statements: 199 },
	{ month: "Feb", statements: 25 },
	{ month: "Mar", statements: 26 },
	{ month: "Apr", statements: 17 },
];

const CONFIG: ChartConfig = {
	statements: { label: "Statements reviewed", color: "blue" },
};

export function ReviewsChart() {
	return (
		<figure className="my-8 flex flex-col gap-4">
			<div className="h-56">
				<BarChart config={CONFIG} data={MONTHS}>
					<Grid />
					<XAxis dataKey="month" maxTicks={12} />
					<YAxis />
					<Tooltip labelKey="month" />
					<Bar dataKey="statements" />
				</BarChart>
			</div>
			<figcaption className="text-neutral-500 text-xs dark:text-neutral-400">
				Statements with a completed review per month, August 2025 to April 2026.
				The September–October surge and the January bump line up with the two
				UCAS deadlines.
			</figcaption>
		</figure>
	);
}
