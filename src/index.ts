import handler from "@tanstack/react-start/server-entry";
import { fallback, link, main, top } from "#/lib/render";
import type { Contribution, GitHubResponse, Stats, Year } from "#/lib/types";
import { USERNAME } from "#/lib/variables";

export interface Env {
	GITHUB_TOKEN: string;
	STATS: KVNamespace;
}

const MAX_YEARS = 3;
const START_DATE = new Date("2012-09-07T04:00:00.000Z");

const SVG_HEADERS = {
	"content-type": "image/svg+xml",
	"cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
	pragma: "no-cache",
	expires: "0",
};

function levelToInt(level: Contribution["contributionLevel"]): number {
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

async function fetchContributions(
	token: string,
	from: Date,
	to: Date
): Promise<{
	weeks: GitHubResponse["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"];
	contributions: number;
}> {
	const body = {
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
			username: USERNAME,
			from: from.toISOString(),
			to: to.toISOString(),
		},
	};

	const response = await fetch("https://api.github.com/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": `${USERNAME}/readme`,
			Authorization: `bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	const json = (await response.json()) as GitHubResponse;
	const calendar = json.data.user.contributionsCollection.contributionCalendar;
	return { weeks: calendar.weeks, contributions: calendar.totalContributions };
}

async function getAllContributions(
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
			from: cursor.toISOString(),
			to: next.toISOString(),
			days: data.weeks
				.flatMap((week) =>
					week.contributionDays.map((day) => levelToInt(day.contributionLevel))
				)
				.reverse(),
		});
		cursor = next;
	}

	return [years.reverse(), totalContributions];
}

function noData(theme: "light" | "dark"): Response {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="60" fill="none">
		<rect width="420" height="60" rx="6" fill="${theme === "dark" ? "#161b22" : "#ebedf0"}"/>
		<text x="210" y="34" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif"
			font-size="13" fill="${theme === "dark" ? "#fff" : "#000"}" opacity="0.5">
			Stats not yet available — cron hasn't run.
		</text>
	</svg>`;
	return new Response(svg, { headers: SVG_HEADERS });
}

async function handleSvg(request: Request, env: Env): Promise<Response> {
	const { searchParams } = new URL(request.url);
	const theme = (searchParams.get("theme") ?? "light") as "light" | "dark";
	const section = searchParams.get("section") ?? "";

	let data: Stats | null = null;
	try {
		const raw = await env.STATS.get("stats");
		data = raw ? (JSON.parse(raw) as Stats) : null;
	} catch {
		return noData(theme);
	}

	if (!data) {
		return noData(theme);
	}

	let content: string;

	if (section === "top") {
		content = top({ height: 20, contributions: data.contributions, theme });
	} else if (section === "link-website") {
		const index = Number(searchParams.get("i"));
		content = link({ height: 18, width: 100, index, theme })("Website");
	} else if (section === "link-twitter") {
		const index = Number(searchParams.get("i"));
		content = link({ height: 18, width: 100, index, theme })("Twitter");
	} else if (section === "link-instagram") {
		const index = Number(searchParams.get("i"));
		content = link({ height: 18, width: 100, index, theme })("Instagram");
	} else if (section === "fallback") {
		content = fallback({ height: 180, width: 420, theme });
	} else {
		const years = data.years.slice(0, MAX_YEARS);
		const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
		const location = {
			city: cf?.city ?? "",
			country: cf?.country ?? "",
		};
		const options = {
			dots: { rows: 6, size: 24, gap: 5 },
			year: { gap: 5 },
		};

		const sizes = years.map((year) => {
			const columns = Math.ceil(year.days.length / options.dots.rows);
			const width =
				columns * options.dots.size + (columns - 1) * options.dots.gap;
			const height =
				options.dots.rows * options.dots.size +
				(options.dots.rows - 1) * options.dots.gap;
			return [width, height];
		});

		const length =
			sizes.reduce((acc, size) => acc + (size[0] ?? 0) + options.year.gap, 0) -
			options.year.gap;

		content = main({
			height: 290,
			years,
			sizes,
			length,
			location,
			theme,
			...options,
		});
	}

	return new Response(content, { headers: SVG_HEADERS });
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		if (url.pathname === "/readme") {
			console.log("fetching readme");
			return await handleSvg(request, env);
		}

		return await handler.fetch(request);
	},

	async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
		const [years, contributions] = await getAllContributions(
			env.GITHUB_TOKEN,
			START_DATE
		);

		const stats: Stats = { years, contributions };
		await env.STATS.put("stats", JSON.stringify(stats));
	},
};
