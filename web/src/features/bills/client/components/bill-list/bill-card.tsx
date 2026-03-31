import { FileText, Info } from "lucide-react";
import Image from "next/image";
import { RubySafeLineClamp } from "@/components/ruby-safe-line-clamp";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { BillStatusBadge } from "./bill-status-badge";
import { BillTag } from "./bill-tag";
import { DynamicBillThumbnail } from "./dynamic-bill-thumbnail";

interface BillCardProps {
  bill: BillWithContent;
}

export function BillCard({ bill }: BillCardProps) {
  const displayTitle = bill.bill_content?.title;
  const summary = bill.bill_content?.summary;

  const isReported = bill.status === "reported";
  const CategoryIcon = isReported ? Info : FileText;
  const categoryText = isReported ? "報告事項" : "議案";

  return (
    <Card className="border border-black hover:bg-muted/50 transition-colors relative overflow-hidden max-w-[634px]">
      <div className="flex flex-col">
        {/* バッジエリア（注目・カテゴリー） */}
        <div className={`${bill.thumbnail_url != null ? "absolute" : "relative"} top-3 left-0 w-full px-3 flex justify-between items-start z-10 pointer-events-none`}>
          <div>
            {bill.is_featured && (
              <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs font-medium text-mirai-text bg-mirai-highlight rounded-[20px] shadow-sm pointer-events-auto">
                注目🔥
              </span>
            )}
          </div>
          
          <div className="pointer-events-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 bg-white/95 rounded-md border border-gray-200/50 shadow-sm backdrop-blur-sm">
              <CategoryIcon className="w-3.5 h-3.5" />
              {categoryText}
            </span>
          </div>
        </div>

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
              </CardTitle>
              <div className="flex flex-row gap-4">
                <BillStatusBadge status={bill.status} className="w-fit" />
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center border border-gray-200 px-1.5 py-0.5 rounded-[4px] bg-gray-50 text-[11px] text-gray-700">
                    {bill.meeting_body}
                  </span>
                  {bill.published_at && (
                    <time>{formatDateWithDots(bill.published_at)} 提出</time>
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
              {bill.tags && bill.tags.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {bill.tags.map((tag) => (
                    <BillTag key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
        </div>
      </div>
    </Card>
  );
}
