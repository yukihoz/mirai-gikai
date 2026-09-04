import { Container } from "@/components/layouts/container";
import { About } from "@/components/top/about";
import { ComingSoonSection } from "@/components/top/coming-soon-section";
import { Hero } from "@/components/top/hero";
import { TeamMirai } from "@/components/top/team-mirai";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { BillDisclaimer } from "@/features/bills/client/components/bill-detail/bill-disclaimer";
import { BillsByTagSection } from "@/features/bills/server/components/bills-by-tag-section";
import { FeaturedBillSection } from "@/features/bills/server/components/featured-bill-section";
import { BillsSearchSection } from "@/features/bills/server/components/bills-search-section";
import { loadHomeData } from "@/features/bills/server/loaders/load-home-data";
import {
  parseBillsSearchParams,
  type RawSearchParams,
} from "@/features/bills/shared/utils/parse-bills-search-params";
import type { BillWithContent } from "@/features/bills/shared/types";
import { HomeChatClient } from "@/features/chat/client/components/home-chat-client";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const searchState = parseBillsSearchParams(await searchParams);
  const {
    billsByTag,
    featuredBills,
    comingSoonBills,
    searchResult,
    categories,
  } = await loadHomeData(searchState);

  // ゆくゆくタグ機能がマージされたらBFFに統合する
  const [currentDifficulty] = await Promise.all([getDifficultyLevel()]);

  const toBillChatContext = (bill: BillWithContent) => {
    return {
      name: `${bill.bill_content?.title}（${bill.name}）`,
      summary: bill.bill_content?.summary,
      tags: bill.tags?.map((tag) => tag.label) || [],
      isFeatured: featuredBills.some((b) => b.id === bill.id),
    };
  };

  return (
    <>
      <Hero />

      {/* 議案一覧セクション */}
      <Container className="">
        <div className="py-10">
          <main className="flex flex-col gap-16">
            {/* 注目の法案セクション */}
            <FeaturedBillSection bills={featuredBills} />

            {/* タグ別議案一覧セクション */}
            <BillsByTagSection billsByTag={billsByTag} />

            {/* Coming soonセクション */}
            <ComingSoonSection bills={comingSoonBills} />
          </main>
        </div>
      </Container>

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
            {/* デスクトップ用チャットエリア（空のプレースホルダ。HomeChatClientが絶対配置や固定配置でない場合に有効） */}
          </div>
        </div>
      </Container>

      {/* チャット機能（実際には固定配置やフロートなどの可能性があるため、場所は変えずコンテキストのみ統合） */}
      <HomeChatClient
        currentDifficulty={currentDifficulty}
        bills={billsByTag
          .flatMap((x) => x.bills)
          .concat(featuredBills)
          .map(toBillChatContext)}
      />
    </>
  );
}
