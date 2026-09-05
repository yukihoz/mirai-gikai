import type { MeetingCommittee } from "../types";

/** 委員会名を並べるときの区切り */
const SEPARATOR = "・";

/** 委員会名を並べた表示用の文字列 */
export function formatCommitteeNames(names: string[]): string {
  return names.join(SEPARATOR);
}

/**
 * まとめページの委員会を並べた表示用の文字列。
 *
 * ページの見出しと、SNSに出るタイトルの両方で使う。別々に組み立てると
 * 片方だけ区切りが変わる。
 */
export function formatMeetingCommittees(
  committees: MeetingCommittee[]
): string {
  return formatCommitteeNames(
    committees.map((committee) => committee.committee)
  );
}
