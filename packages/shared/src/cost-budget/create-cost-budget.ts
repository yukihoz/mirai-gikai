import {
  type BudgetLimits,
  type BudgetVerdict,
  canStartItem,
  describeVerdict,
  evaluateItemCost,
} from "./evaluate-budget";

/** 予算を使い切った・費用が確認できないなどで処理を止めるときの例外 */
export class BudgetStopError extends Error {
  readonly verdict: BudgetVerdict;

  constructor(verdict: BudgetVerdict) {
    super(describeVerdict(verdict));
    this.name = "BudgetStopError";
    this.verdict = verdict;
  }
}

/** 何にいくらかかったかの記録 */
export type CostEntry = {
  /** 資料の件名や会議名など、後から見て何の費用か分かるラベル */
  label: string;
  costUsd: number;
};

export type CostBudget = {
  /** 次の1件に取りかかる。予算を使い切っていれば BudgetStopError */
  assertCanStart(label: string): void;
  /** 1件分の費用を記録する。上限超過・費用不明なら BudgetStopError */
  record(label: string, costUsd: number | null): void;
  spentUsd(): number;
  remainingUsd(): number;
  entries(): readonly CostEntry[];
};

/**
 * 1回の実行分の予算を持つ。
 *
 * 状態はこの関数の中だけに閉じ、判定は `evaluate-budget.ts` の純粋関数に
 * 任せる。テストしたいのは判定のほうなので、状態はできるだけ薄くする。
 */
export function createCostBudget(limits: BudgetLimits): CostBudget {
  const entries: CostEntry[] = [];
  let spent = 0;

  return {
    assertCanStart(label) {
      const verdict = canStartItem(spent, limits);
      if (!verdict.ok) {
        console.warn(`[budget] ${label} を中止: ${describeVerdict(verdict)}`);
        throw new BudgetStopError(verdict);
      }
    },

    record(label, costUsd) {
      const verdict = evaluateItemCost(costUsd, spent, limits);
      if (!verdict.ok) {
        console.warn(`[budget] ${label} で停止: ${describeVerdict(verdict)}`);
        throw new BudgetStopError(verdict);
      }
      // verdict.ok なら costUsd は number
      const cost = costUsd as number;
      spent += cost;
      entries.push({ label, costUsd: cost });
    },

    spentUsd: () => spent,
    remainingUsd: () => Math.max(0, limits.runLimitUsd - spent),
    entries: () => entries,
  };
}
