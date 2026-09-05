import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";

// ============================================================
// Bills
// ============================================================

/**
 * 公開済み議案を難易度コンテンツ付きで取得
 */
export async function findPublishedBillsWithContents(
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select(
      `
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
    `
    )
    .eq("publish_status", "published")
    .eq("bill_contents.difficulty_level", difficultyLevel)
    .order("submitted_date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`);
  }

  return data;
}

/**
 * 公開済み議案を1件取得
 */
export async function findPublishedBillById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .eq("publish_status", "published")
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 管理者用: ステータス問わず議案を1件取得
 */
export async function findBillById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 議案のmirai_stanceを取得
 */
export async function findMiraiStanceByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("mirai_stances")
    .select("*")
    .eq("bill_id", billId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 議案のタグを取得
 */
export async function findTagsByBillId(billId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills_tags")
    .select("tags(id, label)")
    .eq("bill_id", billId);

  if (error) {
    return null;
  }

  return data;
}

// ============================================================
// Bill Contents
// ============================================================

/**
 * 指定された難易度の議案コンテンツを取得
 */
export async function findBillContentByDifficulty(
  billId: string,
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bill_contents")
    .select("*")
    .eq("bill_id", billId)
    .eq("difficulty_level", difficultyLevel)
    .single();

  if (error) {
    console.error(`Failed to fetch bill content: ${error.message}`);
    return null;
  }

  return data;
}

// ============================================================
// Tags (bulk)
// ============================================================

import { groupTagsByBillId } from "../../shared/utils/group-tags";

/**
 * 複数のbill_idに紐づくタグを一括取得し、bill_idごとにグループ化して返す
 */
export async function findTagsByBillIds(
  billIds: string[]
): Promise<Map<string, Array<{ id: string; label: string }>>> {
  if (billIds.length === 0) {
    return new Map();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills_tags")
    .select("bill_id, tags(id, label)")
    .in("bill_id", billIds);

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  return groupTagsByBillId(data ?? []);
}

// ============================================================
// Diet Session Bills
// ============================================================

/**
 * 区議会会期IDに紐づく公開済み議案を取得
 */
export async function findPublishedBillsByDietSession(
  dietSessionId: string,
  difficultyLevel: DifficultyLevelEnum
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select(
      `
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
    `
    )
    .eq("diet_session_id", dietSessionId)
    .eq("publish_status", "published")
    .eq("bill_contents.difficulty_level", difficultyLevel)
    .order("status_order", { ascending: true })
    .order("submitted_date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Failed to fetch bills by diet session: ${error.message}`);
  }

  return data;
}

/**
 * 前回の区議会会期の公開済み議案を取得（成立法案を優先、件数制限あり）
 */
/** 一覧に必要な列。どのクエリでも同じ形で返す */
const BILL_LIST_SELECT = `
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
    `;

/**
 * 報告資料の検索。絞り込み・並び替え・ページングをDBで行う。
 *
 * 全件をアプリに持ってきてから絞ると、件数が増えたときに
 * 絞り込みのクリックごとに待ち時間が出る。1年ぶんで約350件、
 * 数年ぶんなら1000件を超えるため、はじめからDBに寄せる。
 */
export async function searchBills(params: {
  difficultyLevel: DifficultyLevelEnum;
  query: string;
  tagId: string | null;
  ascending: boolean;
  offset: number;
  limit: number;
}) {
  const supabase = createAdminClient();

  // 絞り込み・並び替え・ページングはDB関数に任せる。
  // 「記事タイトル・要約・区の正式名称のどれか」という条件は、
  // PostgREST の or が結合先の列を参照できないため書けない。
  const { data, error } = await supabase.rpc("search_chuo_bills", {
    p_difficulty: params.difficultyLevel,
    p_query: params.query,
    // 型定義では非nullだが、関数側は null を「すべて」として扱う
    p_tag_id: params.tagId as string,
    p_ascending: params.ascending,
    p_offset: params.offset,
    p_limit: params.limit,
  });

  if (error) {
    console.error("Failed to search bills:", error);
    return { rows: [], total: 0 };
  }

  const hits = data ?? [];
  if (hits.length === 0) return { rows: [], total: 0 };

  const { data: rows, error: rowsError } = await supabase
    .from("bills")
    .select(BILL_LIST_SELECT)
    .in(
      "id",
      hits.map((h) => h.bill_id)
    )
    .eq("bill_contents.difficulty_level", params.difficultyLevel);

  if (rowsError) {
    console.error("Failed to fetch searched bills:", rowsError);
    return { rows: [], total: 0 };
  }

  // in で引くと順序が崩れる。DB関数が返した並びに戻す
  const byId = new Map((rows ?? []).map((row) => [row.id, row]));
  const ordered = hits
    .map((h) => byId.get(h.bill_id))
    .filter((row): row is NonNullable<typeof row> => row !== undefined);

  return { rows: ordered, total: Number(hits[0]?.total_count ?? 0) };
}

/** カテゴリごとの公開件数。チップに出す数字に使う */
export async function countPublishedBillsByTag(): Promise<Map<string, number>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills_tags")
    .select("tag_id, bills!inner (publish_status)")
    .eq("bills.publish_status", "published");

  if (error) {
    console.error("Failed to count bills by tag:", error);
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.tag_id, (counts.get(row.tag_id) ?? 0) + 1);
  }
  return counts;
}

