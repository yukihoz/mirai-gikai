import type { Database } from "@mirai-gikai/supabase";
import { z } from "zod";

// 既存の型を再利用
export type Bill = Database["public"]["Tables"]["bills"]["Row"];
export type BillUpdate = Database["public"]["Tables"]["bills"]["Update"];
export type BillInsert = Database["public"]["Tables"]["bills"]["Insert"];

// 公開ステータス型
export type BillPublishStatus = "draft" | "published" | "coming_soon";

// 共通のバリデーションスキーマ
const billBaseSchema = z.object({
  name: z
    .string()
    .min(1, "議案名は必須です")
    .max(200, "議案名は200文字以内で入力してください"),
  status: z.enum([
    "preparing",
    "introduced",
    "in_originating_house",
    "in_receiving_house",
    "enacted",
    "rejected",
    "reported",
  ]),
  meeting_body: z.enum([
    "定例会",
    "臨時会",
    "企画総務委員会",
    "区民文教委員会",
    "福祉保健委員会",
    "環境建設委員会",
    "築地等都市基盤対策特別委員会",
    "地域活性化対策特別委員会",
    "子ども子育て・高齢者対策特別委員会",
    "防災等安全対策特別委員会",
    "予算特別委員会",
    "決算特別委員会",
  ]),
  status_note: z
    .string()
    .max(500, "ステータス備考は500文字以内で入力してください")
    .nullable(),
  published_at: z.string().optional(),
  thumbnail_url: z.string().nullable().optional(),
  share_thumbnail_url: z.string().nullable().optional(),
  shugiin_url: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .refine((val) => val === null || val.startsWith("http"), {
      message: "有効なURLを入力してください",
    })
    .optional(),
  is_featured: z.boolean(),
  diet_session_id: z.string().uuid().nullable().optional(),
});

// 更新用スキーマ（既存）
export const billUpdateSchema = billBaseSchema;
export type BillUpdateInput = z.infer<typeof billUpdateSchema>;

// 新規作成用スキーマ
export const billCreateSchema = billBaseSchema;
export type BillCreateInput = z.infer<typeof billCreateSchema>;
