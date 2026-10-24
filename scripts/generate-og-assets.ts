import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { copyFile, readFile, rename, rm, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative } from "node:path";
import process, { stdout } from "node:process";
import { fileURLToPath } from "node:url";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { ogImagePath, ogVideoPath } from "../src/lib/seo";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const OG_OUTPUT_DIRECTORY = join(DIST, "og");
// Kept between CI runs by actions/cache, so unchanged templates skip recording.
const OG_VIDEO_CACHE_DIRECTORY = fileURLToPath(
  new URL("../.cache/og-videos/", import.meta.url)
);
const OG_VIDEO_FPS = 60;
const OG_VIDEO_LOOP_MS = 5000;
const OG_VIDEO_FRAMES = (OG_VIDEO_FPS * OG_VIDEO_LOOP_MS) / 1000;
// Frame 0 is the poster PNG; the loop ends one frame before it repeats.
const FFMPEG_ARGS = [
  "-hide_banner",
  "-loglevel",
  "error",
  "-y",
  "-f",
  "image2pipe",
  "-framerate",
  String(OG_VIDEO_FPS),
  "-c:v",
  "png",
  "-i",
  "-",
  "-c:v",
  "libx264",
  "-preset",
  "veryslow",
  "-tune",
  "animation",
  "-crf",
  "28",
  "-g",
  String(OG_VIDEO_FRAMES),
  "-pix_fmt",
  "yuv420p",
  "-an",
  "-map_metadata",
  "-1",
  "-movflags",
  "+faststart",
];
const OG_DEFAULT_WIDTH = 1200;
const OG_DEFAULT_HEIGHT = 630;
const OG_TEMPLATE_SELECTOR = "[data-og-template]";
const PAGE_LOAD_TIMEOUT_MS = 15_000;
const OG_READY_TIMEOUT_MS = 25_000;

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
    const resolved = join(DIST, candidate);
    const rel = relative(DIST, resolved);
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
      const rel = relative(DIST, full);
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

  walk(DIST);
  return routes.sort();
}

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

function hasRenderedOgTemplate(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.body.firstElementChild?.hasAttribute("data-og-rendered") ?? false
  );
}

// Pauses every animation so frames are seeked, not raced. Returns the names of
// animations that would not join up seamlessly at the end of the loop.
function pauseAnimations(page: Page): Promise<string[]> {
  return page.evaluate((loopMs) => {
    const broken: string[] = [];
    for (const animation of document.getAnimations()) {
      animation.pause();
      const timing = animation.effect?.getComputedTiming();
      const duration = Number(timing?.duration ?? 0);
      const period = timing?.direction?.includes("alternate")
        ? duration * 2
        : duration;
      const loops =
        timing?.iterations === Number.POSITIVE_INFINITY &&
        period > 0 &&
        loopMs % period === 0 &&
        // A negative delay only shifts the phase; a positive one leaves
        // the start of the loop frozen.
        (timing.delay ?? 0) <= 0;
      if (!loops) {
        broken.push(
          animation instanceof CSSAnimation
            ? animation.animationName
            : animation.id || "unnamed"
        );
      }
    }
    return broken;
  }, OG_VIDEO_LOOP_MS);
}

function seekAnimations(page: Page, timeMs: number): Promise<void> {
  return page.evaluate((time) => {
    for (const animation of document.getAnimations()) {
      animation.currentTime = time;
    }
  }, timeMs);
}

