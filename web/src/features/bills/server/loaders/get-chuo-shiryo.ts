import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@mirai-gikai/supabase";
import { CACHE_TAGS } from "@/lib/cache-tags";

/** 議案のもとになった委員会資料 */
export type ChuoShiryo = {
  /** 委員会の開会日程ページ */
  meetingUrl: string;
  /** 資料PDF（中央区議会サイト） */
  shiryoUrl: string;
  /** 資料の1ページ目を画像にしたもの。無ければ null */
  shiryoImageUrl: string | null;
  /** 画像の実寸。資料は縦長・横長どちらもある */
  shiryoImageWidth: number | null;
  shiryoImageHeight: number | null;
  shiryoNumber: number | null;
  committee: string;
  meetingDate: string;
};

/**
 * 議案がどの委員会資料から作られたかを引く。
 *
 * 中央区版だけの対応なので、本家の `bills` には列を足さず別テーブルに
 * 持っている（`chuo_bill_sources`）。対応が無い議案（AIインタビュー等）は
 * null を返す。
 */
export async function getChuoShiryo(
  billId: string
): Promise<ChuoShiryo | null> {
  return unstable_cache(
    async (): Promise<ChuoShiryo | null> => {
      const { data, error } = await createAdminClient()
        .from("chuo_bill_sources")
        .select(
          "meeting_url, shiryo_url, shiryo_image_url, shiryo_image_width, shiryo_image_height, shiryo_number, committee, meeting_date"
        )
        .eq("bill_id", billId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch chuo shiryo:", error.message);
        return null;
      }
      if (data === null) return null;

      return {
        meetingUrl: data.meeting_url,
        shiryoUrl: data.shiryo_url,
        shiryoImageUrl: data.shiryo_image_url,
        shiryoImageWidth: data.shiryo_image_width,
        shiryoImageHeight: data.shiryo_image_height,
        shiryoNumber: data.shiryo_number,
        committee: data.committee,
        meetingDate: data.meeting_date,
      };
    },
    ["chuo-shiryo-v1", billId],
    { revalidate: 600, tags: [CACHE_TAGS.BILLS, `bill-${billId}`] }
  )();
}
