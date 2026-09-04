/**
 * 取得済みのURLを取り込み直すかどうかの判定。
 *
 * 委員会資料は一度公開されるとほぼ更新されない。取り込みを繰り返しても
 * 中身が同じならAIを呼ばずに済ませたい。相手サイトへのリクエストと
 * AI費用の両方が減る。
 */

/** 前回の取得結果（chuo_ingestion_sources の1行） */
export type KnownSource = {
  contentHash: string | null;
  etag: string | null;
  lastModified: string | null;
};

export type RefetchDecision =
  /** 取得も生成もやり直す */
  | { refetch: true; reason: "unknown" | "forced" | "no_hash" }
  /** 取得はするが、中身が同じなら生成はしない */
  | { refetch: true; reason: "verify" }
  /** 何もしない */
  | { refetch: false; reason: "unchanged" };

/**
 * 取得しに行くかどうか。
 *
 * URLの中身が変わったかは取得してみないと分からないので、ここで判定できるのは
 * 「そもそも取りに行くか」まで。取得後の判定は `shouldRegenerate` で行う。
 *
 * 未取得のURL、`force` 指定、前回のハッシュが無い場合は取りに行く。
 * それ以外は「取りに行って中身を確かめる」（verify）を返す。ハッシュの比較は
 * 取得後にしかできないため、取得そのものは避けられない。
 *
 * 取得を丸ごと省く判断（ETagやLast-Modifiedでの条件付きGET）は、いまは
 * 入れていない。区議会サイトが返すETagが内容と対応しているかを確かめて
 * いないため、当てにして生成を飛ばすと、更新された資料を取りこぼす。
 */
export function shouldRefetch(params: {
  known: KnownSource | null;
  force?: boolean;
}): RefetchDecision {
  if (params.force === true) return { refetch: true, reason: "forced" };
  if (params.known === null) return { refetch: true, reason: "unknown" };
  if (params.known.contentHash === null) {
    return { refetch: true, reason: "no_hash" };
  }
  return { refetch: true, reason: "verify" };
}

/**
 * 取得した中身をもとに、解析と生成をやり直すか決める。
 *
 * ここがAI費用に直結する。ハッシュが一致していれば、資料の中身は前回と
 * 同じなので、解説を作り直しても同じものが出てくる。
 */
export function shouldRegenerate(params: {
  known: KnownSource | null;
  fetchedHash: string;
  force?: boolean;
}): {
  regenerate: boolean;
  reason: "forced" | "new" | "changed" | "unchanged";
} {
  if (params.force === true) return { regenerate: true, reason: "forced" };
  if (params.known === null || params.known.contentHash === null) {
    return { regenerate: true, reason: "new" };
  }
  if (params.known.contentHash !== params.fetchedHash) {
    return { regenerate: true, reason: "changed" };
  }
  return { regenerate: false, reason: "unchanged" };
}

/** 取り込み1回分の集計。実行ログの stats に入れる */
export type IngestStats = {
  /** 対象になった件数 */
  total: number;
  /** 中身が変わっておらず、生成を飛ばした件数 */
  skipped: number;
  /** 新規に生成した件数 */
  generated: number;
  /** 中身が変わっていて作り直した件数 */
  regenerated: number;
  /** 失敗した件数 */
  failed: number;
};

export function emptyStats(): IngestStats {
  return { total: 0, skipped: 0, generated: 0, regenerated: 0, failed: 0 };
}

/** 判定結果を集計に反映する */
export function countDecision(
  stats: IngestStats,
  reason: "forced" | "new" | "changed" | "unchanged"
): IngestStats {
  const next = { ...stats, total: stats.total + 1 };
  switch (reason) {
    case "new":
      return { ...next, generated: next.generated + 1 };
    case "changed":
    case "forced":
      return { ...next, regenerated: next.regenerated + 1 };
    case "unchanged":
      return { ...next, skipped: next.skipped + 1 };
  }
}

/** 集計を人が読める1行にする */
export function describeStats(stats: IngestStats): string {
  return [
    `対象 ${stats.total}`,
    `新規 ${stats.generated}`,
    `作り直し ${stats.regenerated}`,
    `スキップ ${stats.skipped}`,
    `失敗 ${stats.failed}`,
  ].join(" / ");
}
