import { formatDate } from "@/lib/utils/date";

/**
 * 会議まとめページの日付まわり。
 *
 * 日付がそのままURLになるので、受け取る形を狭くしておく。
 */

const jstWeekdayFormat = new Intl.DateTimeFormat("ja-JP", {
  weekday: "short",
  timeZone: "Asia/Tokyo",
});

/**
 * URLの日付パラメータを検査して、そのまま返す。形が違えば null。
 *
 * 実在しない日も弾く。`new Date("2026-02-30")` は3月2日に繰り上がるので、
 * 素通しすると存在しない日のページがいくらでも作れてしまう。
 */
export function parseMeetingDateParam(param: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(param);
  if (match === null) return null;

  const [, year, month, day] = match;
  const date = new Date(`${param}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  // 繰り上がっていないかを、組み立て直して確かめる
  if (date.getUTCFullYear() !== Number(year)) return null;
  if (date.getUTCMonth() + 1 !== Number(month)) return null;
  if (date.getUTCDate() !== Number(day)) return null;

  return param;
}

/** 2026年2月6日（金） */
export function formatMeetingDate(date: string): string {
  const weekday = formatWeekday(date);
  if (weekday === "") return "";
  return `${formatDate(date)}（${weekday}）`;
}

/**
 * 一覧の日付欄に出す「日」だけ（例: 6）。
 *
 * 渡すのは YYYY-MM-DD だけ。DBの日付か `parseMeetingDateParam` を
 * 通した値しか来ないので、ここでは形を検査しない。
 */
export function toDayOfMonth(date: string): number {
  return Number(date.slice(8, 10));
}

/** 曜日1文字（例: 金） */
export function formatWeekday(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return jstWeekdayFormat.format(parsed);
}

/** 一覧の見出しに使う月のキー（例: 2026-02） */
export function toMonthKey(date: string): string {
  return date.slice(0, 7);
}

/** 2026-02 → 2026年2月 */
export function formatMonthKey(monthKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (match === null) return monthKey;

  const [, year, month] = match;
  return `${year}年${Number(month)}月`;
}
