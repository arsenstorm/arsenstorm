import { cn } from "cnfast";
import { useEffect, useState } from "react";
import type {
	ContributionIntensity,
	GitHubActivityDay,
	GitHubActivitySnapshot,
} from "#/lib/types";
import { CustomBentoBlock } from ".";

const GITHUB_ACTIVITY_ENDPOINT = "/api/github";
const ACTIVITY_ROW_COUNT = 6;
const ACTIVITY_TRACK_COPIES = ["primary", "duplicate"] as const;
const SKELETON_COLUMN_COUNT = 74;
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

interface GitHubActivityColumn {
	days: (GitHubActivityDay | null)[];
	key: string;
}

function formatContributionCount(count: number): string {
	return NUMBER_FORMATTER.format(count);
}

function formatContributionDate(date: string): string {
	return DATE_FORMATTER.format(new Date(`${date}T00:00:00.000Z`));
}

function getActivityColumns(
	activity: GitHubActivitySnapshot
): GitHubActivityColumn[] {
	const days = activity.weeks
		.flatMap((week) => week.days)
		.sort((first, second) => first.date.localeCompare(second.date));
	const columns: GitHubActivityColumn[] = [];

	for (let index = 0; index < days.length; index += ACTIVITY_ROW_COUNT) {
		const columnDays = days.slice(index, index + ACTIVITY_ROW_COUNT);
		const padding = Array.from(
			{ length: ACTIVITY_ROW_COUNT - columnDays.length },
			() => null
		);

		columns.push({
			days: [...columnDays, ...padding],
			key: columnDays[0]?.date ?? `empty-${index}`,
		});
	}

	return columns;
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
			className={cn(
				"h-(--github-dot-size) w-(--github-dot-size) rounded-[2px] outline outline-neutral-950/5 -outline-offset-1 dark:outline-white/5",
				LEVEL_CLASS_NAMES[day.level]
			)}
			title={`${day.count} contributions on ${formatContributionDate(day.date)}`}
		/>
	);
}

function ContributionColumn({
	column,
	isDuplicate = false,
}: {
	column: GitHubActivityColumn;
	isDuplicate?: boolean;
}) {
	return (
		<div
			aria-hidden={isDuplicate || undefined}
			className="grid grid-rows-5 gap-1"
		>
			{column.days.map((day, index) => (
				<ContributionDot
					day={day}
					key={day?.date ?? `${column.key}-${index}`}
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
	const columns = getActivityColumns(activity);

	return (
		<div
			aria-label={`${formatContributionCount(activity.totalContributions)} contributions in the last year`}
			className="[--github-dot-size:calc((100cqh-4rem)/5.5)]"
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
							{columns.map((column) => (
								<ContributionColumn
									column={column}
									isDuplicate={copy === "duplicate"}
									key={`${copy}-${column.key}`}
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
	const columns = Array.from(
		{ length: SKELETON_COLUMN_COUNT },
		(_, index) => index
	);
	const rows = Array.from({ length: ACTIVITY_ROW_COUNT }, (_, index) => index);

	return (
		<div
			aria-hidden="true"
			className="animate-pulse [--github-dot-size:calc((100cqh-4rem)/5.5)]"
		>
			<div className="overflow-hidden">
				<div className="grid shrink-0 auto-cols-(--github-dot-size) grid-flow-col gap-1">
					{columns.map((column) => (
						<div className="grid grid-rows-5 gap-1" key={column}>
							{rows.map((row) => (
								<span
									className="h-(--github-dot-size) w-(--github-dot-size) rounded-[2px] bg-neutral-200 dark:bg-neutral-800"
									key={`${column}-${row}`}
								/>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function BentoGithub({ className }: { className?: string }) {
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
		<CustomBentoBlock
			className={cn(
				"@container-size col-span-full row-span-2 h-[calc((100cqw-5rem)/3+1rem)] justify-between overflow-hidden",
				className
			)}
		>
			<div className="flex-1 flex-col items-center justify-center overflow-hidden">
				<p className="-mt-2 flex h-full items-center gap-1 text-neutral-500 text-sm dark:text-neutral-400">
					<span>GitHub Activity</span>
					<span className="text-neutral-500 dark:text-neutral-400">—</span>
					<a
						className="text-neutral-950 underline decoration-neutral-200 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 dark:text-neutral-50 dark:decoration-neutral-800 dark:hover:text-neutral-50 dark:hover:decoration-neutral-50"
						href="https://github.com/arsenstorm"
						rel="noopener noreferrer"
						target="_blank"
					>
						arsenstorm
					</a>
				</p>
			</div>
			{activityContent}
		</CustomBentoBlock>
	);
}