export async function findPreviousSessionBills(
  dietSessionId: string,
  difficultyLevel: DifficultyLevelEnum,
  limit: number
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bills")
    .select(
      `
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
    `
    )
    .eq("diet_session_id", dietSessionId)
    .eq("publish_status", "published")
    .eq("bill_contents.difficulty_level", difficultyLevel)
    .order("status_order", { ascending: true })
    .order("submitted_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch previous session bills:", error);
    return [];
  }

  return data ?? [];
}

/**
 * 前回の区議会会期の公開済み議案数を取得
 */
export async function countPublishedBillsByDietSession(
  dietSessionId: string,
  difficultyLevel: DifficultyLevelEnum
): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("bills")
    .select("*, bill_contents!inner(difficulty_level)", {
      count: "exact",
      head: true,
    })
    .eq("diet_session_id", dietSessionId)
    .eq("publish_status", "published")
    .eq("bill_contents.difficulty_level", difficultyLevel);

  if (error) {
    console.error("Failed to count previous session bills:", error);
    return 0;
  }

  return count ?? 0;
}

// ============================================================
// Featured
// ============================================================

/** すべてのカテゴリ。featured_priority の有無を問わない */
export async function findAllTags() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, label")
    .order("label");

  if (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }

  return data ?? [];
}

/**
 * featured_priorityが設定されているタグを取得
 */
export async function findFeaturedTags() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, label, description, featured_priority")
    .not("featured_priority", "is", null)
    .order("featured_priority", { ascending: true });

  if (error) {
    console.error("Failed to fetch featured tags:", error);
    return [];
  }

  return data ?? [];
}

/**
 * 特定タグに紐づく公開済み議案を取得（bill_contents + タグ付き）
 */
export async function findPublishedBillsByTag(
  tagId: string,
  difficultyLevel: DifficultyLevelEnum,
  dietSessionId: string | null
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("bills_tags")
    .select(
      `
      bill_id,
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
        ),
        bills_tags!inner (
          tags (
            id,
            label
          )
        )
      )
    `
    )
    .eq("tag_id", tagId)
    .eq("bills.publish_status", "published")
    .eq("bills.bill_contents.difficulty_level", difficultyLevel);

  if (dietSessionId) {
    query = query.eq("bills.diet_session_id", dietSessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Failed to fetch bills for tag:`, error);
    return null;
  }

  return data;
}

/**
 * 注目の議案を取得（is_featured = true）
 */
export async function findFeaturedBillsWithContents(
  difficultyLevel: DifficultyLevelEnum,
  dietSessionId: string | null
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("bills")
    .select(
      `
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
      ),
      tags:bills_tags(
        tag:tags(
          id,
          label
        )
      )
    `
    )
    .eq("is_featured", true)
    .eq("bill_contents.difficulty_level", difficultyLevel)
    .order("submitted_date", { ascending: false, nullsFirst: false });

  if (dietSessionId) {
    query = query.eq("diet_session_id", dietSessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch featured bills:", error);
    return [];
  }

  return data ?? [];
}

// ============================================================
// Coming Soon
// ============================================================

/**
 * Coming Soon議案を取得
 */
export async function findComingSoonBills(dietSessionId: string | null) {
  const supabase = createAdminClient();
  let query = supabase
    .from("bills")
    .select(
      `
      id,
      name,
      meeting_body,
      shugiin_url,
      bill_contents (
        title,
        difficulty_level
      )
    `
    )
    .eq("publish_status", "coming_soon")
    .order("created_at", { ascending: false });

  if (dietSessionId) {
    query = query.eq("diet_session_id", dietSessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch coming soon bills:", error);
    return [];
  }

  return data ?? [];
}

// ============================================================
// Preview Tokens
// ============================================================

/**
 * プレビュートークンを検証
 */
export async function findPreviewToken(billId: string, token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("preview_tokens")
    .select("expires_at")
    .eq("bill_id", billId)
    .eq("token", token)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// ============================================================
// Interview Status
// ============================================================

/**
 * 複数のbill_idに対して、公開中のインタビュー設定があるかを一括判定
 *
 * status="public" のみで判定する。論理削除（deleted_at）された設定は
 * 削除時に status="closed" へ変更されるため、ここで自然に除外される
 * （softDeleteInterviewConfigRecord 参照）。
 */
export async function findBillIdsWithPublicInterview(
  billIds: string[]
): Promise<Set<string>> {
  if (billIds.length === 0) {
    return new Set();
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_configs")
    .select("bill_id")
    .in("bill_id", billIds)
    .eq("status", "public");

  if (error) {
    console.error("Failed to fetch interview configs:", error);
    return new Set();
  }

  return new Set(data.map((row) => row.bill_id));
}
