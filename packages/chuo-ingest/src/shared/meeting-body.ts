/**
 * 区議会サイトの会議体名を、DBの `meeting_body_enum` の値に対応づける。
 *
 * ほとんどはそのまま使えるが、1件だけ enum に入らない名前がある。
 * PostgreSQL の enum ラベルは63バイトまでで、
 * 「区制施行８０周年等にぎわいの向上・創出対策特別委員会」は78バイトある。
 *
 * 正式名称は `chuo_bill_sources.committee`（text）に丸ごと残すので、
 * ここで縮めるのは表示・絞り込み用の値だけ。
 *
 * 委員会の名前は数年ごとに変わる。いずれ `meeting_body` は enum をやめて
 * text にするのが本筋で、そのときこの対応表は不要になる。
 */

/** 正式名称 → enum に入れる名前 */
const MEETING_BODY_ALIASES: Record<string, string> = {
  "区制施行８０周年等にぎわいの向上・創出対策特別委員会":
    "区制施行80周年等にぎわい創出対策特別委員会",
  // 全角・半角どちらで来ても拾えるようにしておく
  "区制施行80周年等にぎわいの向上・創出対策特別委員会":
    "区制施行80周年等にぎわい創出対策特別委員会",
};

/**
 * DBに入れる会議体名を返す。
 *
 * 対応表に無い名前はそのまま返す。enum に無い値は INSERT で落ちるので、
 * 新しい委員会ができたら気づける（黙って別の値に丸めない）。
 */
export function toMeetingBody(committeeName: string): string {
  return MEETING_BODY_ALIASES[committeeName] ?? committeeName;
}
