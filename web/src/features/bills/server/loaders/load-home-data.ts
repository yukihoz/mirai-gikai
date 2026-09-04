import { getBillsByFeaturedTags } from "@/features/bills/server/loaders/get-bills-by-featured-tags";
import { getComingSoonBills } from "./get-coming-soon-bills";
import { getFeaturedBills } from "./get-featured-bills";
import type { BillsSearchParams } from "../../shared/utils/parse-bills-search-params";
import { getBillsSearch, getCategoryOptions } from "./get-bills-search";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData(searchParams: BillsSearchParams) {
  const [featuredBills, billsByTag, comingSoonBills, searchResult, categories] =
    await Promise.all([
      getFeaturedBills(),
      getBillsByFeaturedTags(),
      getComingSoonBills(),
      getBillsSearch(searchParams),
      getCategoryOptions(),
    ]);

  return {
    billsByTag,
    featuredBills,
    comingSoonBills,
    searchResult,
    categories,
  };
}
