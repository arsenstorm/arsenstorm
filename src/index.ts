import { handle } from "@astrojs/cloudflare/handler";
import { handleCvPdf } from "#/worker/cv-pdf-route";
import { handleGitHubActivity, refreshGitHubStats } from "#/worker/github";
import { OGRenderer as WorkerOGRenderer } from "#/worker/og-renderer";
import { handleOgImage } from "#/worker/og-route";
import { handleReadmePreview } from "#/worker/readme-preview";
import { handleSvg } from "#/worker/readme-svg";
import type { Env } from "#/worker/types";
import { handleWeather, refreshWeather } from "#/worker/weather";

const WEATHER_REFRESH_CRON = "0 * * * *";
const GITHUB_STATS_REFRESH_CRON = "0 */6 * * *";
const OG_PATH = "/og";

export class OGRenderer extends WorkerOGRenderer {}

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
			return await handleOgImage(request, env, ctx);
		}

		if (url.pathname === "/cv.pdf") {
			return await handleCvPdf(request, env, ctx);
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
