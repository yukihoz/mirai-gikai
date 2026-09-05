import type { BillWithContent } from "@/features/bills/shared/types";
import type { MeetingCommittee } from "../types";

/** 資料1件ぶん。委員会の情報と、その資料から作った記事 */
export type MeetingCommitteeEntry = {
  committee: string;
  meetingUrl: string;
  minutesUrl: string | null;
  bill: BillWithContent;
};

/**
 * その日の資料を委員会ごとにまとめる。
 *
 * 資料は委員会での並び順（資料番号）で渡ってくる前提で、その順を崩さない。
 * 委員会も最初に出てきた順に並べる。会議録のURLは同じ委員会なら
 * どの資料からも同じ値が来るので、最初に見つかったものを使う。
 */
export function toMeetingCommittees(
  entries: MeetingCommitteeEntry[]
): MeetingCommittee[] {
  const committees: MeetingCommittee[] = [];

  for (const entry of entries) {
    const found = committees.find(
      (committee) => committee.committee === entry.committee
    );
    if (found === undefined) {
      committees.push({
        committee: entry.committee,
        meetingUrl: entry.meetingUrl,
        minutesUrl: entry.minutesUrl,
        bills: [entry.bill],
      });
      continue;
    }

    found.bills.push(entry.bill);
    // 会議録は資料が公開されたあとで付くので、null でない値を拾う
    found.minutesUrl ??= entry.minutesUrl;
  }

  return committees;
}
