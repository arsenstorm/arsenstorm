import type { Page } from "@cloudflare/puppeteer";
import {
	OG_READY_TIMEOUT_MS,
	OG_TEMPLATE_SELECTOR,
	type OgDimensions,
} from "./og-shared";

export function normalizeScreenshot(
	value: Awaited<ReturnType<Page["screenshot"]>>
): ArrayBuffer {
	if (value instanceof ArrayBuffer) {
		return value;
	}

	if (typeof value === "object" && value instanceof Uint8Array) {
		return new Uint8Array(value).buffer;
	}

	throw new Error("OG renderer returned an unsupported screenshot format.");
}

export async function extractOgTemplate(
	page: Page
): Promise<OgDimensions | null> {
	return await page.evaluate((selector) => {
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

export async function waitForOgReady(page: Page): Promise<void> {
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

export async function hasRenderedOgTemplate(page: Page): Promise<boolean> {
	return await page.evaluate(
		() =>
			document.body.firstElementChild?.hasAttribute("data-og-rendered") ?? false
	);
}
