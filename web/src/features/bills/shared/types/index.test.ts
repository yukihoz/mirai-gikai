import { describe, expect, it } from "vitest";

import { getBillStatusLabel } from "./index";

describe("getBillStatusLabel", () => {
  it("returns '準備中' for preparing", () => {
    expect(getBillStatusLabel("preparing")).toBe("準備中");
  });

  it("returns '提出済み' for introduced", () => {
    expect(getBillStatusLabel("introduced")).toBe("提出済み");
  });

  it("returns '成立' for enacted", () => {
    expect(getBillStatusLabel("enacted")).toBe("成立");
  });

  it("returns '否決' for rejected", () => {
    expect(getBillStatusLabel("rejected")).toBe("否決");
  });

  describe("in_originating_house", () => {
    it("returns '定例会審議中' when meetingBody is 定例会", () => {
      expect(getBillStatusLabel("in_originating_house", "定例会")).toBe(
        "定例会審議中"
      );
    });

    it("returns '臨時会審議中' when meetingBody is 臨時会", () => {
      expect(getBillStatusLabel("in_originating_house", "臨時会")).toBe(
        "臨時会審議中"
      );
    });

    it("returns '審議中' when meetingBody is undefined", () => {
      expect(getBillStatusLabel("in_originating_house")).toBe("審議中");
    });

    it("returns '審議中' when meetingBody is null", () => {
      expect(getBillStatusLabel("in_originating_house", null)).toBe("審議中");
    });
  });

  describe("in_receiving_house", () => {
    it("returns '審議中' regardless of meetingBody", () => {
      expect(getBillStatusLabel("in_receiving_house", "定例会")).toBe(
        "審議中"
      );
    });

    it("returns '審議中' when meetingBody is undefined", () => {
      expect(getBillStatusLabel("in_receiving_house")).toBe("審議中");
    });

    it("returns '審議中' when meetingBody is null", () => {
      expect(getBillStatusLabel("in_receiving_house", null)).toBe("審議中");
    });
  });

  it("returns the status string as-is for unknown status", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テスト用に未知のステータスを渡す
    expect(getBillStatusLabel("unknown_status" as any)).toBe("unknown_status");
  });
});
