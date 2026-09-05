import "server-only";

import { DEFAULT_DIFFICULTY } from "@/features/bill-difficulty/shared/types/index";
import type { MeetingOgData } from "../../shared/utils/to-meeting-og-data";
import { toMeetingOgData } from "../../shared/utils/to-meeting-og-data";
import { getMeetingDayAt } from "./get-meeting-day";

/**
 * OGP画像に描く内容を引く。会議が無ければ null。
 *
 * 説明の詳しさは既定のものに固定する。SNSの取得はCookieを持たないうえ、
 * 同じURLで人によって違う画像が出るのはおかしい。
 */
export async function getMeetingOgData(
  date: string
): Promise<MeetingOgData | null> {
  const day = await getMeetingDayAt(date, DEFAULT_DIFFICULTY);
  if (day === null) return null;

  return toMeetingOgData(day);
}
