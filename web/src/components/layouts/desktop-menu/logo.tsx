import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { env } from "@/lib/env";

/**
 * デスクトップメニュー: ロゴ (画面左上)
 */
export function DesktopMenuLogo() {
  return (
    <Link
      href={routes.home()}
      className="fixed top-6 left-6 z-50 flex items-center gap-6 hover:opacity-90 transition-opacity"
    >
      {/* ロゴ */}
      <div className="relative w-[160px] h-auto">
        <Image
          src="/img/logo.png"
          alt={env.siteTitle}
          width={160}
          height={53}
          className="w-full h-auto drop-shadow-sm"
          priority
        />
      </div>

      {/* テキスト */}
      <div className="flex flex-col gap-1.5">
        <h1
          className="font-extrabold text-black"
          style={{
            fontSize: "36px",
            lineHeight: "1em",
            letterSpacing: "0.1em",
          }}
        >
          {env.siteShortName}
        </h1>
        <p
          className="font-bold text-black"
          style={{
            fontSize: "16px",
            lineHeight: "2em",
          }}
        >
          {env.assemblyName}の議論をわかりやすく
        </p>
      </div>
    </Link>
  );
}
