/**
 * 中央区議会サイトのURLを組み立てる。
 *
 * 資料PDFのリンクは `../../shiryo/r8/福祉保健/2月10日/(資料4)…….pdf` のように
 * 相対パスかつ日本語で、ファイル名に空白や括弧も入る。WHATWG の `URL` は
 * 相対解決とパーセントエンコードを両方やってくれるので、自前でエスケープを
 * 組み立てない。`encodeURI` を手で当てると二重エンコードを踏みやすい。
 */

export const CHUO_KUGIKAI_ORIGIN = "https://www.kugikai.city.chuo.lg.jp";

/** 議会カレンダー（月別）のURL */
export function buildCalendarUrl(year: number, month: number): string {
  const url = new URL("/calendar/index.html", CHUO_KUGIKAI_ORIGIN);
  url.searchParams.set("year", String(year));
  url.searchParams.set("month", String(month));
  // サイト側のフォームが送る空パラメータ。付けない場合と結果は同じだが、
  // ブラウザで開いたときと同じURLにしておく。
  url.searchParams.set("kaigi", "");
  return url.href;
}

/** カレンダーページから見た相対URL（例: r08/fukushi_20260210.html）を絶対URLにする */
export function buildCommitteePageUrl(href: string): string {
  return new URL(href, `${CHUO_KUGIKAI_ORIGIN}/calendar/`).href;
}

/**
 * ページ内のリンクを絶対URLにする。
 *
 * 日本語・空白を含むパスはここでパーセントエンコードされる。
 * 解決できない相対パスは、黙って別のURLになるより例外にする。
 */
export function resolveUrl(baseUrl: string, href: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    throw new Error(`URLを解決できなかった: base=${baseUrl} href=${href}`);
  }
}

/**
 * 取得してよいURLかを判定する。
 *
 * 中央区議会サイトの robots.txt には `User-agent: *` のグループが無く、
 * 末尾の `Disallow: /*.cgi` `/*?` は直前の1ボットのグループに属している。
 * 規則の上では一般のクライアントに及ばないが、**クエリ付きURLと .cgi を
 * 巡回してほしくない意図は明らか**なので、こちらで守る。
 *
 * カレンダー（`/calendar/`）と資料PDF（`/shiryo/`）は静的なHTML/PDFで、
 * この制約に当たらない。会議録検索（`/kaigiroku/index.cgi?...`）は当たる。
 */
export function isCrawlableUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.origin !== CHUO_KUGIKAI_ORIGIN) return false;
  if (parsed.search !== "" && !isCalendarPath(parsed.pathname)) return false;
  if (parsed.pathname.includes(".cgi")) return false;
  if (parsed.pathname.startsWith("/system/")) return false;
  if (parsed.pathname.startsWith("/tmp/")) return false;

  return true;
}

/**
 * カレンダーだけはクエリ付きを許す。
 *
 * 月の指定が `?year=&month=` でしか行えず、これを避けると当月しか見られない。
 * 1ページに1リクエストで、生成されるURLも月数ぶんしかない。
 */
function isCalendarPath(pathname: string): boolean {
  return pathname === "/calendar/index.html";
}
