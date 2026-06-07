import { existsSync, readdirSync } from "node:fs";

const TECHNICAL_WRITEUPS_PATH_PREFIX = "/technical-writeups";

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
	return (
		shouldPrerenderTechnicalWriteups ||
		!path.startsWith(TECHNICAL_WRITEUPS_PATH_PREFIX)
	);
}
