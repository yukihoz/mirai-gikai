import { Container } from "@/components/layouts/container";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewLandingSection } from "@/features/interview-config/client/components/interview-landing-section";
import { getInterviewConfig } from "@/features/interview-config/server/loaders/get-interview-config";
import { getPublicReportsByBillId } from "@/features/interview-report/server/loaders/get-public-reports-by-bill-id";
import { MeetingDayLinkCard } from "@/features/meetings/server/components/meeting-day-link-card";
import { getMeetingDays } from "@/features/meetings/server/loaders/get-meeting-days";
import { findMeetingDay } from "@/features/meetings/shared/utils/find-meeting-day";
import { BillTopicsPreviewSection } from "@/features/user-topic-analysis/server/components/bill-topics-preview-section";
import { getPublicTopicAnalysis } from "@/features/user-topic-analysis/server/loaders/get-public-topic-analysis";
import { BillDetailClient } from "../../../client/components/bill-detail/bill-detail-client";
import { BillDisclaimer } from "../../../client/components/bill-detail/bill-disclaimer";
import { BillStatusProgress } from "../../../client/components/bill-detail/bill-status-progress";
import { MiraiStanceCard } from "../../../client/components/bill-detail/mirai-stance-card";
import type { BillWithContent } from "../../../shared/types";
import { BillShareButtons } from "../share/bill-share-buttons";
import { getChuoDiscussions } from "../../loaders/get-chuo-discussions";
import { getChuoShiryo } from "../../loaders/get-chuo-shiryo";
import { BillContent } from "./bill-content";
import { BillDetailHeader } from "./bill-detail-header";
import { ChuoShiryoImage } from "../../../client/components/bill-detail/chuo-shiryo-image";
import { ChuoDiscussions } from "./chuo-discussions";
import { ChuoShiryoSource } from "./chuo-shiryo-source";

interface BillDetailLayoutProps {
  bill: BillWithContent;
  currentDifficulty: DifficultyLevelEnum;
}

export async function BillDetailLayout({
  bill,
  currentDifficulty,
}: BillDetailLayoutProps) {
  const showMiraiStance = bill.status === "preparing" || bill.mirai_stance;
  // 会議の一覧は記事に依らないので、資料の取得を待たずに一緒に走らせる。
  // 資料の無い記事（AIインタビュー等）でも引くことになるが、10分キャッシュに
  // 載るので実質の追加コストは無い
  const [
    interviewConfig,
    publicReportsResult,
    topicAnalysis,
    chuoShiryo,
    chuoDiscussions,
    meetingDays,
  ] = await Promise.all([
    getInterviewConfig(bill.id),
    getPublicReportsByBillId(bill.id),
    getPublicTopicAnalysis(bill.id),
    getChuoShiryo(bill.id),
    getChuoDiscussions(bill.id),
    getMeetingDays(),
  ]);

  const meetingDay =
    chuoShiryo === null
      ? null
      : findMeetingDay(meetingDays, chuoShiryo.meetingDate);

  return (
    <div className="container mx-auto pb-8 max-w-4xl">
      {/*
        テキスト選択機能とチャット連携の実装パターン:
        - BillContentはServer Componentのまま保持（SSRによる高速な初期レンダリング）
        - BillDetailClientでクライアントサイド機能（テキスト選択、チャット連携）を提供
        - このパターンによりSSRを保持しつつインタラクティブ機能を実装
      */}
      <BillDetailClient
        bill={bill}
        currentDifficulty={currentDifficulty}
        hasInterviewConfig={interviewConfig != null}
      >
        <BillDetailHeader
          bill={bill}
          hasInterviewConfig={interviewConfig != null}
          opinionCount={topicAnalysis?.total_opinions ?? 0}
          topicCount={topicAnalysis?.topics.length ?? 0}
        />
        <Container>
          {/* 議案ステータス進捗（報告事項・意見募集・AIインタビューの場合は非表示） */}
          {bill.status !== "reported" &&
            bill.status !== "opinion_gathering" &&
            bill.meeting_body !== "AIインタビュー" && (
              <div className="my-8">
                <BillStatusProgress
                  status={bill.status}
                  statusNote={bill.status_note}
                />
              </div>
            )}

          {chuoShiryo?.shiryoImageUrl &&
            chuoShiryo.shiryoImageWidth !== null &&
            chuoShiryo.shiryoImageHeight !== null && (
              <ChuoShiryoImage
                imageUrl={chuoShiryo.shiryoImageUrl}
                width={chuoShiryo.shiryoImageWidth}
                height={chuoShiryo.shiryoImageHeight}
                label={
                  chuoShiryo.shiryoNumber === null
                    ? "資料"
                    : `資料${chuoShiryo.shiryoNumber}`
                }
              />
            )}

          <BillContent bill={bill} />

          {/* 資料の全文への導線。委員会での質疑よりは前に置く */}
          {chuoShiryo && (
            <div className="my-8">
              <ChuoShiryoSource
                shiryo={chuoShiryo}
                title={bill.bill_content?.title || bill.name}
              />
            </div>
          )}

          {/* 会議録が公開されるまで質疑は空。そのときはセクションごと出さない */}
          {chuoShiryo && chuoDiscussions.length > 0 && (
            <div className="my-8">
              <ChuoDiscussions
                discussions={chuoDiscussions}
                shiryo={chuoShiryo}
              />
            </div>
          )}
        </Container>
      </BillDetailClient>

      <Container>
        {/* 同じ日に何が報告されたかへの導線 */}
        {meetingDay !== null && (
          <div className="my-8">
            <MeetingDayLinkCard day={meetingDay} />
          </div>
        )}

        {/* 法案のトピック一覧（AIインタビュー意見の整理） */}
        <div className="my-8">
          <BillTopicsPreviewSection
            billId={bill.id}
            topics={topicAnalysis?.topics ?? []}
            publicReportCount={publicReportsResult.totalCount}
          />
        </div>

        {interviewConfig != null && (
          <div className="my-8">
            <InterviewLandingSection billId={bill.id} />
          </div>
        )}
        {showMiraiStance && (
          <div className="my-8">
            <MiraiStanceCard
              stance={bill.mirai_stance}
              billStatus={bill.status}
            />
          </div>
        )}
        {/* シェアボタン */}
        <div className="my-8">
          <BillShareButtons bill={bill} />
        </div>

        {/* データの出典と免責事項 */}
        <div className="my-8">
          <BillDisclaimer />
        </div>
      </Container>
    </div>
  );
}
