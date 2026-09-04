import type { Route } from "next";
import Link from "next/link";
import { BillsPagination } from "../../client/components/bill-list/bills-pagination";
import { BillsSearchForm } from "../../client/components/bill-list/bills-search-form";
import { BillsSortLinks } from "../../client/components/bill-list/bills-sort-links";
import { CategoryChips } from "../../client/components/bill-list/category-chips";
import { CompactBillCard } from "../../client/components/bill-list/compact-bill-card";
import {
  type BillsSearchParams,
  billsSearchHref,
  hasActiveFilter,
} from "../../shared/utils/parse-bills-search-params";
import { routes } from "@/lib/routes";
import type {
  BillsSearchResult,
  CategoryOption,
} from "../loaders/get-bills-search";

interface BillsSearchSectionProps {
  params: BillsSearchParams;
  result: BillsSearchResult;
  categories: CategoryOption[];
}

/**
 * 報告資料を探すセクション。
 *
 * 会期でも「注目」でもなく、検索とカテゴリで辿れるようにする。
 * 既定は新しい順なので、絞り込まなければ「最近の報告資料」と同じ並びになる。
 * 絞り込みの状態はすべてURLに載るので、条件つきのページを共有できる。
 */
export function BillsSearchSection({
  params,
  result,
  categories,
}: BillsSearchSectionProps) {
  return (
    <section id="search" className="flex flex-col gap-5 scroll-mt-4">
      <h2 className="text-[22px] font-bold text-black leading-[1.48]">
        報告資料を探す
      </h2>

      <BillsSearchForm params={params} />
      <CategoryChips categories={categories} params={params} />

      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-mirai-text-muted">
          {result.total}件
          {hasActiveFilter(params) && (
            <>
              {" "}
              <Link
                href={
                  billsSearchHref(params, {
                    query: "",
                    tagId: null,
                  }) as Route
                }
                className="underline underline-offset-[3px] hover:opacity-70"
              >
                絞り込みを解除
              </Link>
            </>
          )}
        </p>
        <BillsSortLinks params={params} />
      </div>

      {result.bills.length === 0 ? (
        <p className="rounded-md bg-white px-4 py-8 text-center text-sm text-mirai-text-muted">
          該当する報告資料が見つかりませんでした。
          <br />
          別のキーワードやカテゴリでお試しください。
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {result.bills.map((bill) => (
            <Link key={bill.id} href={routes.billDetail(bill.id) as Route}>
              <CompactBillCard bill={bill} />
            </Link>
          ))}
        </div>
      )}

      <BillsPagination params={params} total={result.total} />
    </section>
  );
}
