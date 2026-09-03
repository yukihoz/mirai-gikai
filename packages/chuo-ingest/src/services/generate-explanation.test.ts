import { describe, expect, it, vi } from "vitest";
import type { ExplanationInput } from "../prompts/build-explanation-prompt";
import type { Explanation } from "../shared/schemas";
import {
  generateExplanation,
  generateExplanations,
  type ObjectGenerator,
} from "./generate-explanation";

const input: ExplanationInput = {
  title: "病児・病後児保育事業における事前登録方法の見直しについて",
  shiryoNumber: 4,
  committee: "福祉保健委員会",
  date: "2026-02-10",
  sourceText: "事前登録手続きをオンラインで完結できるよう見直す。",
};

const valid: Explanation = {
  title: "病児保育の申し込みがネットでできるようになります",
  summary:
    "これまで施設ごとに紙で出していた事前登録が、ネットで1回すればよくなります。",
  content: [
    "## 背景",
    "子どもが病気のときに預けられる病児・病後児保育を使うには、あらかじめ登録が必要です。",
    "これまでは施設ごとに紙の書類を出さなければならず、手間がかかっていました。",
    "",
    "## 具体的な内容",
    "- スマホやパソコンからネットで申し込めるようになります",
    "- 1回の登録で、区内すべての施設が使えるようになります",
    "",
    "## 今後の予定",
    "令和7年10月ごろから新しいやり方が始まる予定です。",
  ].join("\n"),
};

/** 決まった値を返す生成器。渡されたプロンプトを覗ける。 */
function fakeGenerator(value: unknown) {
  const calls: { label: string; system: string; user: string }[] = [];
  const generate: ObjectGenerator = async ({ prompt, label }) => {
    calls.push({ label, system: prompt.system, user: prompt.user });
    return value as never;
  };
  return { generate, calls };
}

describe("generateExplanation", () => {
  it("スキーマどおりの解説を返す", async () => {
    const { generate } = fakeGenerator(valid);
    await expect(
      generateExplanation({ input, difficulty: "normal", generate })
    ).resolves.toEqual(valid);
  });

  it("指示文とデータを分けて生成器に渡す", async () => {
    const { generate, calls } = fakeGenerator(valid);
    await generateExplanation({ input, difficulty: "normal", generate });

    expect(calls).toHaveLength(1);
    expect(calls[0].system).toContain("福祉保健委員会");
    expect(calls[0].user).toContain(input.sourceText);
    expect(calls[0].system).not.toContain(input.sourceText);
  });

  it("何の生成かが分かるラベルを渡す", async () => {
    const { generate, calls } = fakeGenerator(valid);
    await generateExplanation({ input, difficulty: "hard", generate });
    expect(calls[0].label).toBe("福祉保健委員会 2026-02-10 資料4 [hard]");
  });

  it("本文が短すぎる結果は通さない", async () => {
    const { generate } = fakeGenerator({ ...valid, content: "短い" });
    await expect(
      generateExplanation({ input, difficulty: "normal", generate })
    ).rejects.toThrow("解説の形式が想定と違う");
  });

  it("タイトルが空の結果は通さない", async () => {
    const { generate } = fakeGenerator({ ...valid, title: "" });
    await expect(
      generateExplanation({ input, difficulty: "normal", generate })
    ).rejects.toThrow("解説の形式が想定と違う");
  });

  it("項目が欠けた結果は通さない", async () => {
    const { generate } = fakeGenerator({ title: valid.title });
    await expect(
      generateExplanation({ input, difficulty: "normal", generate })
    ).rejects.toThrow("解説の形式が想定と違う");
  });

  it("エラーメッセージに対象を書く", async () => {
    const { generate } = fakeGenerator({ ...valid, summary: "" });
    await expect(
      generateExplanation({ input, difficulty: "normal", generate })
    ).rejects.toThrow("資料4 [normal]");
  });
});

describe("generateExplanations", () => {
  it("難易度ごとに解説を作る", async () => {
    const { generate, calls } = fakeGenerator(valid);
    const result = await generateExplanations({
      input,
      difficulties: ["normal", "hard"],
      generate,
    });

    expect(Object.keys(result)).toEqual(["normal", "hard"]);
    expect(calls.map((c) => c.label)).toEqual([
      "福祉保健委員会 2026-02-10 資料4 [normal]",
      "福祉保健委員会 2026-02-10 資料4 [hard]",
    ]);
  });

  it("直列に呼ぶ（予算を使い切ってから止まるのを避ける）", async () => {
    const order: string[] = [];
    const generate: ObjectGenerator = async ({ label }) => {
      order.push(`start:${label}`);
      await new Promise((resolve) => setTimeout(resolve, 1));
      order.push(`end:${label}`);
      return valid as never;
    };

    await generateExplanations({
      input,
      difficulties: ["normal", "hard"],
      generate,
    });

    // 2件目は1件目が終わってから始まる
    expect(order[1]).toContain("end:");
    expect(order[1]).toContain("[normal]");
    expect(order[2]).toContain("start:");
  });

  it("難易度を絞れる", async () => {
    const { generate, calls } = fakeGenerator(valid);
    await generateExplanations({
      input,
      difficulties: ["normal"],
      generate,
    });
    expect(calls).toHaveLength(1);
  });

  it("途中で失敗したら以降を呼ばない", async () => {
    const generate = vi
      .fn<ObjectGenerator>()
      .mockRejectedValueOnce(new Error("生成に失敗"));

    await expect(
      generateExplanations({
        input,
        difficulties: ["normal", "hard"],
        generate: generate as unknown as ObjectGenerator,
      })
    ).rejects.toThrow("生成に失敗");
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
