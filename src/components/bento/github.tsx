import clsx from "clsx";
import { useEffect, useState } from "react";
import type {
	ContributionIntensity,
	GitHubActivityDay,
	GitHubActivitySnapshot,
	GitHubActivityWeek,
} from "#/lib/types";
import { CustomBentoBlock } from ".";

const GITHUB_ACTIVITY_ENDPOINT = "/api/github";
const DAYS_IN_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;
const ACTIVITY_TRACK_COPIES = ["primary", "duplicate"] as const;
const SKELETON_WEEK_COUNT = 53;
const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	day: "numeric",
	month: "short",
	timeZone: "UTC",
	year: "numeric",
});
const NUMBER_FORMATTER = new Intl.NumberFormat("en");

const LEVEL_CLASS_NAMES: Record<ContributionIntensity, string> = {
	0: "bg-transparent",
	1: "bg-[#ffee4a] dark:bg-[#631c03]",
	2: "bg-[#ffc501] dark:bg-[#bd561d]",
	3: "bg-[#fe9600] dark:bg-[#fa7a18]",
	4: "bg-[#03001c] dark:bg-[#fddf68]",
};

type GitHubActivityState =
	| { activity: null; status: "loading" }
	| { activity: GitHubActivitySnapshot; status: "ready" }
	| { activity: null; status: "unavailable" };

function formatContributionCount(count: number): string {
	return NUMBER_FORMATTER.format(count);
}

function formatContributionDate(date: string): string {
	return DATE_FORMATTER.format(new Date(`${date}T00:00:00.000Z`));
}

function getWeekDays(week: GitHubActivityWeek): (GitHubActivityDay | null)[] {
	const daysByWeekday = new Map<number, GitHubActivityDay>();
	for (const day of week.days) {
		daysByWeekday.set(day.weekday, day);
	}

	return DAYS_IN_WEEK.map((weekday) => daysByWeekday.get(weekday) ?? null);
}

function ContributionDot({ day }: { day: GitHubActivityDay | null }) {
	if (!day) {
		return (
			<span
				aria-hidden="true"
				className="h-(--github-dot-size) w-(--github-dot-size) rounded-[2px]"
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			className={clsx(
				"h-(--github-dot-size) w-(--github-dot-size) rounded-[2px] outline outline-neutral-950/5 -outline-offset-1 dark:outline-white/5",
				LEVEL_CLASS_NAMES[day.level]
			)}
			title={`${day.count} contributions on ${formatContributionDate(day.date)}`}
		/>
	);
}

function ContributionWeek({
	isDuplicate = false,
	week,
}: {
	isDuplicate?: boolean;
	week: GitHubActivityWeek;
}) {
	return (
		<div
			aria-hidden={isDuplicate || undefined}
			className="grid grid-rows-7 gap-1"
		>
			{getWeekDays(week).map((day, index) => (
				<ContributionDot
					day={day}
					key={day?.date ?? `${week.firstDay}-${index}`}
				/>
			))}
		</div>
	);
}

function GitHubActivityGraph({
	activity,
}: {
	activity: GitHubActivitySnapshot;
}) {
	return (
		<div
			aria-label={`${formatContributionCount(activity.totalContributions)} contributions in the last year`}
			className="[--github-dot-size:calc((100cqh-1.5rem)/7)]"
			role="img"
		>
			<div className="overflow-hidden">
				<div className="github-activity-track flex">
					{ACTIVITY_TRACK_COPIES.map((copy) => (
						<div
							aria-hidden={copy === "duplicate" || undefined}
							className="grid shrink-0 auto-cols-(--github-dot-size) grid-flow-col gap-1"
							key={copy}
						>
							{activity.weeks.map((week) => (
								<ContributionWeek
									isDuplicate={copy === "duplicate"}
									key={`${copy}-${week.firstDay}`}
									week={week}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function GitHubActivitySkeleton() {
	const weeks = Array.from(
		{ length: SKELETON_WEEK_COUNT },
		(_, index) => index
	);

	return (
		<div
			aria-hidden="true"
			className="animate-pulse [--github-dot-size:calc((100cqh-1.5rem)/7)]"
		>
			<div className="overflow-hidden">
				<div className="grid shrink-0 auto-cols-(--github-dot-size) grid-flow-col gap-1">
					{weeks.map((week) => (
						<div className="grid grid-rows-7 gap-1" key={week}>
							{DAYS_IN_WEEK.map((day) => (
								<span
									className="h-(--github-dot-size) w-(--github-dot-size) rounded-[2px] bg-neutral-200 dark:bg-neutral-800"
									key={`${week}-${day}`}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function BentoGithub() {
	const [state, setState] = useState<GitHubActivityState>({
		activity: null,
		status: "loading",
	});

	useEffect(() => {
		const controller = new AbortController();

		async function loadActivity() {
			const response = await fetch(GITHUB_ACTIVITY_ENDPOINT, {
				signal: controller.signal,
			});

			if (!response.ok) {
				setState({ activity: null, status: "unavailable" });
				return;
			}

			const activity = (await response.json()) as GitHubActivitySnapshot;
			setState({ activity, status: "ready" });
		}

		loadActivity().catch(() => {
			if (controller.signal.aborted) {
				return;
			}

			setState({ activity: null, status: "unavailable" });
		});

		return () => {
			controller.abort();
		};
	}, []);

	let activityContent: React.ReactNode;
	if (state.status === "ready") {
		activityContent = <GitHubActivityGraph activity={state.activity} />;
	} else {
		activityContent = <GitHubActivitySkeleton />;
	}

	return (
		<CustomBentoBlock className="@container-size col-span-6 row-span-2 h-[calc((100cqw-5rem)/3+1rem)] justify-center overflow-hidden">
			{activityContent}
		</CustomBentoBlock>
	);
}
