import type { Minutes, Utterance } from "../shared/types";

/**
 * 議事録から「理事者報告に対する質疑」の発言だけを取り出す。
 *
 * 中央区の委員会は、報告事項への質疑が終わると議題（区政全般の調査、請願審査
 * など）に移る。委員長が
 *
 *   「では、理事者報告についての質疑は終了いたします」
 *   「続きまして、議題（１）、…に入ります」
 *
 * と区切ったあとの質疑は資料に紐づかない自由なやりとりなので、資料ごとの
 * 質疑としては扱わない。
 *
 * この線引きを呼び出し側に任せると、議題の質疑まで資料に貼り付いてしまう。
 * 範囲の決定はここに閉じ込める。
 */
export function selectReportQuestions(minutes: Minutes): Utterance[] {
  const section = minutes.sections.find((s) => s.kind === "report_questions");
  if (section === undefined) return [];

  return minutes.utterances.filter(
    (u) => u.index >= section.fromIndex && u.index <= section.toIndex
  );
}

/**
 * 質疑の中から、委員長の進行発言を落とす。
 *
 * 「発言を願います」「質疑の半ばではありますが、一旦休憩を入れます」など、
 * 中身のないやりとりを渡してもトークンを使うだけで論点は増えない。
 *
 * ただし委員長が委員として質問することもあるため、一律には落とさない。
 * 進行の定型句だけを見て判断する。
 */
export function dropChairProcedural(utterances: Utterance[]): Utterance[] {
  return utterances.filter((utterance) => {
    if (!utterance.speaker.endsWith("委員長")) return true;
    const text = utterance.paragraphs.join("");
    return !PROCEDURAL_PATTERNS.some((pattern) => pattern.test(text));
  });
}

/** 委員長の進行を示す定型句 */
const PROCEDURAL_PATTERNS: RegExp[] = [
  /質疑に入ります/,
  /発言を願います/,
  /発言の時間制/,
  /持ち時間/,
  /休憩を入れます/,
  /再開いたします/,
  /質疑は終了/,
  /ほかに(質疑|ございませ)/,
];
