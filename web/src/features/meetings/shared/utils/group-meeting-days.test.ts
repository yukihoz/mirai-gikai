import { describe, expect, it } from "vitest";
import { groupByMonth, toMeetingDays } from "./group-meeting-days";

describe("toMeetingDays", () => {
  it("同じ日の資料をまとめて数える", () => {
    const days = toMeetingDays([
      { date: "2026-02-06", committee: "企画総務委員会" },
      { date: "2026-02-06", committee: "企画総務委員会" },
      { date: "2026-02-09", committee: "区民文教委員会" },
    ]);

    expect(days).toEqual([
      {
        date: "2026-02-09",
        committees: ["区民文教委員会"],
        billCount: 1,
      },
      {
        date: "2026-02-06",
        committees: ["企画総務委員会"],
        billCount: 2,
      },
    ]);
  });

  it("同じ日に複数の委員会が開かれても取りこぼさない", () => {
    const days = toMeetingDays([
      { date: "2026-02-06", committee: "企画総務委員会" },
      { date: "2026-02-06", committee: "福祉保健委員会" },
      { date: "2026-02-06", committee: "企画総務委員会" },
    ]);

    expect(days).toHaveLength(1);
    expect(days[0].committees).toEqual(["企画総務委員会", "福祉保健委員会"]);
    expect(days[0].billCount).toBe(3);
  });

  it("入力の順番によらず新しい日から並べる", () => {
    const days = toMeetingDays([
      { date: "2026-02-06", committee: "企画総務委員会" },
      { date: "2026-03-02", committee: "環境建設委員会" },
      { date: "2025-12-01", committee: "福祉保健委員会" },
    ]);

    expect(days.map((day) => day.date)).toEqual([
      "2026-03-02",
      "2026-02-06",
      "2025-12-01",
    ]);
  });

  it("資料が無ければ空", () => {
    expect(toMeetingDays([])).toEqual([]);
  });
});

describe("groupByMonth", () => {
  it("月ごとに束ねる", () => {
    const months = groupByMonth(
      toMeetingDays([
        { date: "2026-02-06", committee: "企画総務委員会" },
        { date: "2026-02-09", committee: "区民文教委員会" },
        { date: "2026-01-20", committee: "環境建設委員会" },
      ])
    );

    expect(months.map((month) => month.monthKey)).toEqual([
      "2026-02",
      "2026-01",
    ]);
    expect(months[0].days.map((day) => day.date)).toEqual([
      "2026-02-09",
      "2026-02-06",
    ]);
  });

  it("会議の無い月は見出しを作らない", () => {
    const months = groupByMonth(
      toMeetingDays([
        { date: "2026-04-10", committee: "企画総務委員会" },
        { date: "2026-01-20", committee: "環境建設委員会" },
      ])
    );

    expect(months.map((month) => month.monthKey)).toEqual([
      "2026-04",
      "2026-01",
    ]);
  });

  it("同じ月がとびとびに現れても見出しは1つにまとめる", () => {
    const months = groupByMonth([
      { date: "2026-02-09", committees: ["区民文教委員会"], billCount: 1 },
      { date: "2026-01-20", committees: ["環境建設委員会"], billCount: 1 },
      { date: "2026-02-06", committees: ["企画総務委員会"], billCount: 1 },
    ]);

    expect(months.map((month) => month.monthKey)).toEqual([
      "2026-02",
      "2026-01",
    ]);
    expect(months[0].days.map((day) => day.date)).toEqual([
      "2026-02-09",
      "2026-02-06",
    ]);
  });

  it("会議が無ければ空", () => {
    expect(groupByMonth([])).toEqual([]);
  });
});
