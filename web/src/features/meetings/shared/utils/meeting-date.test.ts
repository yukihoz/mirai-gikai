import { describe, expect, it } from "vitest";
import {
  formatMeetingDate,
  formatMonthKey,
  formatWeekday,
  parseMeetingDateParam,
  toDayOfMonth,
  toMonthKey,
} from "./meeting-date";

describe("parseMeetingDateParam", () => {
  it("YYYY-MM-DD をそのまま返す", () => {
    expect(parseMeetingDateParam("2026-02-06")).toBe("2026-02-06");
  });

  it("形が違えば null", () => {
    expect(parseMeetingDateParam("2026-2-6")).toBeNull();
    expect(parseMeetingDateParam("20260206")).toBeNull();
    expect(parseMeetingDateParam("2026-02-06/../..")).toBeNull();
    expect(parseMeetingDateParam("")).toBeNull();
  });

  it("実在しない日は null。Date の繰り上がりを素通ししない", () => {
    // new Date("2026-02-30") は3月2日になる
    expect(parseMeetingDateParam("2026-02-30")).toBeNull();
    expect(parseMeetingDateParam("2026-13-01")).toBeNull();
    expect(parseMeetingDateParam("2026-00-10")).toBeNull();
  });

  it("うるう年の2月29日は受ける", () => {
    expect(parseMeetingDateParam("2028-02-29")).toBe("2028-02-29");
    expect(parseMeetingDateParam("2026-02-29")).toBeNull();
  });
});

describe("formatMeetingDate", () => {
  it("曜日を添える", () => {
    expect(formatMeetingDate("2026-02-06")).toBe("2026年2月6日（金）");
  });

  it("日付として読めなければ空文字", () => {
    expect(formatMeetingDate("あした")).toBe("");
  });
});

describe("toDayOfMonth", () => {
  it("ゼロ埋めを外した日を返す", () => {
    expect(toDayOfMonth("2026-02-06")).toBe(6);
    expect(toDayOfMonth("2026-02-18")).toBe(18);
  });
});

describe("formatWeekday", () => {
  it("曜日を1文字で返す", () => {
    expect(formatWeekday("2026-02-06")).toBe("金");
    expect(formatWeekday("2026-02-09")).toBe("月");
  });

  it("日付として読めなければ空文字", () => {
    expect(formatWeekday("あした")).toBe("");
  });
});

describe("toMonthKey", () => {
  it("年月だけを取り出す", () => {
    expect(toMonthKey("2026-02-06")).toBe("2026-02");
  });
});

describe("formatMonthKey", () => {
  it("ゼロ埋めを外して読める形にする", () => {
    expect(formatMonthKey("2026-02")).toBe("2026年2月");
    expect(formatMonthKey("2026-11")).toBe("2026年11月");
  });

  it("想定外の形はそのまま返す", () => {
    expect(formatMonthKey("2026")).toBe("2026");
  });
});
