import { describe, expect, it } from "vitest";
import { VISIBLE_CHIPS, visibleCategories } from "./visible-categories";

function categories(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `tag-${i}`,
    label: `カテゴリ${i}`,
    count: n - i,
  }));
}

describe("visibleCategories", () => {
  it("上限以下ならすべて見せる", () => {
    const all = categories(VISIBLE_CHIPS);
    expect(visibleCategories(all, null, false)).toHaveLength(VISIBLE_CHIPS);
  });

  it("上限を超えたら折りたたむ", () => {
    const all = categories(VISIBLE_CHIPS + 5);
    expect(visibleCategories(all, null, false)).toHaveLength(VISIBLE_CHIPS);
  });

  it("開いていればすべて見せる", () => {
    const all = categories(VISIBLE_CHIPS + 5);
    expect(visibleCategories(all, null, true)).toHaveLength(VISIBLE_CHIPS + 5);
  });

  it("隠れる位置のカテゴリを選んでいたら差し込む", () => {
    // 折りたたみの外にあると、押したカテゴリが消えたように見える
    const all = categories(VISIBLE_CHIPS + 5);
    const hidden = all[VISIBLE_CHIPS + 2];
    const shown = visibleCategories(all, hidden.id, false);

    expect(shown).toHaveLength(VISIBLE_CHIPS + 1);
    expect(shown.map((c) => c.id)).toContain(hidden.id);
  });

  it("見えている位置を選んでいるときは増やさない", () => {
    const all = categories(VISIBLE_CHIPS + 5);
    const shown = visibleCategories(all, all[0].id, false);
    expect(shown).toHaveLength(VISIBLE_CHIPS);
  });

  it("知らないidを選んでいても壊れない", () => {
    const all = categories(VISIBLE_CHIPS + 5);
    expect(visibleCategories(all, "無いid", false)).toHaveLength(VISIBLE_CHIPS);
  });

  it("元の配列を書き換えない", () => {
    const all = categories(VISIBLE_CHIPS + 5);
    visibleCategories(all, all[VISIBLE_CHIPS + 1].id, false);
    expect(all).toHaveLength(VISIBLE_CHIPS + 5);
  });
});
