import { describe, expect, it } from "vitest";
import { MierugikaiClient, toUtterance } from "./mierugikai-client";

/** みえる議会が返す1件ぶんの形 */
function record(overrides: Record<string, unknown> = {}) {
  return {
    id: "C20260206-0001",
    title: "令和8年　企画総務委員会(2月6日)",
    speaker: "瓜生委員長",
    category: "瓜生正高",
    body: "ただいまより企画総務委員会を開会いたします。",
    date: "2026/02/06",
    type: "企画総務委員会",
    is_unofficial: false,
    ...overrides,
  };
}

/** manifest と1チャンクだけ返す fetch */
function stubFetch(records: ReturnType<typeof record>[]) {
  return (async (input: string | URL) => {
    const url = String(input);
    const body = url.includes("manifest.json")
      ? { prefix: "gijiroku", totalChunks: 1, version: "v1" }
      : records;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
}

describe("toUtterance", () => {
  it("本文を段落に割り、資料番号を拾う", () => {
    const utterance = toUtterance(
      record({ body: "まず、資料４について。\n\n次に資料６です。" }),
      1
    );

    expect(utterance.paragraphs).toEqual([
      "まず、資料４について。",
      "次に資料６です。",
    ]);
    expect(utterance.shiryoNumbers).toEqual([4, 6]);
  });

  it("発言者は議事録の表記のまま持つ", () => {
    expect(toUtterance(record(), 1).speaker).toBe("瓜生委員長");
  });
});

describe("MierugikaiClient", () => {
  it("会議録の順に並べ直す", async () => {
    const client = new MierugikaiClient({
      // 逆順で置いても id で並べ直せることを見る
      fetchImpl: stubFetch([
        record({ id: "C20260206-0002", body: "2番目の発言" }),
        record({ id: "C20260206-0001", body: "1番目の発言" }),
      ]),
    });

    const utterances = await client.fetchMeetingUtterances({
      date: "2026-02-06",
      committee: "企画総務委員会",
    });

    expect(utterances.map((u) => u.paragraphs[0])).toEqual([
      "1番目の発言",
      "2番目の発言",
    ]);
    expect(utterances.map((u) => u.index)).toEqual([1, 2]);
  });

  it("日付か会議体が違えば拾わない", async () => {
    const client = new MierugikaiClient({
      fetchImpl: stubFetch([record({ type: "区民文教委員会" })]),
    });

    const utterances = await client.fetchMeetingUtterances({
      date: "2026-02-06",
      committee: "企画総務委員会",
    });

    expect(utterances).toEqual([]);
  });
});
