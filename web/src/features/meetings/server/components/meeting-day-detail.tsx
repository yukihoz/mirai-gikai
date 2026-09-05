import "server-only";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type {
  AdjacentMeetingDays,
  MeetingDay,
  MeetingDaySummary,
} from "../../shared/types";
import {
  formatCommitteeNames,
  formatMeetingCommittees,
} from "../../shared/utils/format-committee-names";
import { formatMeetingDate } from "../../shared/utils/meeting-date";
import { MeetingCommitteeSection } from "./meeting-committee-section";

interface MeetingDayDetailProps {
  day: MeetingDay;
  adjacent: AdjacentMeetingDays;
}

/** その日の会議のまとめ */
export function MeetingDayDetail({ day, adjacent }: MeetingDayDetailProps) {
  const committeeNames = formatMeetingCommittees(day.committees);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Link
          href={routes.meetings() as Route}
          className="inline-flex w-fit items-center gap-1 text-sm text-mirai-text-muted hover:opacity-70"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          委員会の記録
        </Link>

        <h1 className="text-2xl font-bold leading-snug text-mirai-text">
          {formatMeetingDate(day.date)}の{committeeNames}
        </h1>
      </header>

      {day.committees.map((committee) => (
        <MeetingCommitteeSection
          key={committee.committee}
          committee={committee}
          /* 委員会が1つなら見出しに名前が出ているので、繰り返さない */
          showHeading={day.committees.length > 1}
        />
      ))}

      <nav
        aria-label="前後の会議"
        className="grid grid-cols-1 gap-3 border-t border-mirai-border pt-6 sm:grid-cols-2"
      >
        <AdjacentLink day={adjacent.older} direction="older" />
        <AdjacentLink day={adjacent.newer} direction="newer" />
      </nav>
    </div>
  );
}

/**
 * 前後の会議への導線。
 *
 * 横に2つ並べると、狭い画面では日付が折り返して読みにくい。
 * 画面が狭いあいだは縦に積み、広いときだけ左右に置く。次の会議は
 * 前の会議が無くても右側に来るよう、列を指定しておく。
 */
function AdjacentLink({
  day,
  direction,
}: {
  day: MeetingDaySummary | null;
  direction: "older" | "newer";
}) {
  if (day === null) return null;

  const isOlder = direction === "older";

  return (
    <Link
      href={routes.meetingDay(day.date) as Route}
      className={`group flex flex-col gap-1 rounded-2xl border border-mirai-border bg-white px-4 py-3 transition-colors hover:border-primary-accent ${
        isOlder ? "" : "sm:col-start-2 sm:text-right"
      }`}
    >
      <span
        className={`flex items-center gap-1 text-xs text-mirai-text-muted ${
          isOlder ? "" : "sm:justify-end"
        }`}
      >
        {isOlder && <ChevronLeft className="size-3.5" aria-hidden="true" />}
        {isOlder ? "前の会議" : "次の会議"}
        {!isOlder && <ChevronRight className="size-3.5" aria-hidden="true" />}
      </span>
      <span className="text-sm font-bold text-mirai-text">
        {formatMeetingDate(day.date)}
      </span>
      <span className="truncate text-xs text-mirai-text-muted">
        {formatCommitteeNames(day.committees)}
      </span>
    </Link>
  );
}
