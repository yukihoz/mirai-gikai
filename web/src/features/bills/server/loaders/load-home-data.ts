import { getBillsByFeaturedTags } from "@/features/bills/server/loaders/get-bills-by-featured-tags";
import { getComingSoonBills } from "./get-coming-soon-bills";
import { getFeaturedBills } from "./get-featured-bills";
import { getBillsByMeetingBody, getRecentBills } from "./get-recent-bills";

/**
 * トップページ用のデータを並列取得する
 * BFF (Backend For Frontend) パターン
 */
export async function loadHomeData() {
  const [
    featuredBills,
    billsByTag,
    comingSoonBills,
    recentBills,
    byMeetingBody,
  ] = await Promise.all([
    getFeaturedBills(),
    getBillsByFeaturedTags(),
    getComingSoonBills(),
    getRecentBills(),
    getBillsByMeetingBody(),
  ]);

  return {
    billsByTag,
    featuredBills,
    comingSoonBills,
    recentBills,
    byMeetingBody,
  };
}
