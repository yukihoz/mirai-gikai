import type { BillWithContent } from "@/features/bills/shared/types";

/**
 * 一覧に出す「会議のあった日」1件。
 *
 * 資料が公開されている日だけが並ぶ。会議そのものの開催日は別に
 * 持っていないので、資料が1件も出なかった日はここに現れない。
 */
export type MeetingDaySummary = {
  /** YYYY-MM-DD */
  date: string;
  /** その日に開かれた委員会。ふつうは1つ */
  committees: string[];
  /** その日の報告資料の数（公開済みのみ） */
  billCount: number;
};

/** まとめページの中の、委員会1つぶん */
export type MeetingCommittee = {
  committee: string;
  /** 中央区議会サイトの開会日程ページ */
  meetingUrl: string;
  /** 正式な会議録。まだ公開されていなければ null */
  minutesUrl: string | null;
  bills: BillWithContent[];
};

/** まとめページ1日ぶん */
export type MeetingDay = {
  /** YYYY-MM-DD */
  date: string;
  committees: MeetingCommittee[];
  billCount: number;
};

/** 前後の会議へのナビに使う、隣り合う日 */
export type AdjacentMeetingDays = {
  /** ひとつ新しい会議。無ければ null */
  newer: MeetingDaySummary | null;
  /** ひとつ古い会議。無ければ null */
  older: MeetingDaySummary | null;
};
