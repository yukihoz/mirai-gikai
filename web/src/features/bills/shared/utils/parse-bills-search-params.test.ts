import { describe, expect, it } from "vitest";
import {
  billsSearchHref,
  DEFAULT_BILLS_SEARCH_PARAMS,
  hasActiveFilter,
  parseBillsSearchParams,
} from "./parse-bills-search-params";

const TAG = "3ac80fed-3679-4c12-94b0-2ff43e60f8ac";

describe("parseBillsSearchParams", () => {
  it("何も無ければ既定値", () => {
    expect(parseBillsSearchParams({})).toEqual(DEFAULT_BILLS_SEARCH_PARAMS);
  });

  it("検索語の前後の空白を落とす", () => {
    expect(parseBillsSearchParams({ q: "  保育  " }).query).toBe("保育");
  });

  it("uuidでないタグは無視する", () => {
    // 存在しないidで検索して0件になるのを防ぐ
    expect(parseBillsSearchParams({ tag: "子育て" }).tagId).toBeNull();
    expect(parseBillsSearchParams({ tag: TAG }).tagId).toBe(TAG);
  });

  it("知らない並び順は既定に落とす", () => {
    expect(parseBillsSearchParams({ sort: "random" }).sort).toBe("new");
    expect(parseBillsSearchParams({ sort: "old" }).sort).toBe("old");
  });

  it("ページ番号は1以上の整数だけ受ける", () => {
    expect(parseBillsSearchParams({ page: "3" }).page).toBe(3);
    expect(parseBillsSearchParams({ page: "0" }).page).toBe(1);
    expect(parseBillsSearchParams({ page: "-2" }).page).toBe(1);
    expect(parseBillsSearchParams({ page: "abc" }).page).toBe(1);
  });

  it("同じキーが複数来たら先頭を使う", () => {
    expect(parseBillsSearchParams({ q: ["保育", "介護"] }).query).toBe("保育");
  });

  it("極端に長い検索語は切り詰める", () => {
    expect(parseBillsSearchParams({ q: "あ".repeat(500) }).query).toHaveLength(
      100
    );
  });
});

describe("billsSearchHref", () => {
  it("既定値はURLに載せない", () => {
    expect(billsSearchHref(DEFAULT_BILLS_SEARCH_PARAMS, {})).toBe("/#search");
  });

  it("絞り込みを1つだけ差し替える", () => {
    const href = billsSearchHref(DEFAULT_BILLS_SEARCH_PARAMS, { tagId: TAG });
    expect(href).toBe(`/?tag=${TAG}#search`);
  });

  it("絞り込みを変えたらページを1に戻す", () => {
    // 3ページ目のまま別カテゴリへ移ると空のページに着く
    const current = { ...DEFAULT_BILLS_SEARCH_PARAMS, page: 3 };
    expect(billsSearchHref(current, { tagId: TAG })).toBe(
      `/?tag=${TAG}#search`
    );
  });

  it("ページ送りではページを保つ", () => {
    const current = { ...DEFAULT_BILLS_SEARCH_PARAMS, tagId: TAG };
    expect(billsSearchHref(current, { page: 2 })).toBe(
      `/?tag=${TAG}&page=2#search`
    );
  });

  it("検索語と並び順を同時に載せる", () => {
    const current = { ...DEFAULT_BILLS_SEARCH_PARAMS, query: "保育" };
    expect(billsSearchHref(current, { sort: "old" })).toBe(
      "/?q=%E4%BF%9D%E8%82%B2&sort=old#search"
    );
  });
});

describe("hasActiveFilter", () => {
  it("検索語かカテゴリがあれば true", () => {
    expect(hasActiveFilter(DEFAULT_BILLS_SEARCH_PARAMS)).toBe(false);
    expect(
      hasActiveFilter({ ...DEFAULT_BILLS_SEARCH_PARAMS, query: "保育" })
    ).toBe(true);
    expect(
      hasActiveFilter({ ...DEFAULT_BILLS_SEARCH_PARAMS, tagId: TAG })
    ).toBe(true);
  });

  it("並び順やページは絞り込みに数えない", () => {
    expect(
      hasActiveFilter({ ...DEFAULT_BILLS_SEARCH_PARAMS, sort: "old", page: 2 })
    ).toBe(false);
  });
});
