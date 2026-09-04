import { createAdminClient } from "@mirai-gikai/supabase";
import { toMeetingBody } from "../shared/meeting-body";
import type { Explanation } from "../shared/schemas";
import type { KnownSource } from "../services/should-refetch";

/**
 * 取り込みのDBアクセス。
 *
 * RLSはポリシーを持たない（全拒否）ので、すべて secret key の
 * `createAdminClient()` 経由で行う。
 */

export type IngestSourceKind =
  | "calendar"
  | "committee"
  | "shiryo_pdf"
  | "minutes";

/**
 * 動いたまま放置された実行を見捨てるまでの時間。
 *
 * 全件の取り込みでも1時間はかからない。これを超えて `running` のままなら
 * プロセスが落ちて記録だけ残ったものとみなす。
 */
const STALE_RUN_MS = 2 * 60 * 60 * 1000;

/** すでに同じモードの取り込みが動いているときに投げる */
export class IngestAlreadyRunningError extends Error {
  constructor(mode: string) {
    super(
      `${mode} の取り込みがすでに動いている。` +
        "二重に走らせるとAIの費用を二重に払うことになるため中止する。"
    );
    this.name = "IngestAlreadyRunningError";
  }
}

/**
 * 取り込み実行を開始し、実行IDを返す。
 *
 * 同じモードの実行が動いていれば始めない。`chuo_ingestion_runs` の
 * 部分ユニークインデックスがモードごとに `running` を1つに限っているので、
 * 排他はDBが決める。プロセス一覧を見て判断すると、起動直後や終了間際の
 * 実行を見落として二重に走らせることになる。
 */
export async function startRun(mode: string): Promise<string> {
  await abandonStaleRuns(mode);

  const { data, error } = await createAdminClient()
    .from("chuo_ingestion_runs")
    .insert({ mode, status: "running" })
    .select("id")
    .single();

  // 23505 = unique_violation。同じモードの running が先にいる
  if (error?.code === "23505") throw new IngestAlreadyRunningError(mode);
  if (error) throw new Error(`実行ログを作れなかった: ${error.message}`);
  return data.id;
}

/**
 * 落ちたまま `running` で残った記録を片付ける。
 *
 * これをしないと、一度プロセスが落ちただけで以後ずっと起動できなくなる。
 */
async function abandonStaleRuns(mode: string): Promise<void> {
  const threshold = new Date(Date.now() - STALE_RUN_MS).toISOString();

  const { error } = await createAdminClient()
    .from("chuo_ingestion_runs")
    .update({
      status: "abandoned",
      finished_at: new Date().toISOString(),
      error: "実行が終わらないまま放置されたため打ち切り扱いにした",
    })
    .eq("mode", mode)
    .eq("status", "running")
    .lt("started_at", threshold);

  if (error) {
    throw new Error(`古い実行ログを片付けられなかった: ${error.message}`);
  }
}

/** 取り込み実行を終える */
export async function finishRun(
  runId: string,
  result: {
    status: "completed" | "failed";
    stats?: unknown;
    /** 費用が確認できなかったときは undefined のままにする（0にしない） */
    costUsd?: number;
    error?: string;
  }
): Promise<void> {
  const { error } = await createAdminClient()
    .from("chuo_ingestion_runs")
    .update({
      status: result.status,
      finished_at: new Date().toISOString(),
      stats: (result.stats ?? null) as never,
      cost_usd: result.costUsd ?? null,
      error: result.error ?? null,
    })
    .eq("id", runId);

  if (error) throw new Error(`実行ログを更新できなかった: ${error.message}`);
}

/** 前回の取得結果を引く */
export async function findKnownSource(
  source: IngestSourceKind,
  url: string
): Promise<KnownSource | null> {
  const { data, error } = await createAdminClient()
    .from("chuo_ingestion_sources")
    .select("content_hash, etag, last_modified")
    .eq("source", source)
    .eq("url", url)
    .maybeSingle();

  if (error) throw new Error(`取得履歴を読めなかった: ${error.message}`);
  if (data === null) return null;

  return {
    contentHash: data.content_hash,
    etag: data.etag,
    lastModified: data.last_modified,
  };
}

/** 取得結果を記録する */
export async function saveSource(params: {
  source: IngestSourceKind;
  url: string;
  contentHash: string;
  etag: string | null;
  lastModified: string | null;
}): Promise<void> {
  const { error } = await createAdminClient()
    .from("chuo_ingestion_sources")
    .upsert(
      {
        source: params.source,
        url: params.url,
        content_hash: params.contentHash,
        etag: params.etag,
        last_modified: params.lastModified,
        last_fetched_at: new Date().toISOString(),
      },
      { onConflict: "source,url" }
    );

  if (error) throw new Error(`取得履歴を保存できなかった: ${error.message}`);
}

