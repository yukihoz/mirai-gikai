"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import {
  DEFAULT_DIFFICULTY,
  type DifficultyLevelEnum,
} from "@/features/bill-difficulty/shared/types";
import { parseDifficultyFromCookieString } from "@/features/bill-difficulty/shared/utils/parse-difficulty-from-cookie-string";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import { sendDifficultyStateEvent } from "@/lib/analytics/preference-state-events";
import { useOnPageView } from "@/lib/analytics/use-on-page-view";
import { isInterviewPage, isMainPage } from "@/lib/page-layout-utils";
import { env } from "@/lib/env";
import { RubyToggle } from "@/lib/rubyful";
import { HamburgerMenu } from "./hamburger-menu";

export function HeaderClient() {
  const difficultyLevel = useDifficultyFromCookie();
  const pathname = usePathname();
  const showDifficultySelector = isMainPage(pathname);
  const showInterviewActions = isInterviewPage(pathname);

  // Headerは1ページに1つだけ常時マウントされるため、
  // ここで難易度設定をページ表示のたびにGAへ送る
  // (DifficultySelectorはmarkdown埋め込み等で複数箇所に
  //  同時マウントされ得るため、送信元には適さない)
  // 送るときに Cookie を読み直す。state 経由だと、Cookie を読む effect より
  // 先にこの effect が走るぶん、初回は必ず既定値が送られてしまう
  useOnPageView(() =>
    sendDifficultyStateEvent(parseDifficultyFromCookieString(document.cookie))
  );

  return (
    <header className="px-3 fixed top-4 left-0 right-0 z-40 max-w-[1440px] mx-auto">
      <div className="rounded-2xl bg-white shadow-sm mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Site Title */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2"
              aria-label="ホーム"
            >
              {/* biome-ignore lint/performance/noImgElement: ロゴはCSSで高さを決めて横幅を自動にしている。next/image は寸法指定を要求し、Vercelの画像最適化にも乗るため、全ページに出るロゴでは割に合わない */}
              <img
                src="/img/logo.png"
                alt={env.siteTitle}
                className="h-12 w-auto md:h-14"
              />
              <div className="text-xl font-bold whitespace-nowrap">
                {env.siteTitle}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex items-center space-x-2"
            aria-label="補助ナビゲーション"
          >
            {showDifficultySelector && (
              // Cookie を読むのはマウント後なので、初期値が変わったら
              // スイッチを作り直して現在の設定に合わせる
              <DifficultySelector
                key={difficultyLevel}
                currentLevel={difficultyLevel}
              />
            )}
            {showInterviewActions && <InterviewHeaderActions />}
            <div className="hidden pc:block ml-2">
              <RubyToggle />
            </div>
            <div className="pc:hidden">
              <HamburgerMenu />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

/**
 * 現在の難易度設定をブラウザの Cookie から読む。
 *
 * サーバーでは Cookie を見ないので、最初の描画は既定値になる。
 * 「難しい」を選んでいる人には、マウント後にスイッチが切り替わって見える。
 * 本文の詳しさはページ側がサーバーで決めているため、表示内容はずれない。
 */
function useDifficultyFromCookie(): DifficultyLevelEnum {
  const [level, setLevel] = useState<DifficultyLevelEnum>(DEFAULT_DIFFICULTY);

  useEffect(() => {
    setLevel(parseDifficultyFromCookieString(document.cookie));
  }, []);

  return level;
}
