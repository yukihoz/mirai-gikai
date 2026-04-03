"use client";

import dynamic from "next/dynamic";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";

const ChatButton = dynamic(
  () => import("./chat-button").then((m) => m.ChatButton),
  { ssr: false }
);

interface HomeChatClientProps {
  currentDifficulty: DifficultyLevelEnum;
  bills: Array<{
    name: string;
    summary?: string;
    tags?: string[];
    isFeatured?: boolean;
  }>;
}

/**
 * トップページ用のチャット機能を提供するコンポーネント
 */
export function HomeChatClient({
  currentDifficulty,
  bills,
}: HomeChatClientProps) {
  return (
    <ChatButton
      difficultyLevel={currentDifficulty}
      pageContext={{
        type: "home",
        bills,
      }}
    />
  );
}
