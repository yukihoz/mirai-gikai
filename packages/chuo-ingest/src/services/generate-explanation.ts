import type { SplitPrompt } from "@mirai-gikai/shared/prompt-safety/untrusted-content";
import {
  buildExplanationPrompt,
  type DifficultyLevel,
  type ExplanationInput,
} from "../prompts/build-explanation-prompt";
import { type Explanation, explanationSchema } from "../shared/schemas";

/**
 * スキーマどおりのオブジェクトを返す生成器。
 *
 * 実体は AI Gateway 越しの `generateObject` になるが、ここでは形だけ決めて
 * 差し替え可能にしておく。プロンプトの組み立てと結果の扱いは、モデルを
 * 呼ばずにテストしたい。
 */
export type ObjectGenerator = <T>(params: {
  prompt: SplitPrompt;
  schema: unknown;
  /** 費用の記録・予算判定に使うラベル */
  label: string;
}) => Promise<T>;

export type GenerateExplanationParams = {
  input: ExplanationInput;
  difficulty: DifficultyLevel;
  generate: ObjectGenerator;
};

/**
 * 資料1件・難易度1つぶんの解説を作る。
 *
 * 返ってきた内容はスキーマで検証する。モデルが空文字や短すぎる本文を
 * 返したときに、そのままDBへ流れて公開されるのを防ぐ。
 */
export async function generateExplanation(
  params: GenerateExplanationParams
): Promise<Explanation> {
  const { input, difficulty, generate } = params;

  const prompt = buildExplanationPrompt({ input, difficulty });
  const raw = await generate<unknown>({
    prompt,
    schema: explanationSchema,
    label: describeInput(input, difficulty),
  });

  const parsed = explanationSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `解説の形式が想定と違う（${describeInput(input, difficulty)}）: ${parsed.error.message}`
    );
  }
  return parsed.data;
}

/** 資料1件について normal / hard の両方を作る */
export async function generateExplanations(params: {
  input: ExplanationInput;
  difficulties: readonly DifficultyLevel[];
  generate: ObjectGenerator;
}): Promise<Record<DifficultyLevel, Explanation | undefined>> {
  const result: Record<string, Explanation | undefined> = {};

  // 直列に呼ぶ。並列にすると1資料で同時に2リクエストが飛び、
  // 予算の積み上げが「使い切ってから止める」形になってしまう。
  for (const difficulty of params.difficulties) {
    result[difficulty] = await generateExplanation({
      input: params.input,
      difficulty,
      generate: params.generate,
    });
  }

  return result as Record<DifficultyLevel, Explanation | undefined>;
}

function describeInput(
  input: ExplanationInput,
  difficulty: DifficultyLevel
): string {
  const number =
    input.shiryoNumber === null ? "資料番号なし" : `資料${input.shiryoNumber}`;
  return `${input.committee} ${input.date} ${number} [${difficulty}]`;
}
