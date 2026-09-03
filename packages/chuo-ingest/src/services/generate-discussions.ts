import {
  buildDiscussionPrompt,
  type DiscussionInput,
} from "../prompts/build-discussion-prompt";
import {
  type MeetingDiscussions,
  meetingDiscussionsSchema,
  type ShiryoDiscussion,
} from "../shared/schemas";
import type { ObjectGenerator } from "./generate-explanation";

export type GenerateDiscussionsParams = {
  input: DiscussionInput;
  generate: ObjectGenerator;
};

/**
 * 委員会1回ぶんの質疑を、資料ごとに切り分けて要約する。
 *
 * 会議単位で1回だけモデルを呼ぶ。資料ごとに呼ぶと、同じ議事録を資料の数だけ
 * 読ませることになり、費用が資料数に比例して膨らむ。1会議の議事録は実測で
 * 16,000トークン程度なので、まとめて渡して問題ない。
 */
export async function generateDiscussions(
  params: GenerateDiscussionsParams
): Promise<ShiryoDiscussion[]> {
  const { input, generate } = params;

  if (input.utterances.length === 0) return [];

  const prompt = buildDiscussionPrompt({ input });
  const raw = await generate<unknown>({
    prompt,
    schema: meetingDiscussionsSchema,
    label: `${input.committee} ${input.date} の質疑`,
  });

  const parsed = meetingDiscussionsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `質疑の形式が想定と違う（${input.committee} ${input.date}）: ${parsed.error.message}`
    );
  }

  return dropUnknownShiryo(parsed.data, input.reports);
}

/**
 * 委員会に出ていない資料番号の質疑を落とす。
 *
 * 資料が7件しかない会議で「資料9」が返ってくることがある。番号の取り違えは
 * 起こるものとして、存在しない資料に紐づいた質疑は捨てる。無理に近い番号へ
 * 寄せると、別の資料のページに関係のない質疑が載る。
 */
export function dropUnknownShiryo(
  generated: MeetingDiscussions,
  reports: { number: number }[]
): ShiryoDiscussion[] {
  const known = new Set(reports.map((r) => r.number));

  return generated.discussions.filter((discussion) => {
    if (known.has(discussion.shiryoNumber)) return true;
    console.warn(
      `[discussions] 資料${discussion.shiryoNumber} は委員会に出ていないため捨てる`
    );
    return false;
  });
}
