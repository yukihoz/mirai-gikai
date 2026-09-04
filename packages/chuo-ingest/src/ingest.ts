import { BudgetStopError } from "@mirai-gikai/shared/cost-budget";
import { ChuoSiteClient } from "./fetchers/chuo-site-client";
import { parseCalendar } from "./parsers/parse-calendar";
import { parseCommitteePage } from "./parsers/parse-committee-page";
import {
  finishRun,
  findKnownSource,
  saveSource,
  startRun,
  findCategories,
  replaceBillCategories,
  upsertBillContent,
  upsertBillFromShiryo,
} from "./repositories/ingest-repository";
import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
} from "./prompts/build-explanation-prompt";
import { createGatewayGenerator } from "./services/gateway-generator";
import {
  renderFirstPagePng,
  saveShiryoImageUrl,
  uploadShiryoImage,
} from "./services/render-shiryo-image";
import { generateCategories } from "./services/generate-categories";
import { generateExplanations } from "./services/generate-explanation";
import type { ObjectGenerator } from "./services/generate-explanation";
import {
  countDecision,
  describeStats,
  emptyStats,
  type IngestStats,
  shouldRegenerate,
} from "./services/should-refetch";
import {
  buildCalendarUrl,
  buildCommitteePageUrl,
  resolveUrl,
} from "./shared/urls";

/**
 * 取り込みの対象にしない会議体。
 *
 * 本会議には資料が付かない。議会運営委員会は議事進行の資料が中心で、
 * 予算・決算特別委員会は報告事項とは性格が違う。
 */
const EXCLUDED_COMMITTEES = new Set([
  "本会議",
  "議会運営委員会",
  "予算特別委員会",
  "決算特別委員会",
]);

export type IngestOptions = {
  /** 対象の年 */
  year: number;
  /** 対象の月 */
  month: number;
  /** この日以降の会議だけ（YYYY-MM-DD） */
  from?: string;
  /** この日までの会議だけ（YYYY-MM-DD） */
  to?: string;
  /** 内容が変わっていなくても作り直す */
  force?: boolean;
  /** 取り込む資料の上限。試すときに使う */
  limit?: number;
  /** 取得も生成もせず、対象だけ出す */
  dryRun?: boolean;
  client?: ChuoSiteClient;
  generate?: ObjectGenerator;
};

export type IngestResult = {
  stats: IngestStats;
  costUsd: number;
  /** 予算で打ち切られた場合の理由 */
  stoppedBy?: string;
};

/**
 * 委員会資料から議案の下書きを作る。
 *
 * カレンダー → 委員会ページ → 資料PDF → 解説生成 → 下書きで保存、まで通す。
 * **公開はしない。** 生成した内容の公開判断は人がadminで行う。
 */
export async function runIngest(options: IngestOptions): Promise<IngestResult> {
  const client = options.client ?? new ChuoSiteClient();
  const gateway =
    options.generate === undefined ? createGatewayGenerator() : null;
  const generate = options.generate ?? gateway?.generate;
  if (generate === undefined) throw new Error("生成器がない");

  const meetings = await collectMeetings(client, options);
  console.log(`対象の委員会: ${meetings.length}件`);
  for (const m of meetings) console.log(`  ${m.date} ${m.committee}`);

  if (options.dryRun === true) {
    return { stats: emptyStats(), costUsd: 0 };
  }

  const runId = await startRun("explain");
  // カテゴリの一覧は実行中に変わらない。資料ごとに引き直さない
  const categories = await findCategories();
  let stats = emptyStats();
  let stoppedBy: string | undefined;

  try {
    let remaining = options.limit ?? Number.POSITIVE_INFINITY;

    for (const meeting of meetings) {
      if (remaining <= 0) break;
      const pageUrl = buildCommitteePageUrl(meeting.href);
      const page = await client.fetchHtml(pageUrl);
      const parsed = parseCommitteePage(page.text);
      if (parsed === null) {
        console.warn(`委員会ページを読めなかった: ${pageUrl}`);
        continue;
      }
      await saveSource({
        source: "committee",
        url: pageUrl,
        contentHash: page.contentHash,
        etag: page.etag,
        lastModified: page.lastModified,
      });

      for (const report of parsed.reports) {
        if (remaining <= 0) break;
        if (report.pdfHref === null) continue;

        const shiryoUrl = resolveUrl(pageUrl, report.pdfHref);
        try {
          const outcome = await ingestOneShiryo({
            client,
            generate,
            shiryoUrl,
            meetingUrl: pageUrl,
            committee: parsed.committee,
            date: parsed.date,
            report,
            categories,
            force: options.force,
          });
          stats = countDecision(stats, outcome);
          remaining -= 1;
        } catch (error) {
          if (error instanceof BudgetStopError) {
            stoppedBy = error.message;
            throw error;
          }
          stats = {
            ...stats,
            total: stats.total + 1,
            failed: stats.failed + 1,
          };
          console.error(`${report.title}: ${String(error)}`);
        }
      }
    }
  } catch (error) {
    if (!(error instanceof BudgetStopError)) {
      await finishRun(runId, {
        status: "failed",
        stats,
        costUsd: gateway?.budget.spentUsd(),
        error: String(error),
      });
      throw error;
    }
  }

  const costUsd = gateway?.budget.spentUsd() ?? 0;
  await finishRun(runId, { status: "completed", stats, costUsd });

  console.log(describeStats(stats));
  console.log(`費用: $${costUsd.toFixed(4)}`);
  if (stoppedBy !== undefined) console.warn(`打ち切り: ${stoppedBy}`);

  return { stats, costUsd, stoppedBy };
}

