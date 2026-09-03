import { describe, expect, it } from "vitest";
import {
  buildCalendarUrl,
  buildCommitteePageUrl,
  isCrawlableUrl,
  resolveUrl,
} from "./urls";

const COMMITTEE_PAGE =
  "https://www.kugikai.city.chuo.lg.jp/calendar/r08/fukushi_20260210.html";

describe("buildCalendarUrl", () => {
  it("年月を指定したカレンダーのURLを組み立てる", () => {
    expect(buildCalendarUrl(2026, 2)).toBe(
      "https://www.kugikai.city.chuo.lg.jp/calendar/index.html?year=2026&month=2&kaigi="
    );
  });

  it("月は0埋めしない（サイトの形式に合わせる）", () => {
    expect(buildCalendarUrl(2024, 11)).toContain("month=11");
    expect(buildCalendarUrl(2026, 9)).toContain("month=9");
  });
});

describe("buildCommitteePageUrl", () => {
  it("カレンダーの相対リンクを絶対URLにする", () => {
    expect(buildCommitteePageUrl("r08/fukushi_20260210.html")).toBe(
      COMMITTEE_PAGE
    );
  });
});

describe("resolveUrl", () => {
  it("日本語を含む資料PDFのパスをエンコードする", () => {
    const href =
      "../../shiryo/r8/福祉保健/2月10日/(資料4)病児・病後児保育事業における事前登録方法の見直しについて.pdf";
    const url = resolveUrl(COMMITTEE_PAGE, href);
    expect(url).toContain("/shiryo/r8/%E7%A6%8F%E7%A5%89%E4%BF%9D%E5%81%A5/");
    expect(url.endsWith(".pdf")).toBe(true);
  });

  it("ファイル名の空白を %20 にする", () => {
    const href =
      "../../shiryo/r8/福祉保健/9月2日/(資料1)社会福祉法人 中央区社会福祉協議会の運営状況について (1).pdf";
    expect(resolveUrl(COMMITTEE_PAGE, href)).toContain("%20");
  });

  it("すでにエンコード済みのURLを二重エンコードしない", () => {
    const encoded = `https://www.kugikai.city.chuo.lg.jp/shiryo/%E7%A6%8F%E7%A5%89.pdf`;
    expect(resolveUrl(COMMITTEE_PAGE, encoded)).toBe(encoded);
  });

  it("括弧はそのまま残す", () => {
    const href = "../../shiryo/r8/x/(資料4)y.pdf";
    const url = resolveUrl(COMMITTEE_PAGE, href);
    expect(url).toContain("(");
    expect(url).toContain(")");
  });

  it("解決できなければ例外にする", () => {
    expect(() => resolveUrl("not a url", "x.pdf")).toThrow(
      "URLを解決できなかった"
    );
  });
});

describe("isCrawlableUrl", () => {
  it("カレンダーページは取得してよい", () => {
    expect(isCrawlableUrl(buildCalendarUrl(2026, 2))).toBe(true);
  });

  it("委員会の開会日程ページは取得してよい", () => {
    expect(isCrawlableUrl(COMMITTEE_PAGE)).toBe(true);
  });

  it("資料PDFは取得してよい", () => {
    expect(
      isCrawlableUrl(
        "https://www.kugikai.city.chuo.lg.jp/shiryo/r8/%E7%A6%8F%E7%A5%89/x.pdf"
      )
    ).toBe(true);
  });

  it("会議録検索（.cgi）は取得しない", () => {
    // robots.txt が巡回してほしくないと示している形
    expect(
      isCrawlableUrl(
        "https://www.kugikai.city.chuo.lg.jp/kaigiroku/index.cgi?keyword=x"
      )
    ).toBe(false);
    expect(
      isCrawlableUrl(
        "https://www.kugikai.city.chuo.lg.jp/kaigiroku.cgi/r07/hukushi20260210.html"
      )
    ).toBe(false);
  });

  it("カレンダー以外のクエリ付きURLは取得しない", () => {
    expect(
      isCrawlableUrl("https://www.kugikai.city.chuo.lg.jp/gian/x.html?a=1")
    ).toBe(false);
  });

  it("/system/ と /tmp/ は取得しない", () => {
    expect(
      isCrawlableUrl("https://www.kugikai.city.chuo.lg.jp/system/x.html")
    ).toBe(false);
    expect(
      isCrawlableUrl("https://www.kugikai.city.chuo.lg.jp/tmp/x.html")
    ).toBe(false);
  });

  it("他のドメインは取得しない", () => {
    expect(isCrawlableUrl("https://example.com/x.pdf")).toBe(false);
    // 中央区の別サイトも対象外にする
    expect(isCrawlableUrl("https://www.city.chuo.lg.jp/x.html")).toBe(false);
  });

  it("URLとして壊れていれば取得しない", () => {
    expect(isCrawlableUrl("not a url")).toBe(false);
  });
});
