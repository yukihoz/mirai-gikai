import "server-only";

import type { Route } from "next";
import Link from "next/link";
import { ExternalTextLink } from "@/components/ui/external-text-link";
import { CompactBillCard } from "@/features/bills/client/components/bill-list/compact-bill-card";
import { routes } from "@/lib/routes";
import type { MeetingCommittee } from "../../shared/types";

interface MeetingCommitteeSectionProps {
  committee: MeetingCommittee;
}

/**
 * 会議まとめの、委員会1つぶん。
 *
 * 一次情報への導線は資料の一覧より先に置く。区議会のサイトで
 * その日の次第と会議録を見てから、個々の資料の解説に入れる並びにする。
 */
export function MeetingCommitteeSection({
  committee,
}: MeetingCommitteeSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-mirai-text">
          {committee.committee}
        </h2>
        <p className="text-sm text-mirai-text-muted">
          報告資料{committee.bills.length}件
        </p>
      </div>

      <div className="rounded-md border border-mirai-border-source bg-mirai-surface-source px-4 py-5">
        <p className="mb-3 text-sm leading-relaxed">
          この委員会の資料と議事録は中央区議会のWebサイトで読めます。
        </p>

        <div className="flex flex-col gap-2">
          <ExternalTextLink href={committee.meetingUrl} className="w-fit">
            この日の開会日程と資料を見る
          </ExternalTextLink>

          {committee.minutesUrl !== null && (
            <ExternalTextLink href={committee.minutesUrl} className="w-fit">
              この委員会の議事録を読む
            </ExternalTextLink>
          )}
        </div>

        {committee.minutesUrl === null && (
          <p className="mt-3 text-xs leading-relaxed text-mirai-text-muted">
            議事録は会議から数か月あとに公開されます。公開されしだい、ここからも読めるようになります。
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {committee.bills.map((bill) => (
          <Link key={bill.id} href={routes.billDetail(bill.id) as Route}>
            <CompactBillCard bill={bill} showMeta={false} />
          </Link>
        ))}
      </div>
    </section>
  );
}
