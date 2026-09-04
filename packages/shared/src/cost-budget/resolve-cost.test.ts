import { describe, expect, it } from "vitest";
import { estimateCostUsd, resolveCostUsd } from "./resolve-cost";

describe("resolveCostUsd", () => {
  it("Gatewayの実費があればそれを使う", () => {
    expect(
      resolveCostUsd({ gatewayCostUsd: 0.0123, estimatedCostUsd: 0.5 })
    ).toBe(0.0123);
  });

  it("実費が文字列で来ても数値として扱う", () => {
    expect(
      resolveCostUsd({ gatewayCostUsd: "0.02", estimatedCostUsd: undefined })
    ).toBe(0.02);
  });

  it("実費0はそのまま0として扱う", () => {
    expect(resolveCostUsd({ gatewayCostUsd: 0, estimatedCostUsd: 0.5 })).toBe(
      0
    );
  });

  it("実費が無ければ見積もりに落ちる", () => {
    expect(
      resolveCostUsd({ gatewayCostUsd: undefined, estimatedCostUsd: 0.5 })
    ).toBe(0.5);
  });

  it("実費が壊れていれば見積もりに落ちる", () => {
    expect(
      resolveCostUsd({ gatewayCostUsd: "n/a", estimatedCostUsd: 0.5 })
    ).toBe(0.5);
    expect(resolveCostUsd({ gatewayCostUsd: -1, estimatedCostUsd: 0.5 })).toBe(
      0.5
    );
  });

  it("どちらも無ければ null を返す（0にはしない）", () => {
    expect(
      resolveCostUsd({ gatewayCostUsd: null, estimatedCostUsd: undefined })
    ).toBeNull();
    expect(
      resolveCostUsd({ gatewayCostUsd: undefined, estimatedCostUsd: undefined })
    ).toBeNull();
  });

  it("Number() が 0 になる値を 0円と解釈しない", () => {
    // Number(null) / Number("") / Number([]) はいずれも 0 になる。
    // 費用が返ってこなかっただけなのに「0円で済んだ」と扱うと、
    // 予算の積み上げをすり抜けて上限が働かなくなる。
    for (const broken of [null, "", "   ", [], {}, false, true]) {
      expect(
        resolveCostUsd({ gatewayCostUsd: broken, estimatedCostUsd: undefined })
      ).toBeNull();
    }
  });
});

describe("estimateCostUsd", () => {
  it("トークン数と単価から見積もる", () => {
    // gpt-5-mini: 入力 $0.25 / 出力 $2.00 per 1M
    const cost = estimateCostUsd({
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
      inputPerMillionUsd: 0.25,
      outputPerMillionUsd: 2,
    });
    expect(cost).toBeCloseTo(2.25, 10);
  });

  it("資料1件ぶんの実測トークンで現実的な額になる", () => {
    // 資料本文2,905トークン + プロンプト800、出力2,100トークン
    const cost = estimateCostUsd({
      inputTokens: 3_705,
      outputTokens: 2_100,
      inputPerMillionUsd: 0.25,
      outputPerMillionUsd: 2,
    });
    expect(cost).toBeGreaterThan(0);
    expect(cost).toBeLessThan(0.01);
  });

  it("単価が分からなければ undefined", () => {
    expect(
      estimateCostUsd({
        inputTokens: 100,
        outputTokens: 100,
        inputPerMillionUsd: undefined,
        outputPerMillionUsd: 2,
      })
    ).toBeUndefined();
  });

  it("トークン数が取れなければ undefined", () => {
    expect(
      estimateCostUsd({
        inputTokens: undefined,
        outputTokens: 100,
        inputPerMillionUsd: 0.25,
        outputPerMillionUsd: 2,
      })
    ).toBeUndefined();
  });
});
