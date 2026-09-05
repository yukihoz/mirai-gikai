import "server-only";

import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { MeetingMonth } from "../../shared/utils/group-meeting-days";
import { formatCommitteeNames } from "../../shared/utils/format-committee-names";
import {
  formatMonthKey,
  formatWeekday,
  toDayOfMonth,
} from "../../shared/utils/meeting-date";

interface MeetingMonthsListProps {
  months: MeetingMonth[];
}

/**
 * 会議のあった日の一覧。
 *
 * 区切りは月にしている。年度で区切ると、年度が変わった直後に中身の
 * 無い見出しだけが出てしまう。
 */
export function MeetingMonthsList({ months }: MeetingMonthsListProps) {
  if (months.length === 0) {
    return (
      <p className="rounded-md bg-white px-4 py-8 text-center text-sm text-mirai-text-muted">
        まだ会議の記録がありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {months.map((month) => (
        <section key={month.monthKey} className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-mirai-text-secondary">
            {formatMonthKey(month.monthKey)}
          </h2>

          <div className="flex flex-col gap-2">
            {month.days.map((day) => (
              <Link
                key={day.date}
                href={routes.meetingDay(day.date) as Route}
                className="group flex items-center gap-4 rounded-2xl border border-mirai-border bg-white px-4 py-3 transition-colors hover:border-primary-accent"
              >
                <div className="w-10 shrink-0 text-center">
                  <div className="text-xl font-bold leading-none text-mirai-text">
                    {toDayOfMonth(day.date)}
                  </div>
                  <div className="mt-1 text-[10px] text-mirai-text-muted">
                    {formatWeekday(day.date)}
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="line-clamp-2 text-[15px] font-bold text-mirai-text">
                    {formatCommitteeNames(day.committees)}
                  </p>
                  <p className="text-xs text-mirai-text-muted">
                    報告資料{day.billCount}件
                  </p>
                </div>

                <ChevronRight
                  className="size-5 shrink-0 text-mirai-text-muted transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
