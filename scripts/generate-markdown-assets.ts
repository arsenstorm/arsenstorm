import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import process, { stdout } from "node:process";
import { fileURLToPath } from "node:url";
import { type ComponentType, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { PROJECTS } from "../src/lib/projects";
import { SITE_URL } from "../src/lib/seo";

const DIST_CLIENT = fileURLToPath(new URL("../dist/client/", import.meta.url));
const WRITEUPS_DIRECTORY = fileURLToPath(
	new URL("../src/writeups/", import.meta.url)
);
const EXPERIENCE_DIRECTORY = fileURLToPath(
	new URL("../src/experience/", import.meta.url)
);

// ponytail: the site's default description lives as a local `const DESCRIPTION`
// in src/pages/index.astro (and src/lib/render.ts) — it is not exported from
// src/lib/seo.ts, and src/ is out of scope for this change. Export it there and
// import it here when src/ is next touched.
const SITE_DESCRIPTION = "I build software with care.";

const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
const IMPORT_REGEX =
	/import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+["']([^"']+)["']/g;
const NAMED_IMPORT_ALIAS_REGEX = /\s+as\s+/;
const SVG_OPEN_TAG_REGEX = /<svg\b[^>]*>/;
const ARIA_LABEL_REGEX = /aria-label="([^"]*)"/;
const PANEL_TITLE_REGEX = /<p\b[^>]*>([\s\S]*?)<\/p>/;
const CLASS_ATTRIBUTE_REGEX = /\s+class="([^"]*)"/g;
const NEUTRAL_TOKEN_REGEX =
	/^(fill|stroke)-neutral-(50|100|300|400|500|700|900|950)$/;
