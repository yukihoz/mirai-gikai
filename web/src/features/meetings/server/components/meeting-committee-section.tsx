import "server-only";

import type { Route } from "next";
import Link from "next/link";
import { ExternalTextLink } from "@/components/ui/external-text-link";
import { CompactBillCard } from "@/features/bills/client/components/bill-list/compact-bill-card";
import { routes } from "@/lib/routes";
import type { MeetingCommittee } from "../../shared/types";

interface MeetingCommitteeSectionProps {
  committee: MeetingCommittee;
  /**
   * 委員会名の見出しを出すか。
   *
   * 同じ日に複数の委員会が開かれたときだけ要る。1つしか無い日は
   * ページの見出しが「2026年2月6日（金）の企画総務委員会」なので、
   * 名前をもう一度出しても読む手がかりにならない。
   */
  showHeading: boolean;
}

/**
 * 会議まとめの、委員会1つぶん。
 *
 * 一次情報への導線は資料の一覧のあとに置く。この日に何が報告されたかを
 * 見てから、区議会のサイトで次第と議事録にあたる、という順で読める。
 */
export function MeetingCommitteeSection({
  committee,
  showHeading,
}: MeetingCommitteeSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      {showHeading && (
        <h2 className="text-xl font-bold text-mirai-text">
          {committee.committee}
        </h2>
      )}

      <div className="flex flex-col gap-3">
        {committee.bills.map((bill) => (
          <Link key={bill.id} href={routes.billDetail(bill.id) as Route}>
            <CompactBillCard bill={bill} showMeta={false} />
          </Link>
        ))}
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
    </section>
  );
}
