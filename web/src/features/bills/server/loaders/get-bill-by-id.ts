import { unstable_cache } from "next/cache";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { BillWithContent } from "../../shared/types";
import {
  findPublishedBillById,
  findMiraiStanceByBillId,
  findTagsByBillId,
} from "../repositories/bill-repository";
import { getBillContentWithDifficulty } from "./helpers/get-bill-content";

export async function getBillById(id: string): Promise<BillWithContent | null> {
  const difficultyLevel = await getDifficultyLevel();
  
  // キャッシュをバイパスしてデータベースから直接取得
  const [bill, miraiStance, billContent, billTags] = await Promise.all([
    findPublishedBillById(id),
    findMiraiStanceByBillId(id),
    getBillContentWithDifficulty(id, difficultyLevel),
    findTagsByBillId(id),
  ]);

  if (!bill) {
    console.error("Failed to fetch bill directly from DB");
    return null;
  }

  const tags =
    billTags
      ?.map((bt) => bt.tags)
      .filter((tag): tag is { id: string; label: string } => tag !== null) ||
    [];

  return {
    ...bill,
    mirai_stance: miraiStance || undefined,
    bill_content: billContent || undefined,
    tags,
  };
}
