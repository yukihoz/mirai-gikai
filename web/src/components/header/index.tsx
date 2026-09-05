import { HeaderClient } from "./header-client";

/**
 * ヘッダー。
 *
 * ここで Cookie を読むと、共有レイアウトにいる都合で全ページが動的
 * レンダリングになり、CDNに載らなくなる。切り替えスイッチの初期値は
 * ブラウザ側で読むようにして、レイアウトはサーバーの状態に触れない。
 */
export function Header() {
  return <HeaderClient />;
}
