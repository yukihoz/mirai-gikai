import {
  buildCategoryPrompt,
  type CategoryInput,
} from "../prompts/build-category-prompt";
import { categorySelectionSchema } from "../shared/schemas";
import type { ObjectGenerator } from "./generate-explanation";

export type GenerateCategoriesParams = {
  input: CategoryInput;
  generate: ObjectGenerator;
};

/**
 * 資料に付けるカテゴリを選ぶ。
 *
 * 返ってきたラベルは、渡した一覧に実在するものだけを残す。
 * 一覧に無いラベルを作ってくることがあり、そのまま保存すると
 * 誰も辿れないカテゴリが増える。
 */
export async function generateCategories(
  params: GenerateCategoriesParams
): Promise<string[]> {
  const { input, generate } = params;

  if (input.categories.length === 0) return [];

  const raw = await generate<unknown>({
    prompt: buildCategoryPrompt({ input }),
    schema: categorySelectionSchema,
    label: `${input.title} のカテゴリ`,
  });

  const parsed = categorySelectionSchema.safeParse(raw);
  if (!parsed.success) {
    console.warn(`[categories] 形式が想定と違う: ${input.title}`);
    return [];
  }

  return keepKnownCategories(parsed.data.categories, input.categories);
}

/** 一覧に実在するカテゴリだけを、IDにして返す */
export function keepKnownCategories(
  selected: string[],
  known: { id: string; label: string }[]
): string[] {
  const byLabel = new Map(known.map((c) => [c.label, c.id]));
  const ids: string[] = [];

  for (const label of selected) {
    const id = byLabel.get(label.trim());
    if (id === undefined) {
      console.warn(`[categories] 一覧に無いカテゴリを捨てる: ${label}`);
      continue;
    }
    if (!ids.includes(id)) ids.push(id);
  }

  return ids;
}
