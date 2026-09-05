import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { BillStatusBadge } from "./bill-status-badge";
import { BillTag } from "./bill-tag";
import { toShortMeetingBody } from "../../../shared/utils/short-meeting-body";
import { DynamicBillThumbnail } from "./dynamic-bill-thumbnail";

interface CompactBillCardProps {
  bill: BillWithContent;
  className?: string;
}

/**
 * コンパクトな水平レイアウトの法案カード
 * 過去区議会セクションや過去区議会議案一覧ページで使用
 */
export function CompactBillCard({ bill, className }: CompactBillCardProps) {
  const displayTitle = bill.bill_content?.title || bill.name;
  // 提出日が無い議案は公開日で代用する
  const billDate = bill.submitted_date ?? bill.published_at;

  return (
    <Card
      className={`border-[0.5px] border-mirai-text-placeholder rounded-2xl shadow-none hover:bg-muted/50 transition-colors overflow-hidden relative ${className ?? ""}`}
    >
      <div className="flex">
        {/* コンテンツエリア */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <h3 className="font-bold text-[15px] leading-[1.6] line-clamp-2">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-3">
            <BillStatusBadge status={bill.status} className="w-fit" />
            <span className="inline-flex items-center border border-gray-200 px-1.5 py-0.5 rounded-[4px] bg-gray-50 text-[10px] text-gray-600">
              {toShortMeetingBody(bill.meeting_body)}
            </span>
            {billDate !== null && (
              <span className="text-xs text-muted-foreground">
                {formatDateWithDots(billDate)}
              </span>
            )}
          </div>

          {/* カテゴリ。何の話題かが件名だけでは分かりにくいので添える */}
          {bill.tags !== undefined && bill.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bill.tags.map((tag) => (
                <BillTag key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {/* サムネイル画像 */}
        {bill.thumbnail_url ? (
          <div className="relative w-24 h-16 flex-shrink-0 self-center mr-4 rounded-lg overflow-hidden">
            <Image
              src={bill.thumbnail_url}
              alt={bill.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 self-center mr-4">
            <DynamicBillThumbnail
              title={displayTitle || bill.name}
              seedString={bill.name}
              meetingBody={bill.meeting_body}
              size="small"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
