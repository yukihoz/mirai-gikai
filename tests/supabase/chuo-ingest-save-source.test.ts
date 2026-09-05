import { afterEach, describe, expect, it } from "vitest";
import { ingestOneShiryo } from "../../packages/chuo-ingest/src/ingest";
import { adminClient } from "./utils";

/**
 * 資料の取得記録を、記事ができてから残すことを確かめる。
 *
 * 先に記録すると、生成が落ちた資料が次の実行で「取得済み・中身は同じ」と
 * 判定されて永久にスキップされる。実際に1件が静かに欠けた。
 * 件数を数えて初めて気づくたぐいの不具合なので、ここで押さえておく。
 */

const SHIRYO_URL = `https://www.kugikai.city.chuo.lg.jp/shiryo/test-save-source-${Date.now()}.pdf`;
const MEETING_URL =
  "https://www.kugikai.city.chuo.lg.jp/calendar/r08/test_20260210.html";

/** PDFを1件返すだけのクライアント */
const client = {
  fetchPdfText: async () => ({
    text: "テスト用の資料本文。事前登録の方法を見直します。",
    contentHash: "hash-for-test",
    etag: null,
    lastModified: null,
    bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
  }),
};

// スキーマの下限（summary 20字以上、content 100字以上）を満たす値にする
const explanation = {
  title: "テスト資料の言い換えタイトル",
  summary:
    "テスト用の要約です。これは何がどう変わるのかを、区民に向けて短く説明するための文章です。",
  content:
    "## 背景\nテスト用の本文です。取得記録の順序を確かめるためだけに使います。\n\n" +
    "## 具体的な内容\n- テスト用の項目その1\n- テスト用の項目その2\n\n" +
    "## 区民の暮らしへの関わり\nこれはテストなので、実際の暮らしには関わりません。",
};

async function run(
  generate: Parameters<typeof ingestOneShiryo>[0]["generate"]
) {
  return ingestOneShiryo({
    client,
    generate,
    shiryoUrl: SHIRYO_URL,
    meetingUrl: MEETING_URL,
    committee: "福祉保健委員会",
    date: "2026-02-10",
    report: { number: 99, title: "取得記録のテスト用資料" },
    categories: [],
  });
}

async function savedSource() {
  const { data } = await adminClient
    .from("chuo_ingestion_sources")
    .select("url")
    .eq("url", SHIRYO_URL)
    .maybeSingle();
  return data;
}

afterEach(async () => {
  const { data } = await adminClient
    .from("chuo_bill_sources")
    .select("bill_id")
    .eq("shiryo_url", SHIRYO_URL)
    .maybeSingle();
  if (data) {
    await adminClient.from("bills").delete().eq("id", data.bill_id);
  }
  await adminClient
    .from("chuo_ingestion_sources")
    .delete()
    .eq("url", SHIRYO_URL);
});

describe("ingestOneShiryo の取得記録", () => {
  it("生成が落ちたら取得を記録しない", async () => {
    // 記録が残ると、次の実行で「中身は同じ」と見なされ永久にスキップされる
    await expect(
      run(async () => {
        throw new Error("生成に失敗した");
      })
    ).rejects.toThrow("生成に失敗した");

    expect(await savedSource()).toBeNull();
  });

  it("記事ができたら取得を記録する", async () => {
    const outcome = await run(async () => explanation as never);

    expect(outcome).toBe("new");
    expect(await savedSource()).not.toBeNull();
  });

  it("一度落ちた資料も、次の実行で拾える", async () => {
    await expect(
      run(async () => {
        throw new Error("一時的な失敗");
      })
    ).rejects.toThrow();

    // 記録が無いので「新規」として作り直される
    const outcome = await run(async () => explanation as never);
    expect(outcome).toBe("new");

    const { data } = await adminClient
      .from("chuo_bill_sources")
      .select("bill_id")
      .eq("shiryo_url", SHIRYO_URL)
      .maybeSingle();
    expect(data).not.toBeNull();
  });
});
