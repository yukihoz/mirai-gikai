import { toHalfWidthDigits } from "../shared/html-text";

/**
 * 発言から資料番号を拾う。
 *
 * 中央区の委員会では、報告事項7件への質疑がまとめて行われる。そのかわり
 * 委員が自分でどの資料の話かを宣言する。
 *
 *   「まず、資料４、そして資料６からお伺いをさせていただければと思います」
 *   「私からは、資料３、４、５、６と触れたいところです」
 *   「続きまして、資料５で質問をさせていただきます」
 *
 * 1つ目の形は「資料」が繰り返されるので素直に拾える。2つ目のように
 * 「資料３、４、５、６」と番号だけ並ぶ形があるため、「資料N」に続く
 * 「、N」の並びも同じ資料への言及として扱う。
 *
 * 「資料1-2」のような枝番や「第3号議案」は対象にしない。委員会の資料は
 * 通し番号で振られており、枝番が出たときに黙って親番号へ丸めるより、
 * 拾えなかったことが分かるほうが後で気づける。
 */
export function extractShiryoNumbers(text: string): number[] {
  const normalized = toHalfWidthDigits(text);
  const found = new Set<number>();

  // 「資料」＋数字。続けて「、数字」が並ぶ場合はそれも同じ列挙とみなす。
  const pattern = /資料[\s 　]*(\d{1,2})((?:[、,][\s 　]*\d{1,2})*)/g;

  for (const match of normalized.matchAll(pattern)) {
    found.add(Number.parseInt(match[1], 10));

    const trailing = match[2];
    if (!trailing) continue;
    for (const rest of trailing.matchAll(/\d{1,2}/g)) {
      found.add(Number.parseInt(rest[0], 10));
    }
  }

  return [...found].sort((a, b) => a - b);
}
