import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCommitteePage } from "./parse-committee-page";

const html = readFileSync(
  join(import.meta.dirname, "__fixtures__/committee-fukushi-20260210.html"),
  "utf-8"
);

describe("parseCommitteePage", () => {
  const page = parseCommitteePage(html);

  it("会議体名と開催日を読み取る", () => {
    expect(page?.committee).toBe("福祉保健委員会");
    expect(page?.date).toBe("2026-02-10");
  });

  it("開会時間を読み取る", () => {
    expect(page?.startsAt).toBe("午後1時30分から");
  });

  it("報告事項を資料番号つきで並べる", () => {
    expect(page?.reports).toHaveLength(7);
    expect(page?.reports.map((r) => r.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("件名から先頭の番号を落とす", () => {
    expect(page?.reports[3].title).toBe(
      "病児・病後児保育事業における事前登録方法の見直しについて"
    );
  });

  it("件名の中の全角数字は原文のまま残す", () => {
    expect(page?.reports[4].title).toBe(
      "令和７年度税制改正に伴う介護保険制度の対応について"
    );
  });

  it("資料PDFのURLを未エンコードのまま返す", () => {
    expect(page?.reports[3].pdfHref).toBe(
      "../../shiryo/r8/福祉保健/2月10日/(資料4)病児・病後児保育事業における事前登録方法の見直しについて.pdf"
    );
  });

  it("li の中の br で件名が分断されない", () => {
    // 資料3の li は末尾に <br> を含む
    expect(page?.reports[2].title).toBe(
      "特定乳児等通園支援事業の運営に関する基準等の設定について"
    );
  });

  it("議題を報告事項と分けて返す", () => {
    expect(page?.agenda).toEqual([
      "福祉及び保健の調査について",
      "健康保険証の廃止を延期することを求める請願",
    ]);
  });

  it("テンプレート由来の空の li は落とす", () => {
    expect(page?.reports.every((r) => r.title !== "")).toBe(true);
    expect(page?.agenda.every((a) => a !== "")).toBe(true);
  });

  it("会議名が読めないHTMLでは null を返す", () => {
    expect(parseCommitteePage("<html><body>404</body></html>")).toBeNull();
  });
});

describe("parseCommitteePage（企画総務委員会）", () => {
  const page = parseCommitteePage(
    readFileSync(
      join(import.meta.dirname, "__fixtures__/committee-kikaku-20260206.html"),
      "utf-8"
    )
  );

  it("資料が9件ある委員会でも番号が飛ばない", () => {
    expect(page?.reports.map((r) => r.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it("すべての報告事項が資料PDFを持つ", () => {
    expect(page?.reports.every((r) => r.pdfHref !== null)).toBe(true);
  });

  it("議題を3件とも拾う", () => {
    expect(page?.agenda).toHaveLength(3);
  });
});
