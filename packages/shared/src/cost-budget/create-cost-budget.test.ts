import { describe, expect, it } from "vitest";
import { BudgetStopError, createCostBudget } from "./create-cost-budget";

const limits = { runLimitUsd: 5, itemLimitUsd: 0.5 };

describe("createCostBudget", () => {
  it("使った分だけ積み上がる", () => {
    const budget = createCostBudget(limits);
    budget.record("資料1", 0.01);
    budget.record("資料2", 0.02);
    expect(budget.spentUsd()).toBeCloseTo(0.03, 10);
    expect(budget.remainingUsd()).toBeCloseTo(4.97, 10);
  });

  it("何にいくらかかったかを残す", () => {
    const budget = createCostBudget(limits);
    budget.record("資料4 病児・病後児保育", 0.008);
    expect(budget.entries()).toEqual([
      { label: "資料4 病児・病後児保育", costUsd: 0.008 },
    ]);
  });

  it("上限に達したら次の1件に取りかかれない", () => {
    const budget = createCostBudget({ runLimitUsd: 0.05, itemLimitUsd: 0.5 });
    budget.record("資料1", 0.05);
    expect(() => budget.assertCanStart("資料2")).toThrow(BudgetStopError);
  });

  it("上限内なら取りかかれる", () => {
    const budget = createCostBudget(limits);
    budget.record("資料1", 0.01);
    expect(() => budget.assertCanStart("資料2")).not.toThrow();
  });

  it("1件あたりの上限を超えたら止まり、その分を積まない", () => {
    const budget = createCostBudget(limits);
    budget.record("資料1", 0.01);
    expect(() => budget.record("資料2", 0.9)).toThrow(BudgetStopError);
    expect(budget.spentUsd()).toBeCloseTo(0.01, 10);
    expect(budget.entries()).toHaveLength(1);
  });

  it("費用が分からなければ止まる", () => {
    const budget = createCostBudget(limits);
    expect(() => budget.record("資料1", null)).toThrow(BudgetStopError);
    expect(budget.spentUsd()).toBe(0);
  });

  it("止まった理由を verdict で取り出せる", () => {
    const budget = createCostBudget(limits);
    try {
      budget.record("資料1", null);
      expect.unreachable("BudgetStopError が投げられるはず");
    } catch (error) {
      expect(error).toBeInstanceOf(BudgetStopError);
      expect((error as BudgetStopError).verdict).toEqual({
        ok: false,
        reason: "cost_unknown",
      });
    }
  });

  it("残額は0未満にならない", () => {
    const budget = createCostBudget({ runLimitUsd: 0.02, itemLimitUsd: 0.5 });
    budget.record("資料1", 0.02);
    expect(budget.remainingUsd()).toBe(0);
  });

  it("2026年2月ぶん（資料34件・会議8回）を既定の上限内で通せる", () => {
    // 1件 $0.008 前後、会議1回 $0.04 前後という実測ベースの想定
    const budget = createCostBudget(limits);
    for (let i = 1; i <= 34; i++) budget.record(`資料${i}`, 0.008);
    for (let i = 1; i <= 8; i++) budget.record(`会議${i}の質疑`, 0.04);
    expect(budget.spentUsd()).toBeLessThan(limits.runLimitUsd);
  });
});
