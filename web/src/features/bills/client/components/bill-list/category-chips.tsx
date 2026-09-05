"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import type { CategoryOption } from "../../../server/loaders/get-bills-search";
import {
  type BillsSearchParams,
  billsSearchHref,
} from "../../../shared/utils/parse-bills-search-params";
import {
  getCategoryAppearance,
  toCategoryKey,
} from "../../../shared/utils/category-appearance";
import {
  VISIBLE_CHIPS,
  visibleCategories,
} from "../../../shared/utils/visible-categories";

/**
 * カテゴリの絞り込みチップ。
 *
 * リンクで完結させる。選択状態はURLにあるので、押した先を共有できる。
 * 選んでいるカテゴリが隠れていると押した実感が持てないので、
 * 折りたたんでいても選択中のものは必ず見せる。
 */
export function CategoryChips({
  categories,
  params,
}: {
  categories: CategoryOption[];
  params: BillsSearchParams;
}) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return null;

  const collapsible = categories.length > VISIBLE_CHIPS;
  const shown = visibleCategories(categories, params.tagId, expanded);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Chip
          href={billsSearchHref(params, { tagId: null }) as Route}
          active={params.tagId === null}
          label="すべて"
        />
        {shown.map((category) => (
          <Chip
            key={category.id}
            href={billsSearchHref(params, { tagId: category.id }) as Route}
            active={params.tagId === category.id}
            label={category.label}
            count={category.count}
          />
        ))}
      </div>

      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 self-start text-sm text-mirai-text-secondary hover:opacity-70"
        >
          {expanded ? (
            <>
              閉じる
              <ChevronUp className="size-4" aria-hidden="true" />
            </>
          ) : (
            <>
              カテゴリをもっと見る（残り{categories.length - VISIBLE_CHIPS}件）
              <ChevronDown className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      )}
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
  // 「すべて」はカテゴリではないのでアイコンを付けない
  const appearance = count === undefined ? null : getCategoryAppearance(label);
  const Icon = appearance?.icon;

  return (
    <Link
      href={href}
      // 件数を別要素にしているので、読み上げ名は自前で組み立てる。
      // 絵文字は読み上げると無関係な語になるので外す
      aria-label={
        count === undefined ? label : `${toCategoryKey(label)} ${count}件`
      }
      // 押している／いないを表すので aria-current ではなく aria-pressed
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary-accent bg-primary-accent/15 font-bold text-mirai-text"
          : "border-mirai-border bg-white text-mirai-text-secondary hover:bg-muted/50"
      }`}
    >
      {Icon !== undefined && (
        <Icon
          className={`size-4 shrink-0 ${appearance?.icon_color}`}
          aria-hidden="true"
        />
      )}
      {count === undefined ? label : toCategoryKey(label)}
      {count !== undefined && (
        <span className="text-xs text-mirai-text-muted">{count}</span>
      )}
    </Link>
  );
}
