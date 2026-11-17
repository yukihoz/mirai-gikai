/**
 * Next.js cache tags for revalidation
 */
export const CACHE_TAGS = {
  BILLS: "bills",
  DIET_SESSIONS: "diet-sessions",
  INTERVIEW_CONFIGS: "interview-configs",
  // admin のレポート公開操作が revalidate するタグ。
  PUBLIC_INTERVIEW_REPORTS: "public-interview-reports",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const ALL_CACHE_TAGS = Object.values(CACHE_TAGS);

/**
 * トップ・検索・会議一覧など、どのページからも引かれる一覧のキャッシュ期間（秒）。
 *
 * admin での編集は revalidateTag で即座に反映されるので、この期間が効くのは
 * admin を通らない更新（取り込み worker が公開済みの議案を書き換えた場合など）だけ。
 * 10分だとアクセスがある限り10分ごとに全件を引き直し、メモリの小さいDBの
 * Disk IO を食うため、1時間にしている。
 *
 * 期間を延ばすぶん、DBエラーを空配列としてキャッシュしてはいけない。
 * キャッシュ関数の中では例外を投げ、外で受けること（期限切れ後の再取得で
 * 失敗しても、前回の値が出続ける）。
 */
export const LIST_CACHE_REVALIDATE_SECONDS = 3600;
