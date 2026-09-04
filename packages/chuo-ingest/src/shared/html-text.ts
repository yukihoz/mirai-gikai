/**
 * 中央区議会サイトのHTMLを読むための小さなテキスト処理。
 *
 * 対象は区議会サイトが吐く素直なHTMLだけなので、DOMパーサーは持ち込まない。
 * jsdom を足すと worker のイメージが重くなるうえ、ここで必要なのは
 * 「タグを落とす」「実体参照を戻す」程度でしかない。
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  // ノーブレークスペースのまま残すと、後段の空白判定が種類ごとに増える。
  // 表示上の差は無いので通常の空白にそろえる。
  nbsp: " ",
};

/** HTMLの実体参照を文字に戻す（このサイトに出るものだけ扱う） */
export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
    if (body.startsWith("#x") || body.startsWith("#X")) {
      const code = Number.parseInt(body.slice(2), 16);
      return Number.isNaN(code) ? whole : String.fromCodePoint(code);
    }
    if (body.startsWith("#")) {
      const code = Number.parseInt(body.slice(1), 10);
      return Number.isNaN(code) ? whole : String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
  });
}

/**
 * タグを落として本文だけにする。
 *
 * `<br>` と `</p>` は改行に変える。改行を空白に潰すと、議事録の段落や
 * 資料リストの項目が1行にくっついてしまい、後段で分けられなくなる。
 */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|div|tr|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  );
}

/** 前後の空白と非改行スペースを落とす（全角スペースは本文の一部なので残す） */
export function trimSpaces(input: string): string {
  return input.replace(/^[\s ]+|[\s ]+$/g, "");
}

/** 全角数字を半角に直す */
export function toHalfWidthDigits(input: string): string {
  return input.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );
}

/**
 * 令和の年を西暦に直す。
 *
 * 令和1年 = 2019年。中央区議会サイトのURLやページ内表記は令和で通っている。
 */
export function reiwaToYear(reiwaYear: number): number {
  return reiwaYear + 2018;
}
