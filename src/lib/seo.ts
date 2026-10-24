import type { WriteupSummary } from "#/lib/writeups";

const SITE_NAME = "Arsen Shkrumelyak";
export const SITE_URL = "https://arsenstorm.com";
export const SITE_DESCRIPTION = "I build software with care.";
const DEFAULT_OG_WIDTH = "1200";
const DEFAULT_OG_HEIGHT = "630";
const LEADING_SLASH_REGEX = /^\//;
const PATH_SEPARATOR_REGEX = /\//g;

interface PageMetaOptions {
	type?: "article" | "website";
}

function getPageTitle(title: string) {
	return title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
}

function getAbsoluteUrl(path: string) {
	return new URL(path, SITE_URL).toString();
}

function ogSlug(path: string): string {
	return path === "/"
		? "index"
		: path.replace(LEADING_SLASH_REGEX, "").replace(PATH_SEPARATOR_REGEX, "-");
}

export function ogImagePath(path: string): string {
	return `/og/${ogSlug(path)}.png`;
}

export function ogVideoPath(path: string): string {
	return `/og/${ogSlug(path)}.mp4`;
}

function getOgImageUrl(path: string) {
	return getAbsoluteUrl(ogImagePath(path));
}

export function pageLinks(path = "/") {
	return [{ href: getAbsoluteUrl(path), rel: "canonical" }];
}

export function pageMeta(
	title: string,
	description: string,
	path = "/",
	options: PageMetaOptions = {}
) {
	const pageTitle = getPageTitle(title);
	const pageUrl = getAbsoluteUrl(path);
	const imageUrl = getOgImageUrl(path);
	const videoUrl = getAbsoluteUrl(ogVideoPath(path));
	const type = options.type ?? "website";

	return [
		{ title: pageTitle },
		{ content: description, name: "description" },
		{ content: pageTitle, property: "og:title" },
		{ content: description, property: "og:description" },
		{ content: type, property: "og:type" },
		{ content: pageUrl, property: "og:url" },
		{ content: imageUrl, property: "og:image" },
		{ content: DEFAULT_OG_WIDTH, property: "og:image:width" },
		{ content: DEFAULT_OG_HEIGHT, property: "og:image:height" },
		{ content: videoUrl, property: "og:video" },
		{ content: "video/mp4", property: "og:video:type" },
		{ content: DEFAULT_OG_WIDTH, property: "og:video:width" },
		{ content: DEFAULT_OG_HEIGHT, property: "og:video:height" },
		{ content: "summary_large_image", name: "twitter:card" },
		{ content: pageTitle, name: "twitter:title" },
		{ content: description, name: "twitter:description" },
		{ content: imageUrl, name: "twitter:image" },
	];
}

export function technicalWriteupJsonLd(writeup: WriteupSummary): string {
	return JSON.stringify({
		"@context": "https://schema.org",
		"@type": "Article",
		author: {
			"@type": "Person",
			name: SITE_NAME,
			url: SITE_URL,
		},
		datePublished: writeup.publishedAt,
		description: writeup.metaDescription ?? writeup.description,
		headline: writeup.title,
		image: getOgImageUrl(writeup.href),
		mainEntityOfPage: getAbsoluteUrl(writeup.href),
		url: getAbsoluteUrl(writeup.href),
	});
}
