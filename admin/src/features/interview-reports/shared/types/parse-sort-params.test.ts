import { describe, expect, it } from "vitest";
import { parseSortParams } from "./index";

describe("parseSortParams", () => {
  it("デフォルト値を返す（パラメータなし）", () => {
    const result = parseSortParams(undefined, undefined);
    expect(result).toEqual({ sortBy: "started_at", sortOrder: "desc" });
  });

  it("有効なソートカラムとオーダーを受け付ける", () => {
    expect(parseSortParams("started_at", "asc")).toEqual({
      sortBy: "started_at",
      sortOrder: "asc",
    });
    expect(parseSortParams("message_count", "desc")).toEqual({
      sortBy: "message_count",
      sortOrder: "desc",
    });
  });

  it("無効なソートカラムはデフォルトにフォールバックする", () => {
    const result = parseSortParams("invalid_column", "asc");
    expect(result).toEqual({ sortBy: "started_at", sortOrder: "asc" });
  });

  it("無効なソートオーダーはデフォルトにフォールバックする", () => {
    const result = parseSortParams("started_at", "invalid");
    expect(result).toEqual({ sortBy: "started_at", sortOrder: "desc" });
  });

  it("両方無効な場合は完全にデフォルトにフォールバックする", () => {
    const result = parseSortParams("bad", "bad");
    expect(result).toEqual({ sortBy: "started_at", sortOrder: "desc" });
  });
});
