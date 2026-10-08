import type {
	Contribution,
	ContributionIntensity,
	GitHubResponse,
	Year,
} from "#/lib/types";
import { USERNAME } from "#/lib/variables";

type GitHubResponsePayload = Partial<GitHubResponse> & {
	errors?: { message?: string }[];
};

const joinErrorMessages = (errors: { message?: string }[]) =>
	errors
		.map((error) => error.message)
		.filter(Boolean)
		.join("; ");

function levelToInt(
	level: Contribution["contributionLevel"]
): ContributionIntensity {
	switch (level) {
		case "NONE":
			return 0;
		case "FIRST_QUARTILE":
			return 1;
		case "SECOND_QUARTILE":
			return 2;
		case "THIRD_QUARTILE":
			return 3;
		case "FOURTH_QUARTILE":
			return 4;
		default:
			return 0;
	}
}

async function readGitHubJson(
	response: Response
): Promise<GitHubResponsePayload> {
	const responseBody = await response.text();
	let json: GitHubResponsePayload;
	try {
		json = JSON.parse(responseBody) as GitHubResponsePayload;
	} catch {
		throw new Error(
			`GitHub returned invalid JSON: ${responseBody.slice(0, 200)}`
		);
	}

	if (!response.ok) {
		const message =
			(json.errors && joinErrorMessages(json.errors)) ||
			responseBody.slice(0, 200);
		throw new Error(`GitHub returned ${response.status}: ${message}`);
	}

	if (json.errors?.length) {
		throw new Error(`GitHub GraphQL error: ${joinErrorMessages(json.errors)}`);
	}

	return json;
}

async function fetchContributions(
	token: string,
	from: Date,
	to: Date
): Promise<{
	weeks: GitHubResponse["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"];
	contributions: number;
}> {
	const response = await fetch("https://api.github.com/graphql", {
		body: JSON.stringify({
			query: `query ($username: String!, $from: DateTime, $to: DateTime) {
				user(login: $username) {
					contributionsCollection(from: $from, to: $to) {
						contributionCalendar {
							totalContributions
							weeks {
								contributionDays {
									contributionCount
									date
									contributionLevel
								}
							}
						}
					}
				}
			}`,
			variables: {
				from: from.toISOString(),
				to: to.toISOString(),
				username: USERNAME,
			},
		}),
		headers: {
			Authorization: `bearer ${token}`,
			"Content-Type": "application/json",
			"User-Agent": `${USERNAME}/readme`,
		},
		method: "POST",
	});
	const json = await readGitHubJson(response);
	const calendar =
		json.data?.user?.contributionsCollection?.contributionCalendar;
	if (!calendar) {
		throw new Error("GitHub response did not include a contribution calendar.");
	}

	return { contributions: calendar.totalContributions, weeks: calendar.weeks };
}

export async function getAllContributions(
	token: string,
	start: Date,
	end: Date = new Date()
): Promise<[Year[], number]> {
	const years: Year[] = [];
	let cursor = start;
	let totalContributions = 0;

	while (cursor < end) {
		let next = new Date(cursor.getFullYear() + 1, 0, 1);
		if (next > end) {
			next = end;
		}

		const data = await fetchContributions(token, cursor, next);
		totalContributions += data.contributions;
		years.push({
			days: data.weeks
				.flatMap((week) =>
					week.contributionDays.map((day) => levelToInt(day.contributionLevel))
				)
				.reverse(),
			from: cursor.toISOString(),
			to: next.toISOString(),
		});
		cursor = next;
	}

	return [years.reverse(), totalContributions];
}
