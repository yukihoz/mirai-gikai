/**
 * 折りたたまずに見せるチップの数。
 *
 * 「すべて」を含めて5行に収める。カテゴリ名は6〜10文字あり、狭い画面では
 * 1行に1〜2個しか並ばない。同じ数を出すと、スマホでは検索結果が
 * 画面の下へ押し出されてしまう。
 */
export const VISIBLE_CHIPS = 15;

/** 狭い画面で折りたたまずに見せる数 */
export const VISIBLE_CHIPS_NARROW = 7;

type Category = { id: string; label: string; count: number };

/**
 * 実際に描くカテゴリを選ぶ。
 *
 * 折りたたんでいても、選択中のカテゴリは必ず見せる。折りたたみの外に
 * あると、押したカテゴリが消えたように見えて絞り込みが壊れて感じられる。
 */
export function visibleCategories<T extends Category>(
  categories: T[],
  selectedId: string | null,
  expanded: boolean,
  limit: number = VISIBLE_CHIPS
): T[] {
  if (expanded || categories.length <= limit) return categories;

  const head = categories.slice(0, limit);
  if (selectedId === null) return head;
  if (head.some((c) => c.id === selectedId)) return head;

  const selected = categories.find((c) => c.id === selectedId);
  return selected === undefined ? head : [...head, selected];
}
