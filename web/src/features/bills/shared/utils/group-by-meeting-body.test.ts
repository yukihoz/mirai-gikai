import { describe, expect, it } from "vitest";
import {
  isCommitteeMeetingBody,
  sortMeetingBodyGroups,
} from "./group-by-meeting-body";

function group(meetingBody: string, ...dates: string[]) {
  return {
    meetingBody,
    bills: dates.map((submitted_date) => ({ submitted_date })),
  };
}

describe("isCommitteeMeetingBody", () => {
  it("委員会は委員会として扱う", () => {
    expect(isCommitteeMeetingBody("福祉保健委員会")).toBe(true);
    expect(isCommitteeMeetingBody("防災等安全対策特別委員会")).toBe(true);
  });

  it("AIインタビューは委員会ではない", () => {
    expect(isCommitteeMeetingBody("AIインタビュー")).toBe(false);
  });
});

describe("sortMeetingBodyGroups", () => {
  it("直近の開催が新しい会議体を上にする", () => {
    const sorted = sortMeetingBodyGroups([
      group("企画総務委員会", "2026-02-06"),
      group("防災等安全対策特別委員会", "2026-02-18"),
      group("福祉保健委員会", "2026-02-10"),
    ]);

    expect(sorted.map((g) => g.meetingBody)).toEqual([
      "防災等安全対策特別委員会",
      "福祉保健委員会",
      "企画総務委員会",
    ]);
  });

  it("委員会でないものは、日付が新しくても末尾へ回す", () => {
    // AIインタビューは委員会の並びに混ざると見出しと合わなくなる
    const sorted = sortMeetingBodyGroups([
      group("福祉保健委員会", "2026-02-10"),
      group("AIインタビュー", "2026-08-08"),
      group("企画総務委員会", "2026-02-06"),
    ]);

    expect(sorted.map((g) => g.meetingBody)).toEqual([
      "福祉保健委員会",
      "企画総務委員会",
      "AIインタビュー",
    ]);
  });

  it("日付が無い会議体は後ろに置く", () => {
    const sorted = sortMeetingBodyGroups([
      { meetingBody: "空の委員会", bills: [] },
      group("福祉保健委員会", "2026-02-10"),
    ]);

    expect(sorted[0]?.meetingBody).toBe("福祉保健委員会");
  });

  it("元の配列を書き換えない", () => {
    const original = [
      group("企画総務委員会", "2026-02-06"),
      group("防災等安全対策特別委員会", "2026-02-18"),
    ];
    sortMeetingBodyGroups(original);

    expect(original.map((g) => g.meetingBody)).toEqual([
      "企画総務委員会",
      "防災等安全対策特別委員会",
    ]);
  });
});
