import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS, LIST_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import type { BillWithContent } from "../../shared/types";
import {
  findBillIdsWithPublicInterview,
  findFeaturedBillsWithContents,
  findTagsByBillIds,
} from "../repositories/bill-repository";

/**
 * 注目の議案を取得する
 * is_featured = true でアクティブな区議会会期の公開済み議案を最新順に取得
 * アクティブな区議会会期がない場合は全件取得
 */
export async function getFeaturedBills(): Promise<BillWithContent[]> {
  // キャッシュ外でcookiesにアクセス
  const difficultyLevel = await getDifficultyLevel();

  // 失敗はキャッシュの外で空にする（理由は LIST_CACHE_REVALIDATE_SECONDS を参照）
  try {
    return await _getCachedFeaturedBills(difficultyLevel);
  } catch (error) {
    console.error("Failed to fetch featured bills:", error);
    return [];
  }
}

const _getCachedFeaturedBills = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<BillWithContent[]> => {
    // 会期に関わらずすべてのFeatured議案を表示するため、dietSessionIdにnullを渡す
    const data = await findFeaturedBillsWithContents(difficultyLevel, null);

    if (data.length === 0) {
      return [];
    }

    // タグ情報とインタビュー状態を一括取得
    const billIds = data.map((item: { id: string }) => item.id);
    const [tagsByBillId, interviewBillIds] = await Promise.all([
      findTagsByBillIds(billIds),
      findBillIdsWithPublicInterview(billIds),
    ]);

    // データ構造を整形
    return data.map((item) => {
      const { bill_contents, ...bill } = item;
      return {
        ...bill,
        bill_content: Array.isArray(bill_contents)
          ? bill_contents[0]
          : undefined,
        tags: tagsByBillId.get(item.id) || [],
        hasPublicInterview: interviewBillIds.has(item.id),
      };
    }) as BillWithContent[];
  },
  ["featured-bills-list-v4"],
  {
    revalidate: LIST_CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.BILLS, CACHE_TAGS.INTERVIEW_CONFIGS],
  }
);
