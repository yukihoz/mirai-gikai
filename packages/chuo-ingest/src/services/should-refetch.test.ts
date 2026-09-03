import { describe, expect, it } from "vitest";
import {
  countDecision,
  describeStats,
  emptyStats,
  type KnownSource,
  shouldRefetch,
  shouldRegenerate,
} from "./should-refetch";

const known: KnownSource = {
  contentHash: "a".repeat(64),
  etag: '"abc"',
  lastModified: "Tue, 10 Feb 2026 00:00:00 GMT",
};

describe("shouldRefetch", () => {
  it("未取得のURLは取りに行く", () => {
    expect(shouldRefetch({ known: null })).toEqual({
      refetch: true,
      reason: "unknown",
    });
  });

  it("force 指定なら取りに行く", () => {
    expect(shouldRefetch({ known, force: true })).toEqual({
      refetch: true,
      reason: "forced",
    });
  });

  it("前回のハッシュが無ければ取りに行く", () => {
    expect(shouldRefetch({ known: { ...known, contentHash: null } })).toEqual({
      refetch: true,
      reason: "no_hash",
    });
  });

  it("取得済みでも中身を確かめに行く", () => {
    // ハッシュの比較は取得後にしかできない
    expect(shouldRefetch({ known })).toEqual({
      refetch: true,
      reason: "verify",
    });
  });
});

describe("shouldRegenerate", () => {
  it("中身が同じなら作り直さない", () => {
    expect(
      shouldRegenerate({ known, fetchedHash: known.contentHash as string })
    ).toEqual({ regenerate: false, reason: "unchanged" });
  });

  it("中身が変わっていれば作り直す", () => {
    expect(shouldRegenerate({ known, fetchedHash: "b".repeat(64) })).toEqual({
      regenerate: true,
      reason: "changed",
    });
  });

  it("初めて見るURLは生成する", () => {
    expect(
      shouldRegenerate({ known: null, fetchedHash: "b".repeat(64) })
    ).toEqual({ regenerate: true, reason: "new" });
  });

  it("前回のハッシュが無ければ生成する", () => {
    expect(
      shouldRegenerate({
        known: { ...known, contentHash: null },
        fetchedHash: "b".repeat(64),
      })
    ).toEqual({ regenerate: true, reason: "new" });
  });

  it("force なら中身が同じでも作り直す", () => {
    expect(
      shouldRegenerate({
        known,
        fetchedHash: known.contentHash as string,
        force: true,
      })
    ).toEqual({ regenerate: true, reason: "forced" });
  });

  it("ETagが変わってもハッシュが同じなら作り直さない", () => {
    // 区議会サイトのETagが内容と対応しているか未確認のため、
    // 判断はハッシュだけで行う
    expect(
      shouldRegenerate({
        known: { ...known, etag: '"changed"' },
        fetchedHash: known.contentHash as string,
      })
    ).toEqual({ regenerate: false, reason: "unchanged" });
  });
});

describe("countDecision", () => {
  it("新規を数える", () => {
    expect(countDecision(emptyStats(), "new")).toMatchObject({
      total: 1,
      generated: 1,
      skipped: 0,
    });
  });

  it("変更を作り直しとして数える", () => {
    expect(countDecision(emptyStats(), "changed")).toMatchObject({
      total: 1,
      regenerated: 1,
    });
  });

  it("force も作り直しとして数える", () => {
    expect(countDecision(emptyStats(), "forced")).toMatchObject({
      total: 1,
      regenerated: 1,
    });
  });

  it("変更なしをスキップとして数える", () => {
    expect(countDecision(emptyStats(), "unchanged")).toMatchObject({
      total: 1,
      skipped: 1,
      generated: 0,
    });
  });

  it("元の集計を書き換えない", () => {
    const stats = emptyStats();
    countDecision(stats, "new");
    expect(stats).toEqual(emptyStats());
  });

  it("2回目の取り込みでは全件スキップになる", () => {
    // 資料34件を2回流したときの想定
    let stats = emptyStats();
    for (let i = 0; i < 34; i++) stats = countDecision(stats, "unchanged");
    expect(stats).toMatchObject({ total: 34, skipped: 34, generated: 0 });
  });
});

describe("describeStats", () => {
  it("集計を1行にまとめる", () => {
    const stats = { ...emptyStats(), total: 34, generated: 30, skipped: 4 };
    expect(describeStats(stats)).toBe(
      "対象 34 / 新規 30 / 作り直し 0 / スキップ 4 / 失敗 0"
    );
  });
});
