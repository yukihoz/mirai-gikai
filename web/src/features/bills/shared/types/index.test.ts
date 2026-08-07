import { describe, expect, it } from "vitest";

import { getBillStatusLabel } from "./index";

describe("getBillStatusLabel", () => {
  it("returns '準備中' for preparing", () => {
    expect(getBillStatusLabel("preparing")).toBe("準備中");
  });

  it("returns '議案提出済み' for introduced", () => {
    expect(getBillStatusLabel("introduced")).toBe("議案提出済み");
  });

  it("returns '議案可決' for enacted", () => {
    expect(getBillStatusLabel("enacted")).toBe("議案可決");
  });

  it("returns '議案否決' for rejected", () => {
    expect(getBillStatusLabel("rejected")).toBe("議案否決");
  });

  describe("in_originating_house", () => {
    it("returns '定例会付託' when meetingBody is 定例会", () => {
      expect(getBillStatusLabel("in_originating_house", "定例会")).toBe(
        "定例会付託"
      );
    });

    it("returns '臨時会付託' when meetingBody is 臨時会", () => {
      expect(getBillStatusLabel("in_originating_house", "臨時会")).toBe(
        "臨時会付託"
      );
    });

    it("returns '付託' when meetingBody is undefined", () => {
      expect(getBillStatusLabel("in_originating_house")).toBe("付託");
    });

    it("returns '付託' when meetingBody is null", () => {
      expect(getBillStatusLabel("in_originating_house", null)).toBe("付託");
    });
  });

  describe("in_receiving_house", () => {
    it("returns '定例会付託' when meetingBody is 定例会", () => {
      expect(getBillStatusLabel("in_receiving_house", "定例会")).toBe(
        "定例会付託"
      );
    });

    it("returns '付託' when meetingBody is undefined", () => {
      expect(getBillStatusLabel("in_receiving_house")).toBe("付託");
    });

    it("returns '付託' when meetingBody is null", () => {
      expect(getBillStatusLabel("in_receiving_house", null)).toBe("付託");
    });
  });

  it("returns the status string as-is for unknown status", () => {
    // biome-ignore lint/suspicious/noExplicitAny: テスト用に未知のステータスを渡す
    expect(getBillStatusLabel("unknown_status" as any)).toBe("unknown_status");
  });
});
