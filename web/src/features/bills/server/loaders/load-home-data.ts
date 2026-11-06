import { getBillsByFeaturedTags } from "@/features/bills/server/loaders/get-bills-by-featured-tags";
import { getComingSoonBills } from "./get-coming-soon-bills";
import { getFeaturedBills } from "./get-featured-bills";
import { getInterviewOpenBills } from "./get-interview-open-bills";
import { getPastSessionsWithBillCount } from "./get-past-sessions-with-bill-count";
import type { BillsSearchParams } from "../../shared/utils/parse-bills-search-params";
import { getBillsSearch, getCategoryOptions } from "./get-bills-search";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData(searchParams?: BillsSearchParams) {
  const [
    featuredBills,
    billsByTag,
    interviewOpenBills,
    comingSoonBills,
    pastSessions,
    searchResult,
    categories,
  ] = await Promise.all([
    getFeaturedBills(),
    getBillsByFeaturedTags(),
    getInterviewOpenBills(),
    getComingSoonBills(),
    getPastSessionsWithBillCount(),
    searchParams ? getBillsSearch(searchParams) : Promise.resolve(null),
    getCategoryOptions(),
  ]);

  return {
    billsByTag,
    featuredBills,
    interviewOpenBills,
    comingSoonBills,
    pastSessions,
    searchResult,
    categories,
  };
}
