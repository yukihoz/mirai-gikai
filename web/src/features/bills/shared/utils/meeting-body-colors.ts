/**
 * 会議体ごとのテーマカラー。
 *
 * サムネイルの柄（Client Component）と、記事本文の質疑セクション
 * （Server Component）の両方から引くので、どちらにも属さない場所に置く。
 */
export type MeetingBodyColor = {
  /** 面の色。淡い背景に使う */
  bg: string;
  /** 柄の線の色。背景の上に薄く重ねる */
  text: string;
  /** 質疑の発言に添える縦線。文字の横に置くので濃さを保つ */
  rail: string;
};

const meetingBodyColors: Record<string, MeetingBodyColor> = {
  // 企画総務系 -> 【ブルー系】 (変更指定あり)
  企画総務委員会: {
    bg: "bg-blue-50",
    text: "text-blue-500/20",
    rail: "bg-blue-500",
  },

  // 本会議・定例会 -> 【パープル系】 (変更指定あり)
  定例会: {
    bg: "bg-purple-50",
    text: "text-purple-500/20",
    rail: "bg-purple-500",
  },
  臨時会: {
    bg: "bg-purple-50",
    text: "text-purple-500/20",
    rail: "bg-purple-500",
  },
  AIインタビュー: {
    bg: "bg-purple-50",
    text: "text-purple-500/20",
    rail: "bg-purple-500",
  },

  // 区民・文教系 -> 【オレンジ・イエロー系】
  区民文教委員会: {
    bg: "bg-orange-50",
    text: "text-orange-500/20",
    rail: "bg-orange-500",
  },

  // 福祉保健系 -> 【ピンク・赤系】
  福祉保健委員会: {
    bg: "bg-rose-50",
    text: "text-rose-500/20",
    rail: "bg-rose-500",
  },

  // 環境・建設基盤系 -> 【グリーン・エメラルド系】
  環境建設委員会: {
    bg: "bg-emerald-50",
    text: "text-emerald-500/20",
    rail: "bg-emerald-500",
  },
  築地等都市基盤対策特別委員会: {
    bg: "bg-teal-50",
    text: "text-teal-500/20",
    rail: "bg-teal-500",
  },

  // その他特別委員会（アンバー・ピンク・レッド系）
  地域活性化対策特別委員会: {
    bg: "bg-amber-50",
    text: "text-amber-500/30",
    rail: "bg-amber-500",
  },
  "子ども子育て・高齢者対策特別委員会": {
    bg: "bg-pink-50",
    text: "text-pink-500/20",
    rail: "bg-pink-500",
  },
  防災等安全対策特別委員会: {
    bg: "bg-red-50",
    text: "text-red-500/15",
    rail: "bg-red-500",
  },

  // 2026年5月に組み替えられた特別委員会。旧委員会の系統色を引き継ぐ
  "築地まちづくり・環境対策特別委員会": {
    bg: "bg-teal-50",
    text: "text-teal-500/20",
    rail: "bg-teal-500",
  },
  "区制施行８０周年等にぎわいの向上・創出対策特別委員会": {
    bg: "bg-amber-50",
    text: "text-amber-500/30",
    rail: "bg-amber-500",
  },
  "子ども・教育環境整備対策特別委員会": {
    bg: "bg-pink-50",
    text: "text-pink-500/20",
    rail: "bg-pink-500",
  },
  "区民生活等安全・安心対策特別委員会": {
    bg: "bg-red-50",
    text: "text-red-500/15",
    rail: "bg-red-500",
  },

  // 予算・決算（イエロー・ストーン系）
  予算特別委員会: {
    bg: "bg-yellow-50",
    text: "text-yellow-600/30",
    rail: "bg-yellow-600",
  },
  決算特別委員会: {
    bg: "bg-stone-50",
    text: "text-stone-500/20",
    rail: "bg-stone-500",
  },
};

/** 色が決まっていない会議体に使う */
export const DEFAULT_MEETING_BODY_COLOR: MeetingBodyColor = {
  bg: "bg-gray-50",
  text: "text-gray-400/20",
  rail: "bg-gray-400",
};

/**
 * 会議体の色を引く。
 *
 * 委員会は数年ごとに組み替えられる。知らない名前が来たときに黙って
 * グレーへ落とすと気づけないので、警告を残してからデフォルトを返す。
 */
export function getMeetingBodyColor(
  meetingBody: string | null | undefined
): MeetingBodyColor {
  if (!meetingBody) return DEFAULT_MEETING_BODY_COLOR;

  const color = meetingBodyColors[meetingBody];
  if (color === undefined) {
    console.warn(`[meeting-body-color] 色が未定義の会議体: ${meetingBody}`);
    return DEFAULT_MEETING_BODY_COLOR;
  }
  return color;
}
