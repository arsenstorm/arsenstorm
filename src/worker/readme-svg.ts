import { fallback, link, main, top } from "#/lib/render";
import type { Stats, Year } from "#/lib/types";
import { GITHUB_STATS_CACHE_KEY } from "./github";
import { type Env, SVG_HEADERS } from "./types";

const MAX_YEARS = 3;

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

function getContributionSizes(
	years: Year[],
	options: { dots: { gap: number; rows: number; size: number } }
) {
	return years.map((year) => {
		const columns = Math.ceil(year.days.length / options.dots.rows);
		const width =
			columns * options.dots.size + (columns - 1) * options.dots.gap;
		const height =
			options.dots.rows * options.dots.size +
			(options.dots.rows - 1) * options.dots.gap;
		return [width, height];
	});
}

function getContributionLength(sizes: number[][], yearGap: number) {
	return (
		sizes.reduce((acc, size) => acc + (size[0] ?? 0) + yearGap, 0) - yearGap
	);
}

function renderReadmeSection({
	data,
	request,
	section,
	theme,
	url,
}: {
	data: Stats;
	request: Request;
	section: string;
	theme: "light" | "dark";
	url: URL;
}) {
	if (section === "top") {
		return top({ contributions: data.contributions, height: 20, theme });
	}

	if (section === "link-website") {
		return link({
			height: 18,
			theme,
			width: 100,
			index: Number(url.searchParams.get("i")),
		})("Website");
	}

	if (section === "link-twitter") {
		return link({
			height: 18,
			theme,
			width: 100,
			index: Number(url.searchParams.get("i")),
		})("Twitter");
	}

	if (section === "link-instagram") {
		return link({
			height: 18,
			theme,
			width: 100,
			index: Number(url.searchParams.get("i")),
		})("Instagram");
	}

	if (section === "fallback") {
		return fallback({ height: 180, theme, width: 420 });
	}

	const years = data.years.slice(0, MAX_YEARS);
	const cf = (request as Request & { cf?: IncomingRequestCfProperties }).cf;
	const location = { city: cf?.city ?? "", country: cf?.country ?? "" };
	const options = { dots: { gap: 5, rows: 6, size: 24 }, year: { gap: 5 } };
	const sizes = getContributionSizes(years, options);
	const length = getContributionLength(sizes, options.year.gap);

	return main({
		...options,
		height: 230,
		length,
		location,
		sizes,
		theme,
		years,
	});
}

export async function handleSvg(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const theme = (url.searchParams.get("theme") ?? "light") as "light" | "dark";
	const section = url.searchParams.get("section") ?? "";

	let data: Stats | null = null;
	try {
		const raw = await env.STATS.get(GITHUB_STATS_CACHE_KEY);
		data = raw ? (JSON.parse(raw) as Stats) : null;
	} catch {
		return noData(theme);
	}

	if (!data) {
		return noData(theme);
	}

	const content = renderReadmeSection({ data, request, section, theme, url });
	return new Response(content, { headers: SVG_HEADERS });
}
