import { Bar } from "#/components/dither-kit/bar";
import { BarChart } from "#/components/dither-kit/bar-chart";
import type { ChartConfig } from "#/components/dither-kit/chart-context";
import { Grid } from "#/components/dither-kit/grid";
import { Legend } from "#/components/dither-kit/legend";
import { Tooltip } from "#/components/dither-kit/tooltip";
import { XAxis } from "#/components/dither-kit/x-axis";
import { YAxis } from "#/components/dither-kit/y-axis";

const WEEKS = [
	{ direct: 2, period: "28 Aug-3 Sep", rush: 0, school: 0, week: "28 Aug" },
	{ direct: 9, period: "4-10 Sep", rush: 0, school: 0, week: "4 Sep" },
	{ direct: 9, period: "11-17 Sep", rush: 0, school: 65, week: "11 Sep" },
	{ direct: 9, period: "18-24 Sep", rush: 0, school: 16, week: "18 Sep" },
	{ direct: 6, period: "25 Sep-1 Oct", rush: 0, school: 27, week: "25 Sep" },
	{ direct: 15, period: "2-8 Oct", rush: 0, school: 13, week: "2 Oct" },
	{ direct: 12, period: "9-15 Oct", rush: 0, school: 0, week: "9 Oct" },
	{ direct: 4, period: "16-22 Oct", rush: 0, school: 0, week: "16 Oct" },
	{ direct: 4, period: "23-29 Oct", rush: 0, school: 96, week: "23 Oct" },
	{ direct: 7, period: "30 Oct-5 Nov", rush: 0, school: 1, week: "30 Oct" },
	{ direct: 7, period: "6-12 Nov", rush: 0, school: 0, week: "6 Nov" },
	{ direct: 5, period: "13-19 Nov", rush: 0, school: 0, week: "13 Nov" },
	{ direct: 6, period: "20-26 Nov", rush: 0, school: 0, week: "20 Nov" },
	{ direct: 7, period: "27 Nov-3 Dec", rush: 0, school: 0, week: "27 Nov" },
	{ direct: 14, period: "4-10 Dec", rush: 0, school: 0, week: "4 Dec" },
	{ direct: 28, period: "11-17 Dec", rush: 0, school: 0, week: "11 Dec" },
	{ direct: 22, period: "18-24 Dec", rush: 0, school: 0, week: "18 Dec" },
	{ direct: 13, period: "25-31 Dec", rush: 0, school: 0, week: "25 Dec" },
	{ direct: 0, period: "1-7 Jan", rush: 206, school: 0, week: "1 Jan" },
];

// biome-ignore assist/source/useSortedKeys: series order sets the stacking and legend order
const CONFIG: ChartConfig = {
	direct: { color: "blue", label: "Direct" },
	school: { color: "green", label: "School" },
	rush: { color: "red", label: "Rush" },
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
