import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layouts/container";
import { MeetingDayDetail } from "@/features/meetings/server/components/meeting-day-detail";
import { getMeetingDay } from "@/features/meetings/server/loaders/get-meeting-day";
import { getAdjacentMeetingDays } from "@/features/meetings/server/loaders/get-meeting-days";
import { formatMeetingCommittees } from "@/features/meetings/shared/utils/format-committee-names";
import {
  formatMeetingDate,
  parseMeetingDateParam,
} from "@/features/meetings/shared/utils/meeting-date";
import { env } from "@/lib/env";

type MeetingDayPageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({
  params,
}: MeetingDayPageProps): Promise<Metadata> {
  const date = parseMeetingDateParam((await params).date);
  if (date === null) return {};

  const day = await getMeetingDay(date);
  if (day === null) return {};

  const committees = formatMeetingCommittees(day.committees);
  const title = `${formatMeetingDate(date)}の${committees} | ${env.siteTitle}`;
  const description = `この日の委員会で報告された${day.billCount}件の資料をまとめています。`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function MeetingDayPage({ params }: MeetingDayPageProps) {
  const date = parseMeetingDateParam((await params).date);
  if (date === null) notFound();

  const day = await getMeetingDay(date);
  if (day === null) notFound();

  const adjacent = await getAdjacentMeetingDays(date);

  return (
    <Container className="py-10">
      <MeetingDayDetail day={day} adjacent={adjacent} />
    </Container>
  );
}
