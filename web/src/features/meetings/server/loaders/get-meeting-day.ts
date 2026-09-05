import "server-only";

import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { toBillsWithContent } from "@/features/bills/server/utils/to-bills-with-content";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { MeetingDay } from "../../shared/types";
import { toMeetingCommittees } from "../../shared/utils/to-meeting-committees";
import { findPublishedMeetingBillRows } from "../repositories/meeting-repository";

/**
 * その日の会議のまとめを引く。公開済みの資料が1件も無ければ null。
 *
 * 「会議があったかどうか」ではなく「読めるものがあるかどうか」で決める。
 * 開催日そのものは持っていないので、資料の無い日はページを作らない。
 */
export async function getMeetingDay(date: string): Promise<MeetingDay | null> {
  const difficultyLevel = await getDifficultyLevel();
  return _getCachedMeetingDay(date, difficultyLevel);
}

const _getCachedMeetingDay = unstable_cache(
  async (
    date: string,
    difficultyLevel: DifficultyLevelEnum
  ): Promise<MeetingDay | null> => {
    const rows = await findPublishedMeetingBillRows({ date, difficultyLevel });
    if (rows.length === 0) return null;

    const bills = await toBillsWithContent(rows.map((row) => row.bill));
    const committees = toMeetingCommittees(
      rows.map((row, index) => ({
        committee: row.committee,
        meetingUrl: row.meetingUrl,
        minutesUrl: row.minutesUrl,
        bill: bills[index],
      }))
    );

    return { date, committees, billCount: bills.length };
  },
  ["meeting-day-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);
