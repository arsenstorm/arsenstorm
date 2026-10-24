import rss from "@astrojs/rss";
import { SITE_URL } from "#/lib/seo";
import { getWriteups } from "#/lib/writeups";

export async function GET() {
	const writeups = await getWriteups();
	return rss({
		customData: "<language>en-gb</language>",
		description: "Writing about interesting technical topics.",
		items: writeups.map((writeup) => ({
			description: writeup.metaDescription ?? writeup.description,
			link: writeup.href,
			pubDate: new Date(writeup.publishedAt),
			title: writeup.title,
		})),
		site: SITE_URL,
		title: "Technical Writing | Arsen Shkrumelyak",
		// Match the canonical URLs, which have no trailing slash.
		trailingSlash: false,
	});
}
