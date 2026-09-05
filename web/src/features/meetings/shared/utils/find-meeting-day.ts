import type { AdjacentMeetingDays, MeetingDaySummary } from "../types";

/** 日付でその日の会議を探す。無ければ null */
export function findMeetingDay(
  days: MeetingDaySummary[],
  date: string
): MeetingDaySummary | null {
  return days.find((day) => day.date === date) ?? null;
}

/**
 * 前後の会議を探す。
 *
 * 渡す配列は新しい順に並んでいる前提なので、ひとつ手前が「次の会議」、
 * ひとつ後ろが「前の会議」になる。端の会議では片方が null。
 */
export function findAdjacentMeetingDays(
  days: MeetingDaySummary[],
  date: string
): AdjacentMeetingDays {
  const index = days.findIndex((day) => day.date === date);
  if (index === -1) return { newer: null, older: null };

  return {
    newer: days[index - 1] ?? null,
    older: days[index + 1] ?? null,
  };
}
