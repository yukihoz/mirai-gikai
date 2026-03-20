import type {
  InterviewSessionWithDetails,
  SortParams,
} from "../../shared/types";
import { DEFAULT_SORT } from "../../shared/types";
import { calculatePaginationRange } from "../../shared/utils/pagination-utils";
import {
  countInterviewSessionsByConfigId,
  findInterviewConfigIdByBillId,
  findInterviewMessageCounts,
  findInterviewSessionsWithReport,
} from "../repositories/interview-report-repository";

export const SESSIONS_PER_PAGE = 30;

export async function getInterviewSessions(
  billId: string,
  page = 1,
  sort: SortParams = DEFAULT_SORT
): Promise<InterviewSessionWithDetails[]> {
  const config = await findInterviewConfigIdByBillId(billId);

  if (!config) {
    return [];
  }

  // ページネーション計算
  const { from, to } = calculatePaginationRange(page, SESSIONS_PER_PAGE);

  // message_countソートの場合はDB側ではstarted_atでソートし、後でアプリ側ソートする
  const dbOrderBy =
    sort.sortBy === "message_count"
      ? { column: "started_at", ascending: false }
      : { column: sort.sortBy, ascending: sort.sortOrder === "asc" };

  // セッション一覧を取得
  let sessions: Awaited<ReturnType<typeof findInterviewSessionsWithReport>>;
  try {
    sessions = await findInterviewSessionsWithReport(
      config.id,
      from,
      to,
      dbOrderBy
    );
  } catch (error) {
    console.error("Failed to fetch interview sessions:", error);
    return [];
  }

  // 全セッションのメッセージ数を一括取得（RPCで1クエリ集計）
  const sessionIds = sessions.map((s) => s.id);
  let messageCounts:
    | Awaited<ReturnType<typeof findInterviewMessageCounts>>
    | undefined;
  try {
    messageCounts = await findInterviewMessageCounts(sessionIds);
  } catch (error) {
    console.error("Failed to fetch message counts:", {
      error,
      sessionIds,
    });
  }

  // セッションIDごとのメッセージ数をマップに変換（missing sessions default to 0）
  const countMap = new Map<string, number>();
  for (const id of sessionIds) {
    countMap.set(id, 0);
  }
  for (const row of messageCounts || []) {
    countMap.set(row.interview_session_id, Number(row.message_count));
  }

  // セッションにメッセージ数を付与
  const sessionsWithDetails: InterviewSessionWithDetails[] = sessions.map(
    (session) => {
      // interview_reportは配列で返ってくるので最初の要素を取得
      const report = Array.isArray(session.interview_report)
        ? session.interview_report[0] || null
        : session.interview_report;

      return {
        ...session,
        message_count: countMap.get(session.id) || 0,
        interview_report: report,
      };
    }
  );

  // message_countでのソート（アプリケーション層）
  if (sort.sortBy === "message_count") {
    sessionsWithDetails.sort((a, b) =>
      sort.sortOrder === "asc"
        ? a.message_count - b.message_count
        : b.message_count - a.message_count
    );
  }

  return sessionsWithDetails;
}

export async function getInterviewSessionsCount(
  billId: string
): Promise<number> {
  const config = await findInterviewConfigIdByBillId(billId);

  if (!config) {
    return 0;
  }

  try {
    return await countInterviewSessionsByConfigId(config.id);
  } catch (error) {
    console.error("Failed to fetch session count:", error);
    return 0;
  }
}
