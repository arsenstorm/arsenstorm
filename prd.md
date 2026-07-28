# PRD — Markdown responses for agents

## Problem

AI agents that fetch arsenstorm.com receive the full HTML page: navigation, layout markup, scripts, and styles wrapped around the content. The content itself is authored in MDX — essentially markdown — but no requester can get it in that form. Agents burn tokens parsing markup that carries no meaning for them, and the extraction they do is lossy compared to the source the pages were written from.

Cloudflare defined a convention for this in February 2026 ("Markdown for Agents"): content negotiation via `Accept: text/markdown`, answered with converted markdown and `Vary: Accept`. Agents are beginning to send that header. The zone-level feature is Pro-plan-only and converts rendered HTML heuristically; this site can answer the same convention from the origin, from source, on any plan.

How often agents hit the site today is unknown. Measuring that is part of this work (see Success criteria) and may feed a published analytics experiment.

## Goals

- An agent that asks for markdown gets the document the author actually wrote, not a scrape of the rendered page.
- The site follows the existing public convention (`Accept: text/markdown`) so agents need no site-specific knowledge to benefit.
- Markdown consumption is observable, so whether agents actually use this is a measurable fact rather than a guess.

## Non-goals

- **No User-Agent sniffing** — serving markdown to requests that didn't ask for it guesses intent instead of honoring it, and misclassification breaks real browsers.
- **No Cloudflare zone feature** — it requires a Pro plan and performs heuristic HTML→markdown conversion; the origin implementation supersedes it.
- **No separate agent-facing content** — markdown responses are derived from the same source as the HTML pages, never written or maintained independently.
- **No change to the HTML site** — human-facing pages render exactly as they do today.

## Requirements

1. A request to any content page with `Accept: text/markdown` in the Accept header returns `200` with `Content-Type: text/markdown; charset=utf-8`.
2. Every markdown response includes `Vary: Accept`, so shared caches (including Cloudflare's) never serve markdown to a browser or HTML to an agent.
3. For writeups (`/writing/*`), the markdown body is derived from the MDX source, not from rendered HTML.
4. Each writeup's markdown begins with YAML frontmatter containing at minimum `title` and `description` (mirroring the Cloudflare response shape).
5. Callouts render as GitHub-style alerts: `Tip` → `> [!TIP]`, `Note` → `> [!NOTE]`, `Caution` → `> [!CAUTION]`, with their inner markdown preserved inside the blockquote. `Panel` renders as its plain content. No JSX or import statements appear in any markdown response.
6. Each diagram appears in the markdown as an inline `<svg>` element, with its `title` and `label` text present as text (not only inside the SVG), so agents that skip SVG markup still get the diagram's meaning.
7. Pages without a markdown source (home, work, writing index) return generated markdown carrying the page's meaningful content — for index pages, at minimum a linked list of what they index.
8. Appending `.md` to a content page's path (e.g. `/writing/webhook-gateway-on-rails.md`) returns the identical markdown response with no Accept header required.
9. `/llms.txt` returns a plain-text index linking to the site's pages, per the llms.txt convention.
10. A request without `text/markdown` in its Accept header returns the HTML page, byte-identical in behavior to today.
11. Every markdown response served in production is counted, and the count is queryable by path and day.
12. New writeups get all of the above with no per-writeup work — publishing an MDX file is sufficient.
13. `robots.txt` contains the line `Content-Signal: search=yes, ai-input=yes, ai-train=no`, per the [Content Signals Policy](https://contentsignals.org/).

## Success criteria

**Verifiable now (these commands are the definition of done):**

- `curl -s -o /dev/null -w "%{http_code} %{content_type}" -H "Accept: text/markdown" https://arsenstorm.com/writing/webhook-gateway-on-rails` → `200 text/markdown; charset=utf-8` (Req 1). The same request against `/`, `/work`, and `/writing` also returns markdown (Req 7).
- `curl -s -H "Accept: text/markdown" https://arsenstorm.com/writing/webhook-gateway-on-rails | head -5` → output starts with `---` frontmatter containing `title:` (Req 4). Over the full body: `grep -c "^import \|<Tip\|<Panel"` returns `0` (Req 5), `grep -c "> \[!"` is non-zero (Req 5), and `grep -c "<svg"` is non-zero (Req 6).
- `curl -sI -H "Accept: text/markdown" https://arsenstorm.com/` → `Vary` header contains `Accept` (Req 2).
- `curl -s https://arsenstorm.com/writing/webhook-gateway-on-rails.md` → same body as the header-negotiated response (Req 8); `curl -s https://arsenstorm.com/llms.txt` → non-empty, contains `/writing/` links (Req 9).
- `curl -s https://arsenstorm.com/writing/webhook-gateway-on-rails | head -1` → HTML doctype, unchanged (Req 10).
- `curl -s https://arsenstorm.com/robots.txt | grep "Content-Signal"` → `Content-Signal: search=yes, ai-input=yes, ai-train=no` (Req 13).

**Observed after launch (cannot be verified by running something today):**

- **True metric:** agents adopt the markdown responses — sustained non-zero markdown requests from real agent traffic. No target number is set; the count itself is the input to a possible published analytics experiment.
- **Proxy that ships with the feature:** the per-path, per-day counter (Req 11) exists and is queryable from day one.
- **Who checks:** Arsen reviews the counts when deciding whether to publish the analytics experiment; the counter query is the check.
