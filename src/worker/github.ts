import type { Stats } from "#/lib/types";
import { fetchGitHubActivity, getAllContributions } from "./github-client";
import {
	type Env,
	isLocalRequest,
	JSON_HEADERS,
	UNAVAILABLE_JSON_HEADERS,
} from "./types";

export const GITHUB_STATS_CACHE_KEY = "stats";
export const GITHUB_ACTIVITY_CACHE_KEY = "github:activity";

const START_DATE = new Date("2012-09-07T04:00:00.000Z");

export async function refreshGitHubStats(env: Env): Promise<void> {
	const [years, contributions] = await getAllContributions(
		env.GITHUB_TOKEN,
		START_DATE
	);
	const stats: Stats = { contributions, years };
	const activity = await fetchGitHubActivity(env.GITHUB_TOKEN);

	await Promise.all([
		env.STATS.put(GITHUB_STATS_CACHE_KEY, JSON.stringify(stats)),
		env.STATS.put(GITHUB_ACTIVITY_CACHE_KEY, JSON.stringify(activity)),
	]);
}

function githubErrorResponse(error: unknown, request: Request): Response {
	const message =
		isLocalRequest(request) && error instanceof Error
			? error.message
			: "Unable to fetch GitHub activity.";

	return new Response(JSON.stringify({ error: message }), {
		headers: UNAVAILABLE_JSON_HEADERS,
		status: 503,
	});
}

export async function handleGitHubActivity(
	request: Request,
	env: Env
): Promise<Response> {
	const raw = await env.STATS.get(GITHUB_ACTIVITY_CACHE_KEY);
	if (raw) {
		return new Response(raw, { headers: JSON_HEADERS });
	}

	try {
		const activity = await fetchGitHubActivity(env.GITHUB_TOKEN);
		const body = JSON.stringify(activity);
		await env.STATS.put(GITHUB_ACTIVITY_CACHE_KEY, body);

		return new Response(body, { headers: JSON_HEADERS });
	} catch (error) {
		return githubErrorResponse(error, request);
	}
}
