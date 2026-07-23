import { Bar } from "#/components/dither-kit/bar";
import { BarChart } from "#/components/dither-kit/bar-chart";
import type { ChartConfig } from "#/components/dither-kit/chart-context";
import { Grid } from "#/components/dither-kit/grid";
import { Legend } from "#/components/dither-kit/legend";
import { Tooltip } from "#/components/dither-kit/tooltip";
import { XAxis } from "#/components/dither-kit/x-axis";
import { YAxis } from "#/components/dither-kit/y-axis";

const WEEKS = [
	{ week: "28 Aug", period: "28 Aug-3 Sep", direct: 2, school: 0, rush: 0 },
	{ week: "4 Sep", period: "4-10 Sep", direct: 9, school: 0, rush: 0 },
	{ week: "11 Sep", period: "11-17 Sep", direct: 9, school: 65, rush: 0 },
	{ week: "18 Sep", period: "18-24 Sep", direct: 9, school: 16, rush: 0 },
	{ week: "25 Sep", period: "25 Sep-1 Oct", direct: 6, school: 27, rush: 0 },
	{ week: "2 Oct", period: "2-8 Oct", direct: 15, school: 13, rush: 0 },
	{ week: "9 Oct", period: "9-15 Oct", direct: 12, school: 0, rush: 0 },
	{ week: "16 Oct", period: "16-22 Oct", direct: 4, school: 0, rush: 0 },
	{ week: "23 Oct", period: "23-29 Oct", direct: 4, school: 96, rush: 0 },
	{ week: "30 Oct", period: "30 Oct-5 Nov", direct: 7, school: 1, rush: 0 },
	{ week: "6 Nov", period: "6-12 Nov", direct: 7, school: 0, rush: 0 },
	{ week: "13 Nov", period: "13-19 Nov", direct: 5, school: 0, rush: 0 },
	{ week: "20 Nov", period: "20-26 Nov", direct: 6, school: 0, rush: 0 },
	{ week: "27 Nov", period: "27 Nov-3 Dec", direct: 7, school: 0, rush: 0 },
	{ week: "4 Dec", period: "4-10 Dec", direct: 14, school: 0, rush: 0 },
	{ week: "11 Dec", period: "11-17 Dec", direct: 28, school: 0, rush: 0 },
	{ week: "18 Dec", period: "18-24 Dec", direct: 22, school: 0, rush: 0 },
	{ week: "25 Dec", period: "25-31 Dec", direct: 13, school: 0, rush: 0 },
	{ week: "1 Jan", period: "1-7 Jan", direct: 0, school: 0, rush: 206 },
];

const CONFIG: ChartConfig = {
	direct: { label: "Direct", color: "blue" },
	school: { label: "School", color: "green" },
	rush: { label: "Rush", color: "red" },
};

export function ReviewsChart() {
	return (
		<figure className="my-8 flex flex-col gap-4">
			<div className="h-56">
				<BarChart config={CONFIG} data={WEEKS} stackType="stacked">
					<Grid />
					<XAxis dataKey="week" maxTicks={5} />
					<YAxis />
					<Legend />
					<Tooltip hideZero labelKey="period" />
					<Bar dataKey="direct" />
					<Bar dataKey="school" />
					<Bar dataKey="rush" />
				</BarChart>
			</div>
			<figcaption className="text-neutral-500 text-xs dark:text-neutral-400">
				Review submissions per week, September 2023 to January 2024. The partner
				school&apos;s cohort arrived in batches through September and October.
				The red bar is the January rush — 206 statements in the first week, 158
				of them on the 7th — which pushed us to wind down the free review
				service.
			</figcaption>
		</figure>
	);
}
