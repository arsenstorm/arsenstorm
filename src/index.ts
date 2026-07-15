import { handle } from "@astrojs/cloudflare/handler";
import { ogImagePath } from "#/lib/seo";
import { handleGitHubActivity, refreshGitHubStats } from "#/worker/github";
import { handleReadmePreview } from "#/worker/readme-preview";
import { handleSvg } from "#/worker/readme-svg";
import type { Env } from "#/worker/types";
import { handleWeather, refreshWeather } from "#/worker/weather";

const WEATHER_REFRESH_CRON = "0 * * * *";
const GITHUB_STATS_REFRESH_CRON = "0 */6 * * *";
const OG_PATH = "/og";
const CV_PDF_HEADERS = {
	"cache-control": "public, max-age=3600, stale-while-revalidate=86400",
	"content-disposition": 'inline; filename="Arsen-Shkrumelyak-CV.pdf"',
	"content-type": "application/pdf",
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/readme") {
			return await handleSvg(request, env);
		}

		if (url.pathname === "/readme/preview") {
			return handleReadmePreview();
		}

		if (url.pathname === "/api/weather") {
			return await handleWeather(request, env);
		}

		if (url.pathname === "/api/github") {
			return await handleGitHubActivity(request, env);
		}

		if (url.pathname === OG_PATH) {
			const path = url.searchParams.get("path") ?? "/";
			return Response.redirect(
				new URL(ogImagePath(path), url.origin).toString(),
				301
			);
		}

		if (url.pathname === "/cv.pdf") {
			const asset = await env.ASSETS.fetch(request);
			if (!asset.ok) {
				return asset;
			}
			return new Response(asset.body, { headers: CV_PDF_HEADERS });
		}

		return await handle(request, env, ctx);
	},

	async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
		switch (event.cron) {
			case WEATHER_REFRESH_CRON:
				await refreshWeather(env);
				return;
			case GITHUB_STATS_REFRESH_CRON:
				await refreshGitHubStats(env);
				return;
			default:
				throw new Error(`Unexpected scheduled cron: ${event.cron}`);
		}
	},
};
