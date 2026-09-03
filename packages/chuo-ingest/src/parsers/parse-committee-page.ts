import {
  htmlToText,
  reiwaToYear,
  toHalfWidthDigits,
  trimSpaces,
} from "../shared/html-text";
import type { CommitteePage, CommitteeReport } from "../shared/types";

/**
 * 委員会の開会日程ページを読む。
 *
 * 取得元: https://www.kugikai.city.chuo.lg.jp/calendar/r08/fukushi_20260210.html
 *
 * ページは `table#tblInfo` の「会議名 / 開会時間 / 委員会審議案件 / 最終更新日」
 * という4行で、審議案件は `【報告事項】` と `【議題】` を見出し代わりにした
 * 1つの `ul` になっている。報告事項だけが資料PDFへのリンクを持つ。
 *
 * テンプレートの都合で空の `li` や入れ子の `ul` が大量に混ざるため、
 * 中身が空の項目は落とす。
 */
export function parseCommitteePage(html: string): CommitteePage | null {
  const rows = extractInfoRows(html);
  const heading = rows.get("会議名");
  if (heading === undefined) return null;

  const date = parseMeetingDate(heading);
  const committee = parseCommitteeName(heading);
  if (date === null || committee === null) return null;

  const items = rows.get("委員会審議案件") ?? "";
  const { reports, agenda } = splitItems(items);

  return {
    committee,
    date,
    startsAt: rows.get("開会時間") ?? null,
    reports,
    agenda,
  };
}

/** `table#tblInfo` を「項目名 → 中身のHTML」にする */
function extractInfoRows(html: string): Map<string, string> {
  const rows = new Map<string, string>();
  const start = html.indexOf('id="tblInfo"');
  if (start === -1) return rows;
  const end = html.indexOf("</table>", start);
  const table = end === -1 ? html.slice(start) : html.slice(start, end);

  const cell =
    /<td class="term">([\s\S]*?)<\/td>\s*<td class="exp">([\s\S]*?)<\/td>/g;
  for (const match of table.matchAll(cell)) {
    const term = trimSpaces(htmlToText(match[1]));
    // 審議案件はHTMLのまま持つ（PDFのhrefが要る）。他はテキストで足りる。
    const value =
      term === "委員会審議案件" ? match[2] : trimSpaces(htmlToText(match[2]));
    rows.set(term, value);
  }
  return rows;
}

/** 「令和8年　福祉保健委員会(2月10日)」→ 2026-02-10 */
function parseMeetingDate(heading: string): string | null {
  const text = toHalfWidthDigits(heading);
  const match = text.match(
    /令和\s*(\d{1,2})\s*年[\s\S]*?\((\d{1,2})月(\d{1,2})日\)/
  );
  if (match === null) return null;
  const year = reiwaToYear(Number.parseInt(match[1], 10));
  const month = match[2].padStart(2, "0");
  const day = match[3].padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 「令和8年　福祉保健委員会(2月10日)」→ 福祉保健委員会 */
function parseCommitteeName(heading: string): string | null {
  const match = heading.match(/年[\s 　]*([^()（）]+?)[\s 　]*[(（]/);
  return match === null ? null : trimSpaces(match[1]);
}

/**
 * 審議案件のリストを【報告事項】と【議題】に分ける。
 *
 * 見出しは項目として書かれているだけで、階層にはなっていない。
 * 【報告事項】が現れてから【議題】までを報告、以降を議題として扱う。
 */
function splitItems(itemsHtml: string): {
  reports: CommitteeReport[];
  agenda: string[];
} {
  const reports: CommitteeReport[] = [];
  const agenda: string[] = [];
  let bucket: "none" | "reports" | "agenda" = "none";

  for (const match of itemsHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)) {
    const inner = match[1];
    const text = trimSpaces(htmlToText(inner).replace(/\s*\n\s*/g, ""));
    if (text === "") continue;

    if (text.includes("【報告事項】")) {
      bucket = "reports";
      continue;
    }
    if (text.includes("【議題】")) {
      bucket = "agenda";
      continue;
    }

    if (bucket === "agenda") {
      agenda.push(stripLeadingNumber(text));
      continue;
    }
    if (bucket === "reports") {
      reports.push(toReport(text, inner));
    }
  }

  return { reports, agenda };
}

function toReport(text: string, inner: string): CommitteeReport {
  const href = inner.match(/href="([^"]+\.pdf)"/i);
  return {
    number: parseLeadingNumber(text),
    title: stripLeadingNumber(text),
    pdfHref: href === null ? null : href[1],
  };
}

/** 「4.病児・病後児保育…」の 4 を返す。番号が無ければ null */
function parseLeadingNumber(text: string): number | null {
  const match = toHalfWidthDigits(text).match(/^(\d{1,2})[.．]/);
  return match === null ? null : Number.parseInt(match[1], 10);
}

/**
 * 「4.病児・病後児保育…」→「病児・病後児保育…」
 *
 * 件名の中の数字（「令和７年度」等）は原文のまま残す。ここで半角に直すと、
 * 区が公開している件名と字面が変わってしまう。
 */
function stripLeadingNumber(text: string): string {
  return trimSpaces(text.replace(/^[0-9０-９]{1,2}[.．][\s 　]*/, ""));
}
