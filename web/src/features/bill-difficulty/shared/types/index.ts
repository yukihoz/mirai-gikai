import type { Database } from "@mirai-gikai/supabase";

// 難易度レベルのEnum
export type DifficultyLevelEnum =
  Database["public"]["Enums"]["difficulty_level_enum"];

// 難易度のラベル
export const DIFFICULTY_LABELS: Record<DifficultyLevelEnum, string> = {
  normal: "ふつう",
  hard: "難しい",
};

// 難易度の説明
export const DIFFICULTY_DESCRIPTIONS: Record<DifficultyLevelEnum, string> = {
  normal: "中学生レベルの内容",
  hard: "専門用語を含む詳細な内容",
};

// Cookie名とデフォルト値
export const DIFFICULTY_COOKIE_NAME = "bill_difficulty_level";
export const DEFAULT_DIFFICULTY: DifficultyLevelEnum = "normal";

// 有効な難易度レベルの配列
export const VALID_DIFFICULTY_LEVELS: DifficultyLevelEnum[] = [
  "normal",
  "hard",
];

// Cookie設定オプション
/**
 * 難易度Cookie専用の設定。ほかのCookieに流用しないこと。
 * `httpOnly` を外しているのは、この値が表示の好みでしかないため。
 */
export const DIFFICULTY_COOKIE_OPTIONS = {
  // ヘッダーの切り替えスイッチがブラウザ側で初期値を読む。
  // 中身は「ふつう / 難しい」の表示の好みだけで、秘匿する情報ではない
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365, // 1年間
  path: "/",
};
