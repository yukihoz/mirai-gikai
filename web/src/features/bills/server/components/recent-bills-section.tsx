import type { Route } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { CompactBillCard } from "../../client/components/bill-list/compact-bill-card";
import type { BillWithContent } from "../../shared/types";

interface RecentBillsSectionProps {
  bills: BillWithContent[];
}

/**
 * 直近の報告資料。
 *
 * 会期では区切らない。年度が替わった直後に新しい会期がまだ空で、
 * トップに何も出ない状態を避けるため。会期ごとの一覧は会期ページが担う。
 */
export function RecentBillsSection({ bills }: RecentBillsSectionProps) {
  if (bills.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[22px] font-bold text-black leading-[1.48]">
        最近の報告資料
      </h2>

      <div className="flex flex-col gap-3">
        {bills.map((bill) => (
          <Link key={bill.id} href={routes.billDetail(bill.id) as Route}>
            <CompactBillCard bill={bill} />
          </Link>
        ))}
      </div>
    </section>
  );
}
