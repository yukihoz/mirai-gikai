"use client";

import { useState } from "react";

interface OgpPreviewCardProps {
  ogImageUrl: string;
  billName: string;
}

export function OgpPreviewCard({ ogImageUrl, billName }: OgpPreviewCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full overflow-hidden">
      {!isLoaded && (
        <div className="aspect-[1200/630] w-full animate-pulse rounded bg-muted" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* biome-ignore lint/performance/noImgElement: OGP画像は外部で生成されるURLで、読み込み完了を onLoad で受けて表示を切り替えている。next/image ではこの制御を保てない */}
      <img
        src={ogImageUrl}
        alt={`${billName}に対する意見のOGP画像`}
        className={`w-full ${isLoaded ? "block" : "hidden"}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
    </div>
  );
}
