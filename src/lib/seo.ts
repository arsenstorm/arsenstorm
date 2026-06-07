const SITE_NAME = "Arsen Shkrumelyak";
const SITE_URL = "https://arsenstorm.com";
const DEFAULT_OG_WIDTH = "1200";
const DEFAULT_OG_HEIGHT = "630";

function getPageTitle(title: string) {
	return title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
}

function getAbsoluteUrl(path: string) {
	return new URL(path, SITE_URL).toString();
}

function getOgImageUrl(path: string) {
	const url = new URL("/og", SITE_URL);
	url.searchParams.set("path", path);

	return url.toString();
}

export function pageMeta(title: string, description: string, path = "/") {
	const pageTitle = getPageTitle(title);
	const pageUrl = getAbsoluteUrl(path);
	const imageUrl = getOgImageUrl(path);

	return [
		{ title: pageTitle },
		{ name: "description", content: description },
		{ property: "og:title", content: pageTitle },
		{ property: "og:description", content: description },
		{ property: "og:type", content: "website" },
		{ property: "og:url", content: pageUrl },
		{ property: "og:image", content: imageUrl },
		{ property: "og:image:width", content: DEFAULT_OG_WIDTH },
		{ property: "og:image:height", content: DEFAULT_OG_HEIGHT },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: pageTitle },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: imageUrl },
	];
}
