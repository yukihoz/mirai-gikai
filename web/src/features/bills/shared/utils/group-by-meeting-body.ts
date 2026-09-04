/**
 * 会議体ごとのまとまりを、トップページに出す順に並べる。
 *
 * 直近の開催が新しい会議体を上に置く。いま開かれている委員会が
 * 上に来るので、「今週何があったか」から辿れる。
 * AIインタビューのように委員会でないものは末尾へ回す。見出しが
 * 「委員会から探す」なので、その並びに混ざると意味が合わなくなる。
 */

/** 委員会ではない会議体 */
export const NON_COMMITTEE_BODIES = new Set(["AIインタビュー"]);

export type MeetingBodyGroup<T> = {
  meetingBody: string;
  bills: T[];
};

export function isCommitteeMeetingBody(meetingBody: string): boolean {
  return !NON_COMMITTEE_BODIES.has(meetingBody);
}

export function sortMeetingBodyGroups<
  T extends { submitted_date?: string | null },
  G extends MeetingBodyGroup<T>,
>(groups: G[]): G[] {
  const byRecency = [...groups].sort((a, b) => {
    const at = a.bills[0]?.submitted_date ?? "";
    const bt = b.bills[0]?.submitted_date ?? "";
    return bt.localeCompare(at);
  });

  return [
    ...byRecency.filter((g) => isCommitteeMeetingBody(g.meetingBody)),
    ...byRecency.filter((g) => !isCommitteeMeetingBody(g.meetingBody)),
  ];
}
