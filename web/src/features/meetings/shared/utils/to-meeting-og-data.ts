import type { MeetingDay } from "../types";
import { formatMeetingCommittees } from "./format-committee-names";

/** OGP画像に並べる報告資料の件数 */
export const OG_TITLE_COUNT = 4;

/** 1件あたりの文字数。長い件名は画像からはみ出す */
export const OG_TITLE_MAX_LENGTH = 30;

/** OGP画像に描く内容 */
export type MeetingOgData = {
  /** YYYY-MM-DD */
  date: string;
  /** 委員会名（複数開かれた日は中黒でつないだもの） */
  committees: string;
  billCount: number;
  /** 先頭から数件の見出し */
  titles: string[];
  /** 画像に載せきれなかった件数。0 なら全部載っている */
  restCount: number;
};

/**
 * 会議のまとめから、OGP画像に描く内容を取り出す。
 *
 * 画像に入る量は決まっているので、件名は数を絞って長さも切る。
 * 切った件数は「ほかN件」として残し、その日の分量が伝わるようにする。
 */
export function toMeetingOgData(day: MeetingDay): MeetingOgData {
  const titles = day.committees
    .flatMap((committee) => committee.bills)
    .map((bill) => bill.bill_content?.title || bill.name);

  return {
    date: day.date,
    committees: formatMeetingCommittees(day.committees),
    billCount: day.billCount,
    titles: titles.slice(0, OG_TITLE_COUNT).map(truncate),
    restCount: Math.max(titles.length - OG_TITLE_COUNT, 0),
  };
}

function truncate(title: string): string {
  if (title.length <= OG_TITLE_MAX_LENGTH) return title;
  return `${title.slice(0, OG_TITLE_MAX_LENGTH)}…`;
}
