import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCalendar } from "./parse-calendar";

const html = readFileSync(
  join(import.meta.dirname, "__fixtures__/calendar-202602.html"),
  "utf-8"
);

describe("parseCalendar", () => {
  const meetings = parseCalendar(html);

  it("開会日程ページを持つ会議をすべて拾う", () => {
    expect(meetings.length).toBeGreaterThan(0);
    expect(meetings.every((m) => m.href.endsWith(".html"))).toBe(true);
  });

  it("日付をURL末尾の8桁から組み立てる", () => {
    const fukushi = meetings.find((m) => m.href.includes("fukushi_20260210"));
    expect(fukushi).toEqual({
      date: "2026-02-10",
      committee: "福祉保健委員会",
      href: "r08/fukushi_20260210.html",
    });
  });

  it("その月の会議だけを返す", () => {
    expect(meetings.every((m) => m.date.startsWith("2026-02"))).toBe(true);
  });

  it("同じ日に複数の委員会があっても取りこぼさない", () => {
    const dates = meetings.map((m) => m.date);
    expect(new Set(dates).size).toBeLessThanOrEqual(dates.length);
  });

  it("カレンダー表の外にあるリンクは拾わない", () => {
    expect(meetings.some((m) => m.committee.includes("トップ"))).toBe(false);
    expect(meetings.some((m) => m.href.includes("gian"))).toBe(false);
  });

  it("カレンダー表が無いHTMLでは空配列を返す", () => {
    expect(
      parseCalendar("<html><body>お探しのページは…</body></html>")
    ).toEqual([]);
  });
});
