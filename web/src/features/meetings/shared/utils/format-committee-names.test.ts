import { describe, expect, it } from "vitest";
import type { MeetingCommittee } from "../types";
import {
  formatCommitteeNames,
  formatMeetingCommittees,
} from "./format-committee-names";

describe("formatCommitteeNames", () => {
  it("中黒でつなぐ", () => {
    expect(formatCommitteeNames(["企画総務委員会", "福祉保健委員会"])).toBe(
      "企画総務委員会・福祉保健委員会"
    );
  });

  it("1つなら区切りは付かない", () => {
    expect(formatCommitteeNames(["企画総務委員会"])).toBe("企画総務委員会");
  });

  it("空なら空文字", () => {
    expect(formatCommitteeNames([])).toBe("");
  });
});

describe("formatMeetingCommittees", () => {
  it("委員会名だけを取り出してつなぐ", () => {
    const committees = [
      { committee: "企画総務委員会" },
      { committee: "福祉保健委員会" },
    ] as MeetingCommittee[];

    expect(formatMeetingCommittees(committees)).toBe(
      "企画総務委員会・福祉保健委員会"
    );
  });
});
