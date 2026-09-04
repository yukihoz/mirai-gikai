import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { detectSections, parseMinutes } from "./parse-minutes";

const html = readFileSync(
  join(import.meta.dirname, "__fixtures__/minutes-fukushi-20260210.html"),
  "utf-8"
);

// 委員会ごとに委員長の言い回しが違うため、別の委員会でも固定する。
const kikakuHtml = readFileSync(
  join(import.meta.dirname, "__fixtures__/minutes-kikaku-20260206.html"),
  "utf-8"
);

describe("parseMinutes", () => {
  const minutes = parseMinutes(html);

  it("会議体名と開催日を読み取る", () => {
    expect(minutes?.committee).toBe("福祉保健委員会");
    expect(minutes?.date).toBe("2026-02-10");
  });

  it("「○」で始まる塊を1発言としてまとめる", () => {
    expect(minutes?.utterances.length).toBeGreaterThan(30);
    expect(minutes?.utterances[0]).toMatchObject({
      index: 1,
      speaker: "堀田委員長",
    });
  });

  it("同じ発言の2段落目以降を同じ発言にぶら下げる", () => {
    const first = minutes?.utterances[0];
    expect(first?.paragraphs.length).toBeGreaterThan(1);
    expect(first?.paragraphs[0]).toContain("ただいまより福祉保健委員会を開会");
  });

  it("発言者名を議事録の表記のまま持つ", () => {
    const speakers = new Set(minutes?.utterances.map((u) => u.speaker));
    expect(speakers).toContain("高橋委員");
    expect(speakers).toContain("武藤生活衛生課長");
  });

  it("議事整理の記述（〔「異議なし」と呼ぶ者あり〕）を発言にしない", () => {
    const bodies = minutes?.utterances.flatMap((u) => u.paragraphs) ?? [];
    expect(bodies.some((b) => b.startsWith("〔"))).toBe(false);
  });

  it("発言ごとに言及された資料番号を持つ", () => {
    const takahashi = minutes?.utterances.find(
      (u) => u.speaker === "高橋委員" && u.shiryoNumbers.length > 0
    );
    expect(takahashi?.shiryoNumbers).toEqual([4, 6]);
  });

  it("番号だけ並べた言及も資料番号として拾う", () => {
    const kurohara = minutes?.utterances.find(
      (u) => u.speaker === "黒原委員" && u.shiryoNumbers.length > 2
    );
    expect(kurohara?.shiryoNumbers).toEqual([3, 4, 5, 6]);
  });

  it("委員長の定型句で理事者報告への質疑を切り出す", () => {
    const questions = minutes?.sections.find(
      (s) => s.kind === "report_questions"
    );
    expect(questions).toBeDefined();
    expect(questions?.fromIndex).toBeLessThan(questions?.toIndex ?? 0);
  });

  it("議題を1件ずつ区切る", () => {
    const agenda = minutes?.sections.filter((s) => s.kind === "agenda") ?? [];
    expect(agenda.length).toBeGreaterThanOrEqual(1);
    expect(agenda[0].label).toBe("議題（1）");
  });

  it("区切りが発言の範囲を重複なく覆う", () => {
    const sections = minutes?.sections ?? [];
    for (let i = 1; i < sections.length; i++) {
      expect(sections[i].fromIndex).toBe(sections[i - 1].toIndex + 1);
    }
    expect(sections.at(-1)?.toIndex).toBe(minutes?.utterances.length);
  });

  it("見出しが読めないHTMLでは null を返す", () => {
    expect(parseMinutes("<html><body>404</body></html>")).toBeNull();
  });
});

describe("parseMinutes（企画総務委員会）", () => {
  const minutes = parseMinutes(kikakuHtml);

  it("「理事者報告を願います」でも報告の始まりとみなす", () => {
    // 福祉保健は「理事者報告に入ります」、企画総務は「理事者報告を願います」
    const reports = minutes?.sections.find((s) => s.kind === "reports");
    expect(reports).toBeDefined();
  });

  it("「質疑のある方はいらっしゃいますか」でも議題の始まりとみなす", () => {
    const agenda = minutes?.sections.filter((s) => s.kind === "agenda") ?? [];
    expect(agenda.map((s) => s.label)).toEqual([
      "議題（1）",
      "議題（2）",
      "議題（3）",
    ]);
  });

  it("同じ議題番号が再び出ても節を切らない", () => {
    // 委員長は継続審査の確認でもう一度「議題（1）」と言う
    const agenda = minutes?.sections.filter((s) => s.kind === "agenda") ?? [];
    const labels = agenda.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("委員が議題に言及しても節を切らない", () => {
    const sections = minutes?.sections ?? [];
    const speakerAt = (index: number) =>
      minutes?.utterances[index - 1]?.speaker ?? "";
    for (const section of sections) {
      if (section.kind === "opening") continue;
      expect(speakerAt(section.fromIndex)).toMatch(/委員長$/);
    }
  });

  it("理事者の報告からも資料番号を拾う", () => {
    const reporter = minutes?.utterances.find(
      (u) => u.speaker === "山﨑総務部長"
    );
    expect(reporter?.shiryoNumbers).toEqual([3, 4, 5, 6, 7, 8]);
  });
});

describe("detectSections（進行の言い回しの違い）", () => {
  const chair = (text: string) => ({
    index: 0,
    speaker: "委員長",
    paragraphs: [text],
    shiryoNumbers: [],
  });

  it("持ち時間の案内を質疑の始まりとみなす", () => {
    // 特別委員会は「理事者報告に対する質疑に入ります」と言わず、
    // 報告のあと持ち時間を読み上げてそのまま質疑に入る
    const utterances = [
      { ...chair("それでは、理事者報告を願います。"), index: 1 },
      {
        ...chair("発言の持ち時間制につきましては、既に御承知のとおりです。"),
        index: 2,
      },
      {
        index: 3,
        speaker: "永井委員",
        paragraphs: ["資料１について伺います。"],
        shiryoNumbers: [1],
      },
    ];

    const sections = detectSections(utterances);
    const questions = sections.find((s) => s.kind === "report_questions");
    expect(questions?.fromIndex).toBe(2);
    expect(questions?.toIndex).toBe(3);
  });

  it("常任委員会では同じ発言に両方の合図が入っていても節が重複しない", () => {
    // 「持ち時間…。それでは、理事者報告に対する質疑に入ります」が1発言に入る
    const utterances = [
      { ...chair("理事者報告に入ります。"), index: 1 },
      {
        ...chair(
          "発言の持ち時間制につきましては…。それでは、理事者報告に対する質疑に入ります。"
        ),
        index: 2,
      },
      {
        index: 3,
        speaker: "高橋委員",
        paragraphs: ["資料４について。"],
        shiryoNumbers: [4],
      },
    ];

    const sections = detectSections(utterances);
    expect(sections.filter((s) => s.kind === "report_questions")).toHaveLength(
      1
    );
  });
});
