import { describe, expect, it } from "vitest";
import {
  type BudgetLimits,
  canStartItem,
  describeVerdict,
  evaluateItemCost,
} from "./evaluate-budget";

const limits: BudgetLimits = { runLimitUsd: 5, itemLimitUsd: 0.5 };

describe("canStartItem", () => {
  it("残額があれば取りかかれる", () => {
    expect(canStartItem(0, limits)).toEqual({ ok: true });
    expect(canStartItem(4.99, limits)).toEqual({ ok: true });
  });

  it("上限ちょうどに達していたら止める", () => {
    expect(canStartItem(5, limits)).toEqual({
      ok: false,
      reason: "run_limit",
      spentUsd: 5,
      limitUsd: 5,
    });
  });

  it("上限を超えていたら止める", () => {
    const verdict = canStartItem(5.2, limits);
    expect(verdict.ok).toBe(false);
  });
});

describe("evaluateItemCost", () => {
  it("想定どおりの費用なら受け入れる", () => {
    expect(evaluateItemCost(0.01, 0, limits)).toEqual({ ok: true });
  });

  it("費用0も受け入れる（キャッシュ等で実費0になりうる）", () => {
    expect(evaluateItemCost(0, 1, limits)).toEqual({ ok: true });
  });

  it("費用が分からなければ止める", () => {
    // 0 として扱うと積み上げが実態から離れ、上限が働かなくなる
    expect(evaluateItemCost(null, 0, limits)).toEqual({
      ok: false,
      reason: "cost_unknown",
    });
  });

  it("1件あたりの上限を超えたら止める", () => {
    expect(evaluateItemCost(0.6, 0, limits)).toEqual({
      ok: false,
      reason: "item_limit",
      costUsd: 0.6,
      limitUsd: 0.5,
    });
  });

  it("1件あたりの上限ちょうどは受け入れる", () => {
    expect(evaluateItemCost(0.5, 0, limits)).toEqual({ ok: true });
  });

  it("合計が実行の上限を超えたら止める", () => {
    const verdict = evaluateItemCost(0.2, 4.9, limits);
    // 0.2 + 4.9 は 5.1000000000000005 になるため厳密一致では比べない
    expect(verdict).toMatchObject({
      ok: false,
      reason: "run_limit",
      limitUsd: 5,
    });
    expect(verdict.ok === false && verdict.reason === "run_limit").toBe(true);
  });

  it("合計が上限ちょうどなら受け入れる", () => {
    expect(evaluateItemCost(0.1, 4.9, limits)).toEqual({ ok: true });
  });

  it("1件の上限判定を合計の判定より先に行う", () => {
    // どちらにも触れる場合、原因として先に伝えるべきは1件側
    const verdict = evaluateItemCost(0.9, 4.9, limits);
    expect(verdict).toMatchObject({ ok: false, reason: "item_limit" });
  });
});

describe("describeVerdict", () => {
  it("予算内であることを伝える", () => {
    expect(describeVerdict({ ok: true })).toBe("予算内");
  });

  it("実行の上限に達したことを金額つきで伝える", () => {
    const message = describeVerdict({
      ok: false,
      reason: "run_limit",
      spentUsd: 5.1234,
      limitUsd: 5,
    });
    expect(message).toContain("$5.1234");
    expect(message).toContain("$5.00");
  });

  it("費用不明であることを伝える", () => {
    expect(describeVerdict({ ok: false, reason: "cost_unknown" })).toContain(
      "費用を確認できなかった"
    );
  });
});
