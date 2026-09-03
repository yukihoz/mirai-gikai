import { describe, expect, it } from "vitest";
import { DEFAULT_INGEST_BUDGET, readIngestBudget } from "./limits";

describe("DEFAULT_INGEST_BUDGET", () => {
  it("2026年2月ぶんの見込み（推論込みで約$2.7）を通せる額にする", () => {
    expect(DEFAULT_INGEST_BUDGET.runLimitUsd).toBeGreaterThan(2.7);
  });

  it("1件あたりの上限は想定（$0.01前後）よりずっと大きく、暴走は捕まえる", () => {
    expect(DEFAULT_INGEST_BUDGET.itemLimitUsd).toBeGreaterThan(0.1);
    expect(DEFAULT_INGEST_BUDGET.itemLimitUsd).toBeLessThan(
      DEFAULT_INGEST_BUDGET.runLimitUsd
    );
  });
});

describe("readIngestBudget", () => {
  it("未設定なら既定値を使う", () => {
    expect(readIngestBudget({})).toEqual(DEFAULT_INGEST_BUDGET);
  });

  it("空文字も未設定として扱う", () => {
    expect(
      readIngestBudget({
        CHUO_INGEST_RUN_BUDGET_USD: "",
        CHUO_INGEST_ITEM_BUDGET_USD: "",
      })
    ).toEqual(DEFAULT_INGEST_BUDGET);
  });

  it("環境変数で上書きできる", () => {
    expect(
      readIngestBudget({
        CHUO_INGEST_RUN_BUDGET_USD: "60",
        CHUO_INGEST_ITEM_BUDGET_USD: "1.5",
      })
    ).toEqual({ runLimitUsd: 60, itemLimitUsd: 1.5 });
  });

  it("片方だけの指定も効く", () => {
    expect(readIngestBudget({ CHUO_INGEST_RUN_BUDGET_USD: "60" })).toEqual({
      runLimitUsd: 60,
      itemLimitUsd: DEFAULT_INGEST_BUDGET.itemLimitUsd,
    });
  });

  it("数値でなければエラーにする（既定値に落とさない）", () => {
    expect(() =>
      readIngestBudget({ CHUO_INGEST_RUN_BUDGET_USD: "たくさん" })
    ).toThrow("CHUO_INGEST_RUN_BUDGET_USD");
  });

  it("0や負の値はエラーにする", () => {
    expect(() =>
      readIngestBudget({ CHUO_INGEST_RUN_BUDGET_USD: "0" })
    ).toThrow();
    expect(() =>
      readIngestBudget({ CHUO_INGEST_ITEM_BUDGET_USD: "-1" })
    ).toThrow();
  });
});
