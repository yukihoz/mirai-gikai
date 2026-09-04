import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

/** 委員会で交わされた質疑1件（論点単位） */
export type ChuoDiscussion = {
  id: string;
  title: string;
  question: string;
  questioners: string[];
  answer: string;
  answerers: string[];
};

/**
 * 議案（＝委員会資料）に紐づく質疑を返す。
 *
 * 会議録は資料の公開から数か月遅れて出るため、質疑がまだ無い記事も多い。
 * 空配列のときは表示側でセクションごと出さない。
 */
export async function getChuoDiscussions(
  billId: string
): Promise<ChuoDiscussion[]> {
  return unstable_cache(
    async (): Promise<ChuoDiscussion[]> => {
      const { data, error } = await createAdminClient()
        .from("chuo_discussions")
        .select("id, title, question, questioners, answer, answerers")
        .eq("bill_id", billId)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch chuo discussions:", error.message);
        return [];
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        question: row.question,
        questioners: row.questioners,
        answer: row.answer,
        answerers: row.answerers,
      }));
    },
    ["chuo-discussions-v1", billId],
    { revalidate: 600, tags: [CACHE_TAGS.BILLS, `bill-${billId}`] }
  )();
}
