/**
 * バッチ処理の予算判定。
 *
 * AIチャットの上限（`web/src/features/chat/server/services/system-cost-guard.ts`）は
 * 「1日・1か月の合計をDBから引いて判定する」形だが、取り込みジョブはリクエスト
 * 単位ではなく1回の実行の中で何十回もAIを呼ぶ。実行の途中で積み上げを見て
 * 止められないと、暴走したときに上限が意味を持たない。
 *
 * ここでは判定だけを純粋関数として置き、状態の持ち回りは呼び出し側に任せる。
 */

export type BudgetLimits = {
  /** 1回の実行で使ってよい上限（USD） */
  runLimitUsd: number;
  /** 1件（資料1本・会議1回）で使ってよい上限（USD） */
  itemLimitUsd: number;
};

export type BudgetVerdict =
  | { ok: true }
  | { ok: false; reason: "run_limit"; spentUsd: number; limitUsd: number }
  | { ok: false; reason: "item_limit"; costUsd: number; limitUsd: number }
  | { ok: false; reason: "cost_unknown" };

/**
 * 次の1件に取りかかってよいか。
 *
 * 使い切ってから止めるのではなく、取りかかる前に残額を見る。
 */
export function canStartItem(
  spentUsd: number,
  limits: BudgetLimits
): BudgetVerdict {
  if (spentUsd >= limits.runLimitUsd) {
    return {
      ok: false,
      reason: "run_limit",
      spentUsd,
      limitUsd: limits.runLimitUsd,
    };
  }
  return { ok: true };
}

/**
 * 1件を処理した結果を受け入れてよいか。
 *
 * 費用が分からない（null）ときは続行しない。分からないまま進めると、
 * 積み上げが実態から離れていき、上限が働かなくなる。
 */
export function evaluateItemCost(
  costUsd: number | null,
  spentUsd: number,
  limits: BudgetLimits
): BudgetVerdict {
  if (costUsd === null) {
    return { ok: false, reason: "cost_unknown" };
  }

  if (costUsd > limits.itemLimitUsd) {
    return {
      ok: false,
      reason: "item_limit",
      costUsd,
      limitUsd: limits.itemLimitUsd,
    };
  }

  const nextSpent = spentUsd + costUsd;
  if (nextSpent > limits.runLimitUsd) {
    return {
      ok: false,
      reason: "run_limit",
      spentUsd: nextSpent,
      limitUsd: limits.runLimitUsd,
    };
  }

  return { ok: true };
}

/** 判定結果を人が読めるメッセージにする */
export function describeVerdict(verdict: BudgetVerdict): string {
  if (verdict.ok) return "予算内";

  switch (verdict.reason) {
    case "run_limit":
      return `実行あたりの上限に達した（使用 $${verdict.spentUsd.toFixed(4)} / 上限 $${verdict.limitUsd.toFixed(2)}）`;
    case "item_limit":
      return `1件あたりの上限を超えた（$${verdict.costUsd.toFixed(4)} / 上限 $${verdict.limitUsd.toFixed(2)}）`;
    case "cost_unknown":
      return "費用を確認できなかった（Gatewayの実費もトークンからの見積もりも得られない）";
  }
}