/** 資料URLから、既に作られた議案を引く */
export async function findBillByShiryoUrl(
  shiryoUrl: string
): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from("chuo_bill_sources")
    .select("bill_id")
    .eq("shiryo_url", shiryoUrl)
    .maybeSingle();

  if (error) throw new Error(`議案の対応を読めなかった: ${error.message}`);
  return data?.bill_id ?? null;
}

export type UpsertBillParams = {
  /** 区の表記そのままの件名。議案名として使う */
  name: string;
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  meetingDate: string;
  meetingUrl: string;
  shiryoUrl: string;
  shiryoNumber: number | null;
  /** 資料PDFから取り出した本文。AIチャットのナレッジソースにする */
  knowledgeSource: string;
};

/**
 * 資料1件から議案を作る（既にあれば更新する）。
 *
 * **必ず下書きで作る。** 生成した内容をそのまま公開しない。
 * 公開の判断は人がadminで行う。
 */
/**
 * 開催日を含む会期を引く。
 *
 * トップページの一覧も会期一覧ページも、議案が会期に紐づいていることを
 * 前提にしている。ここが空だと、記事を公開してもどこからも辿れない。
 *
 * 期間が重なる会期が登録されていることがあるため、開始日が新しいほう
 * （より限定された会期）を採る。
 */
export async function findSessionForDate(
  meetingDate: string
): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from("diet_sessions")
    .select("id")
    .lte("start_date", meetingDate)
    .gte("end_date", meetingDate)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`会期を引けなかった: ${error.message}`);
  return data?.id ?? null;
}

export async function upsertBillFromShiryo(
  params: UpsertBillParams
): Promise<{ billId: string; created: boolean }> {
  const client = createAdminClient();
  const existing = await findBillByShiryoUrl(params.shiryoUrl);
  const dietSessionId = await findSessionForDate(params.meetingDate);

  if (dietSessionId === null) {
    console.warn(
      `[ingest] ${params.meetingDate} を含む会期が無い。一覧に出ないので会期を登録すること`
    );
  }

  const fields = {
    name: params.name,
    meeting_body: toMeetingBody(params.committee) as never,
    status: "reported" as const,
    diet_session_id: dietSessionId,
    submitted_date: `${params.meetingDate}T00:00:00+09:00`,
    shugiin_url: params.meetingUrl,
    knowledge_source: params.knowledgeSource.slice(0, 40_000),
    use_knowledge_source_in_chat: true,
    // 有識者レビューの運用は行っていない。false のままだと公開ページに
    // 「レビュー中」バナーが出続けるため、作成時点で立てておく。
    is_review_completed: true,
  };

  if (existing !== null) {
    const { error } = await client
      .from("bills")
      .update(fields)
      .eq("id", existing);
    if (error) throw new Error(`議案を更新できなかった: ${error.message}`);
    return { billId: existing, created: false };
  }

  const { data, error } = await client
    .from("bills")
    .insert({ ...fields, publish_status: "draft" })
    .select("id")
    .single();

  if (error) throw new Error(`議案を作れなかった: ${error.message}`);

  const link = await client.from("chuo_bill_sources").insert({
    bill_id: data.id,
    meeting_url: params.meetingUrl,
    shiryo_url: params.shiryoUrl,
    shiryo_number: params.shiryoNumber,
    committee: params.committee,
    meeting_date: params.meetingDate,
  });
  if (link.error) {
    throw new Error(`議案と資料を紐づけられなかった: ${link.error.message}`);
  }

  return { billId: data.id, created: true };
}

/** 解説を difficulty ごとに保存する */
export async function upsertBillContent(params: {
  billId: string;
  difficulty: "normal" | "hard";
  explanation: Explanation;
}): Promise<void> {
  const client = createAdminClient();
  const { data } = await client
    .from("bill_contents")
    .select("id")
    .eq("bill_id", params.billId)
    .eq("difficulty_level", params.difficulty)
    .maybeSingle();

  const fields = {
    bill_id: params.billId,
    difficulty_level: params.difficulty,
    title: params.explanation.title,
    summary: params.explanation.summary,
    content: params.explanation.content,
  };

  const { error } =
    data === null
      ? await client.from("bill_contents").insert(fields)
      : await client.from("bill_contents").update(fields).eq("id", data.id);

  if (error) throw new Error(`解説を保存できなかった: ${error.message}`);
}
