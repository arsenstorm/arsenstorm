import { appendFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Cloudflare turns a cached `Link` header into a 103 Early Hints response, so
// the font starts downloading before the Worker has answered. Only the font:
// the stylesheet's name changes every build, and Cloudflare keeps serving the
// cached hint after a deploy, so a hinted stylesheet would preload a 404.
const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const HTML_EXTENSION_REGEX = /\.html$/;

function htmlRoutes(directory: string): string[] {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
		.map((entry) => relative(DIST, join(entry.parentPath, entry.name)))
		.filter((file) => file !== "404.html" && !file.startsWith("writeup-demos/"))
		.map((file) => `/${file.replace(HTML_EXTENSION_REGEX, "")}`)
		.map((route) => (route === "/index" ? "/" : route));
}

const link =
	"</fonts/InterVariable-latin.woff2>; rel=preload; as=font; crossorigin";

const rules = htmlRoutes(DIST)
	.map((route) => `${route}\n  Link: ${link}\n`)
	.join("");
appendFileSync(join(DIST, "_headers"), `\n# Early hints\n${rules}`);
