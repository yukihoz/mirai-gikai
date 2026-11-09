import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { ComingSoonSection } from "@/components/top/coming-soon-section";
import { Hero } from "@/components/top/hero";
import { TeamMirai } from "@/components/top/team-mirai";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { BillsSearchSection } from "@/features/bills/server/components/bills-search-section";
import { FeaturedBillSection } from "@/features/bills/server/components/featured-bill-section";
import { InterviewOpenBillSection } from "@/features/bills/server/components/interview-open-bill-section";
import { PastSessionList } from "@/features/bills/server/components/past-session-list";
import { getFeaturedTags } from "@/features/bills/server/loaders/get-featured-tags";
import { getSuggestableBills } from "@/features/bills/server/loaders/get-suggestable-bills";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";
import {
  parseBillsSearchParams,
  type RawSearchParams,
} from "@/features/bills/shared/utils/parse-bills-search-params";
import type { BillWithContent } from "@/features/bills/shared/types";
import { chatBillName } from "@/features/bills/shared/utils/chat-bill-name";
import { pickHomeSections } from "@/features/bills/shared/utils/pick-home-sections";
import { HomeChatClient } from "@/features/chat/client/components/home-chat-client";
import { getCurrentDietSession } from "@/features/diet-sessions/server/loaders/get-current-diet-session";
import { getJapanTime } from "@/lib/utils/date";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const japanTime = getJapanTime();
  const searchState = parseBillsSearchParams(await searchParams);

  const [
    {
      billsByTag,
      featuredBills,
      interviewOpenBills,
      comingSoonBills,
      pastSessions,
      searchResult,
      categories,
    },
    currentSession,
    currentDifficulty,
    suggestableBills,
    featuredTags,
  ] = await Promise.all([
    loadHomeData(searchState),
    getCurrentDietSession(japanTime),
    getDifficultyLevel(),
    getSuggestableBills(),
    getFeaturedTags(),
  ]);

  const inSession = currentSession !== null;

  const { tagGroups, shownBills, featuredBillIds } = pickHomeSections({
    billsByTag,
    featuredBills,
    interviewOpenBills,
    inSession,
  });

  const toBillChatContext = (bill: BillWithContent) => {
    return {
      name: chatBillName(bill),
      summary: bill.bill_content?.summary,
      tags: bill.tags?.map((tag) => tag.label) || [],
      isFeatured: featuredBillIds.has(bill.id),
    };
  };

  return (
    <>
      <Hero />

      {/* 報告資料を探す */}
      <div className="bg-mirai-surface-muted py-10">
        <Container>
          <BillsSearchSection
            params={searchState}
            result={searchResult}
            categories={categories}
          />
        </Container>
      </div>

      {/* 議案一覧セクション */}
      <Container className="">
        <div className="py-10">
          <main className="flex flex-col gap-16">
            {/*
              AIインタビュー受付中セクション。意見を出せる報告資料を最初に見せる。
              会期では絞らない（閉会中でも受付中なら案内する）。
            */}
            {interviewOpenBills.length > 0 && (
              <InterviewOpenBillSection bills={interviewOpenBills} />
            )}

            {/* 注目の報告資料 */}
            <FeaturedBillSection bills={featuredBills} />

            {/* タグ別報告資料一覧セクション */}
            <BillsByTagSection billsByTag={tagGroups} />

            {/* Coming soonセクション */}
            <ComingSoonSection bills={comingSoonBills} />
          </main>
        </div>
      </Container>

      {/* 過去の会期セクション（Archive） */}
      {pastSessions.length > 0 && (
        <div className="bg-mirai-surface-muted py-10">
          <Container>
            <div className="flex flex-col gap-10">
              <PastSessionList sessions={pastSessions} />
            </div>
          </Container>
        </div>
      )}

      <Container className="pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-12 lg:gap-20">
          <div className="flex flex-col gap-8">
            {/* みらい議会とは セクション */}
            <About />

            {/* チームみらいについて セクション */}
            <TeamMirai />

            {/* 免責事項 */}
            <BillDisclaimer />
          </div>

          <div className="hidden md:block">
            {/* デスクトップ用チャットエリアのプレースホルダ */}
          </div>
        </div>
      </Container>

      {/* チャット機能 */}
      <HomeChatClient
        currentDifficulty={currentDifficulty}
        bills={shownBills.map(toBillChatContext)}
      />
    </>
  );
}
