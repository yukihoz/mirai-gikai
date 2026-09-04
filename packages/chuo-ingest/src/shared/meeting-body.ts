/**
 * 区議会サイトの会議体名を、DBに入れる値にする。
 *
 * `bills.meeting_body` は text なので、区の表記をそのまま入れられる。
 * 以前は enum だったため、63バイトを超える委員会名を縮める対応表を
 * 持っていたが、text 化にともなって不要になった。
 *
 * 関数を残しているのは、将来また表記ゆれ（全角・半角、旧称）を吸収する
 * 必要が出たときに、直す場所をここ1か所に保つため。
 */
export function toMeetingBody(committeeName: string): string {
  return committeeName;
}
