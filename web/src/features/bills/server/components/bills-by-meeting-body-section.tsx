import { CompactBillCard } from "../../client/components/bill-list/compact-bill-card";
import { getMeetingBodyColor } from "../../shared/utils/meeting-body-colors";
import { isCommitteeMeetingBody } from "../../shared/utils/group-by-meeting-body";
import type { BillsByMeetingBody } from "../loaders/get-recent-bills";

interface BillsByMeetingBodySectionProps {
  groups: BillsByMeetingBody[];
}

/**
 * 会議体ごとにまとめた記事。
 *
 * 報告資料は委員会ごとに出るので、全部を1列に並べるより
 * 「どの委員会の話か」で辿れるほうが探しやすい。委員会は8つ前後で
 * 増減も緩やかなため、見出しを立てて縦に積む形にしている。
 *
 * AIインタビューのように委員会ではないものは「委員会から探す」に
 * 混ぜず、別のまとまりとして下に置く。入り口が無くなると辿れなくなる。
 */
export function BillsByMeetingBodySection({
  groups,
}: BillsByMeetingBodySectionProps) {
  const committees = groups.filter((g) =>
    isCommitteeMeetingBody(g.meetingBody)
  );
  const others = groups.filter((g) => !isCommitteeMeetingBody(g.meetingBody));

  if (committees.length === 0 && others.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {committees.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-[22px] font-bold text-black leading-[1.48]">
            委員会から探す
          </h2>
          <MeetingBodyGroups groups={committees} />
        </section>
      )}

      {others.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className="text-[22px] font-bold text-black leading-[1.48]">
            AIインタビュー
          </h2>
          <p className="text-sm text-mirai-text-muted">
            区民のみなさんの意見をAIが聞き取り、まとめたものです。
          </p>
          <MeetingBodyGroups groups={others} showHeading={false} />
        </section>
      )}
    </div>
  );
}

/** 会議体ごとの見出しと記事の並び */
function MeetingBodyGroups({
  groups,
  showHeading = true,
}: {
  groups: BillsByMeetingBody[];
  /** 会議体名が節の見出しと重なるときは出さない */
  showHeading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <div key={group.meetingBody} className="flex flex-col gap-3">
          {showHeading && (
            <div className="flex items-baseline gap-3">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <span
                  className={`inline-block w-1 h-5 rounded-sm ${getMeetingBodyColor(group.meetingBody).rail}`}
                  aria-hidden="true"
                />
                {group.meetingBody}
              </h3>
              <span className="text-xs text-mirai-text-muted">
                {group.totalCount}件
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {group.bills.map((bill) => (
              <CompactBillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
