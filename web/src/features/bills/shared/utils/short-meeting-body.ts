/**
 * 一覧に出す会議体の短い名前。
 *
 * 「福祉保健委員会」「築地まちづくり・環境対策特別委員会」のように、
 * どれも末尾が「委員会」「特別委員会」でそろっている。並べたときに
 * 同じ語が縦に連なるだけで、見分けの助けにならない。狭い画面では
 * その分だけ本題が押し出される。
 */
export function toShortMeetingBody(
  meetingBody: string | null | undefined
): string {
  if (!meetingBody) return "";

  return meetingBody.replace(/(特別)?委員会$/, "");
}
