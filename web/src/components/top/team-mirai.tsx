import Image from "next/image";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { EXTERNAL_LINKS } from "@/config/external-links";
import { env } from "@/lib/env";
import { LinkButton } from "./link-button";

const TEAM_MIRAI_SNS_ORDER = [
  "youtube",
  "x",
  "line",
  "instagram",
  "facebook",
  "tiktok",
] as const;

export function TeamMirai() {
  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          {/* ボタングループ - デスクトップでは3カラムのグリッドで等間隔に配置 */}
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-1.5 w-full">
            <LinkButton
              href={EXTERNAL_LINKS.ABOUT_NOTE}
              icon={{
                src: "/icons/note-icon.png",
                alt: "note",
                width: 20,
                height: 20,
              }}
              className="w-full md:w-auto"
            >
              {env.siteShortName}とは
            </LinkButton>

            <LinkButton
              href="https://team-mir.ai/"
              icon={{
                src: "/icons/info-icon.svg",
                alt: "",
                width: 18,
                height: 18,
              }}
              className="w-full md:w-auto"
            >
              チームみらいについて詳しく
            </LinkButton>

            <LinkButton
              href="https://team-mir.ai/#donation"
              icon={{
                src: "/icons/heart-icon.svg",
                alt: "",
                width: 18,
                height: 18,
              }}
              className="w-full md:w-auto"
            >
              寄附で応援する
            </LinkButton>
          </div>

          {/* SNSアイコン */}
          <div className="flex flex-wrap gap-3 items-end">
            {TEAM_MIRAI_SNS_ORDER.map((key) => {
              const sns = SOCIAL_LINKS[key];
              return (
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
                    className={
                      sns.hasBorder
                        ? "rounded-full border border-mirai-border-light"
                        : ""
                    }
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
