import { describe, expect, it } from "vitest";
import type { MeetingDaySummary } from "../types";
import { findAdjacentMeetingDays, findMeetingDay } from "./find-meeting-day";

function day(date: string): MeetingDaySummary {
  return { date, committees: ["企画総務委員会"], billCount: 1 };
}

// 新しい順に並んでいる前提の配列
const days = [day("2026-02-18"), day("2026-02-16"), day("2026-02-06")];

describe("findMeetingDay", () => {
  it("その日の会議を返す", () => {
    expect(findMeetingDay(days, "2026-02-16")?.date).toBe("2026-02-16");
  });

  it("会議の無い日は null", () => {
    expect(findMeetingDay(days, "2026-02-17")).toBeNull();
    expect(findMeetingDay([], "2026-02-16")).toBeNull();
  });
});

describe("findAdjacentMeetingDays", () => {
  it("ひとつ手前が次の会議、ひとつ後ろが前の会議", () => {
    const adjacent = findAdjacentMeetingDays(days, "2026-02-16");

    expect(adjacent.newer?.date).toBe("2026-02-18");
    expect(adjacent.older?.date).toBe("2026-02-06");
  });

  it("いちばん新しい会議には次が無い", () => {
    const adjacent = findAdjacentMeetingDays(days, "2026-02-18");

    expect(adjacent.newer).toBeNull();
    expect(adjacent.older?.date).toBe("2026-02-16");
  });

  it("いちばん古い会議には前が無い", () => {
    const adjacent = findAdjacentMeetingDays(days, "2026-02-06");

    expect(adjacent.newer?.date).toBe("2026-02-16");
    expect(adjacent.older).toBeNull();
  });

  it("会議が1件だけなら前も次も無い", () => {
    const adjacent = findAdjacentMeetingDays([day("2026-02-06")], "2026-02-06");

    expect(adjacent).toEqual({ newer: null, older: null });
  });

  it("見つからない日は前も次も無い", () => {
    expect(findAdjacentMeetingDays(days, "2026-02-17")).toEqual({
      newer: null,
      older: null,
    });
  });
});
