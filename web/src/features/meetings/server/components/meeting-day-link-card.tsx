import "server-only";

import { CalendarDays, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { MeetingDaySummary } from "../../shared/types";
import { formatMeetingDate } from "../../shared/utils/meeting-date";

interface MeetingDayLinkCardProps {
  day: MeetingDaySummary;
}

/**
 * 記事から、その資料が出された会議のまとめへの導線。
 *
 * 記事は資料1件ぶんしか映さないので、同じ日に何が報告されたかが
 * 見えない。委員会は関連する話題をまとめて扱うため、隣の資料が
 * この資料の背景になっていることが多い。
 */
export function MeetingDayLinkCard({ day }: MeetingDayLinkCardProps) {
  const others = day.billCount - 1;

  return (
    <Link
      href={routes.meetingDay(day.date) as Route}
      className="group flex items-center gap-3 rounded-2xl border border-mirai-border bg-white px-4 py-4 transition-colors hover:border-primary-accent"
    >
      <CalendarDays
        className="size-5 shrink-0 text-mirai-text-muted"
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[15px] font-bold text-mirai-text">
          {formatMeetingDate(day.date)}の委員会
        </p>
        <p className="text-xs text-mirai-text-muted">
          {others > 0
            ? `この日はほかに${others}件の報告資料が出されました`
            : "この日の開会日程と議事録もあわせて見られます"}
        </p>
      </div>

      <ChevronRight
        className="size-5 shrink-0 text-mirai-text-muted transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}
