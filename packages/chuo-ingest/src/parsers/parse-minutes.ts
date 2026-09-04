import {
  htmlToText,
  reiwaToYear,
  toHalfWidthDigits,
  trimSpaces,
} from "../shared/html-text";
import type {
  Minutes,
  MinutesSection,
  MinutesSectionKind,
  Utterance,
} from "../shared/types";
import { extractShiryoNumbers } from "./extract-shiryo-numbers";

/**
 * 委員会の議事録を読む。
 *
 * 取得元: https://www.kugikai.city.chuo.lg.jp/kaigiroku.cgi/r07/hukushi20260210.html
 *
 * 本文は `p.kaigi02` が1段落で、発言の頭だけが「○」で始まる。同じ人の
 * 2段落目以降は「○」が付かないため、「○」で新しい発言を開始し、
 * 続く段落を同じ発言にぶら下げる。
 *
 * `p.kaigi03` は〔「異議なし」と呼ぶ者あり〕のような議事整理の記述で、
 * 誰の発言でもないので落とす。`p.kaigi01` は出席者などの冒頭情報。
 */
export function parseMinutes(html: string): Minutes | null {
  const title = extractTitle(html);
  if (title === null) return null;

  const date = parseMinutesDate(title);
  const committee = parseCommitteeName(title);
  if (date === null || committee === null) return null;

  const utterances = extractUtterances(html);

  return {
    title,
    committee,
    date,
    utterances,
    sections: detectSections(utterances),
  };
}

function extractTitle(html: string): string | null {
  const match = html.match(/<h1>([\s\S]*?)<\/h1>/);
  return match === null ? null : trimSpaces(htmlToText(match[1]));
}

