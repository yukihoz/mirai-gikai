import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { DietSession } from "../../shared/types";
import { findAllDietSessions } from "../repositories/diet-session-repository";

/**
 * すべての区議会会期を降順で取得
 */
export async function getAllDietSessions(): Promise<DietSession[]> {
  return _getCachedAllDietSessions();
}

const _getCachedAllDietSessions = unstable_cache(
  async (): Promise<DietSession[]> => {
    return findAllDietSessions();
  },
  ["all-diet-sessions"],
  {
    revalidate: 3600, // 1 hour
    tags: [CACHE_TAGS.DIET_SESSIONS],
  }
);
