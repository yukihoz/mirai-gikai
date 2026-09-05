import type { Metadata } from "next";
import {
  MEETINGS_PAGE_DESCRIPTION,
  MeetingsPage,
} from "@/features/meetings/server/components/meetings-page";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `委員会の記録 | ${env.siteTitle}`,
  description: MEETINGS_PAGE_DESCRIPTION,
};

export default function Meetings() {
  return <MeetingsPage />;
}
