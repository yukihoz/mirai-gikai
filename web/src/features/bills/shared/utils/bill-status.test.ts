import { describe, expect, it } from "vitest";
import { getCardStatusLabel, getStatusVariant } from "./bill-status";

describe("getCardStatusLabel", () => {
  it.each([
    ["introduced", "議案提出済み"],
    ["in_originating_house", "付託"],
    ["in_receiving_house", "付託"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getCardStatusLabel(status)).toBe(expected);
  });

  it("enacted → 議案可決", () => {
    expect(getCardStatusLabel("enacted")).toBe("議案可決");
  });

  it("rejected → 議案否決", () => {
    expect(getCardStatusLabel("rejected")).toBe("議案否決");
  });

  it("preparing → 準備中", () => {
    expect(getCardStatusLabel("preparing")).toBe("準備中");
  });
});

describe("getStatusVariant", () => {
  it.each([
    ["introduced", "light"],
    ["in_originating_house", "light"],
    ["in_receiving_house", "light"],
  ] as const)("審議中ステータス %s → %s", (status, expected) => {
    expect(getStatusVariant(status)).toBe(expected);
  });

  it("enacted → default", () => {
    expect(getStatusVariant("enacted")).toBe("default");
  });

  it("rejected → dark", () => {
    expect(getStatusVariant("rejected")).toBe("dark");
  });

  it("preparing → muted", () => {
    expect(getStatusVariant("preparing")).toBe("muted");
  });
});
