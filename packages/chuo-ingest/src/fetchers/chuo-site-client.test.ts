import { describe, expect, it } from "vitest";
import { ChuoSiteClient } from "./chuo-site-client";
import { buildCalendarUrl, buildCommitteePageUrl } from "../shared/urls";

const PAGE_URL = buildCommitteePageUrl("r08/fukushi_20260210.html");
const PDF_URL =
  "https://www.kugikai.city.chuo.lg.jp/shiryo/r8/%E7%A6%8F%E7%A5%89/x.pdf";

/** リクエストを記録し、決めた応答を返すfetch */
function createFakeFetch(
  body: Uint8Array | string,
  init: { status?: number; headers?: Record<string, string> } = {}
) {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const bytes =
    typeof body === "string" ? new TextEncoder().encode(body) : body;
  // Response の BodyInit は SharedArrayBuffer を受け付けないため、
  // 中身を素の ArrayBuffer に写してから渡す。
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  const fetchImpl = (async (url: string, options?: RequestInit) => {
    calls.push({
      url: String(url),
      headers: (options?.headers ?? {}) as Record<string, string>,
    });
    return new Response(buffer, {
      status: init.status ?? 200,
      headers: init.headers,
    });
  }) as unknown as typeof globalThis.fetch;

  return { fetchImpl, calls };
}

/** 時計とsleepを差し替えて、待ち時間を実時間なしで観測する */
function createClock() {
  let current = 1_000_000;
  const waits: number[] = [];
  return {
    now: () => current,
    sleep: async (ms: number) => {
      waits.push(ms);
      current += ms;
    },
    advance: (ms: number) => {
      current += ms;
    },
    waits,
  };
}

