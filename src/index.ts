import { ogImagePath } from "#/lib/seo";
import { refreshGitHubStats } from "#/worker/github";
import { handleMarkdown, withVaryAccept } from "#/worker/markdown";
import { handleOgVideo, isOgVideoPath } from "#/worker/og-video";
import { handleReadmePreview } from "#/worker/readme-preview";
import { handleSvg } from "#/worker/readme-svg";
import type { Env } from "#/worker/types";

const GITHUB_STATS_REFRESH_CRON = "0 */6 * * *";
const OG_PATH = "/og";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname === "/readme") {
      return await handleSvg(request, env);
    }

    if (url.pathname === "/readme/preview") {
      return handleReadmePreview();
    }

    if (url.pathname === OG_PATH) {
      const path = url.searchParams.get("path") ?? "/";
      return Response.redirect(
        new URL(ogImagePath(path), url.origin).toString(),
        301
      );
    }

    if (isOgVideoPath(url.pathname)) {
      return await handleOgVideo(request, env);
    }

    const markdown = await handleMarkdown(request, env);
    if (markdown) {
      return markdown;
    }

    // Pages, and the redirects in front of them, answer differently when
    // markdown is asked for, so caches must key on Accept.
    const response = await env.ASSETS.fetch(request);
    const isPage =
      response.headers.get("content-type")?.startsWith("text/html") ||
      (response.status >= 300 && response.status < 400);
    return isPage ? withVaryAccept(response) : response;
  },

  async scheduled(event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    if (event.cron !== GITHUB_STATS_REFRESH_CRON) {
      throw new Error(`Unexpected scheduled cron: ${event.cron}`);
    }
    await refreshGitHubStats(env);
  },
};
