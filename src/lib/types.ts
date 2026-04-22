export interface Year {
	days: number[];
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
