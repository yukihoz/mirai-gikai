"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { InterviewHeaderActions } from "@/features/interview-session/client/components/interview-header-actions";
import { isInterviewPage, isMainPage } from "@/lib/page-layout-utils";
import { routes } from "@/lib/routes";
import { env } from "@/lib/env";
import { RubyToggle } from "@/lib/rubyful";
import { HamburgerMenu } from "./hamburger-menu";

interface HeaderClientProps {
  difficultyLevel: DifficultyLevelEnum;
}

export function HeaderClient({ difficultyLevel }: HeaderClientProps) {
  const pathname = usePathname();
  const showDifficultySelector = isMainPage(pathname);
  const showInterviewActions = isInterviewPage(pathname);

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
              <Image
                src="/img/logo.png"
                alt={env.siteTitle}
                width={56}
                height={56}
                className="h-12 w-auto md:h-14"
                priority
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
              <div className="hidden pc:block">
                <DifficultySelector currentLevel={difficultyLevel} />
              </div>
            )}
            {showInterviewActions && <InterviewHeaderActions />}
            <div className="hidden pc:block ml-2">
              <RubyToggle />
            </div>
            <div className="pc:hidden">
              <HamburgerMenu difficultyLevel={difficultyLevel} />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
