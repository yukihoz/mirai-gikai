import Image from "next/image";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { env } from "@/lib/env";
import { LinkButton } from "./link-button";

export function About() {
  return (
    <div>
      <div className="flex flex-col gap-4">
        {/* ヘッダー */}
        <div className="flex flex-col gap-4">
          <h2>
            <Image
              src="/icons/about-typography.svg"
              alt="About"
              width={143}
              height={36}
              priority
            />
          </h2>
          <p className="text-sm font-bold text-primary-accent">
            {env.siteShortName}とは
          </p>
        </div>

        {/* コンテンツ */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold leading-[43.2px]">
              {env.assemblyName}での議論を
              <br />
              できる限りわかりやすく
            </h3>
            <p className="text-[15px] leading-[28px] text-black whitespace-pre-wrap">
              みらい議会は、区議会で今どんな法案が検討されているか、わかりやすく伝えるプラットフォームです。区民の皆さんの意見を政治に届けることを目指して、継続的にアップデートしていきます。{"\n"}
              なお、本サービスはほづみゆうきが、チームみらいの「みらい議会」を元に作成したものです。チームみらい、そしてみらい議会については以下の記事をご覧ください。
            </p>
          </div>

          {/* ボタンはTeamMiraiセクションに統合されました */}
        </div>
      </div>
    </div>
  );
}
