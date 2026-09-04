import { BudgetStopError } from "@mirai-gikai/shared/cost-budget";
import { MierugikaiClient } from "./fetchers/mierugikai-client";
import { detectSections } from "./parsers/parse-minutes";
import {
  dropChairProcedural,
  selectReportQuestions,
} from "./parsers/select-report-questions";
import {
  findMeetingsToLink,
  finishRun,
  markDiscussionsLinked,
  replaceDiscussions,
  startRun,
} from "./repositories/discussions-repository";
import { generateDiscussions } from "./services/generate-discussions";
import type { ObjectGenerator } from "./services/generate-explanation";
import { createGatewayGenerator } from "./services/gateway-generator";
import {
  countDecision,
  describeStats,
  emptyStats,
  type IngestStats,
} from "./services/should-refetch";
import { buildOfficialMinutesUrl } from "./shared/official-minutes-url";
import type { Minutes } from "./shared/types";

export type IngestDiscussionsOptions = {
  /** この日以降の会議だけ（YYYY-MM-DD） */
  from?: string;
  /** この日までの会議だけ（YYYY-MM-DD） */
  to?: string;
  /** すでに紐づけた会議も作り直す */
  force?: boolean;
  /** 処理する会議の上限 */
  limit?: number;
  /** 取得も生成もせず、対象だけ出す */
  dryRun?: boolean;
  client?: MierugikaiClient;
  generate?: ObjectGenerator;
};

export type IngestDiscussionsResult = {
  stats: IngestStats;
  costUsd: number;
  stoppedBy?: string;
};

/**
 * 委員会での質疑を、資料ごとに紐づける。
 *
 * 会議録は資料が公開されてから数か月後に出るため、記事は
 * 「資料の解説だけ」→「質疑を追記」と2段階で育つ。この関数は後半を担う。
 *
 * 議事録はみえる議会のJSONから取る。中央区議会の会議録は `.cgi` 配下で、
 * robots.txt が巡回対象から外す意図を示しているため直接は取りに行かない。
 */
export async function runIngestDiscussions(
  options: IngestDiscussionsOptions = {}
): Promise<IngestDiscussionsResult> {
  const client = options.client ?? new MierugikaiClient();
  const gateway =
    options.generate === undefined ? createGatewayGenerator() : null;
  const generate = options.generate ?? gateway?.generate;
  if (generate === undefined) throw new Error("生成器がない");

  const meetings = await findMeetingsToLink({
    from: options.from,
    to: options.to,
    includeLinked: options.force === true,
  });

  console.log(`対象の委員会: ${meetings.length}件`);
  for (const m of meetings) {
    console.log(
      `  ${m.meetingDate} ${m.committee}（資料${m.reports.length}件）`
    );
  }

  if (options.dryRun === true) {
    return { stats: emptyStats(), costUsd: 0 };
  }

  const runId = await startRun("discussions");
  let stats = emptyStats();
  let stoppedBy: string | undefined;

  try {
    const targets = meetings.slice(0, options.limit ?? meetings.length);

    for (const meeting of targets) {
      try {
        const outcome = await linkOneMeeting({ meeting, client, generate });
        stats = countDecision(stats, outcome);
      } catch (error) {
        if (error instanceof BudgetStopError) {
          stoppedBy = error.message;
          throw error;
        }
        stats = { ...stats, total: stats.total + 1, failed: stats.failed + 1 };
        console.error(
          `${meeting.committee} ${meeting.meetingDate}: ${String(error)}`
        );
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

/** 委員会1回ぶんの質疑を紐づける */
async function linkOneMeeting(params: {
  meeting: {
    committee: string;
    meetingDate: string;
    reports: { billId: string; shiryoNumber: number; title: string }[];
  };
  client: MierugikaiClient;
  generate: ObjectGenerator;
}): Promise<"new" | "unchanged"> {
  const { meeting, client, generate } = params;

  const all = await client.fetchMeetingUtterances({
    date: meeting.meetingDate,
    committee: meeting.committee,
  });

  if (all.length === 0) {
    console.log(`  会議録がまだ: ${meeting.committee} ${meeting.meetingDate}`);
    return "unchanged";
  }

  // 理事者報告への質疑だけに絞る。議題（区政全般の調査・請願審査）は
  // 資料に紐づかないので渡さない。
  const minutes: Minutes = {
    title: `${meeting.committee} ${meeting.meetingDate}`,
    committee: meeting.committee,
    date: meeting.meetingDate,
    utterances: all,
    sections: detectSections(all),
  };
  const utterances = dropChairProcedural(selectReportQuestions(minutes));

  if (utterances.length === 0) {
    console.log(`  質疑なし: ${meeting.committee} ${meeting.meetingDate}`);
    return "unchanged";
  }

  const discussions = await generateDiscussions({
    input: {
      committee: meeting.committee,
      date: meeting.meetingDate,
      reports: meeting.reports.map((r) => ({
        number: r.shiryoNumber,
        title: r.title,
      })),
      utterances,
    },
    generate,
  });

  const byNumber = new Map(
    meeting.reports.map((r) => [r.shiryoNumber, r.billId])
  );
  let saved = 0;

  for (const discussion of discussions) {
    const billId = byNumber.get(discussion.shiryoNumber);
    if (billId === undefined) continue;
    await replaceDiscussions({ billId, topics: discussion.topics });
    saved += discussion.topics.length;
  }

  // 質疑が付かなかった資料も「会議録は見た」と記録する。
  // そうしないと毎回モデルを呼び直すことになる。
  //
  // リンクは中央区議会の正式な会議録に向ける。ここに載せているのは
  // AIが書いた要約なので、読み手が一次情報に当たれる先は正式版にする。
  await markDiscussionsLinked({
    billIds: meeting.reports.map((r) => r.billId),
    minutesUrl: buildOfficialMinutesUrl({
      committee: meeting.committee,
      date: meeting.meetingDate,
    }),
  });

  console.log(
    `  ${meeting.committee} ${meeting.meetingDate}: ${discussions.length}資料 / 論点${saved}件`
  );
  return "new";
}
