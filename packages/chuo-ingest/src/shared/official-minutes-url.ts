/**
 * 中央区議会サイトにある正式な会議録へのリンクを組み立てる。
 *
 * URLは `kaigiroku.cgi/{年度}/{委員会の略称}{YYYYMMDD}.html` の形で、
 * 日付から機械的に決まる。`.cgi` 配下は robots.txt が巡回対象から
 * 外しているので、取りに行かず組み立てるだけにする。
 */

const ORIGIN = "https://www.kugikai.city.chuo.lg.jp";

/**
 * 委員会名 → 会議録のファイル名に使われる略称。
 *
 * 略称は委員会名から機械的には決まらない（区民文教は bunkyou、
 * 子ども子育て・高齢者対策特別委員会は shoushi）。会議録検索の
 * 結果から拾ったものを表に持つ。
 */
const COMMITTEE_SLUGS: Record<string, string> = {
  企画総務委員会: "kikaku",
  区民文教委員会: "bunkyou",
  福祉保健委員会: "hukushi",
  環境建設委員会: "kankyou",
  築地等都市基盤対策特別委員会: "toshikiban",
  "子ども子育て・高齢者対策特別委員会": "shoushi",
  地域活性化対策特別委員会: "chiikikasseika",
  防災等安全対策特別委員会: "bousai",
};

/**
 * その会議の会議録ページのURL。略称が分からない委員会では null。
 *
 * 2026年5月に組み替えられた特別委員会は、まだ会議録が公開されておらず
 * 略称も分からない。当て推量でURLを作ると、リンク切れのページを
 * 「正式版はこちら」として案内することになるので、出さない。
 */
export function buildOfficialMinutesUrl(params: {
  committee: string;
  /** 開催日 (YYYY-MM-DD) */
  date: string;
}): string | null {
  const slug = COMMITTEE_SLUGS[params.committee];
  if (slug === undefined) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.date);
  if (match === null) return null;

  const [, year, month, day] = match;
  const dir = toFiscalYearDirectory(Number(year), Number(month));
  if (dir === null) return null;

  return `${ORIGIN}/kaigiroku.cgi/${dir}/${slug}${year}${month}${day}.html`;
}

/**
 * 会議録が置かれるディレクトリ名（例: r07）。
 *
 * 区切りは年度で、4月から翌年3月までが同じディレクトリに入る。
 * 2026年2月の委員会は令和7年度なので r07。
 */
function toFiscalYearDirectory(year: number, month: number): string | null {
  const fiscalYear = month >= 4 ? year : year - 1;
  // 令和元年 = 2019年
  const reiwa = fiscalYear - 2018;
  if (reiwa < 1 || reiwa > 99) return null;

  return `r${String(reiwa).padStart(2, "0")}`;
}
