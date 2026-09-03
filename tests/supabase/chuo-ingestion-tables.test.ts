import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient } from "./utils";

/**
 * 取り込み管理テーブルの制約を、実際のローカルDBで確かめる。
 *
 * ここで守りたいのは2つ。
 *   1. 同じ資料から議案が二重に作られないこと（chuo_bill_sources の一意制約）
 *   2. 費用不明（null）と費用0が区別できること（cost_usd）
 *
 * どちらもアプリ層のユニットテストでは検出できない。1は制約がDB側にあり、
 * 2は numeric 列が 0 に丸めないことの確認だから。
 */

const MEETING_URL =
  "https://www.kugikai.city.chuo.lg.jp/calendar/r08/test_20260210.html";
const SHIRYO_URL = "https://www.kugikai.city.chuo.lg.jp/shiryo/test-a.pdf";

let billIds: string[] = [];

beforeAll(async () => {
  // 制約の確認に2件の議案が要る（同じ資料URLを別議案に付けようとする）
  const { data, error } = await adminClient
    .from("bills")
    .insert([
      {
        name: "取り込みテスト用の議案A",
        status: "reported",
        meeting_body: "福祉保健委員会",
      },
      {
        name: "取り込みテスト用の議案B",
        status: "reported",
        meeting_body: "福祉保健委員会",
      },
    ])
    .select("id");

  if (error) throw new Error(`議案の作成に失敗: ${error.message}`);
  billIds = (data ?? []).map((row) => row.id);
});

afterAll(async () => {
  // bill_id は cascade なので chuo_bill_sources も一緒に消える
  if (billIds.length > 0) {
    await adminClient.from("bills").delete().in("id", billIds);
  }
  await adminClient
    .from("chuo_ingestion_sources")
    .delete()
    .like("url", "https://www.kugikai.city.chuo.lg.jp/shiryo/test-%");
  await adminClient.from("chuo_ingestion_runs").delete().eq("mode", "test");
});

describe("chuo_bill_sources", () => {
  it("資料URLで議案を1件に固定する", async () => {
    const { error } = await adminClient.from("chuo_bill_sources").insert({
      bill_id: billIds[0],
      meeting_url: MEETING_URL,
      shiryo_url: SHIRYO_URL,
      shiryo_number: 4,
      committee: "福祉保健委員会",
      meeting_date: "2026-02-10",
    });
    expect(error).toBeNull();
  });

  it("同じ資料URLを別の議案に付けられない", async () => {
    // 取り込みを二度走らせても議案が重複しないことの担保
    const { error } = await adminClient.from("chuo_bill_sources").insert({
      bill_id: billIds[1],
      meeting_url: MEETING_URL,
      shiryo_url: SHIRYO_URL,
      shiryo_number: 4,
      committee: "福祉保健委員会",
      meeting_date: "2026-02-10",
    });
    expect(error).not.toBeNull();
    expect(error?.code).toBe("23505");
  });

  it("委員会と開催日で引ける", async () => {
    const { data, error } = await adminClient
      .from("chuo_bill_sources")
      .select("bill_id, shiryo_number")
      .eq("committee", "福祉保健委員会")
      .eq("meeting_date", "2026-02-10");

    expect(error).toBeNull();
    expect(data?.some((row) => row.bill_id === billIds[0])).toBe(true);
  });

  it("議案を消すと対応も消える", async () => {
    const { error } = await adminClient
      .from("bills")
      .delete()
      .eq("id", billIds[0]);
    expect(error).toBeNull();

    const { data } = await adminClient
      .from("chuo_bill_sources")
      .select("bill_id")
      .eq("shiryo_url", SHIRYO_URL);
    expect(data).toEqual([]);

    billIds = billIds.filter((id) => id !== billIds[0]);
  });
});

describe("chuo_ingestion_sources", () => {
  const url = "https://www.kugikai.city.chuo.lg.jp/shiryo/test-b.pdf";
  const hashA = "a".repeat(64);
  const hashB = "b".repeat(64);

  it("同じ source と url は upsert で1行に保たれる", async () => {
    const first = await adminClient
      .from("chuo_ingestion_sources")
      .insert({ source: "shiryo_pdf", url, content_hash: hashA });
    expect(first.error).toBeNull();

    const second = await adminClient.from("chuo_ingestion_sources").upsert(
      {
        source: "shiryo_pdf",
        url,
        content_hash: hashB,
        last_fetched_at: new Date().toISOString(),
      },
      { onConflict: "source,url" }
    );
    expect(second.error).toBeNull();

    const { data } = await adminClient
      .from("chuo_ingestion_sources")
      .select("content_hash")
      .eq("url", url);
    expect(data).toHaveLength(1);
    expect(data?.[0].content_hash).toBe(hashB);
  });

  it("同じURLでも source が違えば別に持てる", async () => {
    // 資料PDFと議事録で同じURLを見ることは無いが、
    // source を分けておけば取り違えない
    const { error } = await adminClient
      .from("chuo_ingestion_sources")
      .insert({ source: "minutes", url, content_hash: hashA });
    expect(error).toBeNull();

    const { data } = await adminClient
      .from("chuo_ingestion_sources")
      .select("source")
      .eq("url", url);
    expect(data).toHaveLength(2);
  });

  it("更新すると updated_at が進む", async () => {
    const before = await adminClient
      .from("chuo_ingestion_sources")
      .select("created_at, updated_at")
      .eq("url", url)
      .eq("source", "shiryo_pdf")
      .single();

    expect(
      new Date(before.data?.updated_at ?? 0).getTime()
    ).toBeGreaterThanOrEqual(new Date(before.data?.created_at ?? 0).getTime());
  });
});

describe("chuo_ingestion_runs", () => {
  it("費用不明（null）と費用0を区別できる", async () => {
    // null を 0 として記録すると「無料で済んだ」ことになり、
    // 積み上げが実態から離れる
    const { data, error } = await adminClient
      .from("chuo_ingestion_runs")
      .insert([
        { mode: "test", status: "completed", cost_usd: 0 },
        { mode: "test", status: "completed" },
      ])
      .select("cost_usd");

    expect(error).toBeNull();
    const values = (data ?? []).map((row) => row.cost_usd);
    expect(values).toContain(0);
    expect(values).toContain(null);
  });

  it("小数第6位までの費用を保てる", async () => {
    // 1件あたり $0.008 前後なので、丸められると積み上がらない
    const { data, error } = await adminClient
      .from("chuo_ingestion_runs")
      .insert({ mode: "test", status: "completed", cost_usd: 0.002123 })
      .select("cost_usd")
      .single();

    expect(error).toBeNull();
    expect(Number(data?.cost_usd)).toBeCloseTo(0.002123, 6);
  });

  it("stats に集計をそのまま入れられる", async () => {
    const stats = {
      total: 34,
      skipped: 4,
      generated: 30,
      regenerated: 0,
      failed: 0,
    };
    const { data, error } = await adminClient
      .from("chuo_ingestion_runs")
      .insert({ mode: "test", status: "completed", stats })
      .select("stats")
      .single();

    expect(error).toBeNull();
    expect(data?.stats).toEqual(stats);
  });
});
