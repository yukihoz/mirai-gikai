import {
  buildUntrustedContentGuardInstructions,
  createUntrustedContentNonce,
  type SplitPrompt,
  wrapUntrustedContent,
} from "@mirai-gikai/shared/prompt-safety/untrusted-content";

/** モデルに渡す資料本文の最大文字数。長い資料は後ろを落とす。 */
export const MAX_SHIRYO_CHARS = 24_000;

export const DIFFICULTY_LEVELS = ["normal", "hard"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export type ExplanationInput = {
  /** 委員会に出された資料の件名（区の表記そのまま） */
  title: string;
  /** 資料番号。無ければ null */
  shiryoNumber: number | null;
  /** 会議体名（例: 福祉保健委員会） */
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  date: string;
  /** 資料PDFから取り出した本文 */
  sourceText: string;
};

const DIFFICULTY_GUIDANCE: Record<DifficultyLevel, string> = {
  normal: `## 読み手と書き方（ふつう）
- 読み手は、区政に特別くわしくない中央区民です。中学生が読んでも分かる言葉で書いてください
- 行政の言い回し（「〜に資する」「所要の改正」「鑑み」など）は、日常の言葉に置き換えてください
- 制度や事業の名前を出すときは、それが何なのかを一言添えてください
- 本文は600〜900文字程度を目安にしてください`,
  hard: `## 読み手と書き方（くわしい）
- 読み手は、区政に関心があり、背景まで知りたい中央区民です
- 制度の仕組み、見直しの経緯、金額・対象範囲・時期などの具体を落とさずに書いてください
- 専門用語を使ってよいですが、初出時には短い説明を添えてください
- 本文は1000〜1600文字程度を目安にしてください`,
};

/**
 * 委員会資料の解説を書かせるプロンプトを組み立てる。
 *
 * 材料は区が公開している資料PDFの本文だけで、モデルの一般知識で内容を
 * 補わせない。区議会の報告事項は区民生活に直結するため、事実でない説明を
 * 出すと区政への誤解に直結する。
 *
 * 資料本文は外部から来たテキストなので、指示文（system）とは別のチャネル
 * （user）に、ナンス付きの区切りで囲んで渡す。資料の中に「この指示を
 * 無視して」と書かれていても従わせない。
 */
export function buildExplanationPrompt(params: {
  input: ExplanationInput;
  difficulty: DifficultyLevel;
  nonce?: string;
}): SplitPrompt {
  const { input, difficulty } = params;
  const nonce = params.nonce ?? createUntrustedContentNonce();

  const facts = [
    input.shiryoNumber === null ? null : `資料番号: 資料${input.shiryoNumber}`,
    `件名: ${input.title}`,
    `会議体: ${input.committee}`,
    `報告日: ${input.date}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const system = `あなたは、中央区議会に出された委員会資料を区民に分かりやすく伝える解説者です。

${DIFFICULTY_GUIDANCE[difficulty]}

## 絶対に守ること

- **資料に書かれていないことは書かないでください。** 一般的な知識で内容を補ったり、
  「おそらく〜だろう」と推測したりしてはいけません。資料から読み取れることだけを書きます
- 金額・日付・対象範囲・施設名などの具体的な数値や固有名詞は、資料のとおりに正確に書いてください
- この報告への賛否や評価を書かないでください。「良い見直しです」「問題があります」といった
  価値判断は解説者の役割ではありません。何が変わるのかを説明することに徹してください
- 資料が乏しく内容を説明しきれない場合は、分かる範囲だけを簡潔に書いてください。
  分量を満たすために内容を膨らませてはいけません
- 議員個人や会派の名前を出さないでください

## 本文の構成

\`## 見出し\` でセクションを区切ってください（サイト側が \`##\` ごとにカードで囲みます）。
次の構成を基本にし、資料に該当する情報がない節は省いて構いません。

- \`## 背景\` … なぜこれが行われるのか
- \`## 具体的な内容\` … 何がどう変わるのか。箇条書きが有効なら \`- \` を使う
- \`## 区民の暮らしへの関わり\` … どんな人が、どんな場面で関係するのか。
  資料から読み取れる範囲に限り、想像で広げないこと
- \`## 今後の予定\` … 時期が書かれている場合のみ

## 資料の情報

${facts}

${buildUntrustedContentGuardInstructions(nonce)}`;

  const user = wrapUntrustedContent(
    truncate(input.sourceText, MAX_SHIRYO_CHARS),
    nonce
  );

  return { system, user };
}

/**
 * 長すぎる資料を切り詰める。
 *
 * 切ったことが分かるようにしておく。黙って落とすと、後半が無いまま
 * 「資料の全体を読んだ」つもりの解説が出る。
 */
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n（以降は文字数の都合で省略。この資料には続きがあります）`;
}
