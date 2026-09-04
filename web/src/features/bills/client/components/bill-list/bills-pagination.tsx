import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  BILLS_PER_PAGE,
  type BillsSearchParams,
  billsSearchHref,
} from "../../../shared/utils/parse-bills-search-params";

/**
 * ページ送り。
 *
 * 番号を全部並べるとページ数が増えたときに折り返すので、
 * 前後と現在地だけを出す。件数は上の見出しに出ている。
 */
export function BillsPagination({
  params,
  total,
}: {
  params: BillsSearchParams;
  total: number;
}) {
  const lastPage = Math.max(1, Math.ceil(total / BILLS_PER_PAGE));
  if (lastPage <= 1) return null;

  const page = Math.min(params.page, lastPage);

  return (
    <nav
      aria-label="ページ送り"
      className="flex items-center justify-center gap-4 pt-2"
    >
      <PageLink
        href={billsSearchHref(params, { page: page - 1 }) as Route}
        disabled={page <= 1}
        label="前へ"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        前へ
      </PageLink>

      <span className="text-sm text-mirai-text-muted" aria-current="page">
        {page} / {lastPage}
      </span>

      <PageLink
        href={billsSearchHref(params, { page: page + 1 }) as Route}
        disabled={page >= lastPage}
        label="次へ"
      >
        次へ
        <ChevronRight className="size-4" aria-hidden="true" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: Route;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex items-center gap-1 text-sm text-mirai-text-placeholder"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-70"
    >
      {children}
    </Link>
  );
}
