import { describe, expect, it } from "vitest";
import { parseDifficultyFromCookieString } from "./parse-difficulty-from-cookie-string";

describe("parseDifficultyFromCookieString", () => {
  it("該当するCookieの値を読む", () => {
    expect(parseDifficultyFromCookieString("bill_difficulty_level=hard")).toBe(
      "hard"
    );
  });

  it("ほかのCookieに混ざっていても読む", () => {
    expect(
      parseDifficultyFromCookieString(
        "foo=1; bill_difficulty_level=hard; bar=2"
      )
    ).toBe("hard");
  });

  it("名前の一部が一致するだけのCookieは拾わない", () => {
    expect(parseDifficultyFromCookieString("xbill_difficulty_level=hard")).toBe(
      "normal"
    );
  });

  it("Cookieが無ければ既定値", () => {
    expect(parseDifficultyFromCookieString("")).toBe("normal");
    expect(parseDifficultyFromCookieString("foo=1")).toBe("normal");
  });

  it("値が空でも既定値", () => {
    expect(parseDifficultyFromCookieString("bill_difficulty_level=")).toBe(
      "normal"
    );
  });

  it("前後に空白があっても読む", () => {
    expect(
      parseDifficultyFromCookieString("foo=1 ;  bill_difficulty_level=hard ")
    ).toBe("hard");
  });

  it("同じ名前が並んでいたら先に出てきたほうを使う", () => {
    expect(
      parseDifficultyFromCookieString(
        "bill_difficulty_level=hard; bill_difficulty_level=normal"
      )
    ).toBe("hard");
  });

  it("URLエンコードされた値をデコードする", () => {
    expect(
      parseDifficultyFromCookieString("bill_difficulty_level=%68ard")
    ).toBe("hard");
  });

  it("デコードできない値でも例外を投げず既定値", () => {
    // decodeURIComponent は "%" 単体で URIError を投げる。
    // ヘッダーから呼ばれるので、投げると画面全体が落ちる
    expect(parseDifficultyFromCookieString("bill_difficulty_level=%")).toBe(
      "normal"
    );
  });

  it("知らない値は既定値", () => {
    expect(
      parseDifficultyFromCookieString("bill_difficulty_level=veryhard")
    ).toBe("normal");
  });
});
