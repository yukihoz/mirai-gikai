import type { CalendarMeeting } from "../shared/types";
import { htmlToText, trimSpaces } from "../shared/html-text";

/**
 * 議会カレンダー（月別）から、その月の会議を拾う。
 *
 * 取得元: https://www.kugikai.city.chuo.lg.jp/calendar/index.html?year=2026&month=2
 *
 * カレンダーはサーバー側で組まれた静的HTMLで、開催日程ページを持つ会議だけが
 * リンクになっている。リンクが無いコマ（予定だけ・非公開）は資料も議事録も
 * 無いため、リンクのあるものだけを返す。
 *
 * 日付はセルの「10日」ではなくURL末尾の8桁から取る。セルは月をまたぐ週で
 * 前月・翌月の日付も並ぶため、URLのほうが取り違えない。
 */
export function parseCalendar(html: string): CalendarMeeting[] {
  const table = extractCalendarTable(html);
  if (table === null) return [];

  const meetings: CalendarMeeting[] = [];
  const seen = new Set<string>();

  const anchor = /<a\s+href="([^"]+_(\d{8})\.html)"[^>]*>([\s\S]*?)<\/a>/g;
  for (const match of table.matchAll(anchor)) {
    const [, href, digits, label] = match;
    const committee = trimSpaces(htmlToText(label));
    if (committee === "") continue;

    // 同じ会議が複数コマに現れることはないが、テンプレートの重複に備える。
    if (seen.has(href)) continue;
    seen.add(href);

    meetings.push({
      date: `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`,
      committee,
      href,
    });
  }

  return meetings;
}

/** カレンダー本体の table だけを切り出す（ヘッダーやフッターのリンクを拾わないため） */
function extractCalendarTable(html: string): string | null {
  const start = html.indexOf('id="tblCalendar"');
  if (start === -1) return null;
  const end = html.indexOf("</table>", start);
  return end === -1 ? html.slice(start) : html.slice(start, end);
}
