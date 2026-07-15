import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { isAbsolute, join, relative } from "node:path";
import process, { stdout } from "node:process";
import { fileURLToPath } from "node:url";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { ogImagePath } from "../src/lib/seo";

const DIST_CLIENT = fileURLToPath(new URL("../dist/client/", import.meta.url));
const OG_OUTPUT_DIRECTORY = join(DIST_CLIENT, "og");
const OG_DEFAULT_WIDTH = 1200;
const OG_DEFAULT_HEIGHT = 630;
const OG_TEMPLATE_SELECTOR = "[data-og-template]";
const PAGE_LOAD_TIMEOUT_MS = 15_000;
const OG_READY_TIMEOUT_MS = 25_000;
const CV_PDF_OUTPUT = join(DIST_CLIENT, "cv.pdf");

const HTML_EXTENSION_REGEX = /\.html$/;
const LEADING_SLASH_REGEX = /^\//;

interface OgDimensions {
	height: number;
	width: number;
}

// Mirror the Worker's slashless asset semantics: exact file, `.html`, or
// `/index.html`, plus `/` → index.html. Reject path traversal.
function resolveAsset(pathname: string): string | null {
	const decoded = decodeURIComponent(pathname).replace(LEADING_SLASH_REGEX, "");
	const candidates =
		decoded === ""
			? ["index.html"]
			: [decoded, `${decoded}.html`, `${decoded}/index.html`];

	for (const candidate of candidates) {
		const resolved = join(DIST_CLIENT, candidate);
		const rel = relative(DIST_CLIENT, resolved);
		if (rel.startsWith("..") || isAbsolute(rel)) {
			continue;
		}
		if (existsSync(resolved) && statSync(resolved).isFile()) {
			return resolved;
		}
	}

	return null;
}

function fileToRoute(relativePath: string): string {
	const withoutExtension = relativePath.replace(HTML_EXTENSION_REGEX, "");
	if (withoutExtension === "index") {
		return "/";
	}

	const segments = withoutExtension.split("/");
	if (segments.at(-1) === "index") {
		segments.pop();
	}

	return `/${segments.join("/")}`;
}

function discoverRoutes(): string[] {
	const routes: string[] = [];

	const walk = (directory: string) => {
		for (const entry of readdirSync(directory, { withFileTypes: true })) {
			const full = join(directory, entry.name);
			const rel = relative(DIST_CLIENT, full);
			if (entry.isDirectory()) {
				if (rel !== "og") {
					walk(full);
				}
				continue;
			}
			if (!entry.name.endsWith(".html") || rel === "404.html") {
				continue;
			}
			routes.push(fileToRoute(rel));
		}
	};

	walk(DIST_CLIENT);
	return routes.sort();
}

// Ported verbatim from src/worker/og-browser.ts extractOgTemplate.
function extractOgTemplate(page: Page): Promise<OgDimensions | null> {
	return page.evaluate((selector) => {
		const ogWindow = window as typeof window & {
			__OG_READY__?: boolean;
			__OG_TEMPLATE_RESTORE__?: MutationObserver;
		};
		const template = document.querySelector<HTMLElement>(selector);
		if (!template) {
			return null;
		}

		const width = Number.parseInt(
			template.getAttribute("data-og-width") ?? "",
			10
		);
		const height = Number.parseInt(
			template.getAttribute("data-og-height") ?? "",
			10
		);
		const normalizedWidth = Number.isFinite(width) && width > 0 ? width : 1200;
		const normalizedHeight =
			Number.isFinite(height) && height > 0 ? height : 630;
		const readyMode = template.getAttribute("data-og-ready");
		const renderRoot = template.cloneNode(true);
		if (!(renderRoot instanceof HTMLElement)) {
			return null;
		}

		renderRoot.style.cssText = `position:static;width:${normalizedWidth}px;height:${normalizedHeight}px;overflow:hidden;pointer-events:none;`;
		renderRoot.removeAttribute("aria-hidden");
		renderRoot.removeAttribute("hidden");
		renderRoot.setAttribute("data-og-rendered", "");
		document.documentElement.style.cssText = `width:${normalizedWidth}px;height:${normalizedHeight}px;overflow:hidden;background:transparent;`;
		document.body.style.cssText = `margin:0;padding:0;width:${normalizedWidth}px;height:${normalizedHeight}px;overflow:hidden;background:transparent;`;
		ogWindow.__OG_TEMPLATE_RESTORE__?.disconnect();

		const mountRenderRoot = () => {
			if (
				document.body.childElementCount === 1 &&
				document.body.firstElementChild === renderRoot
			) {
				return;
			}

			document.body.replaceChildren(renderRoot);
		};

		mountRenderRoot();
		ogWindow.__OG_TEMPLATE_RESTORE__ = new MutationObserver(mountRenderRoot);
		ogWindow.__OG_TEMPLATE_RESTORE__.observe(document.body, {
			childList: true,
		});

		if (readyMode !== "manual") {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					ogWindow.__OG_READY__ = true;
				});
			});
		}

		return { height: normalizedHeight, width: normalizedWidth };
	}, OG_TEMPLATE_SELECTOR);
}

