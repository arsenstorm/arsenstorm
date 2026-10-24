import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ItemGroup } from "./item-group";

const TIME_REGEX = /<time datetime="([^"]+)">([^<]+)<\/time>/gi;

const headings = (items: { publishedAt: string; title: string }[]) =>
  [
    ...renderToStaticMarkup(
      <ItemGroup
        groupBy="month"
        items={items.map((item) => ({ ...item, description: "" }))}
      />
    ).matchAll(TIME_REGEX),
  ].map(([, dateTime, label]) => `${dateTime} ${label}`);

describe("ItemGroup month headings", () => {
  it("keeps the same month in different years apart", () => {
    expect(
      headings([
        { publishedAt: "2027-10-02", title: "New" },
        { publishedAt: "2027-09-14", title: "Middle" },
        { publishedAt: "2026-10-20", title: "Old" },
      ])
    ).toEqual(["2027-10 October", "2027-09 September", "2026-10 October 2026"]);
  });
});
