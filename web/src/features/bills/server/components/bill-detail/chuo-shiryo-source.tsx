import { ExternalLink } from "lucide-react";
import { formatDateWithDots } from "@/lib/utils/date";
import type { ChuoShiryo } from "../../loaders/get-chuo-shiryo";

interface ChuoShiryoSourceProps {
  shiryo: ChuoShiryo;
  /** 記事のタイトル。「資料3」だけでは何の資料か伝わらないため添える */
  title: string;
}

/**
 * 報告資料の全文への導線。
 *
 * 本文の解説はAIが書いたものなので、一次情報にたどり着ける道を必ず残す。
 * 置き場所は本文の直後で、この先に入る委員会での質疑よりは前。
 * 「解説を読んだ → もとの資料を見る → 委員会で何が議論されたかを見る」
 * という順で読めるようにする。
 */
export function ChuoShiryoSource({ shiryo, title }: ChuoShiryoSourceProps) {
  return (
    <section className="rounded-md border border-mirai-border-source bg-mirai-surface-source px-4 py-6">
      <p className="text-sm leading-relaxed mb-4">
        この報告資料の全文は、中央区議会のウェブサイトで読めます。
      </p>

      <a
        href={shiryo.shiryoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-[3px] hover:opacity-70"
      >
        「{title}」の全文を読む（PDF）
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
      </a>

      <p className="mt-4 text-xs leading-relaxed text-mirai-text-muted">
        {shiryo.committee}（{formatDateWithDots(shiryo.meetingDate)}）に
        出された資料です。
        <a
          href={shiryo.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-[3px] hover:opacity-70"
        >
          この日の開会日程
        </a>
        もあわせてご覧いただけます。区の都合でリンク先が削除・移動されることがあります。
      </p>
    </section>
  );
}
