import type { Metadata } from "next";
import { Container } from "@/components/layouts/container";
import { LegalPageLayout } from "@/components/layouts/legal-page-layout";

export const metadata: Metadata = {
  title: "よくある質問 | みらい議会",
  description: "みらい議会のよくある質問。現在準備中です。",
};

export default function FAQPage() {
  return (
    <LegalPageLayout
      className="bg-transparent pt-24 md:pt-12"
      title="よくある質問"
      description="みらい議会について、よくいただくお問い合わせをまとめています。"
    >
      <Container className="py-20 text-center">
        <p className="text-2xl font-bold text-gray-300">準備中</p>
        <p className="mt-4 text-mirai-text-muted">
          現在、よくある質問のコンテンツを準備しています。公開までしばらくお待ちください。
        </p>
      </Container>
    </LegalPageLayout>
  );
}
