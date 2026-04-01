import Image from "next/image";
import { LinkButton } from "@/components/top/link-button";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";
import { HOZUMI_SOCIAL_LINKS } from "@/lib/social-links";

export function BillDisclaimer() {
  return (
    <div className="space-y-6">
      {/* ほづみゆうきについて */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary-accent">ほづみゆうきについて</h3>
        <p className="text-[15px] leading-[28px] text-black">
          東京都中央区議会議員。妻と娘2人の4人家族。 文部科学省、子育て系NPOのシステム&政策提言担当を経て現職へ。「データ分析に基づき子どもにも大人にもやさしい中央区」を目指して区議選に完全無所属で挑戦し当選。
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          {Object.entries(HOZUMI_SOCIAL_LINKS).map(([key, sns]) => (
            <a
              key={key}
              href={sns.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <Image
                src={sns.iconPath}
                alt={sns.name}
                width={48}
                height={48}
                className={sns.hasBorder ? "rounded-full border border-mirai-border-light" : ""}
              />
            </a>
          ))}
        </div>
      </div>

      {/* データの出典について */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-black">掲載コンテンツについて</h3>
        <p className="text-xs leading-relaxed text-mirai-text-note">
          掲載されている議案等の情報は、{env.assemblyName}に提出された議案などの公開情報を基に、ほづみゆうきがAIを活用しながら背景情報を整理したものです。
        </p>
      </div>

      {/* 掲載コンテンツについての免責事項 */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-black">免責事項</h3>
        <p className="text-xs leading-relaxed text-mirai-text-note">
          本サイトで公開する情報は、可能な限り正確かつ最新の情報を反映するよう努めていますが、その正確性・完全性・即時性について保証するものではありません。また、AIチャットは不正確または誤解を招く回答を生成する可能性があります。正確な情報は、公式文書や一次資料をご確認ください。
        </p>
      </div>

      <LinkButton
        href={routes.faq()}
        icon={{
          src: "/icons/question-bubble.svg",
          alt: "note",
          width: 20,
          height: 20,
        }}
        className="w-fit"
      >
        よくある質問
      </LinkButton>
    </div>
  );
}
