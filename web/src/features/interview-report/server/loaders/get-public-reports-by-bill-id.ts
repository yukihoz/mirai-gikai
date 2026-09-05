import "server-only";

import { unstable_cache } from "next/cache";
import { shouldDisplayPublicReports } from "@mirai-gikai/shared/report-publication/auto-publish";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  mapPublicInterviewReports,
  type PublicInterviewReportDisplay,
} from "../../shared/utils/public-report-display";
import {
  countPublicReportsByBillId,
  findPublicReportsByBillId,
} from "../repositories/interview-report-repository";

export type PublicInterviewReport = PublicInterviewReportDisplay;

export type PublicReportsResult = {
  reports: PublicInterviewReport[];
  totalCount: number;
};

/**
 * 議案IDから公開インタビューレポート（最大3件）と総件数を取得
 *
 * DBへの問い合わせが2回続くので、記事を開くたびに走ると効く。
 * 記事ページのほかの取得と同じく10分キャッシュに載せる。
 */
export async function getPublicReportsByBillId(
  billId: string
): Promise<PublicReportsResult> {
  return _getCachedPublicReportsByBillId(billId);
}

const _getCachedPublicReportsByBillId = unstable_cache(
  async (billId: string): Promise<PublicReportsResult> => {
    const totalCount = await countPublicReportsByBillId(billId);

    if (!shouldDisplayPublicReports(totalCount)) {
      return { reports: [], totalCount: 0 };
    }

    const rawReports = await findPublicReportsByBillId(billId, 3);
    const reports = mapPublicInterviewReports(rawReports);

    return { reports, totalCount };
  },
  ["public-reports-by-bill-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);