const DARK_PREFIX = "dark:";
const CAPITALIZED_NAME_REGEX = /^[A-Z]/;
const LINE_BREAK_REGEX = /\r?\n/;
const FRONTMATTER_KEY_REGEX = /^([A-Za-z][\w-]*):\s*(.*)$/;
const LIST_ITEM_REGEX = /^\s+-\s/;
const LIST_ITEM_PREFIX_REGEX = /^\s+-\s+/;
const WHITESPACE_REGEX = /\s+/;
const HTML_ENTITY_REGEX = /&(amp|lt|gt|quot|#39|#x27);/g;
const ID_ATTRIBUTE_REGEX = /\bid="([^"]+)"/g;
const ID_REFERENCE_REGEX = /url\(#([^)]+)\)/g;

const HTML_ENTITIES: Record<string, string> = {
	"#39": "'",
	"#x27": "'",
	amp: "&",
	gt: ">",
	lt: "<",
	quot: '"',
};

const NEUTRAL_PALETTE: Record<string, string> = {
	"50": "#fafafa",
	"100": "#f5f5f5",
	"300": "#d4d4d4",
	"400": "#a3a3a3",
	"500": "#737373",
	"700": "#404040",
	"900": "#171717",
	"950": "#0a0a0a",
};

const CALLOUT_ALERTS: Record<string, string> = {
	Caution: "CAUTION",
	Danger: "CAUTION",
	Info: "NOTE",
	Note: "NOTE",
	Success: "NOTE",
	Tip: "TIP",
	Warning: "WARNING",
};

const INTERACTIVE_PLACEHOLDER =
	"[Interactive content — see the web version of this page.]";

const DIAGRAM_PATH_MARKER = "/diagrams/";

interface MdxAttribute {
	name?: string;
	type: string;
	value?: unknown;
}

interface MdNode {
	attributes?: MdxAttribute[];
	children?: MdNode[];
	lang?: string | null;
	meta?: string | null;
	name?: string | null;
	type: string;
	value?: string;
}

type Frontmatter = Record<string, string | string[] | null>;

const processor = unified()
	.use(remarkParse)
	.use(remarkMdx)
	.use(remarkGfm)
	.use(remarkStringify, { bullet: "-" });

/** A node serialized verbatim — remark escapes `[` in plain text, which would
 *  break GitHub alert markers and the interactive-content placeholder. */
function raw(value: string): MdNode {
	return { type: "html", value };
}

function paragraph(children: MdNode[]): MdNode {
	return { children, type: "paragraph" };
}

function decodeEntities(value: string): string {
	return value.replace(
		HTML_ENTITY_REGEX,
		(_match, name: string) => HTML_ENTITIES[name] ?? _match
	);
}

// -- Frontmatter -------------------------------------------------------------

/** Minimal YAML reader for the flat frontmatter shapes this repo uses: quoted
 *  strings, `null`, inline JSON arrays, and block lists of quoted strings.
 *  Keys whose values are neither (e.g. `facts`, a list of maps) are skipped. */
export function parseFrontmatter(source: string): Frontmatter {
	const match = FRONTMATTER_REGEX.exec(source);
	if (!match) {
		throw new Error("Missing frontmatter block.");
	}

	const fields: Frontmatter = {};
	const lines = match[1].split(LINE_BREAK_REGEX);

	for (let index = 0; index < lines.length; index += 1) {
		const keyed = FRONTMATTER_KEY_REGEX.exec(lines[index]);
		if (!keyed) {
			continue;
		}

		const [, key, rest] = keyed;
		if (rest === "") {
			const items: string[] = [];
			while (
				index + 1 < lines.length &&
				LIST_ITEM_REGEX.test(lines[index + 1])
			) {
				index += 1;
				const item = lines[index].replace(LIST_ITEM_PREFIX_REGEX, "");
				if (item.startsWith('"')) {
					items.push(JSON.parse(item) as string);
				}
			}
			fields[key] = items;
			continue;
		}

		fields[key] = parseScalar(rest);
	}

	return fields;
}

function parseScalar(rest: string): string | null {
	if (rest === "null") {
		return null;
	}
	if (rest.startsWith('"') || rest.startsWith("[")) {
		return JSON.parse(rest) as string;
	}
	return rest;
}

function requireString(fields: Frontmatter, key: string, file: string): string {
	const value = fields[key];
	if (typeof value !== "string") {
		throw new Error(
			`Frontmatter field "${key}" missing or not a string in ${file}.`
		);
	}
	return value;
}

function requireList(fields: Frontmatter, key: string, file: string): string[] {
	const value = fields[key];
	if (!Array.isArray(value)) {
		throw new Error(
			`Frontmatter field "${key}" missing or not a list in ${file}.`
		);
	}
	return value;
}

// -- SVG ---------------------------------------------------------------------

function classTokenToAttribute(token: string): string | null {
	if (token.startsWith(DARK_PREFIX)) {
		return null;
	}
	if (token === "font-mono") {
		return 'font-family="ui-monospace, monospace"';
	}
	const neutral = NEUTRAL_TOKEN_REGEX.exec(token);
	if (!neutral) {
		return null;
	}
	return `${neutral[1]}="${NEUTRAL_PALETTE[neutral[2]]}"`;
}

/** Replace Tailwind `class` attributes with the equivalent SVG presentation
 *  attributes, so the markup renders outside the site's stylesheet. */
export function mapSvgClasses(svg: string): string {
	return svg.replace(CLASS_ATTRIBUTE_REGEX, (_match, classList: string) => {
		const attributes: string[] = [];
		for (const token of classList.split(WHITESPACE_REGEX)) {
			const attribute = token ? classTokenToAttribute(token) : null;
			if (attribute && !attributes.includes(attribute)) {
				attributes.push(attribute);
			}
		}
		return attributes.length > 0 ? ` ${attributes.join(" ")}` : "";
	});
}

interface RenderedDiagram {
	label: string;
	svg: string;
	title: string;
}

function extractDiagram(html: string, name: string): RenderedDiagram {
	const start = html.indexOf("<svg");
	const end = html.indexOf("</svg>", start);
	if (start === -1 || end === -1) {
		throw new Error(`Diagram <${name}> rendered no <svg> element.`);
	}

	const svg = html.slice(start, end + "</svg>".length);
	const label = ARIA_LABEL_REGEX.exec(SVG_OPEN_TAG_REGEX.exec(svg)?.[0] ?? "");
	if (!label) {
		throw new Error(`Diagram <${name}> has no aria-label on its <svg>.`);
	}

	const title = PANEL_TITLE_REGEX.exec(html.slice(0, start));
	if (!title) {
		throw new Error(`Diagram <${name}> has no panel title before its <svg>.`);
	}

	return {
		label: decodeEntities(label[1]),
		svg: namespaceIds(mapSvgClasses(svg), name),
		title: decodeEntities(title[1]),
	};
}

/** React's `useId` restarts per render, so every diagram in a page would emit
 *  the same `<marker id>`. Qualify ids (and their `url(#…)` refs) by component. */
function namespaceIds(svg: string, name: string): string {
	return svg
		.replace(ID_ATTRIBUTE_REGEX, (_match, id: string) => `id="${id}-${name}"`)
		.replace(ID_REFERENCE_REGEX, (_match, id: string) => `url(#${id}-${name})`);
}

async function renderDiagram(
	name: string,
	modulePath: string
): Promise<MdNode[]> {
	const mod = (await import(modulePath)) as Record<string, ComponentType>;
	const Component = mod[name];
	if (!Component) {
		throw new Error(`Module ${modulePath} has no export named ${name}.`);
	}

	const { label, svg, title } = extractDiagram(
		renderToStaticMarkup(createElement(Component)),
		name
	);

	return [
		paragraph([{ children: [{ type: "text", value: title }], type: "strong" }]),
		raw(svg),
		paragraph([
			{ children: [{ type: "text", value: label }], type: "emphasis" },
		]),
	];
}

// -- MDX transform -----------------------------------------------------------

function collectImports(tree: MdNode, file: string): Map<string, string> {
	const imports = new Map<string, string>();
	for (const node of tree.children ?? []) {
		if (node.type !== "mdxjsEsm" || !node.value) {
			continue;
		}
		IMPORT_REGEX.lastIndex = 0;
		let match = IMPORT_REGEX.exec(node.value);
		while (match) {
			const [, named, defaultName, specifier] = match;
			const resolved = specifier.startsWith(".")
				? resolve(dirname(file), specifier)
				: specifier;
			const names = named
				? named
						.split(",")
						.map(
							(part) => part.trim().split(NAMED_IMPORT_ALIAS_REGEX).at(-1) ?? ""
						)
				: [defaultName];
			for (const name of names) {
				if (name) {
					imports.set(name, resolved);
				}
			}
			match = IMPORT_REGEX.exec(node.value);
		}
	}
	return imports;
}

function attributeString(node: MdNode, name: string): string | null {
	for (const attribute of node.attributes ?? []) {
		if (
			attribute.type === "mdxJsxAttribute" &&
			attribute.name === name &&
			typeof attribute.value === "string"
		) {
			return attribute.value;
		}
	}
	return null;
}

function titleParagraph(node: MdNode): MdNode[] {
	const title = attributeString(node, "title");
	if (!title) {
		return [];
	}
	return [
		paragraph([{ children: [{ type: "text", value: title }], type: "strong" }]),
	];
}

async function transformJsx(
	node: MdNode,
	imports: Map<string, string>
): Promise<MdNode[]> {
	const name = node.name ?? "";
	const children = await transformNodes(node.children ?? [], imports);

	const alert = CALLOUT_ALERTS[name];
	if (alert) {
		return [
			{
				children: [raw(`[!${alert}]`), ...titleParagraph(node), ...children],
				type: "blockquote",
			},
		];
	}

	if (name === "Panel") {
		return [...titleParagraph(node), ...children];
	}

	const modulePath = imports.get(name);
	if (modulePath?.includes(DIAGRAM_PATH_MARKER)) {
		return await renderDiagram(name, modulePath);
	}

	if (children.length > 0) {
		return children;
	}

	return [
		paragraph([{ children: [raw(INTERACTIVE_PLACEHOLDER)], type: "emphasis" }]),
	];
}

async function transformNode(
	node: MdNode,
	imports: Map<string, string>
): Promise<MdNode[]> {
	if (
		node.type === "mdxjsEsm" ||
		node.type === "mdxFlowExpression" ||
		node.type === "mdxTextExpression"
	) {
		return [];
	}

	if (
		(node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
		CAPITALIZED_NAME_REGEX.test(node.name ?? "")
	) {
		return await transformJsx(node, imports);
	}

	if (node.type === "code") {
		node.meta = null;
		return [node];
	}

	if (node.children) {
		node.children = await transformNodes(node.children, imports);
	}
	return [node];
}

async function transformNodes(
	nodes: MdNode[],
	imports: Map<string, string>
): Promise<MdNode[]> {
	const output: MdNode[] = [];
	for (const node of nodes) {
		output.push(...(await transformNode(node, imports)));
	}
	return output;
}

/** Turn an `index.mdx` source into plain markdown: frontmatter verbatim, JSX
 *  lowered to markdown, diagrams inlined as SVG. `file` resolves relative
 *  imports and is only needed when the source imports diagram modules. */
export async function transformMdxToMarkdown(
	source: string,
	file: string
): Promise<string> {
	const match = FRONTMATTER_REGEX.exec(source);
	if (!match) {
		throw new Error(`Missing frontmatter block in ${file}.`);
	}

	const tree = processor.parse(
		source.slice(match[0].length)
	) as unknown as MdNode;
	const imports = collectImports(tree, file);
	tree.children = await transformNodes(tree.children ?? [], imports);

	const body = processor.stringify(tree as never);
	return `${match[0]}\n${body}`;
}

// -- Page templates ----------------------------------------------------------

interface Writeup {
	description: string;
	publishedAt: string;
	slug: string;
	title: string;
}

interface Experience {
	company: string;
	end: string | null;
	highlights: string[];
	role: string;
	slug: string;
	start: string;
	summary: string;
}

function entryDirectories(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();
}

function readWriteups(): Writeup[] {
	return entryDirectories(WRITEUPS_DIRECTORY)
		.map((slug) => {
			const file = join(WRITEUPS_DIRECTORY, slug, "index.mdx");
			const fields = parseFrontmatter(readFileSync(file, "utf8"));
			return {
				description: requireString(fields, "description", file),
				publishedAt: requireString(fields, "publishedAt", file),
				slug,
				title: requireString(fields, "title", file),
			};
		})
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

function readExperience(): Experience[] {
	return entryDirectories(EXPERIENCE_DIRECTORY)
		.map((slug) => {
			const file = join(EXPERIENCE_DIRECTORY, slug, "index.mdx");
			const fields = parseFrontmatter(readFileSync(file, "utf8"));
			const end = fields.end;
			return {
				company: requireString(fields, "company", file),
				end: typeof end === "string" ? end : null,
				highlights: requireList(fields, "highlights", file),
				role: requireString(fields, "role", file),
				slug,
				start: requireString(fields, "start", file),
				summary: requireString(fields, "summary", file),
			};
		})
		.sort((a, b) => b.start.localeCompare(a.start));
}

function experienceBody(experience: Experience[]): string {
	return experience
		.map((item) =>
			[
				`## ${item.company} — ${item.role}`,
				`${item.start} – ${item.end ?? "present"}`,
				item.summary,
				item.highlights.map((highlight) => `- ${highlight}`).join("\n"),
			]
				.filter(Boolean)
				.join("\n\n")
		)
		.join("\n\n");
}

function indexPage(): string {
	return [
		"# Arsen Shkrumelyak",
		SITE_DESCRIPTION,
		[
			`- [Writing](${SITE_URL}/writing)`,
			`- [Projects](${SITE_URL}/projects)`,
			`- [Experience](${SITE_URL}/experience)`,
			`- [CV](${SITE_URL}/cv.pdf)`,
		].join("\n"),
	].join("\n\n");
}

function writingPage(writeups: Writeup[]): string {
	const items = writeups.map(
		(writeup) =>
			`- [${writeup.title}](${SITE_URL}/writing/${writeup.slug}) — ${writeup.description} (${writeup.publishedAt})`
	);
	return `# Writing\n\n${items.join("\n")}`;
}

function projectsPage(): string {
	const items = PROJECTS.map((project) => {
		if (!project.href) {
			return `- ${project.title} — ${project.description}`;
		}
		const href = project.href.startsWith("/")
			? `${SITE_URL}${project.href}`
			: project.href;
		return `- [${project.title}](${href}) — ${project.description}`;
	});
	return `# Projects\n\n${items.join("\n")}`;
}

function llmsTxt(writeups: Writeup[]): string {
	const writing = writeups.map(
		(writeup) =>
			`- [${writeup.title}](${SITE_URL}/writing/${writeup.slug}.md): ${writeup.description}`
	);
	return [
		"# Arsen Shkrumelyak",
		`> ${SITE_DESCRIPTION}`,
		`## Writing\n${writing.join("\n")}`,
		[
			"## Pages",
			`- [Home](${SITE_URL}/index.md)`,
			`- [Writing index](${SITE_URL}/writing.md)`,
			`- [Projects](${SITE_URL}/projects.md)`,
			`- [Experience](${SITE_URL}/experience.md)`,
			`- [CV](${SITE_URL}/cv.md)`,
		].join("\n"),
	].join("\n\n");
}

// -- Entry point -------------------------------------------------------------

async function write(relativePath: string, contents: string): Promise<void> {
	const outPath = join(DIST_CLIENT, relativePath);
	mkdirSync(dirname(outPath), { recursive: true });
	await writeFile(
		outPath,
		contents.endsWith("\n") ? contents : `${contents}\n`
	);
	stdout.write(`generated ${relative(process.cwd(), outPath)}\n`);
}

async function writeEntries(
	directory: string,
	route: string,
	slugs: string[]
): Promise<void> {
	for (const slug of slugs) {
		const file = join(directory, slug, "index.mdx");
		const markdown = await transformMdxToMarkdown(
			readFileSync(file, "utf8"),
			file
		);
		await write(`${route}/${slug}.md`, markdown);
	}
}

async function main(): Promise<void> {
	if (!existsSync(DIST_CLIENT)) {
		throw new Error(
			"dist/client not found — run `astro build` before `bun run generate:markdown-assets`."
		);
	}

	const writeups = readWriteups();
	const experience = readExperience();
	const body = experienceBody(experience);

	await write("index.md", indexPage());
	await write("writing.md", writingPage(writeups));
	await write("projects.md", projectsPage());
	await write("experience.md", `# Experience\n\n${body}`);
	await write("cv.md", `# CV\n\nPDF: ${SITE_URL}/cv.pdf\n\n${body}`);
	await writeEntries(
		WRITEUPS_DIRECTORY,
		"writing",
		writeups.map((writeup) => writeup.slug)
	);
	await writeEntries(
		EXPERIENCE_DIRECTORY,
		"experience",
		experience.map((item) => item.slug)
	);
	await write("llms.txt", llmsTxt(writeups));
}

if (import.meta.main) {
	main().catch((error: unknown) => {
		const message = error instanceof Error ? error.message : "Unknown error";
		process.stderr.write(`${message}\n`);
		process.exitCode = 1;
	});
}
