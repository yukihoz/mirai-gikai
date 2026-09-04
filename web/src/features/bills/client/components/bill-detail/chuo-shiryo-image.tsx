"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChuoShiryoImageProps {
  imageUrl: string;
  width: number;
  height: number;
  /** 「資料3」など。番号が読み取れないときは「資料」 */
  label: string;
}

/**
 * 記事のもとになった委員会資料の1ページ目。
 *
 * 解説だけだと「何を読んで書かれたのか」が読み手に見えない。原本の1枚目を
 * 置くことで、AIの要約と区が出した資料を並べて確かめられるようにする。
 *
 * 資料は文字が小さいので、クリックで拡大できるようにする。PDFへ直接飛ばすと
 * サイトから出てしまい、記事に戻ってこない。全文へのリンクは本文の下に別途
 * 置いてあるので、ここは「大きく見る」だけに絞る。
 */
export function ChuoShiryoImage({
  imageUrl,
  width,
  height,
  label,
}: ChuoShiryoImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const alt = `${label}の1ページ目`;

  return (
    <>
      <figure className="my-8">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`${alt}を拡大する`}
          className="block w-full cursor-zoom-in rounded-md overflow-hidden border border-mirai-border bg-white transition-opacity hover:opacity-90"
        >
          <Image
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </button>
        <figcaption className="mt-2 text-xs text-mirai-text-muted">
          委員会に出された{label}の1ページ目です。タップすると大きく表示します。
        </figcaption>
      </figure>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-4">
          <DialogHeader>
            <DialogTitle className="text-base">{alt}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[80vh]">
            <Image
              src={imageUrl}
              alt={alt}
              width={width}
              height={height}
              className="w-full h-auto"
              sizes="95vw"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
