import { appendFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Cloudflare turns a cached `Link` header into a 103 Early Hints response, so
// the stylesheet and font start downloading before the Worker has answered.
// The stylesheet name is hashed per build, so the rule is written after it.
const DIST_CLIENT = fileURLToPath(new URL("../dist/client/", import.meta.url));
const HTML_EXTENSION_REGEX = /\.html$/;

function htmlRoutes(directory: string): string[] {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
		.map((entry) => relative(DIST_CLIENT, join(entry.parentPath, entry.name)))
		.filter((file) => file !== "404.html" && !file.startsWith("writeup-demos/"))
		.map((file) => `/${file.replace(HTML_EXTENSION_REGEX, "")}`)
		.map((route) => (route === "/index" ? "/" : route));
}

const stylesheets = readdirSync(join(DIST_CLIENT, "_astro"))
	.filter((file) => file.endsWith(".css"))
	.map((file) => `</_astro/${file}>; rel=preload; as=style`);
const font = "</fonts/InterVariable-latin.woff2>; rel=preload; as=font; crossorigin";
const link = [...stylesheets, font].join(", ");

const rules = htmlRoutes(DIST_CLIENT)
	.map((route) => `${route}\n  Link: ${link}\n`)
	.join("");
appendFileSync(join(DIST_CLIENT, "_headers"), `\n# Early hints\n${rules}`);
