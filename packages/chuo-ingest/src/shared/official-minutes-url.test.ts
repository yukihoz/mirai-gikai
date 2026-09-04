import { describe, expect, it } from "vitest";
import { buildOfficialMinutesUrl } from "./official-minutes-url";

describe("buildOfficialMinutesUrl", () => {
  it("区議会サイトで公開されているURLと同じ形になる", () => {
    // 実際に公開されている2件で規則を突き合わせる
    expect(
      buildOfficialMinutesUrl({
        committee: "福祉保健委員会",
        date: "2026-02-10",
      })
    ).toBe(
      "https://www.kugikai.city.chuo.lg.jp/kaigiroku.cgi/r07/hukushi20260210.html"
    );
    expect(
      buildOfficialMinutesUrl({
        committee: "企画総務委員会",
        date: "2026-02-06",
      })
    ).toBe(
      "https://www.kugikai.city.chuo.lg.jp/kaigiroku.cgi/r07/kikaku20260206.html"
    );
  });

  it("4月から翌3月までを同じ年度のディレクトリに入れる", () => {
    expect(
      buildOfficialMinutesUrl({
        committee: "区民文教委員会",
        date: "2026-03-31",
      })
    ).toContain("/r07/");
    expect(
      buildOfficialMinutesUrl({
        committee: "区民文教委員会",
        date: "2026-04-01",
      })
    ).toContain("/r08/");
  });

  it("令和元年度は r01 になる", () => {
    expect(
      buildOfficialMinutesUrl({
        committee: "子ども子育て・高齢者対策特別委員会",
        date: "2020-02-26",
      })
    ).toBe(
      "https://www.kugikai.city.chuo.lg.jp/kaigiroku.cgi/r01/shoushi20200226.html"
    );
  });

  it("略称が分からない委員会では出さない", () => {
    // 2026年5月に組み替えられた特別委員会は会議録がまだ無い
    expect(
      buildOfficialMinutesUrl({
        committee: "築地まちづくり・環境対策特別委員会",
        date: "2026-06-10",
      })
    ).toBeNull();
  });

  it("日付の形が違えば出さない", () => {
    expect(
      buildOfficialMinutesUrl({
        committee: "福祉保健委員会",
        date: "2026/02/10",
      })
    ).toBeNull();
  });

  it("令和より前の日付では出さない", () => {
    expect(
      buildOfficialMinutesUrl({
        committee: "福祉保健委員会",
        date: "2018-06-10",
      })
    ).toBeNull();
  });
});
