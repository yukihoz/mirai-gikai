import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminClient } from "../utils";

/**
 * 報告資料の検索を、実際のローカルDBで確かめる。
 *
 * この関数の肝は「記事タイトル・要約・区の正式名称のどれかに含まれる」
 * という条件で、PostgREST のクエリビルダーでは書けない（or が結合先の
 * 列を参照できない）。アプリ層のユニットテストでは検証できない。
 */

const PREFIX = `検索テスト-${Date.now()}`;
const billIds: string[] = [];
let tagId = "";

async function createBill(params: {
  name: string;
  title: string;
  summary: string;
  submittedDate: string;
}) {
  const { data, error } = await adminClient
    .from("bills")
    .insert({
      name: params.name,
      status: "reported",
      meeting_body: "福祉保健委員会",
      publish_status: "published",
      submitted_date: params.submittedDate,
    })
    .select("id")
    .single();
  if (error) throw new Error(`議案を作れなかった: ${error.message}`);

  const contents = await adminClient.from("bill_contents").insert(
    (["normal", "hard"] as const).map((level) => ({
      bill_id: data.id,
      difficulty_level: level,
      title: params.title,
      summary: params.summary,
      content: "## 背景\n本文",
    }))
  );
  if (contents.error) {
    throw new Error(`本文を作れなかった: ${contents.error.message}`);
  }

  billIds.push(data.id);
  return data.id;
}

beforeAll(async () => {
  const tag = await adminClient
    .from("tags")
    .insert({ label: `${PREFIX}タグ` })
    .select("id")
    .single();
  if (tag.error) throw new Error(`タグを作れなかった: ${tag.error.message}`);
  tagId = tag.data.id;

  // 正式名称だけに語がある／記事タイトルだけにある、を作り分ける
  const withTag = await createBill({
    name: `${PREFIX} 病児保育事業における事前登録方法の見直しについて`,
    title: `${PREFIX} 申し込みがネットでできます`,
    summary: "事前登録がまとめてできるようになります。",
    submittedDate: "2026-02-10T00:00:00+09:00",
  });
  await createBill({
    name: `${PREFIX} 令和8年度都区財政調整方針等について`,
    title: `${PREFIX} 東京都とのお金の分け方`,
    summary: "都と区の配分の考え方を定めます。",
    submittedDate: "2026-02-06T00:00:00+09:00",
  });

  const link = await adminClient
    .from("bills_tags")
    .insert({ bill_id: withTag, tag_id: tagId });
  if (link.error)
    throw new Error(`タグを付けられなかった: ${link.error.message}`);
});

afterAll(async () => {
  if (billIds.length > 0) {
    await adminClient.from("bills").delete().in("id", billIds);
  }
  if (tagId !== "") {
    await adminClient.from("tags").delete().eq("id", tagId);
  }
});

async function search(params: {
  query?: string;
  tagId?: string | null;
  ascending?: boolean;
  offset?: number;
  limit?: number;
}) {
  const { data, error } = await adminClient.rpc("search_chuo_bills", {
    p_difficulty: "normal",
    p_query: params.query ?? PREFIX,
    p_tag_id: (params.tagId ?? null) as string,
    p_ascending: params.ascending ?? false,
    p_offset: params.offset ?? 0,
    p_limit: params.limit ?? 20,
  });
  if (error) throw new Error(error.message);
  return data ?? [];
}

describe("search_chuo_bills", () => {
  it("記事タイトルに含まれる語で見つかる", async () => {
    const rows = await search({ query: "申し込みがネットで" });
    expect(rows).toHaveLength(1);
  });

  it("区の正式名称にしか無い語でも見つかる", async () => {
    // 記事タイトルは「東京都とのお金の分け方」で、この語を含まない
    const rows = await search({ query: "都区財政調整方針等について" });
    expect(rows.map((r) => r.bill_id)).toContain(billIds[1]);
  });

  it("要約に含まれる語でも見つかる", async () => {
    const rows = await search({ query: "都と区の配分" });
    expect(rows).toHaveLength(1);
  });

  it("検索語が空なら絞り込まない", async () => {
    const rows = await search({ query: PREFIX });
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it("カテゴリで絞れる", async () => {
    const rows = await search({ tagId });
    expect(rows).toHaveLength(1);
  });

  it("総数を各行に付ける", async () => {
    const rows = await search({ limit: 1 });
    expect(rows).toHaveLength(1);
    expect(Number(rows[0]?.total_count)).toBeGreaterThanOrEqual(2);
  });

  it("新しい順と古い順で並びが逆になる", async () => {
    const desc = await search({ ascending: false });
    const asc = await search({ ascending: true });
    expect(desc[0]?.bill_id).toBe(asc[asc.length - 1]?.bill_id);
  });

  it("offset でページを送れる", async () => {
    const first = await search({ limit: 1, offset: 0 });
    const second = await search({ limit: 1, offset: 1 });
    expect(first[0]?.bill_id).not.toBe(second[0]?.bill_id);
  });

  it("下書きの記事は出てこない", async () => {
    const target = billIds[0];
    await adminClient
      .from("bills")
      .update({ publish_status: "draft" })
      .eq("id", target);

    const rows = await search({});
    expect(rows.map((r) => r.bill_id)).not.toContain(target);

    await adminClient
      .from("bills")
      .update({ publish_status: "published" })
      .eq("id", target);
  });
});
