import { describe, expect, it } from "vitest";
import { handleOgVideo, isOgVideoPath } from "./og-video";
import type { Env } from "./types";

describe("isOgVideoPath", () => {
  it.each(["/og/index.mp4", "/og/writing-foo.mp4"])("matches %s", (path) => {
    expect(isOgVideoPath(path)).toBe(true);
  });

  it.each(["/og/index.png", "/og", "/og/nested/index.mp4", "/index.mp4"])(
    "ignores %s",
    (path) => {
      expect(isOgVideoPath(path)).toBe(false);
    }
  );
});

describe("handleOgVideo", () => {
  const video = "0123456789";
  const env = {
    ASSETS: {
      fetch: (input: URL | Request | string) =>
        Promise.resolve(
          String(input).endsWith("/og/index.mp4")
            ? new Response(video, { headers: { "content-type": "video/mp4" } })
            : new Response(null, { status: 404 })
        ),
    },
  } as unknown as Env;
  const get = (path: string, range?: string) =>
    handleOgVideo(
      new Request(`https://example.com${path}`, {
        headers: range ? { range } : {},
      }),
      env
    );

  it("serves the whole video without a range", async () => {
    const response = await get("/og/index.mp4");
    expect(response.status).toBe(200);
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(await response.text()).toBe(video);
  });

  it.each([
    ["bytes=0-1", "01", "bytes 0-1/10"],
    ["bytes=7-", "789", "bytes 7-9/10"],
    ["bytes=-3", "789", "bytes 7-9/10"],
    ["bytes=8-99", "89", "bytes 8-9/10"],
  ])("answers %s with 206", async (range, body, contentRange) => {
    const response = await get("/og/index.mp4", range);
    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe(contentRange);
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(await response.text()).toBe(body);
  });

  it.each(["bytes=10-", "bytes=5-2", "bytes=-"])(
    "rejects %s with 416",
    async (range) => {
      const response = await get("/og/index.mp4", range);
      expect(response.status).toBe(416);
      expect(response.headers.get("content-range")).toBe("bytes */10");
    }
  );

  it("passes a missing video through", async () => {
    expect((await get("/og/missing.mp4", "bytes=0-1")).status).toBe(404);
  });
});
