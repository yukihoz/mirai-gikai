import { describe, expect, it } from "vitest";
import type { BillWithContent } from "@/features/bills/shared/types";
import {
  type MeetingCommitteeEntry,
  toMeetingCommittees,
} from "./to-meeting-committees";

function entry(
  overrides: Partial<MeetingCommitteeEntry> & { id: string }
): MeetingCommitteeEntry {
  const { id, ...rest } = overrides;
  return {
    committee: "企画総務委員会",
    meetingUrl: "https://example.test/meeting",
    minutesUrl: null,
    bill: { id, tags: [] } as unknown as BillWithContent,
    ...rest,
  };
}

describe("toMeetingCommittees", () => {
  it("委員会ごとにまとめ、資料の順を保つ", () => {
    const committees = toMeetingCommittees([
      entry({ id: "a" }),
      entry({ id: "b" }),
      entry({ id: "c" }),
    ]);

    expect(committees).toHaveLength(1);
    expect(committees[0].bills.map((bill) => bill.id)).toEqual(["a", "b", "c"]);
  });

  it("同じ日に複数の委員会があれば、最初に出てきた順に並べる", () => {
    const committees = toMeetingCommittees([
      entry({ id: "a", committee: "福祉保健委員会" }),
      entry({ id: "b", committee: "企画総務委員会" }),
      entry({ id: "c", committee: "福祉保健委員会" }),
    ]);

    expect(committees.map((c) => c.committee)).toEqual([
      "福祉保健委員会",
      "企画総務委員会",
    ]);
    expect(committees[0].bills.map((bill) => bill.id)).toEqual(["a", "c"]);
  });

  it("会議録のURLは、値のある資料から拾う", () => {
    const committees = toMeetingCommittees([
      entry({ id: "a", minutesUrl: null }),
      entry({ id: "b", minutesUrl: "https://example.test/minutes" }),
    ]);

    expect(committees[0].minutesUrl).toBe("https://example.test/minutes");
  });

  it("どの資料にも会議録が無ければ null のまま", () => {
    const committees = toMeetingCommittees([entry({ id: "a" })]);

    expect(committees[0].minutesUrl).toBeNull();
  });

  it("資料が無ければ空", () => {
    expect(toMeetingCommittees([])).toEqual([]);
  });
});
