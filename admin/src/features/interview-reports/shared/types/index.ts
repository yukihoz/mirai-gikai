import type { Database } from "@mirai-gikai/supabase";

export type InterviewSession =
  Database["public"]["Tables"]["interview_sessions"]["Row"];

export type InterviewReport =
  Database["public"]["Tables"]["interview_report"]["Row"];

export type InterviewMessage =
  Database["public"]["Tables"]["interview_messages"]["Row"];

export type InterviewSessionWithDetails = InterviewSession & {
  message_count: number;
  interview_report: InterviewReport | null;
};

export type ReactionCounts = {
  helpful: number;
  hmm: number;
};

export type InterviewSessionDetail = InterviewSession & {
  interview_report: InterviewReport | null;
  interview_messages: InterviewMessage[];
  reaction_counts: ReactionCounts | null;
};

export const SORTABLE_COLUMNS = ["started_at", "message_count"] as const;

export type SortColumn = (typeof SORTABLE_COLUMNS)[number];
export type SortOrder = "asc" | "desc";

export interface SortParams {
  sortBy: SortColumn;
  sortOrder: SortOrder;
}

export const DEFAULT_SORT: SortParams = {
  sortBy: "started_at",
  sortOrder: "desc",
};

export function parseSortParams(
  sortBy: string | undefined,
  sortOrder: string | undefined
): SortParams {
  const column = SORTABLE_COLUMNS.includes(sortBy as SortColumn)
    ? (sortBy as SortColumn)
    : DEFAULT_SORT.sortBy;
  const order =
    sortOrder === "asc" || sortOrder === "desc"
      ? sortOrder
      : DEFAULT_SORT.sortOrder;
  return { sortBy: column, sortOrder: order };
}

export { formatDuration } from "../utils/format-duration";
export {
  getSessionStatus,
  type SessionStatus,
} from "../utils/get-session-status";
