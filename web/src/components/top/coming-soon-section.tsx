import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ComingSoonBill } from "@/features/bills/shared/types";
import { Card, CardContent } from "../ui/card";

interface ComingSoonSectionProps {
  bills: ComingSoonBill[];
}

export function ComingSoonSection({ bills }: ComingSoonSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      {/* Coming soonカードリスト (法案がある場合のみ表示) */}
      {bills.length > 0 && (
        <div className="flex flex-col gap-3">
          {bills.map((bill) => (
            <ComingSoonBillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </section>
  );
}

function ComingSoonBillCard({ bill }: { bill: ComingSoonBill }) {
  // タイトルがあればそれを表示、なければ正式名称を表示
  const displayTitle = bill.title || bill.name;
  // 正式名称（タイトルがある場合のみ別途表示）
  const officialName = bill.title ? bill.name : null;

  const content = (
    <Card
      className={`border border-black ${
        bill.shugiin_url
          ? "hover:bg-gray-50 transition-colors cursor-pointer"
          : ""
      }`}
    >
      <CardContent className="flex items-center justify-between py-4 px-5">
        <div className="flex flex-col gap-1 min-w-0 pr-3">
          <h3 className="font-bold text-base text-black leading-tight">
            {displayTitle}
          </h3>
          {officialName && (
            <p className="text-xs text-mirai-text-subtle">{officialName}</p>
          )}
        </div>
        {bill.shugiin_url && (
          <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </CardContent>
    </Card>
  );

  // shugiin_url がある場合は外部リンク
  if (bill.shugiin_url) {
    return (
      <Link
        href={bill.shugiin_url as Route}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </Link>
    );
  }

  return content;
}
