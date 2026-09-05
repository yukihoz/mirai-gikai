import type { MetadataRoute } from "next";
import { getBills } from "@/features/bills/server/loaders/get-bills";
import { getMeetingDays } from "@/features/meetings/server/loaders/get-meeting-days";
import { routes } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const [bills, meetingDays] = await Promise.all([
    getBills(),
    getMeetingDays(),
  ]);

  const billUrls = bills.map((bill) => ({
    url: `${baseUrl}${routes.billDetail(bill.id)}`,
    lastModified: new Date(bill.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 会議のまとめ。中身は資料が出そろったあとほとんど変わらないので、
  // 更新頻度は低めに申告する
  const meetingUrls = meetingDays.map((day) => ({
    url: `${baseUrl}${routes.meetingDay(day.date)}`,
    lastModified: new Date(day.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}${routes.meetings()}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...billUrls,
    ...meetingUrls,
  ];
}
