import { describe, expect, it } from "vitest";
import {
  decodeEntities,
  htmlToText,
  reiwaToYear,
  toHalfWidthDigits,
  trimSpaces,
} from "./html-text";

describe("decodeEntities", () => {
  it("名前つき実体参照を戻す", () => {
    expect(decodeEntities("A&amp;B &lt;C&gt; &quot;D&quot;")).toBe(
      'A&B <C> "D"'
    );
  });

  it("&nbsp; を空白にする", () => {
    expect(decodeEntities("あ&nbsp;い")).toBe("あ い");
  });

  it("数値参照を戻す（10進・16進）", () => {
    expect(decodeEntities("&#65;&#x42;")).toBe("AB");
  });

  it("知らない実体参照はそのまま残す", () => {
    expect(decodeEntities("&unknown;")).toBe("&unknown;");
  });
});

describe("htmlToText", () => {
  it("タグを落とす", () => {
    expect(htmlToText("<p>本文</p>").trim()).toBe("本文");
  });

  it("br とブロック終了タグを改行にする", () => {
    expect(htmlToText("<li>あ<br>い</li>")).toBe("あ\nい\n");
  });

  it("コメントを落とす", () => {
    expect(htmlToText("令和<!-- InstanceBegin -->8<!-- End -->年")).toBe(
      "令和8年"
    );
  });

  it("script / style の中身を落とす", () => {
    expect(htmlToText("<script>var a=1;</script>本文").trim()).toBe("本文");
  });
});

describe("trimSpaces", () => {
  it("前後の空白を落とす", () => {
    expect(trimSpaces("  あ  ")).toBe("あ");
  });

  it("前後の全角スペースも落とす", () => {
    expect(trimSpaces("　あ　")).toBe("あ");
  });

  it("途中の全角スペースは残す", () => {
    expect(trimSpaces("あ　い")).toBe("あ　い");
  });
});

describe("toHalfWidthDigits", () => {
  it("全角数字を半角にする", () => {
    expect(toHalfWidthDigits("資料４、５")).toBe("資料4、5");
  });

  it("数字以外は変えない", () => {
    expect(toHalfWidthDigits("あア亜Ａ")).toBe("あア亜Ａ");
  });
});

describe("reiwaToYear", () => {
  it("令和1年を2019年にする", () => {
    expect(reiwaToYear(1)).toBe(2019);
  });

  it("令和8年を2026年にする", () => {
    expect(reiwaToYear(8)).toBe(2026);
  });
});
