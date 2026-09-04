/**
 * トップの報告資料検索の状態。
 *
 * 絞り込みはすべて URL に載せる。リンクで完結するので、一覧そのものは
 * Server Component のまま保てる。ブラウザの戻るも効き、条件つきの
 * ページをそのまま共有できる。
 */

/** 並び替えの種類 */
export const BILL_SORT_KEYS = ["new", "old"] as const;
export type BillSortKey = (typeof BILL_SORT_KEYS)[number];

export const BILL_SORT_LABELS: Record<BillSortKey, string> = {
  new: "新しい順",
  old: "古い順",
};

export const DEFAULT_BILL_SORT: BillSortKey = "new";

export function isBillSortKey(value: string): value is BillSortKey {
  return (BILL_SORT_KEYS as readonly string[]).includes(value);
}

/** 1ページに出す件数 */
export const BILLS_PER_PAGE = 20;

export type BillsSearchParams = {
  /** 検索語。空文字は絞り込みなし */
  query: string;
  /** カテゴリ（タグ）id。null は「すべて」 */
  tagId: string | null;
  sort: BillSortKey;
  /** 1始まり */
  page: number;
};

/** ページから渡ってくる生の searchParams */
export type RawSearchParams = {
  q?: string | string[];
  tag?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export const DEFAULT_BILLS_SEARCH_PARAMS: Readonly<BillsSearchParams> = {
  query: "",
  tagId: null,
  sort: DEFAULT_BILL_SORT,
  page: 1,
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** uuid かどうか。存在しないタグidで検索して0件になるのを防ぐ */
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function parseBillsSearchParams(
  raw: RawSearchParams
): BillsSearchParams {
  const query = (firstValue(raw.q) ?? "").trim().slice(0, 100);
  const tag = firstValue(raw.tag);
  const sort = firstValue(raw.sort) ?? "";
  const page = Number.parseInt(firstValue(raw.page) ?? "", 10);

  return {
    query,
    tagId: tag !== undefined && isUuid(tag) ? tag : null,
    sort: isBillSortKey(sort) ? sort : DEFAULT_BILL_SORT,
    page: Number.isFinite(page) && page >= 1 ? page : 1,
  };
}

/**
 * いまの絞り込みから1つだけ差し替えたリンクを作る。
 *
 * 既定値はURLに載せない。「すべて・新しい順・1ページ目」がURLに残ると、
 * 共有されたリンクが無駄に長くなるうえ、既定が変わったときに古い値が
 * 固定されてしまう。
 */
export function billsSearchHref(
  current: BillsSearchParams,
  patch: Partial<BillsSearchParams>
): string {
  const next = { ...current, ...patch };

  // 絞り込みを変えたらページは1に戻す。3ページ目のまま別カテゴリへ
  // 移ると、件数が足りず空のページに着く
  const pageReset =
    patch.page === undefined &&
    (patch.query !== undefined ||
      patch.tagId !== undefined ||
      patch.sort !== undefined);

  const params = new URLSearchParams();
  if (next.query !== "") params.set("q", next.query);
  if (next.tagId !== null) params.set("tag", next.tagId);
  if (next.sort !== DEFAULT_BILL_SORT) params.set("sort", next.sort);
  const page = pageReset ? 1 : next.page;
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();
  // 一覧はトップの途中にあるので、絞り込み後はそこへ戻す
  return qs === "" ? "/#search" : `/?${qs}#search`;
}

/** 絞り込みが1つでも掛かっているか */
export function hasActiveFilter(params: BillsSearchParams): boolean {
  return params.query !== "" || params.tagId !== null;
}
