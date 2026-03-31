"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import type { BillsByTag, BillWithContent } from "../../../shared/types";
import { BillCard } from "./bill-card";

interface Props {
  billsByTag: BillsByTag[];
}

export function BillsByTagWithFilter({ billsByTag }: Props) {
  const [activeMeetingBody, setActiveMeetingBody] = useState<string>("all");

  if (billsByTag.length === 0) {
    return null;
  }

  // 重複を排除した会議体のリストを作成
  const allBills = billsByTag.flatMap((tagGroup) => tagGroup.bills);
  const meetingBodies = Array.from(
    new Set(allBills.map((b: BillWithContent) => b.meeting_body))
  ).filter(Boolean).sort();

  return (
    <div className="flex flex-col gap-8">
      {/* フィルターボタン */}
      {meetingBodies.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => setActiveMeetingBody("all")}
            className={`h-[29px] px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeMeetingBody === "all"
                ? "bg-mirai-gradient text-black hover:bg-mirai-gradient"
                : "bg-mirai-surface-grouped text-mirai-text-muted hover:bg-mirai-surface-muted"
            }`}
          >
            すべて
          </Button>
          {meetingBodies.map((body) => (
            <Button
              key={body}
              variant="ghost"
              onClick={() => setActiveMeetingBody(body)}
              className={`h-[29px] px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                activeMeetingBody === body
                  ? "bg-mirai-gradient text-black hover:bg-mirai-gradient"
                  : "bg-mirai-surface-grouped text-mirai-text-muted hover:bg-mirai-surface-muted"
              }`}
            >
              {body}
            </Button>
          ))}
        </div>
      )}

      {/* タグごとのリスト */}
      <div className="flex flex-col gap-12">
        {billsByTag.map(({ tag, bills }) => {
          const filteredBills =
            activeMeetingBody === "all"
              ? bills
              : bills.filter((b: BillWithContent) => b.meeting_body === activeMeetingBody);

          if (filteredBills.length === 0) return null;

          return (
            <section key={tag.id} className="flex flex-col gap-6">
              {/* タグヘッダー */}
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[22px] font-bold text-black leading-[1.48]">
                  {tag.label}
                </h2>
                {tag.description && (
                  <p className="text-xs text-mirai-text-secondary">
                    {tag.description}
                  </p>
                )}
              </div>

              {/* 議案カード一覧 */}
              <div className="flex flex-col gap-4">
                {filteredBills.map((bill: BillWithContent) => (
                  <Link key={bill.id} href={routes.billDetail(bill.id) as Route}>
                    <BillCard bill={bill} />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
