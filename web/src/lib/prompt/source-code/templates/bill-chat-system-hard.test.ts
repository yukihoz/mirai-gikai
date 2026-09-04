import { describe, expect, it } from "vitest";
import { env } from "@/lib/env";
import { buildBillChatSystemHardPrompt } from "./bill-chat-system-hard";

describe("buildBillChatSystemHardPrompt", () => {
  it("4つのパラメータがプロンプトに埋め込まれる", () => {
    const result = buildBillChatSystemHardPrompt(
      "テスト報告資料名",
      "テスト報告資料タイトル",
      "テスト報告資料要約",
      "テスト報告資料詳細"
    );

    expect(result).toContain("テスト報告資料名");
    expect(result).toContain("テスト報告資料タイトル");
    expect(result).toContain("テスト報告資料要約");
    expect(result).toContain("テスト報告資料詳細");
  });

  it("難易度「難しい」セクションが含まれる", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).toContain("回答の難易度：難しい");
    expect(result).toContain("専門用語を正確に使用");
  });

  it("みらい議会の説明が含まれる", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).toContain(env.siteShortName);
    expect(result).toContain(env.teamName);
  });

  it("knowledgeSource を渡すと <knowledge_source> セクションが含まれる", () => {
    const result = buildBillChatSystemHardPrompt(
      "a",
      "b",
      "c",
      "d",
      "補足知識"
    );

    expect(result).toContain("補足ナレッジ");
    expect(result).toContain("補足知識");
  });

  it("knowledgeSource を省略するとセクションごと出ない", () => {
    const result = buildBillChatSystemHardPrompt("a", "b", "c", "d");

    expect(result).not.toContain("<knowledge_source>");
  });
});
