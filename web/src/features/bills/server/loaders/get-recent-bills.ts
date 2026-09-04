import "server-only";

import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  findRecentBills,
  findRecentBillsByMeetingBody,
} from "../repositories/bill-repository";
import type { BillWithContent } from "../../shared/types";
import { sortMeetingBodyGroups } from "../../shared/utils/group-by-meeting-body";
import { toBillsWithContent } from "../utils/to-bills-with-content";

/** トップに並べる直近の記事数 */
const RECENT_LIMIT = 8;

/** 会議体ごとに見せる件数 */
const PER_MEETING_BODY = 5;

/** 会議体ごとにまとめた記事 */
export type BillsByMeetingBody = {
  meetingBody: string;
  /** その会議体の公開記事の総数 */
  totalCount: number;
  /** 新しい順に PER_MEETING_BODY 件まで */
  bills: BillWithContent[];
};

/**
 * 直近の記事を会期に関係なく返す。
 *
 * 会期で区切ると、年度が替わった直後は新しい会期に記事が1件も無く、
 * トップが空になる。読み手にとって「直近の報告資料」は年度の切れ目とは
 * 無関係なので、会期をまたいで新しい順に並べる。
 * 会期ごとの一覧は会期ページ（/kokkai/[slug]/bills）が担う。
 */
export async function getRecentBills(): Promise<BillWithContent[]> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedRecentBills(difficultyLevel);
}

const _getCachedRecentBills = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<BillWithContent[]> => {
    const data = await findRecentBills(difficultyLevel, RECENT_LIMIT);
    return await toBillsWithContent(data);
  },
  ["recent-bills-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);

/**
 * 直近の分を除いた記事を、会議体ごとにまとめて返す。
 *
 * 報告資料は委員会ごとに出るので、一覧を全部並べるより
 * 「どの委員会の話か」で辿れるほうが探しやすい。
 */
export async function getBillsByMeetingBody(): Promise<BillsByMeetingBody[]> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedBillsByMeetingBody(difficultyLevel);
}

const _getCachedBillsByMeetingBody = unstable_cache(
  async (
    difficultyLevel: DifficultyLevelEnum
  ): Promise<BillsByMeetingBody[]> => {
    const rows = await findRecentBillsByMeetingBody(difficultyLevel);

    const grouped = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.meeting_body;
      if (key === null) continue;
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }

    // タグとインタビュー有無の問い合わせは、表示する分だけまとめて1回で行う
    const heads = [...grouped.values()].flatMap((all) =>
      all.slice(0, PER_MEETING_BODY)
    );
    const billsById = new Map(
      (await toBillsWithContent(heads)).map((bill) => [bill.id, bill])
    );

    const groups = [...grouped.entries()]
      .map(([meetingBody, all]) => ({
        meetingBody,
        totalCount: all.length,
        bills: all
          .slice(0, PER_MEETING_BODY)
          .map((row) => billsById.get(row.id))
          .filter((bill): bill is BillWithContent => bill !== undefined),
      }))
      .filter((group) => group.bills.length > 0);

    return sortMeetingBodyGroups(groups);
  },
  ["bills-by-meeting-body-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);
