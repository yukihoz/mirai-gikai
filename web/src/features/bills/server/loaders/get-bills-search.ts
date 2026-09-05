import "server-only";

import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../../shared/types";
import {
  BILLS_PER_PAGE,
  type BillsSearchParams,
} from "../../shared/utils/parse-bills-search-params";
import {
  countPublishedBillsByTag,
  findAllTags,
  searchBills,
} from "../repositories/bill-repository";
import { toBillsWithContent } from "../utils/to-bills-with-content";

export type BillsSearchResult = {
  bills: BillWithContent[];
  /** 絞り込み後の総数。ページャに使う */
  total: number;
};

/** チップに出すカテゴリ1件 */
export type CategoryOption = {
  id: string;
  label: string;
  count: number;
};

/** 絞り込んだ報告資料を1ページぶん返す */
export async function getBillsSearch(
  params: BillsSearchParams
): Promise<BillsSearchResult> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBillsSearch(
    difficultyLevel,
    params.query,
    params.tagId,
    params.sort === "old",
    params.page
  );
}

const _getCachedBillsSearch = unstable_cache(
  async (
    difficultyLevel: DifficultyLevelEnum,
    query: string,
    tagId: string | null,
    ascending: boolean,
    page: number
  ): Promise<BillsSearchResult> => {
    const { rows, total } = await searchBills({
      difficultyLevel,
      query,
      tagId,
      ascending,
      offset: (page - 1) * BILLS_PER_PAGE,
      limit: BILLS_PER_PAGE,
    });

    return { bills: await toBillsWithContent(rows), total };
  },
  ["bills-search-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);

/**
 * カテゴリのチップに出す一覧。
 *
 * 記事が1件も無いカテゴリは出さない。押しても0件のチップが並ぶと、
 * 絞り込みが壊れているように見える。
 */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  // 件数は記事の公開状態だけで決まる。難易度に左右されない
  return _getCachedCategoryOptions();
}

const _getCachedCategoryOptions = unstable_cache(
  async (): Promise<CategoryOption[]> => {
    const [tags, counts] = await Promise.all([
      findAllTags(),
      countPublishedBillsByTag(),
    ]);

    return tags
      .map((tag) => ({
        id: tag.id,
        label: tag.label,
        count: counts.get(tag.id) ?? 0,
      }))
      .filter((tag) => tag.count > 0)
      .sort((a, b) => b.count - a.count);
  },
  ["category-options-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);
