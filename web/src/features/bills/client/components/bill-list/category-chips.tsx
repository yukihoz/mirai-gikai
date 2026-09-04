import type { Route } from "next";
import Link from "next/link";
import type { CategoryOption } from "../../../server/loaders/get-bills-search";
import {
  type BillsSearchParams,
  billsSearchHref,
} from "../../../shared/utils/parse-bills-search-params";

/**
 * カテゴリの絞り込みチップ。
 *
 * リンクで完結させる。選択状態はURLにあるので、押した先を共有できる。
 */
export function CategoryChips({
  categories,
  params,
}: {
  categories: CategoryOption[];
  params: BillsSearchParams;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Chip
        href={billsSearchHref(params, { tagId: null }) as Route}
        active={params.tagId === null}
        label="すべて"
      />
      {categories.map((category) => (
        <Chip
          key={category.id}
          href={billsSearchHref(params, { tagId: category.id }) as Route}
          active={params.tagId === category.id}
          label={category.label}
          count={category.count}
        />
      ))}
    </div>
  );
}

function Chip({
  href,
  active,
  label,
  count,
}: {
  href: Route;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      // 件数を別要素にしているので、読み上げ名は自前で組み立てる
      aria-label={count === undefined ? label : `${label} ${count}件`}
      // 押している／いないを表すので aria-current ではなく aria-pressed
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary-accent bg-primary-accent/15 font-bold text-mirai-text"
          : "border-mirai-border bg-white text-mirai-text-secondary hover:bg-muted/50"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="text-xs text-mirai-text-muted">{count}</span>
      )}
    </Link>
  );
}
