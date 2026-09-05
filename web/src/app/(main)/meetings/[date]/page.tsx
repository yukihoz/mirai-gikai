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
import { routes } from "@/lib/routes";

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
  const shareImageUrl = new URL(
    `/api/og/meeting?date=${date}`,
    env.webUrl
  ).toString();

  return {
    title,
    description,
    alternates: {
      canonical: routes.meetingDay(date),
    },
    // openGraph と twitter は親の指定を引き継がず丸ごと置き換わる。
    // 画像を書かないと共有時に画像の無い小さなカードになる
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: shareImageUrl, alt: `${title} のOGPイメージ` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImageUrl],
    },
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
