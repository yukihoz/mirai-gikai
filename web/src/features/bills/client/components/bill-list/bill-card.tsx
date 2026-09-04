import Image from "next/image";
import { RubySafeLineClamp } from "@/components/ruby-safe-line-clamp";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { ReviewCompleteBadge } from "../bill-detail/review-status-banner";
import { BillStatusBadge } from "./bill-status-badge";
import { BillTag } from "./bill-tag";
import { DynamicBillThumbnail } from "./dynamic-bill-thumbnail";

interface BillCardProps {
  bill: BillWithContent;
}

export function BillCard({ bill }: BillCardProps) {
  const displayTitle = bill.bill_content?.title;
  const summary = bill.bill_content?.summary;
  // 提出日が無い議案は公開日で代用する
  const billDate = bill.submitted_date ?? bill.published_at;

  return (
    <Card className="border border-black hover:bg-muted/50 transition-colors relative overflow-hidden max-w-[634px]">
      <div className="flex flex-col">
        {/* バッジエリア（注目） */}
        {bill.is_featured && (
          <div
            className={`${bill.thumbnail_url != null ? "absolute" : "relative"} top-3 left-3 z-10 pointer-events-none`}
          >
            <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-medium text-mirai-text bg-mirai-highlight rounded-[20px] shadow-sm pointer-events-auto">
              注目🔥
            </span>
          </div>
        )}

        {/* サムネイル画像 */}
        {bill.thumbnail_url ? (
          <div className="relative w-full h-52 md:h-65">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ) : (
          <DynamicBillThumbnail
            title={displayTitle || bill.name}
            seedString={bill.name}
            meetingBody={bill.meeting_body}
            size="large"
          />
        )}

        {/* コンテンツエリア */}
        <div className="flex-1">
          <CardHeader>
            <div className="flex flex-col gap-3">
              <CardTitle className="text-2xl/8 tracking-normal">
                {displayTitle}
                {bill.is_review_completed && (
                  <>
                    {" "}
                    <ReviewCompleteBadge />
                  </>
                )}
              </CardTitle>
              <div className="flex flex-row gap-4">
                <BillStatusBadge status={bill.status} className="w-fit" />
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center border border-gray-200 px-1.5 py-0.5 rounded-[4px] bg-gray-50 text-[11px] text-gray-700">
                    {bill.meeting_body}
                  </span>
                  {billDate !== null && (
                    <time>{formatDateWithDots(billDate)} 提出</time>
                  )}
                </div>
              </div>
              <RubySafeLineClamp
                text={summary}
                maxLength={132}
                lineClamp={4}
                className="text-sm leading-relaxed"
              />
              {/* タグ表示 */}
              {(bill.tags.length > 0 || bill.hasPublicInterview) && (
                <div className="flex flex-wrap gap-3">
                  {bill.tags.map((tag) => (
                    <BillTag key={tag.id} tag={tag} />
                  ))}
                  {bill.hasPublicInterview && (
                    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-black bg-mirai-light-gradient rounded-full">
                      AIインタビュー受付中
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
}
