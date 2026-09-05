import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import type { BillRow } from "@/features/bills/server/utils/to-bills-with-content";
import type { MeetingDayRow } from "../../shared/utils/group-meeting-days";

/**
 * 1回のリクエストで取る行数。
 *
 * PostgREST は `max_rows`（このプロジェクトでは1000）を超えた分を
 * 黙って捨てる。資料は取り込みのたびに増えていくので、上限に達した日から
 * 古い月が一覧・sitemap・記事の導線から静かに消える。範囲を切って
 * 取り切るまで繰り返す。
 */
const PAGE_SIZE = 1000;

/**
 * 会議のあった日を、公開済みの資料から引く。
 *
 * 絞り込みはまとめページと必ず揃える。片方だけが説明の詳しさで絞ると、
 * 一覧の「報告資料N件」がまとめページの中身と食い違い、一覧に出ている日を
 * 開いたら404、ということも起こる。
 *
 * 集計はアプリ側でやる。行は日付と委員会名だけで、まとめた結果は
 * 10分キャッシュするため、DB関数を足すほどではない。
 */
export async function findPublishedMeetingDayRows(
  difficultyLevel: DifficultyLevelEnum
): Promise<MeetingDayRow[]> {
  const supabase = createAdminClient();
  const rows: MeetingDayRow[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("chuo_bill_sources")
      .select(
        "meeting_date, committee, bills!inner(id, bill_contents!inner(id))"
      )
      .eq("bills.publish_status", "published")
      .eq("bills.bill_contents.difficulty_level", difficultyLevel)
      .order("meeting_date", { ascending: false })
      .order("shiryo_url", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch meeting days: ${error.message}`);
    }

    for (const row of data) {
      rows.push({ date: row.meeting_date, committee: row.committee });
    }

    if (data.length < PAGE_SIZE) return rows;
  }
}

/** 1日ぶんの資料。委員会と資料番号を、議案の行に添えて返す */
export type MeetingBillRow = {
  committee: string;
  meetingUrl: string;
  minutesUrl: string | null;
  shiryoNumber: number | null;
  bill: BillRow;
};

/**
 * その日に出された資料を、委員会での並び順（資料番号）で引く。
 *
 * 資料番号は委員会の次第の順なので、そのまま出せばその日の議事の
 * 流れになる。番号が取れなかった資料は末尾に置く。
 */
export async function findPublishedMeetingBillRows(params: {
  date: string;
  difficultyLevel: DifficultyLevelEnum;
}): Promise<MeetingBillRow[]> {
  const { data, error } = await createAdminClient()
    .from("chuo_bill_sources")
    .select(
      `
      committee,
      meeting_url,
      minutes_url,
      shiryo_number,
      bills!inner (
        *,
        bill_contents!inner (
          id,
          bill_id,
          title,
          summary,
          content,
          difficulty_level,
          created_at,
          updated_at
        )
      )
    `
    )
    .eq("meeting_date", params.date)
    .eq("bills.publish_status", "published")
    .eq("bills.bill_contents.difficulty_level", params.difficultyLevel)
    .order("shiryo_number", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch meeting bills: ${error.message}`);
  }

  return data.map((row) => ({
    committee: row.committee,
    meetingUrl: row.meeting_url,
    minutesUrl: row.minutes_url,
    shiryoNumber: row.shiryo_number,
    bill: row.bills as BillRow,
  }));
}
