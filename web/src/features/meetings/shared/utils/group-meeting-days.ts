import type { MeetingDaySummary } from "../types";
import { toMonthKey } from "./meeting-date";

/** 日付と委員会だけを持つ行。1行が資料1件にあたる */
export type MeetingDayRow = {
  date: string;
  committee: string;
};

/** 月の見出しと、その月の会議 */
export type MeetingMonth = {
  /** YYYY-MM */
  monthKey: string;
  days: MeetingDaySummary[];
};

/**
 * 資料の行を「会議のあった日」にまとめる。
 *
 * 中央区議会は1日に1つの委員会を開くのがふつうだが、同じ日に複数開く
 * 決まりも無いので、日ごとに委員会の配列を持つ。
 */
export function toMeetingDays(rows: MeetingDayRow[]): MeetingDaySummary[] {
  const byDate = new Map<string, MeetingDaySummary>();

  for (const row of rows) {
    const day = byDate.get(row.date);
    if (day === undefined) {
      byDate.set(row.date, {
        date: row.date,
        committees: [row.committee],
        billCount: 1,
      });
      continue;
    }

    day.billCount += 1;
    if (!day.committees.includes(row.committee)) {
      day.committees.push(row.committee);
    }
  }

  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 月ごとにまとめる。
 *
 * 年度で区切ると、年度が変わった直後に中身のない見出しだけが出る。
 * 会議のあった月だけを見出しにすれば、そういう空振りが起きない。
 *
 * 同じ月がとびとびに現れても見出しは1つにまとめる。直前の要素とだけ
 * 比べると、並びが崩れたときに同じ月の見出しが2つできてしまう。
 */
export function groupByMonth(days: MeetingDaySummary[]): MeetingMonth[] {
  const byMonth = new Map<string, MeetingMonth>();

  for (const day of days) {
    const monthKey = toMonthKey(day.date);
    const month = byMonth.get(monthKey);
    if (month === undefined) {
      byMonth.set(monthKey, { monthKey, days: [day] });
      continue;
    }
    month.days.push(day);
  }

  return [...byMonth.values()];
}
