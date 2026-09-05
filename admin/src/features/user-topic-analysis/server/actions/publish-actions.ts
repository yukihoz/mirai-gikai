"use server";

import { setVersionPublished } from "@mirai-gikai/topic-analysis-core/repository";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/server/lib/auth-server";
import { routes } from "@/lib/routes";
import {
  invalidateWebCache,
  WEB_CACHE_TAGS,
} from "@/lib/utils/cache-invalidation";

/** Admin による version の公開／非公開切替（§7）。 */
export async function setVersionPublishedAction(input: {
  versionId: string;
  billId: string;
  published: boolean;
}): Promise<void> {
  await requireAdmin();
  await setVersionPublished(input.versionId, input.published);
  revalidatePath(routes.billUserTopicAnalysis(input.billId));
  // 記事ページのトピック分析は web 側でもキャッシュしている。
  // 取り下げをすぐ反映させるため、そちらにも伝える
  await invalidateWebCache([WEB_CACHE_TAGS.BILLS]);
}
