import { existsSync, readdirSync } from "node:fs";

const TECHNICAL_WRITEUPS_PATH_PREFIX = "/technical-writeups";
// Ignore paths with a file extension (e.g. /cv.pdf) as they are worker-rendered assets, not HTML routes.
const ASSET_PATH_REGEX = /\.[a-z0-9]+$/i;

function getTechnicalWriteupFileCount() {
	const writeupsDirectory = new URL("../src/writeups/", import.meta.url);

	if (!existsSync(writeupsDirectory)) {
		return 0;
	}

	return readdirSync(writeupsDirectory, { withFileTypes: true }).filter(
		(entry) =>
			entry.isDirectory() &&
			existsSync(new URL(`./${entry.name}/index.mdx`, writeupsDirectory))
	).length;
}

const shouldPrerenderTechnicalWriteups = getTechnicalWriteupFileCount() > 0;

export function shouldPrerenderPath(path: string) {
	if (ASSET_PATH_REGEX.test(path)) {
		return false;
	}

	return (
		shouldPrerenderTechnicalWriteups ||
		!path.startsWith(TECHNICAL_WRITEUPS_PATH_PREFIX)
	);
}
