import { describe, expect, it } from "vitest";
import { extractShiryoNumbers } from "./extract-shiryo-numbers";

describe("extractShiryoNumbers", () => {
  it("「資料」が繰り返される形を拾う", () => {
    const text =
      "まず、資料４、そして資料６からお伺いをさせていただければと思います。";
    expect(extractShiryoNumbers(text)).toEqual([4, 6]);
  });

  it("「資料３、４、５、６」のように番号だけ並ぶ形も拾う", () => {
    const text = "私からは、資料３、４、５、６と触れたいところです。";
    expect(extractShiryoNumbers(text)).toEqual([3, 4, 5, 6]);
  });

  it("半角数字でも拾う", () => {
    expect(extractShiryoNumbers("資料1と資料10について")).toEqual([1, 10]);
  });

  it("「資料」と数字の間の空白を許す", () => {
    expect(extractShiryoNumbers("資料 ５ について")).toEqual([5]);
    expect(extractShiryoNumbers("資料　5について")).toEqual([5]);
  });

  it("同じ番号を重複させず、昇順で返す", () => {
    const text = "資料６について。続いて資料３。もう一度資料６に戻ります。";
    expect(extractShiryoNumbers(text)).toEqual([3, 6]);
  });

  it("資料への言及がなければ空配列を返す", () => {
    expect(extractShiryoNumbers("よろしくお願いいたします。")).toEqual([]);
  });

  it("「議案第3号」のような別の番号は拾わない", () => {
    expect(extractShiryoNumbers("議案第3号について伺います。")).toEqual([]);
  });

  it("列挙の直後に続く別の文の数字は拾わない", () => {
    // 「資料５」で列挙は切れ、「400人」は別の数字として扱う。
    const text = "資料５です。影響人数としては400人と見込んでおります。";
    expect(extractShiryoNumbers(text)).toEqual([5]);
  });
});