// Everything the frames are drawn from: the template, the styles and keyframes
// it uses, its fonts and images, and this script (which owns the timing and
// encoder settings). Not the whole stylesheet: Tailwind builds one for the
// site, so a new class on any page would re-record every video.
async function ogVideoHash(page: Page): Promise<string> {
  const { css, html, images } = await page.evaluate(() => {
    const pseudoElements = [null, "::before", "::after"];
    const styles = [...document.body.querySelectorAll("*")].flatMap((element) =>
      pseudoElements.map((pseudo) => {
        const style = getComputedStyle(element, pseudo);
        // Custom properties come back in a different order on every run,
        // and their values already show in the properties that use them.
        return [...style]
          .filter((name) => !name.startsWith("--"))
          .map((name) => `${name}:${style.getPropertyValue(name)}`)
          .join(";");
      })
    );
    const animationNames = new Set(
      document
        .getAnimations()
        .map((animation) =>
          animation instanceof CSSAnimation ? animation.animationName : ""
        )
    );
    const keyframes: string[] = [];
    const collectKeyframes = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSKeyframesRule) {
          if (animationNames.has(rule.name)) {
            keyframes.push(rule.cssText);
          }
        } else if (rule instanceof CSSGroupingRule) {
          collectKeyframes(rule.cssRules);
        }
      }
    };
    for (const sheet of document.styleSheets) {
      collectKeyframes(sheet.cssRules);
    }
    const fonts = [...document.fonts]
      .filter((font) => font.status === "loaded")
      .map((font) => `${font.family} ${font.weight} ${font.style}`);
    return {
      css: [...styles, ...keyframes, ...fonts].join("\n"),
      html: document.body.innerHTML,
      images: [...document.images].map(
        (image) => new URL(image.currentSrc || image.src).pathname
      ),
    };
  });
  const hash = createHash("sha256")
    .update(await readFile(fileURLToPath(import.meta.url)))
    .update(html)
    .update(css);
  const files = images
    .map((image) => resolveAsset(image))
    .filter((file) => file !== null);
  // Read in parallel, hash in order: Promise.all keeps the order.
  for (const contents of await Promise.all(
    files.map((file) => readFile(file))
  )) {
    hash.update(contents);
  }
  return hash.digest("hex");
}

async function recordOgVideo(page: Page, outPath: string): Promise<void> {
  const partialPath = `${outPath}.partial.mp4`;
  const ffmpeg = Bun.spawn(["ffmpeg", ...FFMPEG_ARGS, partialPath], {
    stderr: "pipe",
    stdin: "pipe",
  });
  for (let frame = 0; frame < OG_VIDEO_FRAMES; frame += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: each frame seeks the one page, then screenshots it
    await seekAnimations(page, (frame * 1000) / OG_VIDEO_FPS);
    ffmpeg.stdin.write(
      await page.screenshot({ optimizeForSpeed: true, type: "png" })
    );
  }
  await ffmpeg.stdin.end();
  if ((await ffmpeg.exited) !== 0) {
    const error = await new Response(ffmpeg.stderr).text();
    throw new Error(`ffmpeg failed for ${outPath}: ${error}`);
  }
  await rename(partialPath, outPath);
}

async function writeOgVideo(
  page: Page,
  route: string,
  usedCacheFiles: Set<string>
): Promise<void> {
  const cacheFile = `${await ogVideoHash(page)}.mp4`;
  const cachePath = join(OG_VIDEO_CACHE_DIRECTORY, cacheFile);
  const cached = existsSync(cachePath);
  if (!cached) {
    await recordOgVideo(page, cachePath);
  }
  usedCacheFiles.add(cacheFile);

  const outPath = join(DIST, ogVideoPath(route));
  await copyFile(cachePath, outPath);
  stdout.write(
    `${cached ? "reused" : "recorded"} ${relative(process.cwd(), outPath)}\n`
  );
}

async function pruneOgVideoCache(usedCacheFiles: Set<string>): Promise<void> {
  await Promise.all(
    readdirSync(OG_VIDEO_CACHE_DIRECTORY)
      .filter((file) => !usedCacheFiles.has(file))
      .map((file) => rm(join(OG_VIDEO_CACHE_DIRECTORY, file)))
  );
}

async function renderOgAssets(
  page: Page,
  origin: string,
  route: string,
  usedCacheFiles: Set<string>
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

  const brokenLoops = await pauseAnimations(page);
  if (brokenLoops.length > 0) {
    throw new Error(
      `OG animations on ${route} do not loop every ${OG_VIDEO_LOOP_MS}ms: ${brokenLoops.join(", ")}`
    );
  }
  await seekAnimations(page, 0);

  const screenshot = await page.screenshot({ type: "png" });
  const outPath = join(DIST, ogImagePath(route));
  await writeFile(outPath, screenshot);
  stdout.write(`generated ${relative(process.cwd(), outPath)}\n`);

  await writeOgVideo(page, route, usedCacheFiles);
}

async function main(): Promise<void> {
  if (!existsSync(DIST)) {
    throw new Error(
      "dist not found — run `bun run build` before `bun run generate:og`."
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
    mkdirSync(OG_VIDEO_CACHE_DIRECTORY, { recursive: true });

    const usedCacheFiles = new Set<string>();
    const ogPage = await browser.newPage();
    for (const route of discoverRoutes()) {
      // biome-ignore lint/performance/noAwaitInLoops: routes share one page, so they render one at a time
      await renderOgAssets(ogPage, origin, route, usedCacheFiles);
    }
    await ogPage.close();
    await pruneOgVideoCache(usedCacheFiles);
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
