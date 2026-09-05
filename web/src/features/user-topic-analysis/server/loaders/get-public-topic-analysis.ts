import "server-only";

import {
  getPublicTopicAnalysis as fetchPublicTopicAnalysis,
  type PublicTopicAnalysis,
} from "@mirai-gikai/topic-analysis-core/public-server";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/cache-tags";

/**
 * 議案の公開中トピック分析を、§8 の表示時フィルタ適用後の表示用データで取得する。
 * Server Components から直接呼ぶ（公開 API と同じデータ契約）。
 * 公開版が無ければ null（呼び出し側で「分析準備中」扱いにする）。
 *
 * 取得・フィルタの本体は @mirai-gikai/topic-analysis-core/public に集約（web/admin 共有）。
 * React cache() でリクエスト内のDB呼び出しを重複排除する
 * （generateMetadata とページ本体で同じ billId を取得しても1回のクエリで済む）。
 */
export const getPublicTopicAnalysis = cache(
  (billId: string): Promise<PublicTopicAnalysis | null> =>
    _getCachedPublicTopicAnalysis(billId)
);

/**
 * リクエストをまたいだキャッシュ。
 *
 * React の cache() は同じリクエストの中でしか効かないので、記事を開くたびに
 * DBへ問い合わせが飛んでいた。記事ページのほかの取得（議案・資料・質疑）は
 * どれも10分キャッシュを持っているので、ここも揃える。
 */
const _getCachedPublicTopicAnalysis = unstable_cache(
  (billId: string): Promise<PublicTopicAnalysis | null> =>
    fetchPublicTopicAnalysis(billId),
  ["public-topic-analysis-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);