// Ported verbatim from src/worker/og-browser.ts waitForOgReady.
async function waitForOgReady(page: Page): Promise<void> {
	try {
		await page.waitForFunction("window.__OG_READY__ === true", {
			timeout: OG_READY_TIMEOUT_MS,
		});
	} catch {
		await page.evaluate(
			() =>
				new Promise<void>((resolve) => {
					let frame = 0;
					const wait = () => {
						frame += 1;
						if (frame >= 10) {
							resolve();
							return;
						}
						requestAnimationFrame(wait);
					};
					requestAnimationFrame(wait);
				})
		);
	}
}

// Ported verbatim from src/worker/og-browser.ts hasRenderedOgTemplate.
function hasRenderedOgTemplate(page: Page): Promise<boolean> {
	return page.evaluate(
		() =>
			document.body.firstElementChild?.hasAttribute("data-og-rendered") ?? false
	);
}

async function renderOgImage(
	page: Page,
	origin: string,
	route: string
): Promise<void> {
	await page.setViewport({
		deviceScaleFactor: 1,
		height: OG_DEFAULT_HEIGHT,
		width: OG_DEFAULT_WIDTH,
	});
	await page.goto(`${origin}${route}`, {
		timeout: PAGE_LOAD_TIMEOUT_MS,
		waitUntil: "domcontentloaded",
	});

	const dimensions = await extractOgTemplate(page);
	if (!dimensions) {
		stdout.write(`skipped ${route} (no OG template)\n`);
		return;
	}

	await page.setViewport({
		deviceScaleFactor: 1,
		height: dimensions.height,
		width: dimensions.width,
	});
	await waitForOgReady(page);
	if (!(await hasRenderedOgTemplate(page))) {
		throw new Error(
			`OG template extraction did not replace the page body for ${route}.`
		);
	}

	const screenshot = await page.screenshot({ type: "png" });
	const outPath = join(DIST_CLIENT, ogImagePath(route));
	await writeFile(outPath, screenshot);
	stdout.write(`generated ${relative(process.cwd(), outPath)}\n`);
}

async function renderCvPdf(page: Page, origin: string): Promise<void> {
	// `domcontentloaded`, not `networkidle0`: the CV page is prerendered so the
	// full content is already in the initial HTML.
	await page.goto(`${origin}/cv`, {
		timeout: PAGE_LOAD_TIMEOUT_MS,
		waitUntil: "domcontentloaded",
	});
	// Wait for web fonts (Inter) so the PDF doesn't fall back to a default face.
	await page.evaluateHandle("document.fonts.ready");
	const pdf = await page.pdf({
		format: "A4",
		preferCSSPageSize: true,
		printBackground: true,
	});
	await writeFile(CV_PDF_OUTPUT, pdf);
	stdout.write(`generated ${relative(process.cwd(), CV_PDF_OUTPUT)}\n`);
}

async function main(): Promise<void> {
	if (!existsSync(DIST_CLIENT)) {
		throw new Error(
			"dist/client not found — run `bun run build` before `bun run generate:og`."
		);
	}

	const server = Bun.serve({
		fetch(request) {
			const { pathname } = new URL(request.url);
			const resolved = resolveAsset(pathname);
			if (!resolved) {
				return new Response("Not found", { status: 404 });
			}
			return new Response(Bun.file(resolved));
		},
		port: 0,
	});
	const origin = `http://localhost:${server.port}`;

	let browser: Browser | null = null;
	try {
		// GitHub's Ubuntu runners restrict unprivileged user namespaces, which
		// breaks Chrome's sandbox. Safe to disable: we only render our own
		// freshly built, locally served output.
		browser = await puppeteer.launch({ args: ["--no-sandbox"] });
		mkdirSync(OG_OUTPUT_DIRECTORY, { recursive: true });

		const ogPage = await browser.newPage();
		for (const route of discoverRoutes()) {
			await renderOgImage(ogPage, origin, route);
		}
		await ogPage.close();

		const pdfPage = await browser.newPage();
		await renderCvPdf(pdfPage, origin);
		await pdfPage.close();
	} finally {
		await browser?.close();
		await server.stop();
	}
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : "Unknown error";
	process.stderr.write(`${message}\n`);
	process.exitCode = 1;
});
