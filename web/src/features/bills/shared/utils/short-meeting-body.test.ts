import { describe, expect, it } from "vitest";
import { toShortMeetingBody } from "./short-meeting-body";

describe("toShortMeetingBody", () => {
  it("常任委員会の「委員会」を落とす", () => {
    expect(toShortMeetingBody("福祉保健委員会")).toBe("福祉保健");
    expect(toShortMeetingBody("企画総務委員会")).toBe("企画総務");
  });

  it("特別委員会の「特別委員会」を落とす", () => {
    expect(toShortMeetingBody("防災等安全対策特別委員会")).toBe(
      "防災等安全対策"
    );
    expect(toShortMeetingBody("築地まちづくり・環境対策特別委員会")).toBe(
      "築地まちづくり・環境対策"
    );
  });

  it("末尾以外の「委員会」は残す", () => {
    // 「教育委員会事務局」のように途中に出てくることがある
    expect(toShortMeetingBody("教育委員会事務局の報告")).toBe(
      "教育委員会事務局の報告"
    );
  });

  it("委員会でない会議体はそのまま", () => {
    expect(toShortMeetingBody("AIインタビュー")).toBe("AIインタビュー");
    expect(toShortMeetingBody("定例会")).toBe("定例会");
  });

  it("空や未設定でも壊れない", () => {
    expect(toShortMeetingBody(null)).toBe("");
    expect(toShortMeetingBody(undefined)).toBe("");
    expect(toShortMeetingBody("")).toBe("");
  });
});
