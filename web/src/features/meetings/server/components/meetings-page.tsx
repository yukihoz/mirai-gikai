import "server-only";

import { Container } from "@/components/layouts/container";
import { getMeetingMonths } from "../loaders/get-meeting-days";
import { MeetingMonthsList } from "./meeting-months-list";

/**
 * 会議のあった日の一覧ページ。
 *
 * 説明文はメタデータの description と揃える。片方だけ直すと、検索結果に
 * 出る文とページに出る文がずれる。
 */
export const MEETINGS_PAGE_DESCRIPTION =
  "いつどの委員会が開かれ、どんな報告資料が出されたかを日付ごとにまとめています。資料が公開されている会議だけが並びます。";

export async function MeetingsPage() {
  const months = await getMeetingMonths();

  return (
    <Container className="py-12">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-mirai-text">委員会の記録</h1>
          <p className="text-sm leading-relaxed text-mirai-text-secondary">
            {MEETINGS_PAGE_DESCRIPTION}
          </p>
        </div>

        <MeetingMonthsList months={months} />
      </div>
    </Container>
  );
}
