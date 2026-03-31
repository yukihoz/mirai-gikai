import { FileText, Info } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatDateWithDots } from "@/lib/utils/date";
import type { BillWithContent } from "../../../shared/types";
import { BillStatusBadge } from "./bill-status-badge";
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
  const statusLabel = bill.status === "enacted" ? "成立" : "提出";

  const isReported = bill.status === "reported";
  const CategoryIcon = isReported ? Info : FileText;
  const categoryText = isReported ? "報告事項" : "議案";

  return (
    <Card
      className={`border-[0.5px] border-mirai-text-placeholder rounded-2xl shadow-none hover:bg-muted/50 transition-colors overflow-hidden relative ${className ?? ""}`}
    >
      {/* カテゴリバッジ */}
      <div className="absolute top-2 right-2 flex items-start z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-700 bg-white/95 rounded border border-gray-200/50 shadow-sm backdrop-blur-sm pointer-events-auto">
          <CategoryIcon className="w-3 h-3" />
          {categoryText}
        </span>
      </div>

      <div className="flex">
        {/* コンテンツエリア */}
        <div className="flex-1 p-4 flex flex-col gap-2">
          <h3 className="font-bold text-[15px] leading-[1.6] line-clamp-2 pr-20">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-3">
            <BillStatusBadge status={bill.status} className="w-fit" />
            <span className="inline-flex items-center border border-gray-200 px-1.5 py-0.5 rounded-[4px] bg-gray-50 text-[10px] text-gray-600">
              {bill.meeting_body}
            </span>
            {bill.published_at && (
              <span className="text-xs text-muted-foreground">
                {formatDateWithDots(bill.published_at)} {statusLabel}
              </span>
            )}
          </div>
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
