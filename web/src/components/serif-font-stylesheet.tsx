/**
 * 引用文の明朝体（Noto Serif JP、`font-mirai-serif`）を読み込む。
 *
 * next/font を通さず、ブラウザが Google Fonts から直接読み込む。next/font は
 * ビルドのたびに Google Fonts の CSS を取得するが、Noto Serif JP は拡張子の
 * ないフォント URL を返すことがあり、next/font がそれを解釈できずにビルドが
 * 落ちるため。
 *
 * `font-mirai-serif` を使う部品の中で描画する。precedence 付きの stylesheet は
 * React が <head> に移して1つにまとめるので、何度描画しても読み込みは1回で、
 * 明朝体を使わないページでは読み込まれない。
 */
export function SerifFontStylesheet() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@500;600&display=swap"
      precedence="default"
    />
  );
}
