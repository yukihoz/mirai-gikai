import {
  type CostBudget,
  createCostBudget,
} from "@mirai-gikai/shared/cost-budget";
import { readIngestBudget } from "@mirai-gikai/shared/cost-budget/limits";
import {
  estimateCostUsd,
  resolveCostUsd,
} from "@mirai-gikai/shared/cost-budget/resolve-cost";
import { generateObject } from "ai";
import type { z } from "zod";
import type { ObjectGenerator } from "./generate-explanation";

/** 取り込みで使うモデル。Vercel AI Gateway 形式。 */
export const CHUO_INGEST_MODEL = "openai/gpt-5-mini";

/** gpt-5-mini の単価（USD / 100万トークン）。実費が取れないときの見積もり用。 */
const FALLBACK_PRICING = { input: 0.25, output: 2.0 };

/** 1回の生成のタイムアウト。資料や議事録は長い。 */
const TIMEOUT_MS = 180_000;

export type GatewayGeneratorOptions = {
  model?: string;
  budget?: CostBudget;
};

/**
 * AI Gateway 越しに構造化出力を得る生成器を作る。
 *
 * 呼び出しのたびに費用を予算へ積み上げ、上限を超えたら BudgetStopError で
 * 止まる。Gateway は `providerMetadata.gateway.cost` に実費を返すので、
 * トークンからの見積もりは実費が取れなかったときの保険にとどめる。
 *
 * 予算を渡さなければ環境変数（CHUO_INGEST_RUN_BUDGET_USD 等）から作る。
 */
export function createGatewayGenerator(options: GatewayGeneratorOptions = {}): {
  generate: ObjectGenerator;
  budget: CostBudget;
} {
  const model = options.model ?? CHUO_INGEST_MODEL;
  const budget = options.budget ?? createCostBudget(readIngestBudget());

  const generate: ObjectGenerator = async ({ prompt, schema, label }) => {
    budget.assertCanStart(label);

    const result = await generateObject({
      model,
      schema: schema as z.ZodType,
      system: prompt.system,
      prompt: prompt.user,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
    });

    budget.record(label, readCost(result));
    return result.object as never;
  };

  return { generate, budget };
}

/** 実費 → トークンからの見積もり → 不明(null) の順で費用を決める */
function readCost(result: {
  providerMetadata?: unknown;
  usage?: { inputTokens?: number; outputTokens?: number };
}): number | null {
  const gatewayCostUsd = (
    result.providerMetadata as { gateway?: { cost?: unknown } } | undefined
  )?.gateway?.cost;

  return resolveCostUsd({
    gatewayCostUsd,
    estimatedCostUsd: estimateCostUsd({
      inputTokens: result.usage?.inputTokens,
      outputTokens: result.usage?.outputTokens,
      inputPerMillionUsd: FALLBACK_PRICING.input,
      outputPerMillionUsd: FALLBACK_PRICING.output,
    }),
  });
}
