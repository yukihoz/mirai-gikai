import type { Route } from "next";
import Link from "next/link";
import {
  BILL_SORT_KEYS,
  BILL_SORT_LABELS,
  type BillsSearchParams,
  billsSearchHref,
} from "../../../shared/utils/parse-bills-search-params";

/**
 * 並び替え。
 *
 * 選択肢が2つしかないので、セレクトではなくリンクを並べる。
 * JSを使わずに済み、押した状態がそのままURLに残る。
 */
export function BillsSortLinks({ params }: { params: BillsSearchParams }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {BILL_SORT_KEYS.map((key) => {
        const active = params.sort === key;
        return (
          <Link
            key={key}
            href={billsSearchHref(params, { sort: key }) as Route}
            aria-pressed={active}
            className={
              active
                ? "font-bold text-mirai-text"
                : "text-mirai-text-muted hover:opacity-70"
            }
          >
            {BILL_SORT_LABELS[key]}
          </Link>
        );
      })}
    </div>
  );
}
