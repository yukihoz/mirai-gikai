import { describe, expect, it, vi } from "vitest";
import type { ObjectGenerator } from "./generate-explanation";
import {
  generateCategories,
  keepKnownCategories,
} from "./generate-categories";

const CATEGORIES = [
  { id: "t1", label: "👶 子育て・保育園" },
  { id: "t2", label: "💻 デジタル・DX" },
  { id: "t3", label: "👵 高齢者・介護" },
];

const input = {
  title: "病児・病後児保育事業における事前登録方法の見直しについて",
  articleTitle: "病児・病後児保育の事前登録をオンライン化",
  summary: "事前登録がLoGoフォームでまとめてできるようになります。",
  sourceText: "病児・病後児保育の事前登録について…",
  categories: CATEGORIES,
};

function fakeGenerator(value: unknown) {
  const generate: ObjectGenerator = async () => value as never;
  return generate;
}

describe("keepKnownCategories", () => {
  it("一覧にあるラベルをIDにする", () => {
    expect(
      keepKnownCategories(["👶 子育て・保育園", "💻 デジタル・DX"], CATEGORIES)
    ).toEqual(["t1", "t2"]);
  });

  it("一覧に無いラベルは捨てる", () => {
    // それらしい名前を作ってくることがある。残すと誰も辿れない分類が増える
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      keepKnownCategories(["👶 子育て・保育園", "🚀 宇宙開発"], CATEGORIES)
    ).toEqual(["t1"]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("前後の空白は無視する", () => {
    expect(keepKnownCategories([" 💻 デジタル・DX "], CATEGORIES)).toEqual([
      "t2",
    ]);
  });

  it("同じものを2回選んでも1つにする", () => {
    expect(
      keepKnownCategories(["👶 子育て・保育園", "👶 子育て・保育園"], CATEGORIES)
    ).toEqual(["t1"]);
  });

  it("何も選ばれなければ空で返す", () => {
    expect(keepKnownCategories([], CATEGORIES)).toEqual([]);
  });
});

describe("generateCategories", () => {
  it("選ばれたカテゴリをIDで返す", async () => {
    const generate = fakeGenerator({
      categories: ["👶 子育て・保育園", "💻 デジタル・DX"],
    });

    await expect(generateCategories({ input, generate })).resolves.toEqual([
      "t1",
      "t2",
    ]);
  });

  it("カテゴリが1件も無ければモデルを呼ばない", async () => {
    const generate = vi.fn();

    await expect(
      generateCategories({
        input: { ...input, categories: [] },
        generate: generate as unknown as ObjectGenerator,
      })
    ).resolves.toEqual([]);
    expect(generate).not.toHaveBeenCalled();
  });

  it("形式が違えば空で返す", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const generate = fakeGenerator({ categories: "子育て" });

    await expect(generateCategories({ input, generate })).resolves.toEqual([]);
    warn.mockRestore();
  });
});
