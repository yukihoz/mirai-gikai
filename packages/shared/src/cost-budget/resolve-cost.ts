/**
 * 1回のAI呼び出しにかかった金額を決める。
 *
 * Vercel AI Gateway は `providerMetadata.gateway.cost` に実費を返す。実費が
 * 取れたならそれを使い、取れなければトークン数と単価から見積もる。
 *
 * どちらも取れなかったときは **0 ではなく null を返す**。0 を返すと
 * 「無料で使えた」ことになって予算の積み上げをすり抜け、上限が働かなくなる。
 * 費用が分からない状態は、費用が0の状態とは違う。
 */

/** 実費も見積もりも得られなかったことを表す */
export const COST_UNKNOWN = null;

export type ResolveCostParams = {
  /** Gateway が返した実費（USD）。数値でなければ見積もりに落ちる */
  gatewayCostUsd: unknown;
  /** トークン数からの見積もり（USD）。算出できなければ undefined */
  estimatedCostUsd: number | undefined;
};

/**
 * 実費 → 見積もり → 不明（null）の順で費用を決める。
 *
 * 負の値は壊れた入力として扱い、次の候補に落とす。
 */
export function resolveCostUsd(params: ResolveCostParams): number | null {
  const actual = toNonNegativeNumber(params.gatewayCostUsd);
  if (actual !== null) return actual;

  const estimated = params.estimatedCostUsd;
  if (estimated !== undefined && Number.isFinite(estimated) && estimated >= 0) {
    return estimated;
  }

  return COST_UNKNOWN;
}

/**
 * 値を0以上の数値として読む。読めなければ null。
 *
 * `Number()` に丸投げしないのは、`Number(null)`・`Number("")`・`Number([])`
 * がいずれも 0 になるため。費用が返ってこなかったのに「0円で済んだ」と
 * 解釈すると、予算の積み上げをすり抜けて上限が働かなくなる。
 */
function toNonNegativeNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  return null;
}

/** トークン数と単価（USD / 100万トークン）から費用を見積もる */
export function estimateCostUsd(params: {
  inputTokens: number | undefined;
  outputTokens: number | undefined;
  inputPerMillionUsd: number | undefined;
  outputPerMillionUsd: number | undefined;
}): number | undefined {
  const { inputTokens, outputTokens, inputPerMillionUsd, outputPerMillionUsd } =
    params;

  if (inputPerMillionUsd === undefined || outputPerMillionUsd === undefined) {
    return undefined;
  }
  if (inputTokens === undefined || outputTokens === undefined) {
    return undefined;
  }

  const input = (inputTokens / 1_000_000) * inputPerMillionUsd;
  const output = (outputTokens / 1_000_000) * outputPerMillionUsd;
  const total = input + output;
  return Number.isFinite(total) ? total : undefined;
}
