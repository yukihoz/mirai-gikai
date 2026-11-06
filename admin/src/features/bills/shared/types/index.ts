import type { Database } from "@mirai-gikai/supabase";

export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];

export type BillStatus = Database["public"]["Enums"]["bill_status_enum"];
export type BillPublishStatus =
  Database["public"]["Enums"]["bill_publish_status"];
// bills.meeting_body は text。委員会名は区が決めるもので、
// アプリが値の集合を持たない（数年ごとに組み替えられる）。
export type MeetingBody =
  Database["public"]["Tables"]["bills"]["Row"]["meeting_body"];
export type OriginatingHouse = Database["public"]["Enums"]["house_enum"];
export type BillArticleKind = Database["public"]["Enums"]["bill_article_kind"];

export type BillWithContent = Bill & {
  bill_content?: Database["public"]["Tables"]["bill_contents"]["Row"];
};

export type BillWithDietSession = Bill & {
  diet_sessions: { name: string } | null;
};

import type { SortConfig } from "@/lib/sort";

// ソート関連の型定義
export type BillSortField =
  | "created_at"
  | "submitted_date"
  | "status_order"
  | "publish_status_order";

export const BILL_SORT_FIELDS: readonly BillSortField[] = [
  "created_at",
  "submitted_date",
  "status_order",
  "publish_status_order",
] as const;

export type BillSortConfig = SortConfig<BillSortField>;

export const DEFAULT_BILL_SORT: BillSortConfig = {
  field: "created_at",
  order: "desc",
};

// ステータスのソート順（DBのstatus_order generated columnと一致させる）
export const BILL_STATUS_ORDER: Record<BillStatus, number> = {
  enacted: 0,
  rejected: 1,
  in_receiving_house: 2,
  in_originating_house: 3,
  opinion_gathering: 4,
  introduced: 5,
  preparing: 6,
  reported: 7,
};

// House display mapping
export const HOUSE_LABELS: Record<OriginatingHouse, string> = {
  HR: "衆議院",
  HC: "参議院",
};

export const ARTICLE_KIND_LABELS: Record<BillArticleKind, string> = {
  standard: "通常版",
  ai_generated: "AI自動生成版",
};

// ステータスを日本語ラベルに変換する関数
export function getBillStatusLabel(
  status: BillStatus,
  meetingBody?: MeetingBody | null
): string {
  switch (status) {
    case "preparing":
      return "準備中";
    case "opinion_gathering":
      return "意見募集";
    case "introduced":
      return "提出済み";
    case "in_originating_house":
      if (meetingBody) {
        return `${meetingBody}審議中`;
      }
      return "審議中";
    case "in_receiving_house":
      return "審議中";
    case "enacted":
      return "成立";
    case "rejected":
      return "否決";
    case "reported":
      return "報告済み";
    default:
      return status;
  }
}
