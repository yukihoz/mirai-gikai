/**
 * 折りたたまずに見せるチップの数。
 *
 * 画面幅にもよるが、おおよそ5行に収まる数。カテゴリは今後増えるので、
 * 全部並べると検索結果が画面の下へ押し出される。
 */
export const VISIBLE_CHIPS = 15;

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
  expanded: boolean
): T[] {
  if (expanded || categories.length <= VISIBLE_CHIPS) return categories;

  const head = categories.slice(0, VISIBLE_CHIPS);
  if (selectedId === null) return head;
  if (head.some((c) => c.id === selectedId)) return head;

  const selected = categories.find((c) => c.id === selectedId);
  return selected === undefined ? head : [...head, selected];
}
