import puppeteer, { type Browser } from "@cloudflare/puppeteer";
import {
	extractOgTemplate,
	hasRenderedOgTemplate,
	normalizeScreenshot,
	waitForOgReady,
} from "./og-browser";
import {
	OG_DEFAULT_HEIGHT,
	OG_DEFAULT_WIDTH,
	OG_FAILURE_COOLDOWN_MS,
	OG_PAGE_LOAD_TIMEOUT_MS,
	type OgRenderRequest,
	readOgRenderRequest,
} from "./og-shared";
import { type Env, MINUTE_MS, PNG_HEADERS } from "./types";

const OG_BROWSER_KEEP_ALIVE_MS = 10 * MINUTE_MS;

export class OGRenderer implements DurableObject {
	private browser: Browser | null = null;
	private readonly cooldowns = new Map<string, number>();
	private readonly env: Env;
	private readonly inFlight = new Map<string, Promise<ArrayBuffer>>();

	constructor(_privateState: DurableObjectState, env: Env) {
		this.env = env;
	}

	async fetch(request: Request): Promise<Response> {
		const renderRequest = readOgRenderRequest(request);
		if (!renderRequest) {
			return new Response("Invalid render request.", { status: 400 });
		}

		const cooldownUntil = this.cooldowns.get(renderRequest.cacheKey) ?? 0;
		if (Date.now() < cooldownUntil) {
			return new Response("Render is in cooldown.", { status: 429 });
		}

		const existing = this.inFlight.get(renderRequest.cacheKey);
		if (existing) {
			return new Response(await existing, { headers: PNG_HEADERS });
		}

		const render = this.generate(renderRequest).catch((error: unknown) => {
			this.cooldowns.set(
				renderRequest.cacheKey,
				Date.now() + OG_FAILURE_COOLDOWN_MS
			);
			throw error;
		});
		this.inFlight.set(renderRequest.cacheKey, render);

		try {
			return new Response(await render, { headers: PNG_HEADERS });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to render OG image.";
			return new Response(message, { status: 500 });
		} finally {
			this.inFlight.delete(renderRequest.cacheKey);
		}
	}

	private async getBrowser(): Promise<Browser> {
		if (this.browser) {
			try {
				await this.browser.version();
				return this.browser;
			} catch {
				this.browser = null;
			}
		}

		this.browser = await puppeteer.launch(this.env.BROWSER, {
			keep_alive: OG_BROWSER_KEEP_ALIVE_MS,
		});

		return this.browser;
	}

	private async generate(renderRequest: OgRenderRequest): Promise<ArrayBuffer> {
		if (renderRequest.format === "pdf") {
			return await this.generatePdf(renderRequest.url);
		}

		const browser = await this.getBrowser();
		const page = await browser.newPage();

		try {
			await page.setViewport({
				deviceScaleFactor: 1,
				height: OG_DEFAULT_HEIGHT,
				width: OG_DEFAULT_WIDTH,
			});
			await page.goto(renderRequest.url, {
				timeout: OG_PAGE_LOAD_TIMEOUT_MS,
				waitUntil: "domcontentloaded",
			});
			const dimensions = await extractOgTemplate(page);
			if (!dimensions) {
				throw new Error(`No OG template found on page: ${renderRequest.url}`);
			}

			await page.setViewport({
				deviceScaleFactor: 1,
				height: dimensions.height,
				width: dimensions.width,
			});
			await waitForOgReady(page);
			if (!(await hasRenderedOgTemplate(page))) {
				throw new Error(
					"OG template extraction did not replace the page body."
				);
			}

			return normalizeScreenshot(await page.screenshot({ type: "png" }));
		} finally {
			await page.close();
		}
	}

	private async generatePdf(targetUrl: string): Promise<ArrayBuffer> {
		const browser = await this.getBrowser();
		const page = await browser.newPage();

		try {
			// `domcontentloaded`, not `networkidle0`: the dev server's HMR socket
			// keeps the network busy forever, and the CV page is prerendered so the
			// full content is already in the initial HTML.
			await page.goto(targetUrl, {
				timeout: OG_PAGE_LOAD_TIMEOUT_MS,
				waitUntil: "domcontentloaded",
			});
			// Wait for web fonts (Inter) so the PDF doesn't fall back to a default face.
			await page.evaluateHandle("document.fonts.ready");
			const pdf = await page.pdf({
				format: "A4",
				// Respect the page's `@page { size: A4 }` and print background colours.
				preferCSSPageSize: true,
				printBackground: true,
			});

			return new Uint8Array(pdf).buffer as ArrayBuffer;
		} finally {
			await page.close();
		}
	}
}