/** 資料1件を取り込む */
async function ingestOneShiryo(params: {
  client: ChuoSiteClient;
  generate: ObjectGenerator;
  shiryoUrl: string;
  meetingUrl: string;
  committee: string;
  date: string;
  report: { number: number | null; title: string };
  /** 選べるカテゴリの一覧。実行のはじめに1回だけ読む */
  categories: { id: string; label: string }[];
  force?: boolean;
}): Promise<"new" | "changed" | "forced" | "unchanged"> {
  const known = await findKnownSource("shiryo_pdf", params.shiryoUrl);
  const pdf = await params.client.fetchPdfText(params.shiryoUrl);

  const decision = shouldRegenerate({
    known,
    fetchedHash: pdf.contentHash,
    force: params.force,
  });

  await saveSource({
    source: "shiryo_pdf",
    url: params.shiryoUrl,
    contentHash: pdf.contentHash,
    etag: pdf.etag,
    lastModified: pdf.lastModified,
  });

  if (!decision.regenerate) {
    console.log(
      `  スキップ 資料${params.report.number}: ${params.report.title}`
    );
    return "unchanged";
  }

  if (pdf.text.trim() === "") {
    throw new Error("PDFからテキストを取り出せなかった");
  }

  const explanations = await generateExplanations({
    input: {
      title: params.report.title,
      shiryoNumber: params.report.number,
      committee: params.committee,
      date: params.date,
      sourceText: pdf.text,
    },
    difficulties: DIFFICULTY_LEVELS,
    generate: params.generate,
  });

  const normal = explanations.normal;
  if (normal === undefined) throw new Error("ふつう版の解説が作れなかった");

  const { billId, created } = await upsertBillFromShiryo({
    // 区民向けの言い換えを議案名にする。正式名称は資料の件名として別に残る
    name: normal.title,
    committee: params.committee,
    meetingDate: params.date,
    meetingUrl: params.meetingUrl,
    shiryoUrl: params.shiryoUrl,
    shiryoNumber: params.report.number,
    knowledgeSource: pdf.text,
  });

  for (const difficulty of DIFFICULTY_LEVELS) {
    const explanation = explanations[difficulty];
    if (explanation === undefined) continue;
    await upsertBillContent({ billId, difficulty, explanation });
  }

  // カテゴリを付ける。一覧の絞り込みに使う。
  // 失敗しても記事は成立するので、警告にとどめる。
  try {
    const tagIds = await generateCategories({
      input: {
        title: params.report.title,
        articleTitle: normal.title,
        summary: normal.summary,
        sourceText: pdf.text,
        categories: params.categories,
      },
      generate: params.generate,
    });
    await replaceBillCategories({ billId, tagIds });
  } catch (error) {
    console.warn(`  カテゴリを付けられなかった: ${String(error)}`);
  }

  // 資料の1ページ目を画像にして記事に載せる。
  // 失敗しても解説は作れているので、記事ごと落とさず警告にとどめる。
  try {
    const rendered = await renderFirstPagePng(pdf.bytes);
    const imageUrl = await uploadShiryoImage({ billId, png: rendered.png });
    await saveShiryoImageUrl({
      billId,
      imageUrl,
      width: rendered.width,
      height: rendered.height,
    });
  } catch (error) {
    console.warn(`  資料画像を作れなかった: ${String(error)}`);
  }

  console.log(
    `  ${created ? "作成" : "更新"} 資料${params.report.number}: ${normal.title}`
  );
  return decision.reason;
}

/** カレンダーから対象の委員会を集める */
async function collectMeetings(
  client: ChuoSiteClient,
  options: IngestOptions
): Promise<{ date: string; committee: string; href: string }[]> {
  const calendarUrl = buildCalendarUrl(options.year, options.month);
  const calendar = await client.fetchHtml(calendarUrl);
  await saveSource({
    source: "calendar",
    url: calendarUrl,
    contentHash: calendar.contentHash,
    etag: calendar.etag,
    lastModified: calendar.lastModified,
  });

  return parseCalendar(calendar.text).filter((meeting) => {
    if (EXCLUDED_COMMITTEES.has(meeting.committee)) return false;
    if (options.from !== undefined && meeting.date < options.from) return false;
    if (options.to !== undefined && meeting.date > options.to) return false;
    return true;
  });
}
