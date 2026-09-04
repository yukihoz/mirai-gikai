import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMinutes } from "../parsers/parse-minutes";
import type { Utterance } from "../shared/types";
import {
  buildDiscussionPrompt,
  type DiscussionInput,
  formatUtterances,
} from "./build-discussion-prompt";

const minutes = parseMinutes(
  readFileSync(
    join(
      import.meta.dirname,
      "../parsers/__fixtures__/minutes-fukushi-20260210.html"
    ),
    "utf-8"
  )
);

/** 実際の議事録から、理事者報告への質疑にあたる発言だけを取り出す */
function questionUtterances(): Utterance[] {
  const section = minutes?.sections.find((s) => s.kind === "report_questions");
  if (section === undefined) return [];
  return (minutes?.utterances ?? []).filter(
    (u) => u.index >= section.fromIndex && u.index <= section.toIndex
  );
}

const input: DiscussionInput = {
  committee: "福祉保健委員会",
  date: "2026-02-10",
  reports: [
    { number: 3, title: "特定乳児等通園支援事業の運営に関する基準等の設定" },
    { number: 4, title: "病児・病後児保育事業における事前登録方法の見直し" },
    { number: 5, title: "令和7年度税制改正に伴う介護保険制度の対応" },
    { number: 6, title: "人とペットの災害対策の推進に向けた連携協定の締結" },
  ],
  utterances: questionUtterances(),
};

const NONCE = "test-nonce";

describe("buildDiscussionPrompt", () => {
  const { system, user } = buildDiscussionPrompt({ input, nonce: NONCE });

  it("委員会と日付を伝える", () => {
    expect(system).toContain("福祉保健委員会");
    expect(system).toContain("2026-02-10");
  });

  it("資料の一覧を番号つきで渡す", () => {
    expect(system).toContain("資料4: 病児・病後児保育事業");
    expect(system).toContain("資料6: 人とペットの災害対策");
  });

  it("発言をデータ側に置き、区切りで囲む", () => {
    expect(user).toContain(`<<<UNTRUSTED_CONTENT_${NONCE}>>>`);
    expect(user).toContain("高橋委員");
  });

  it("発言をそのまま書き写させない", () => {
    expect(system).toContain("そのまま書き写さないで");
    expect(system).toContain("あなた自身の言葉で要約");
  });

  it("評価を書かせない", () => {
    expect(system).toContain("どちらが正しいという評価を書かないで");
  });

  it("会派名を書かせない", () => {
    expect(system).toContain("会派名・政党名は書かないで");
  });

  it("同じ論点を複数委員でまとめさせる", () => {
    expect(system).toContain("1つの論点にまとめて");
  });

  it("印が付くのは番号を口に出した回だけだと伝える", () => {
    expect(system).toContain("資料番号を口に出した回にしか付きません");
  });

  it("印の無い発言は直前の資料の続きとして読ませる", () => {
    expect(system).toContain("直前に印が付いた資料の続き");
  });

  it("番号を言わない委員は内容から紐づけさせる", () => {
    expect(system).toContain("資料番号を一度も口に出さない委員もいます");
    expect(system).toContain("発言の内容と");
    expect(system).toContain("件名を照らし合わせて");
  });

  it("除外はどの資料にも当てはまらないときだけにする", () => {
    expect(system).toContain("どの資料にも当てはまらない発言だけ");
  });

  it("渡す範囲が理事者報告への質疑だけだと伝える", () => {
    expect(system).toContain("理事者報告についての質疑は終了いたします");
    expect(system).toContain("あらかじめ取り除いてあります");
  });
});

describe("formatUtterances", () => {
  it("発言者と本文を並べる", () => {
    const text = formatUtterances(
      [
        {
          index: 1,
          speaker: "高橋委員",
          paragraphs: ["順次質問させていただきます。"],
          shiryoNumbers: [],
        },
      ],
      1000
    );
    expect(text).toBe("［発言1］高橋委員\n順次質問させていただきます。");
  });

  it("資料への言及に印を付ける", () => {
    const text = formatUtterances(
      [
        {
          index: 1,
          speaker: "高橋委員",
          paragraphs: ["まず、資料４、そして資料６から。"],
          shiryoNumbers: [4, 6],
        },
      ],
      1000
    );
    expect(text).toContain("高橋委員［資料4・6への言及］");
  });

  it("言及が無ければ印を付けない", () => {
    const text = formatUtterances(
      [
        {
          index: 1,
          speaker: "武藤生活衛生課長",
          paragraphs: ["以上でございます。"],
          shiryoNumbers: [],
        },
      ],
      1000
    );
    expect(text).not.toContain("［資料");
  });

  it("実際の議事録で、印が付く発言と付かない発言が混ざる", () => {
    const text = formatUtterances(questionUtterances(), 100_000);
    expect(text).toContain("［資料4・6への言及］");
    expect(text).toContain("［資料3・4・5・6への言及］");
    // 答弁には印が付かない
    expect(text).toContain("左近士子ども家庭支援センター所長\n");
  });

  it("上限を超えたら打ち切り、切ったことを書き添える", () => {
    const text = formatUtterances(questionUtterances(), 200);
    expect(text).toContain("以降は文字数の都合で省略");
    expect(text.length).toBeLessThan(600);
  });

  it("発言が無ければ空文字を返す", () => {
    expect(formatUtterances([], 1000)).toBe("");
  });
});
