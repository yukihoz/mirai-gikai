import "server-only";

import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type {
  AdjacentMeetingDays,
  MeetingDaySummary,
} from "../../shared/types";
import {
  findAdjacentMeetingDays,
  findMeetingDay,
} from "../../shared/utils/find-meeting-day";
import {
  groupByMonth,
  type MeetingMonth,
  toMeetingDays,
} from "../../shared/utils/group-meeting-days";
import { findPublishedMeetingDayRows } from "../repositories/meeting-repository";

/** 会議のあった日を、新しい順に全部返す */
export async function getMeetingDays(): Promise<MeetingDaySummary[]> {
  return _getCachedMeetingDays(await getDifficultyLevel());
}

const _getCachedMeetingDays = unstable_cache(
  async (difficultyLevel: DifficultyLevelEnum): Promise<MeetingDaySummary[]> =>
    toMeetingDays(await findPublishedMeetingDayRows(difficultyLevel)),
  ["meeting-days-v1"],
  { revalidate: 600, tags: [CACHE_TAGS.BILLS] }
);

/** 一覧の表示用に、月で束ねたもの */
export async function getMeetingMonths(): Promise<MeetingMonth[]> {
  return groupByMonth(await getMeetingDays());
}

/** その日の会議1件ぶんの概要。記事から会議まとめへ誘導するのに使う */
export async function getMeetingDaySummary(
  date: string
): Promise<MeetingDaySummary | null> {
  return findMeetingDay(await getMeetingDays(), date);
}

/** 前後の会議へのナビに使う、隣り合う日 */
export async function getAdjacentMeetingDays(
  date: string
): Promise<AdjacentMeetingDays> {
  return findAdjacentMeetingDays(await getMeetingDays(), date);
}
