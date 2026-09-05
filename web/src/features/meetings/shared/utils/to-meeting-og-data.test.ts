import { describe, expect, it } from "vitest";
import type { BillWithContent } from "@/features/bills/shared/types";
import type { MeetingCommittee, MeetingDay } from "../types";
import { OG_TITLE_MAX_LENGTH, toMeetingOgData } from "./to-meeting-og-data";

function bill(title: string | null, name = "議案名"): BillWithContent {
  return {
    id: title ?? name,
    name,
    bill_content: title === null ? undefined : { title },
  } as unknown as BillWithContent;
}

function day(committees: MeetingCommittee[]): MeetingDay {
  return {
    date: "2026-02-06",
    committees,
    billCount: committees.reduce((sum, c) => sum + c.bills.length, 0),
  };
}

function committee(name: string, bills: BillWithContent[]): MeetingCommittee {
  return {
    committee: name,
    meetingUrl: "https://example.test/meeting",
    minutesUrl: null,
    bills,
  };
}

describe("toMeetingOgData", () => {
  it("先頭4件の見出しと、残りの件数を返す", () => {
    const data = toMeetingOgData(
      day([
        committee("企画総務委員会", [
          bill("資料1"),
          bill("資料2"),
          bill("資料3"),
          bill("資料4"),
          bill("資料5"),
        ]),
      ])
    );

    expect(data.titles).toEqual(["資料1", "資料2", "資料3", "資料4"]);
    expect(data.restCount).toBe(1);
    expect(data.billCount).toBe(5);
    expect(data.committees).toBe("企画総務委員会");
    expect(data.date).toBe("2026-02-06");
  });

  it("4件以下なら残りは0件", () => {
    const data = toMeetingOgData(
      day([committee("環境建設委員会", [bill("資料1"), bill("資料2")])])
    );

    expect(data.titles).toEqual(["資料1", "資料2"]);
    expect(data.restCount).toBe(0);
  });

  it("長い見出しは切って三点リーダを付ける", () => {
    const long = "あ".repeat(OG_TITLE_MAX_LENGTH + 5);
    const data = toMeetingOgData(
      day([committee("福祉保健委員会", [bill(long)])])
    );

    expect(data.titles[0]).toBe(`${"あ".repeat(OG_TITLE_MAX_LENGTH)}…`);
  });

  it("ちょうどの長さは切らない", () => {
    const exact = "あ".repeat(OG_TITLE_MAX_LENGTH);
    const data = toMeetingOgData(
      day([committee("福祉保健委員会", [bill(exact)])])
    );

    expect(data.titles[0]).toBe(exact);
  });

  it("わかりやすいタイトルが無ければ正式名称を使う", () => {
    const data = toMeetingOgData(
      day([committee("区民文教委員会", [bill(null, "第1号議案")])])
    );

    expect(data.titles).toEqual(["第1号議案"]);
  });

  it("複数の委員会の資料を、委員会の順に並べる", () => {
    const data = toMeetingOgData(
      day([
        committee("企画総務委員会", [bill("資料A")]),
        committee("福祉保健委員会", [bill("資料B")]),
      ])
    );

    expect(data.titles).toEqual(["資料A", "資料B"]);
    expect(data.committees).toBe("企画総務委員会・福祉保健委員会");
  });
});
