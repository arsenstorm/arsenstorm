import type { Env } from "./types";

const OG_VIDEO_PATH_REGEX = /^\/og\/[^/]+\.mp4$/;
const BYTE_RANGE_REGEX = /^bytes=(\d*)-(\d*)$/;

export function isOgVideoPath(pathname: string): boolean {
  return OG_VIDEO_PATH_REGEX.test(pathname);
}

// Static assets ignore Range and always answer 200, but Safari (and so
// iMessage link previews) will not play a video unless it gets a 206. The
// videos are tens of kilobytes, so reading one whole to slice it is fine.
export async function handleOgVideo(
  request: Request,
  env: Env
): Promise<Response> {
  const asset = await env.ASSETS.fetch(request.url);
  const headers = new Headers(asset.headers);
  headers.set("accept-ranges", "bytes");
  const range = request.headers.get("range")?.match(BYTE_RANGE_REGEX);
  if (!(asset.ok && range)) {
    return new Response(asset.body, { headers, status: asset.status });
  }

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const [, first = "", last = ""] = range;
  const isSuffix = first === "";
  const start = isSuffix ? Math.max(size - Number(last), 0) : Number(first);
  const end =
    isSuffix || last === "" ? size - 1 : Math.min(Number(last), size - 1);
  headers.delete("content-length");
  if ((isSuffix && last === "") || start > end) {
    headers.set("content-range", `bytes */${size}`);
    return new Response(null, { headers, status: 416 });
  }

  headers.set("content-range", `bytes ${start}-${end}/${size}`);
  return new Response(body.slice(start, end + 1), { headers, status: 206 });
}
