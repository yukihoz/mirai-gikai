/**
 * 中央区議会サイトから読み取る値の型。
 *
 * パーサーはここで定義した形だけを返し、DBの都合（bills / bill_contents 等）は
 * 持ち込まない。取り込み先が変わってもパーサーを書き直さずに済むようにする。
 */

/** 議会カレンダーの1コマ（1つの会議） */
export type CalendarMeeting = {
  /** 開催日 (YYYY-MM-DD) */
  date: string;
  /** カレンダーに出る会議体名（例: 福祉保健委員会） */
  committee: string;
  /** カレンダーページから見た相対URL（例: r08/fukushi_20260210.html） */
  href: string;
};

/** 委員会に出された報告事項1件 */
export type CommitteeReport = {
  /**
   * 資料番号（例: 4）。
   *
   * 議事録で委員が「資料４について」と言うときの番号と対応する。
   * 番号を読み取れなかった場合は null。
   */
  number: number | null;
  /** 件名（先頭の「4.」は落とす） */
  title: string;
  /**
   * 資料PDFの相対URL。日本語ファイル名は未エンコードのまま返す。
   *
   * エンコードは取得側の責務にする。ここで encodeURI すると、
   * 元のHTMLに書かれていた文字列と突き合わせられなくなる。
   */
  pdfHref: string | null;
};

/** 委員会の開会日程ページ */
export type CommitteePage = {
  /** 会議体名（例: 福祉保健委員会） */
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  date: string;
  /** 開会時間の表記（例: 午後1時30分から）。無ければ null */
  startsAt: string | null;
  /** 【報告事項】に並ぶ資料 */
  reports: CommitteeReport[];
  /** 【議題】に並ぶ件名 */
  agenda: string[];
};

/** 議事録の1発言（「○」で始まる塊。同一発言の複数段落を含む） */
export type Utterance = {
  /** 会議内の連番（1始まり） */
  index: number;
  /** 議事録の表記そのまま（例: 高橋委員、武藤生活衛生課長） */
  speaker: string;
  /** 発言の段落。空行で分かれていたものをそのまま保つ */
  paragraphs: string[];
  /** 発言中で言及された資料番号（昇順・重複なし） */
  shiryoNumbers: number[];
};

/**
 * 議事録の区切り。
 *
 * - `opening` … 開会から理事者報告の前まで
 * - `reports` … 理事者による報告（資料の読み上げ）
 * - `report_questions` … 報告事項に対する質疑
 * - `agenda` … 議題（1件ごとに1つ）
 * - `closing` … 質疑・議題のあと
 */
export type MinutesSectionKind =
  | "opening"
  | "reports"
  | "report_questions"
  | "agenda"
  | "closing";

export type MinutesSection = {
  kind: MinutesSectionKind;
  /** 議題の見出し（例: 議題（1））。それ以外は null */
  label: string | null;
  /** この区切りに含まれる最初の発言の index */
  fromIndex: number;
  /** この区切りに含まれる最後の発言の index */
  toIndex: number;
};

/** 委員会の議事録 */
export type Minutes = {
  /** ページの見出し（例: 令和8年　福祉保健委員会(2月10日)） */
  title: string;
  /** 会議体名（例: 福祉保健委員会） */
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  date: string;
  utterances: Utterance[];
  sections: MinutesSection[];
};
