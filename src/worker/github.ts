import type { Stats } from "#/lib/types";
import { getAllContributions } from "./github-client";
import type { Env } from "./types";

export const GITHUB_STATS_CACHE_KEY = "stats";

const START_DATE = new Date("2012-09-07T04:00:00.000Z");

export async function refreshGitHubStats(env: Env): Promise<void> {
	const [years, contributions] = await getAllContributions(
		env.GITHUB_TOKEN,
		START_DATE
	);
	const stats: Stats = { contributions, years };
	await env.STATS.put(GITHUB_STATS_CACHE_KEY, JSON.stringify(stats));
}
