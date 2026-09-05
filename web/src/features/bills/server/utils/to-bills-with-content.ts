import "server-only";

import type { BillWithContent } from "../../shared/types";
import {
  findBillIdsWithPublicInterview,
  findTagsByBillIds,
} from "../repositories/bill-repository";

/** リポジトリが返す行。bill_contents は inner join で必ず1件付く */
export type BillRow = {
  id: string;
  bill_contents: unknown;
  [key: string]: unknown;
};

/**
 * 議案の行に、タグとインタビュー有無を足して表示用の形にする。
 *
 * 一覧を出すローダーが増えるたびに同じ組み立てを書いていたので、
 * 1か所にまとめる。タグとインタビューは議案IDでまとめて引くので、
 * 件数が増えてもクエリは2回で済む。
 */
export async function toBillsWithContent(
  rows: BillRow[]
): Promise<BillWithContent[]> {
  if (rows.length === 0) return [];

  const billIds = rows.map((row) => row.id);
  const [tagsByBillId, interviewBillIds] = await Promise.all([
    findTagsByBillIds(billIds),
    findBillIdsWithPublicInterview(billIds),
  ]);

  return rows.map((row) => {
    const { bill_contents, ...bill } = row;
    return {
      ...bill,
      bill_content: Array.isArray(bill_contents) ? bill_contents[0] : undefined,
      tags: tagsByBillId.get(row.id) ?? [],
      hasPublicInterview: interviewBillIds.has(row.id),
    } as BillWithContent;
  });
}
