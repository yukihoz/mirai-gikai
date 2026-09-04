import {
  buildUntrustedContentGuardInstructions,
  createUntrustedContentNonce,
  type SplitPrompt,
  wrapUntrustedContent,
} from "@mirai-gikai/shared/prompt-safety/untrusted-content";

/** モデルに渡す資料本文の最大文字数。分類は冒頭を読めば足りる。 */
export const MAX_CATEGORY_CHARS = 6_000;

export type CategoryInput = {
  /** 委員会に出された資料の件名（区の表記そのまま） */
  title: string;
  /** 記事の言い換えタイトル */
  articleTitle: string;
  /** 記事の要約 */
  summary: string;
  /** 資料PDFから取り出した本文 */
  sourceText: string;
  /** 選ばせるカテゴリの一覧 */
  categories: { id: string; label: string }[];
};

/**
 * 資料にカテゴリを付けさせるプロンプトを組み立てる。
 *
 * 解説の生成とは分けている。カテゴリだけ選び直したいことがあるのと、
 * 解説を作り直すと費用が資料本文ぶん丸ごとかかるため。
 */
export function buildCategoryPrompt(params: {
  input: CategoryInput;
  nonce?: string;
}): SplitPrompt {
  const { input } = params;
  const nonce = params.nonce ?? createUntrustedContentNonce();

  const list = input.categories.map((c) => `- ${c.label}`).join("\n");

  const system = `あなたは、中央区議会に出された報告資料を、区民が探しやすいように分類する担当者です。

## 選べるカテゴリ

${list}

## やること

資料を読み、**当てはまるカテゴリを1〜3件**選んでください。
上の一覧にある表記をそのまま返してください（絵文字も含めて一字一句同じに）。

## 選び方

- **区民から見て、その資料が誰に関わるか**で選んでください。
  区役所の担当部署ではなく、暮らしの側から見た分類です
- 迷ったら**絞ってください**。3件まで選べますが、無理に埋めなくてよい。
  本当に中心となる話題が1つなら1件で構いません
- 委員会の名前に引きずられないでください。福祉保健委員会に出た資料でも、
  中身がデジタル手続の話なら「💻 デジタル・DX」です
- どれにも当てはまらないと判断したら、空で返してください。
  無理にどれかへ寄せると、探す人の邪魔になります

## 例

- 病児保育の事前登録がオンラインでできるようになる
  → 「👶 子育て・保育園」「💻 デジタル・DX」
- 後期高齢者医療の保険料率を改定する
  → 「👵 高齢者・介護」「💰 税金・家計への支援」
- 鉄道駅のエレベーター設置状況の報告
  → 「🚲 道路・交通・バス」「🏛️ 公共施設・インフラ」

${buildUntrustedContentGuardInstructions(nonce)}`;

  const body = [
    `件名: ${input.title}`,
    `記事タイトル: ${input.articleTitle}`,
    `要約: ${input.summary}`,
    "",
    "資料の本文:",
    input.sourceText.slice(0, MAX_CATEGORY_CHARS),
  ].join("\n");

  return { system, user: wrapUntrustedContent(body, nonce) };
}