describe("ChuoSiteClient.fetchHtml", () => {
  it("本文と内容ハッシュを返す", async () => {
    const { fetchImpl } = createFakeFetch("<html>本文</html>");
    const client = new ChuoSiteClient({ fetchImpl });

    const result = await client.fetchHtml(PAGE_URL);

    expect(result.text).toBe("<html>本文</html>");
    expect(result.url).toBe(PAGE_URL);
    expect(result.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("同じ内容なら同じハッシュになる（再取得の判定に使う）", async () => {
    const a = new ChuoSiteClient({
      fetchImpl: createFakeFetch("同じ").fetchImpl,
    });
    const b = new ChuoSiteClient({
      fetchImpl: createFakeFetch("同じ").fetchImpl,
    });
    const c = new ChuoSiteClient({
      fetchImpl: createFakeFetch("ちがう").fetchImpl,
    });

    const [x, y, z] = await Promise.all([
      a.fetchHtml(PAGE_URL),
      b.fetchHtml(PAGE_URL),
      c.fetchHtml(PAGE_URL),
    ]);

    expect(x.contentHash).toBe(y.contentHash);
    expect(x.contentHash).not.toBe(z.contentHash);
  });

  it("UTF-8として読む", async () => {
    const { fetchImpl } = createFakeFetch("令和8年　福祉保健委員会");
    const client = new ChuoSiteClient({ fetchImpl });
    const result = await client.fetchHtml(PAGE_URL);
    expect(result.text).toBe("令和8年　福祉保健委員会");
  });

  it("連絡先入りのUser-Agentを送る", async () => {
    const { fetchImpl, calls } = createFakeFetch("x");
    await new ChuoSiteClient({ fetchImpl }).fetchHtml(PAGE_URL);
    expect(calls[0].headers["User-Agent"]).toContain("mirai-gikai");
    expect(calls[0].headers["User-Agent"]).toContain("https://");
  });

  it("ETagとLast-Modifiedを持ち帰る", async () => {
    const { fetchImpl } = createFakeFetch("x", {
      headers: {
        etag: '"abc"',
        "last-modified": "Tue, 10 Feb 2026 00:00:00 GMT",
      },
    });
    const result = await new ChuoSiteClient({ fetchImpl }).fetchHtml(PAGE_URL);
    expect(result.etag).toBe('"abc"');
    expect(result.lastModified).toBe("Tue, 10 Feb 2026 00:00:00 GMT");
  });

  it("ヘッダーが無ければnullにする", async () => {
    const { fetchImpl } = createFakeFetch("x");
    const result = await new ChuoSiteClient({ fetchImpl }).fetchHtml(PAGE_URL);
    expect(result.etag).toBeNull();
    expect(result.lastModified).toBeNull();
  });

  it("エラー応答は例外にする", async () => {
    const { fetchImpl } = createFakeFetch("not found", { status: 404 });
    await expect(
      new ChuoSiteClient({ fetchImpl }).fetchHtml(PAGE_URL)
    ).rejects.toThrow("404");
  });

  it("取得対象外のURLは投げる前に止める", async () => {
    const { fetchImpl, calls } = createFakeFetch("x");
    const client = new ChuoSiteClient({ fetchImpl });

    await expect(
      client.fetchHtml(
        "https://www.kugikai.city.chuo.lg.jp/kaigiroku/index.cgi?keyword=x"
      )
    ).rejects.toThrow("取得対象外");
    expect(calls).toHaveLength(0);
  });
});

describe("ChuoSiteClient のアクセス間隔", () => {
  it("初回は待たない", async () => {
    const clock = createClock();
    const { fetchImpl } = createFakeFetch("x");
    const client = new ChuoSiteClient({ fetchImpl, ...clock });

    await client.fetchHtml(PAGE_URL);

    expect(clock.waits).toEqual([]);
  });

  it("続けて取るときは既定で1秒あける", async () => {
    const clock = createClock();
    const { fetchImpl } = createFakeFetch("x");
    const client = new ChuoSiteClient({ fetchImpl, ...clock });

    await client.fetchHtml(PAGE_URL);
    await client.fetchHtml(PAGE_URL);

    expect(clock.waits).toEqual([1000]);
  });

  it("前回から十分たっていれば待たない", async () => {
    const clock = createClock();
    const { fetchImpl } = createFakeFetch("x");
    const client = new ChuoSiteClient({ fetchImpl, ...clock });

    await client.fetchHtml(PAGE_URL);
    clock.advance(5000);
    await client.fetchHtml(PAGE_URL);

    expect(clock.waits).toEqual([]);
  });

  it("経過したぶんだけ待ち時間を差し引く", async () => {
    const clock = createClock();
    const { fetchImpl } = createFakeFetch("x");
    const client = new ChuoSiteClient({ fetchImpl, ...clock });

    await client.fetchHtml(PAGE_URL);
    clock.advance(400);
    await client.fetchHtml(PAGE_URL);

    expect(clock.waits).toEqual([600]);
  });

  it("間隔は変更できる", async () => {
    const clock = createClock();
    const { fetchImpl } = createFakeFetch("x");
    const client = new ChuoSiteClient({
      fetchImpl,
      minIntervalMs: 2000,
      ...clock,
    });

    await client.fetchHtml(PAGE_URL);
    await client.fetchHtml(PAGE_URL);

    expect(clock.waits).toEqual([2000]);
  });

  it("カレンダーとPDFをまたいでも間隔を守る", async () => {
    const clock = createClock();
    const { fetchImpl } = createFakeFetch("x");
    const client = new ChuoSiteClient({
      fetchImpl,
      pdfToText: async () => "資料本文",
      ...clock,
    });

    await client.fetchHtml(buildCalendarUrl(2026, 2));
    await client.fetchPdfText(PDF_URL);

    expect(clock.waits).toEqual([1000]);
  });
});

describe("ChuoSiteClient.fetchPdfText", () => {
  it("PDFをテキストにして返す", async () => {
    const { fetchImpl } = createFakeFetch(new Uint8Array([0x25, 0x50, 0x44]));
    const client = new ChuoSiteClient({
      fetchImpl,
      pdfToText: async () =>
        "１　後期高齢者医療制度保険料軽減措置の延長について",
    });

    const result = await client.fetchPdfText(PDF_URL);

    expect(result.text).toContain("後期高齢者医療制度");
  });

  it("ハッシュはPDFの中身から取る（テキスト化の実装に依存しない）", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const one = await new ChuoSiteClient({
      fetchImpl: createFakeFetch(bytes).fetchImpl,
      pdfToText: async () => "テキストA",
    }).fetchPdfText(PDF_URL);
    const two = await new ChuoSiteClient({
      fetchImpl: createFakeFetch(bytes).fetchImpl,
      pdfToText: async () => "テキストB",
    }).fetchPdfText(PDF_URL);

    expect(one.contentHash).toBe(two.contentHash);
    expect(one.text).not.toBe(two.text);
  });
});
