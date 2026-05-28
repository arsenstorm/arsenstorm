export type ContributionIntensity = 0 | 1 | 2 | 3 | 4;

export interface Year {
	days: ContributionIntensity[];
	from: string;
	to: string;
}

export interface Contribution {
	contributionCount: number;
	contributionLevel:
		| "NONE"
		| "FIRST_QUARTILE"
		| "SECOND_QUARTILE"
		| "THIRD_QUARTILE"
		| "FOURTH_QUARTILE";
	date: string;
}

export interface GitHubResponse {
	data: {
		user: {
			contributionsCollection: {
				contributionCalendar: {
					totalContributions: number;
					weeks: {
						contributionDays: Contribution[];
					}[];
				};
			};
		};
	};
}

export interface Stats {
	contributions: number;
	years: Year[];
}

export interface GitHubActivityDay {
	count: number;
	date: string;
	level: ContributionIntensity;
	weekday: number;
}

export interface GitHubActivityWeek {
	days: GitHubActivityDay[];
	firstDay: string;
}

export interface GitHubActivitySnapshot {
	fetchedAt: string;
	from: string;
	to: string;
	totalContributions: number;
	username: string;
	weeks: GitHubActivityWeek[];
}
