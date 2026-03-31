import "server-only";
import { createAdminClient } from "@mirai-gikai/supabase";
import type { DietSession } from "../../shared/types";

/**
 * アクティブな区議会会期を取得
 */
export async function findActiveDietSession(): Promise<DietSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch active diet session:", error);
    return null;
  }

  return data;
}

/**
 * 指定日時点で開催中の区議会会期を取得
 */
export async function findCurrentDietSession(
  targetDate: string
): Promise<DietSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .lte("start_date", targetDate)
    .gte("end_date", targetDate)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch current diet session:", error);
    return null;
  }

  return data;
}

/**
 * slugで区議会会期を取得
 */
export async function findDietSessionBySlug(
  slug: string
): Promise<DietSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch diet session by slug:", error);
    return null;
  }

  return data;
}

/**
 * 指定日より前の直近の区議会会期を取得
 */
export async function findPreviousDietSession(
  beforeStartDate: string
): Promise<DietSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .lt("start_date", beforeStartDate)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch previous diet session:", error);
    return null;
  }

  return data;
}
/**
 * 最も新しい区議会会期を取得（is_activeを問わない）
 */
export async function findLatestDietSession(): Promise<DietSession | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .order("is_active", { ascending: false })
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch latest diet session:", error);
    return null;
  }

  return data;
}

/**
 * すべての区議会会期を降順（開始日が新しい順）で取得
 */
export async function findAllDietSessions(): Promise<DietSession[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("diet_sessions")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch all diet sessions:", error);
    return [];
  }

  return data;
}
