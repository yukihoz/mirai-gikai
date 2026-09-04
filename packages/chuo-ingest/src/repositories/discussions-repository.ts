import { createAdminClient } from "@mirai-gikai/supabase";
import type { DiscussionTopic } from "../shared/schemas";

export { finishRun, startRun } from "./ingest-repository";

/** 質疑を紐づける対象の委員会 */
export type MeetingToLink = {
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  meetingDate: string;
  reports: { billId: string; shiryoNumber: number; title: string }[];
};

/**
 * 質疑をまだ紐づけていない委員会を、資料つきで返す。
 *
 * 資料単位ではなく会議単位でまとめる。議事録は会議ごとに1回だけ
 * モデルに渡すため（資料ごとに呼ぶと同じ議事録を資料の数だけ読ませる）。
 */
export async function findMeetingsToLink(params: {
  from?: string;
  to?: string;
  includeLinked?: boolean;
}): Promise<MeetingToLink[]> {
  let query = createAdminClient()
    .from("chuo_bill_sources")
    .select("bill_id, committee, meeting_date, shiryo_number, bills(name)")
    .not("shiryo_number", "is", null)
    .order("meeting_date", { ascending: true });

  if (params.from !== undefined) query = query.gte("meeting_date", params.from);
  if (params.to !== undefined) query = query.lte("meeting_date", params.to);
  if (params.includeLinked !== true) {
    query = query.is("discussions_linked_at", null);
  }

  const { data, error } = await query;
  if (error) throw new Error(`対象の委員会を読めなかった: ${error.message}`);

  const byMeeting = new Map<string, MeetingToLink>();
  for (const row of data ?? []) {
    if (row.shiryo_number === null) continue;
    const key = `${row.meeting_date}|${row.committee}`;
    const meeting = byMeeting.get(key) ?? {
      committee: row.committee,
      meetingDate: row.meeting_date,
      reports: [],
    };
    meeting.reports.push({
      billId: row.bill_id,
      shiryoNumber: row.shiryo_number,
      // 議案名は区民向けの言い換え。資料の対応づけには十分な手がかりになる
      title: (row.bills as { name: string } | null)?.name ?? "",
    });
    byMeeting.set(key, meeting);
  }

  return [...byMeeting.values()].map((m) => ({
    ...m,
    reports: m.reports.sort((a, b) => a.shiryoNumber - b.shiryoNumber),
  }));
}

/**
 * 1つの資料の質疑を入れ替える。
 *
 * 作り直しのときに古い論点が残らないよう、消してから入れる。
 */
export async function replaceDiscussions(params: {
  billId: string;
  topics: DiscussionTopic[];
}): Promise<void> {
  const client = createAdminClient();

  const removed = await client
    .from("chuo_discussions")
    .delete()
    .eq("bill_id", params.billId);
  if (removed.error) {
    throw new Error(`古い質疑を消せなかった: ${removed.error.message}`);
  }

  if (params.topics.length === 0) return;

  const { error } = await client.from("chuo_discussions").insert(
    params.topics.map((topic, index) => ({
      bill_id: params.billId,
      display_order: index,
      title: topic.title,
      question: topic.question,
      questioners: topic.questioners,
      answer: topic.answer,
      answerers: topic.answerers,
    }))
  );
  if (error) throw new Error(`質疑を保存できなかった: ${error.message}`);
}

/**
 * 会議録を読んだ資料に印を付け、会議録へのリンクを持たせる。
 *
 * 質疑が付かなかった資料にも印を付ける。付けないと、次の実行でまた同じ
 * 議事録をモデルに読ませることになる。
 */
export async function markDiscussionsLinked(params: {
  billIds: string[];
  /** みえる議会の会議録へのリンク（質疑の先頭を指す） */
  minutesUrl: string | null;
}): Promise<void> {
  if (params.billIds.length === 0) return;

  const { error } = await createAdminClient()
    .from("chuo_bill_sources")
    .update({
      discussions_linked_at: new Date().toISOString(),
      minutes_url: params.minutesUrl,
    })
    .in("bill_id", params.billIds);

  if (error) {
    throw new Error(`質疑の紐づけを記録できなかった: ${error.message}`);
  }
}
