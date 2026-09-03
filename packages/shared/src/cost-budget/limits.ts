import type { BudgetLimits } from "./evaluate-budget";

/**
 * 取り込みジョブの既定の上限。
 *
 * 2026年2月の実測（資料34件・8会議）を基準にしている。
 *
 *   資料1件の本文   平均 2,905 トークン
 *   議事録1会議分   平均 16,145 トークン
 *
 * openai/gpt-5-mini（入力 $0.25 / 出力 $2.00 per 1M）で1か月分を通すと、
 * 推論トークンが乗らなければ約 $0.28、出力の9割が推論でも約 $2.7。
 * 1件あたりは $0.01 前後にしかならない。
 *
 * 既定値はその1か月分をゆとりを持って通せる額にし、暴走したときは
 * そこで止まるようにする。過去分をまとめて流すときは上限を明示的に
 * 上げてもらう（全件 678 資料でも推論込みで $51 程度）。高い操作は
 * 黙って通るより、意図して指定するほうがよい。
 */
export const DEFAULT_INGEST_BUDGET: BudgetLimits = {
  /** 1回の実行の上限。2026年2月分（最大 $2.7 見込み）の倍近い余裕 */
  runLimitUsd: 5,
  /**
   * 1件の上限。想定は $0.01 前後なので、$0.5 に達している時点で
   * 資料が異常に長いか、呼び方を間違えている。
   */
  itemLimitUsd: 0.5,
};

/**
 * 環境変数から上限を読む。
 *
 * 未設定なら既定値。設定されていても正の数でなければ、黙って既定値に
 * 落とさずエラーにする。上限の指定を間違えたまま走り出すのが一番まずい。
 */
export function readIngestBudget(
  envVars: Record<string, string | undefined> = process.env
): BudgetLimits {
  return {
    runLimitUsd: readPositiveNumber(
      envVars.CHUO_INGEST_RUN_BUDGET_USD,
      "CHUO_INGEST_RUN_BUDGET_USD",
      DEFAULT_INGEST_BUDGET.runLimitUsd
    ),
    itemLimitUsd: readPositiveNumber(
      envVars.CHUO_INGEST_ITEM_BUDGET_USD,
      "CHUO_INGEST_ITEM_BUDGET_USD",
      DEFAULT_INGEST_BUDGET.itemLimitUsd
    ),
  };
}

function readPositiveNumber(
  raw: string | undefined,
  name: string,
  fallback: number
): number {
  if (raw === undefined || raw === "") return fallback;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`環境変数 ${name} は正の数値で指定してください`);
  }
  return value;
}
