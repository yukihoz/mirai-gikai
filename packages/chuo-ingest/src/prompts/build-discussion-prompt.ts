import {
  buildUntrustedContentGuardInstructions,
  createUntrustedContentNonce,
  type SplitPrompt,
  wrapUntrustedContent,
} from "@mirai-gikai/shared/prompt-safety/untrusted-content";
import type { Utterance } from "../shared/types";

/** モデルに渡す議事録の最大文字数。1会議あたり実測で2〜3万字。 */
export const MAX_MINUTES_CHARS = 60_000;

export type DiscussionInput = {
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  date: string;
  /** 委員会に出された資料（番号と件名） */
  reports: { number: number; title: string }[];
  /** 理事者報告への質疑にあたる発言 */
  utterances: Utterance[];
};

/**
 * 委員会の質疑を資料ごとに切り分けて要約させるプロンプトを組み立てる。
 *
 * 中央区の委員会は報告事項への質疑をまとめて行うが、委員が自分でどの資料の
 * 話かを宣言する（「まず、資料４、そして資料６から」）。パーサーが拾った
 * 資料番号を各発言に添えて渡し、モデルには振り分けと要約をさせる。
 *
 * 発言そのものは公開しない。議員の発言の著作権は議員個人に帰属し、
 * ウェブ掲載の可否は学説が割れている。一方、情報解析（著作権法30条の4）は
 * 自由で、AIが独自の表現で書いた要約は原文の表現を再現しない限り
 * 複製・翻案に当たらない。だから「要約させる」ことがそのまま設計になる。
 */
export function buildDiscussionPrompt(params: {
  input: DiscussionInput;
  nonce?: string;
}): SplitPrompt {
  const { input } = params;
  const nonce = params.nonce ?? createUntrustedContentNonce();

  const reportList = input.reports
    .map((r) => `- 資料${r.number}: ${r.title}`)
    .join("\n");

  const system = `あなたは、中央区議会の委員会でどんな質疑があったかを区民に伝える記録者です。

${input.date} の${input.committee}で、次の資料について報告が行われ、まとめて質疑が行われました。

${reportList}

## 渡される発言の範囲

**理事者報告に対する質疑の部分だけ**を渡します。
委員長が「理事者報告についての質疑は終了いたします」と述べた以降の議題
（区政全般の調査、請願審査など）は、資料に紐づかない自由な質疑なので、
あらかじめ取り除いてあります。

## やること

質疑を読み、**資料ごとに**「どんな論点が議論されたか」を取り出してください。

- 1つの資料に複数の論点があれば、論点ごとに分けてください
- 複数の委員が同じことを聞いていたら、**1つの論点にまとめて** questioners に全員を入れてください
- 質疑が交わされていない資料は、結果に含めないでください（無理に作らない）

## どの資料の話かの見分け方

発言には \`［資料4への言及］\` のような印を付けてあります。ただしこれは、委員が
「まず、資料４について」と**資料番号を口に出した回にしか付きません**。印だけを
頼りにせず、次の順で判断してください。

1. **印がある発言**は、その資料の話です
2. **印が無い発言**は、まず直前に印が付いた資料の続きとして読んでください。
   理事者の答弁や、同じ委員の追加質問には印が付きません
3. **資料番号を一度も口に出さない委員もいます。** その場合は、発言の内容と
   上の資料一覧の件名を照らし合わせて、どの資料の話かを判断してください。
   例えば保育所の待機児童の話をしていれば、保育に関する資料の質疑です
4. 委員が変わったら、その委員が最初に触れた資料から読み直してください

内容から見てどの資料にも当てはまらない発言だけ、除外してください。

## 絶対に守ること

- **発言をそのまま書き写さないでください。** あなた自身の言葉で要約してください
- 発言に無いことを補わないでください。金額・日付・数値・固有名詞は発言のとおりに
- **どちらが正しいという評価を書かないでください。** 委員の質問が鋭いとか、区の回答が
  不十分だとか、そうした判断は記録者の役割ではありません。何が問われ、何が答えられたかを
  そのまま伝えることに徹してください
- 会派名・政党名は書かないでください
- 発言者名は氏名だけにしてください（「高橋委員」→「高橋」、
  「武藤生活衛生課長」→「武藤 生活衛生課長」のように、委員は氏名のみ、
  理事者は氏名と役職）
- 「以上でございます」「よろしくお願いいたします」のような定型のあいさつは、
  論点に含めないでください

## 出力の目安

- title は「なぜ〜なのか」「〜は大丈夫か」のように、論点が分かる短い見出しに
- question は1〜2文。answer は1〜3文
- 質疑が実質的に行われていない会議なら、discussions を空配列にしてください

${buildUntrustedContentGuardInstructions(nonce)}`;

  const user = wrapUntrustedContent(
    formatUtterances(input.utterances, MAX_MINUTES_CHARS),
    nonce
  );

  return { system, user };
}

/**
 * 発言を「発言者 → 本文」の並びにする。
 *
 * パーサーが拾った資料番号を添える。委員が「資料４について」と言った回だけ
 * 番号が付き、続く答弁や追加質問には付かないので、モデルには直前の資料を
 * 引き継ぐよう system 側で伝えている。
 */
export function formatUtterances(
  utterances: Utterance[],
  maxChars: number
): string {
  const lines: string[] = [];
  let total = 0;

  for (const utterance of utterances) {
    const mention =
      utterance.shiryoNumbers.length > 0
        ? `［資料${utterance.shiryoNumbers.join("・")}への言及］`
        : "";
    const body = utterance.paragraphs.join("\n");
    const line = `${utterance.speaker}${mention}\n${body}`;

    if (total + line.length > maxChars) {
      lines.push("（以降は文字数の都合で省略）");
      break;
    }
    lines.push(line);
    total += line.length;
  }

  return lines.join("\n\n");
}