/** 「令和8年　福祉保健委員会(2月10日)」→ 2026-02-10 */
function parseMinutesDate(title: string): string | null {
  const text = toHalfWidthDigits(title);
  const match = text.match(
    /令和\s*(\d{1,2})\s*年[\s\S]*?\((\d{1,2})月(\d{1,2})日\)/
  );
  if (match === null) return null;
  const year = reiwaToYear(Number.parseInt(match[1], 10));
  return `${year}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function parseCommitteeName(title: string): string | null {
  const match = title.match(/年[\s 　]*([^()（）]+?)[\s 　]*[(（]/);
  return match === null ? null : trimSpaces(match[1]);
}

/**
 * 本文の段落（p.kaigi02）を発言単位にまとめる。
 *
 * 1つの発言は複数の `p.kaigi02` にまたがる。発言の1つ目の `p` だけが
 * 「○発言者名」で始まり、`<br>` を挟んで本文が続く。2段落目以降は
 * 独立した `p` になり、全角スペースの字下げだけを持つ。
 *
 *   <p class="kaigi02">○堀田委員長<br>　ただいまより…開会いたします。</p>
 *   <p class="kaigi02">　本日、礒野委員が欠席のため…</p>
 */
function extractUtterances(html: string): Utterance[] {
  const utterances: Utterance[] = [];
  let current: { speaker: string; paragraphs: string[] } | null = null;

  const paragraph = /<p class="kaigi02">([\s\S]*?)<\/p>/g;
  for (const match of html.matchAll(paragraph)) {
    const lines = htmlToText(match[1])
      .split("\n")
      .map(trimSpaces)
      .filter((line) => line !== "");

    for (const line of lines) {
      const head = line.match(/^○([^　\s]+)[　\s]*(.*)$/);
      if (head === null) {
        // 「○」が無い行は直前の発言の続き。
        // 発言が始まる前の（午後1時30分　開会）等は捨てる。
        if (current !== null) current.paragraphs.push(line);
        continue;
      }

      if (current !== null) utterances.push(toUtterance(current, utterances));
      const rest = trimSpaces(head[2]);
      current = { speaker: head[1], paragraphs: rest === "" ? [] : [rest] };
    }
  }

  if (current !== null) utterances.push(toUtterance(current, utterances));
  return utterances;
}

function toUtterance(
  current: { speaker: string; paragraphs: string[] },
  done: Utterance[]
): Utterance {
  return {
    index: done.length + 1,
    speaker: current.speaker,
    paragraphs: current.paragraphs,
    shiryoNumbers: extractShiryoNumbers(current.paragraphs.join("\n")),
  };
}

/** 節の優先順位。同じ発言に複数の合図が入っていたら後ろのものを採る。 */
const SECTION_PRECEDENCE: MinutesSectionKind[] = [
  "opening",
  "reports",
  "report_questions",
  "closing",
  "agenda",
];

/**
 * 委員長の定型句で議事録を区切る。
 *
 * 中央区の委員会は進行がほぼ定型だが、委員会ごとに言い回しが揺れる。
 *
 *   「では、理事者報告に入ります」／「それでは、理事者報告を願います」
 *   「それでは、理事者報告に対する質疑に入ります」
 *   「では、理事者報告についての質疑は終了いたします」
 *   「続きまして、議題（１）、…に入ります」
 *   「続きまして、議題（１）、…、質疑のある方はいらっしゃいますか」
 *
 * 合図を拾うのは委員長の発言だけにする。委員が「議題（１）について」と
 * 触れることがあり、発言者を見ないと審議の途中で節が切れてしまう。
 *
 * 議題は同じ番号が何度も出る（継続審査の確認など）ため、最初の1回だけを
 * 節の始まりとして扱う。
 *
 * 合図が見つからない会議もあるので、拾えた区切りだけを返す。取りこぼしても
 * 前後の節に含まれるだけで、誤った節に入れてしまうより害が小さい。
 *
 * 議事録HTMLからでも、みえる議会のJSONからでも、発言の並びさえあれば
 * 同じ判定ができるよう公開している。
 */
export function detectSections(utterances: Utterance[]): MinutesSection[] {
  if (utterances.length === 0) return [];

  type Marker = { kind: MinutesSectionKind; label: string | null; at: number };
  const byIndex = new Map<number, Marker>();
  const seenAgenda = new Set<string>();

  const put = (marker: Marker) => {
    const existing = byIndex.get(marker.at);
    if (
      existing !== undefined &&
      SECTION_PRECEDENCE.indexOf(existing.kind) >=
        SECTION_PRECEDENCE.indexOf(marker.kind)
    ) {
      return;
    }
    byIndex.set(marker.at, marker);
  };

  for (const utterance of utterances) {
    if (!utterance.speaker.endsWith("委員長")) continue;
    const text = utterance.paragraphs.join("\n");
    const at = utterance.index;

    if (/理事者報告(に入り|を願い|をお願い)/.test(text)) {
      put({ kind: "reports", label: null, at });
    }
    if (/理事者報告に対する質疑に入り/.test(text)) {
      put({ kind: "report_questions", label: null, at });
    }
    // 特別委員会は「理事者報告に対する質疑に入ります」と言わない。
    // 報告のあと、委員長が発言の持ち時間を読み上げてそのまま質疑に入る。
    // 常任委員会でも同じ発言が質疑の直前に来るので、両方でこれを合図にできる。
    if (/発言の持ち時間制/.test(text)) {
      put({ kind: "report_questions", label: null, at });
    }
    if (/理事者報告について(の|は)質疑(は|を)?終了/.test(text)) {
      put({ kind: "closing", label: null, at });
    }

    const agenda = text.match(
      /議題[（(]\s*([0-9０-９一二三四五六七八九十]+)\s*[）)]/
    );
    if (agenda !== null) {
      const label = `議題（${toHalfWidthDigits(agenda[1])}）`;
      if (!seenAgenda.has(label)) {
        seenAgenda.add(label);
        put({ kind: "agenda", label, at });
      }
    }
  }

  const markers = [...byIndex.values()].sort((a, b) => a.at - b.at);
  const sections: MinutesSection[] = [];
  const first = markers[0];

  if (first === undefined || first.at > 1) {
    sections.push({
      kind: "opening",
      label: null,
      fromIndex: 1,
      toIndex: first === undefined ? utterances.length : first.at - 1,
    });
  }

  markers.forEach((marker, i) => {
    const next = markers[i + 1];
    sections.push({
      kind: marker.kind,
      label: marker.label,
      fromIndex: marker.at,
      toIndex: next === undefined ? utterances.length : next.at - 1,
    });
  });

  return sections.filter((s) => s.fromIndex <= s.toIndex);
}
