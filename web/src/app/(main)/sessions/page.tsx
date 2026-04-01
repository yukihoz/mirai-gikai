import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layouts/container";
import { getAllDietSessions } from "@/features/diet-sessions/server/loaders/get-all-diet-sessions";
import { env } from "@/lib/env";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: `議会会期一覧 | ${env.siteTitle}`,
  description: `${env.assemblyName}の過去の会期一覧です。各会期で提出された議案をご覧いただけます。`,
};

export default async function SessionsPage() {
  const sessions = await getAllDietSessions();

  return (
    <Container className="py-12">
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="text-3xl font-bold text-mirai-text mb-4">過去の会期一覧</h1>
          <p className="text-sm text-mirai-text-secondary">
            {env.assemblyName}でこれまでに開催された会期の一覧です。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => {
            const startDate = new Date(session.start_date);
            const endDate = new Date(session.end_date);
            const year = startDate.getFullYear();
            
            // 名称の中に年が含まれているかチェック（重複表示防止）
            const displayName = session.name.includes(year.toString())
              ? session.name
              : `${year}年 ${session.name}`;

            if (!session.slug) return null;

            return (
              <Link
                key={session.id}
                href={routes.kokkaiSessionBills(session.slug)}
                className="group p-6 bg-white border border-mirai-border-light rounded-2xl hover:border-primary-accent transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-mirai-text group-hover:text-primary-accent transition-colors">
                        {displayName}
                      </h2>
                      {session.is_active && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-accent text-white rounded-full">
                          実施中
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-mirai-text-secondary">
                      の提出議案・報告事項
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-mirai-text-secondary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}

          {sessions.length === 0 && (
            <div className="py-20 text-center text-mirai-text-secondary">
              会期情報が見つかりませんでした。
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
