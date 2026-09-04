import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Minutes, Utterance } from "../shared/types";
import { parseMinutes } from "./parse-minutes";
import {
  dropChairProcedural,
  selectReportQuestions,
} from "./select-report-questions";

function loadMinutes(name: string): Minutes {
  const minutes = parseMinutes(
    readFileSync(join(import.meta.dirname, `__fixtures__/${name}`), "utf-8")
  );
  if (minutes === null) throw new Error(`議事録を読めなかった: ${name}`);
  return minutes;
}

const fukushi = loadMinutes("minutes-fukushi-20260210.html");
const kikaku = loadMinutes("minutes-kikaku-20260206.html");

describe("selectReportQuestions", () => {
  it("理事者報告への質疑だけを返す", () => {
    const selected = selectReportQuestions(fukushi);
    expect(selected.length).toBeGreaterThan(0);

    const section = fukushi.sections.find((s) => s.kind === "report_questions");
    expect(selected[0].index).toBe(section?.fromIndex);
    expect(selected.at(-1)?.index).toBe(section?.toIndex);
  });

  it("「質疑は終了いたします」以降の議題を含めない", () => {
    const selected = selectReportQuestions(fukushi);
    const bodies = selected.flatMap((u) => u.paragraphs).join("\n");

    // 議題（1）で聞かれた保育園の入園利用調整は、資料の質疑ではない
    expect(bodies).not.toContain("入園利用調整の結果");
    expect(bodies).not.toContain("継続審査");
  });

  it("報告そのもの（資料の読み上げ）を含めない", () => {
    const selected = selectReportQuestions(fukushi);
    const bodies = selected.flatMap((u) => u.paragraphs).join("\n");
    // 資料の読み上げは reports セクションなので入らない
    expect(bodies).not.toContain("以上７件報告");
    expect(bodies).not.toContain("（資料１）");
  });

  it("理事者が答弁者として登場するのは正しい", () => {
    // 部長は報告もするが質疑にも答える。発言者名では切り分けられない
    const selected = selectReportQuestions(fukushi);
    expect(selected.map((u) => u.speaker)).toContain("大久保福祉保健部長");
  });

  it("別の委員会でも範囲を切り出せる", () => {
    const selected = selectReportQuestions(kikaku);
    expect(selected.length).toBeGreaterThan(0);
    const bodies = selected.flatMap((u) => u.paragraphs).join("\n");
    expect(bodies).not.toContain("区制施行80周年について１点お尋ね");
  });

  it("質疑の節が無ければ空配列を返す", () => {
    const empty: Minutes = {
      ...fukushi,
      sections: fukushi.sections.filter((s) => s.kind !== "report_questions"),
    };
    expect(selectReportQuestions(empty)).toEqual([]);
  });
});

describe("dropChairProcedural", () => {
  const chair = (text: string): Utterance => ({
    index: 1,
    speaker: "堀田委員長",
    paragraphs: [text],
    shiryoNumbers: [],
  });

  it("委員長の進行発言を落とす", () => {
    expect(
      dropChairProcedural([
        chair("それでは、理事者報告に対する質疑に入ります。"),
      ])
    ).toEqual([]);
    expect(dropChairProcedural([chair("発言を願います。")])).toEqual([]);
    expect(
      dropChairProcedural([
        chair("一旦休憩を入れます。再開は午後３時10分です。"),
      ])
    ).toEqual([]);
  });

  it("持ち時間の案内を落とす（会派名が入るため）", () => {
    const text =
      "発言の持ち時間制につきましては、既に御承知のとおりです。自由民主党さん83分…";
    expect(dropChairProcedural([chair(text)])).toEqual([]);
  });

  it("委員長が委員として質問する発言は残す", () => {
    const question = chair(
      "私からも資料４について伺います。対象となる施設はどこまで広がるのでしょうか。"
    );
    expect(dropChairProcedural([question])).toEqual([question]);
  });

  it("委員長以外の発言は落とさない", () => {
    const member: Utterance = {
      index: 2,
      speaker: "高橋委員",
      paragraphs: ["質疑に入りますが、私からお伺いします。"],
      shiryoNumbers: [],
    };
    expect(dropChairProcedural([member])).toEqual([member]);
  });

  it("実際の議事録で進行発言だけ減る", () => {
    const selected = selectReportQuestions(fukushi);
    const kept = dropChairProcedural(selected);

    expect(kept.length).toBeLessThan(selected.length);
    const bodies = kept.flatMap((u) => u.paragraphs).join("\n");
    expect(bodies).not.toContain("発言を願います");
    // 委員長が読み上げる会派別の持ち時間は落ちる
    expect(bodies).not.toContain("自由民主党さん");
    // 委員の質疑は残る
    expect(bodies).toContain("ＬｏＧｏフォーム");
  });

  it("委員が自分で会派を名乗る発言は落とさない", () => {
    // 「参政党、黒原です。……私からは、資料３、４、５、６と触れたい」のように、
    // 名乗りと質疑が同じ発言に入っている。ここを削ると質疑ごと失われるため、
    // 会派名を出さない扱いは出力側（プロンプト）で担保する。
    const kept = dropChairProcedural(selectReportQuestions(fukushi));
    const bodies = kept.flatMap((u) => u.paragraphs).join("\n");
    expect(bodies).toContain("資料３、４、５、６と触れたい");
  });
});
