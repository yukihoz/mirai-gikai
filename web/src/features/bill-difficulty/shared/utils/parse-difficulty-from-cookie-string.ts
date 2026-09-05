import {
  DIFFICULTY_COOKIE_NAME,
  type DifficultyLevelEnum,
} from "../types/index";
import { parseDifficultyLevel } from "./parse-difficulty-level";

/**
 * `document.cookie` の文字列から難易度を読む。
 *
 * ヘッダーの切り替えスイッチは、初期値を出すためだけにサーバーで Cookie を
 * 読んでいた。共有レイアウトで Cookie を読むと全ページが動的レンダリングに
 * なり、CDNに載らなくなる。値は表示の好みでしかないので、ブラウザ側で読む。
 */
export function parseDifficultyFromCookieString(
  cookieString: string
): DifficultyLevelEnum {
  for (const part of cookieString.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === DIFFICULTY_COOKIE_NAME) {
      return parseDifficultyLevel(safeDecode(rest.join("=")));
    }
  }

  return parseDifficultyLevel(undefined);
}

/**
 * デコードできない値は「無かった」ことにする。
 *
 * `decodeURIComponent` は `%` 単体のような壊れた値で例外を投げる。
 * この関数はヘッダーから呼ばれるので、投げるとCookieが壊れているだけで
 * 画面全体が落ちる。
 */
function safeDecode(value: string): string | undefined {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}
