import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";
import { findLatestDietSession } from "../repositories/diet-session-repository";

/**
 * 最新の区議会会期を取得（アクティブかどうかを問わない）
 */
export async function getLatestDietSession(): Promise<DietSession | null> {
  return _getCachedLatestDietSession();
}

const _getCachedLatestDietSession = unstable_cache(
  async (): Promise<DietSession | null> => {
    return findLatestDietSession();
  },
  ["latest-diet-session-v2"], // v2 を付けてキャッシュをクリア済みの状態にする
  {
    revalidate: 3600, // 1時間
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
