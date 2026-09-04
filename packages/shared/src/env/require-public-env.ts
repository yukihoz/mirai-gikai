/**
 * 公開用の環境変数を読む。設定漏れは起動時に落として気づけるようにする。
 *
 * ただし Vercel の Preview だけは例外にする。この構成では Preview 用の
 * Supabase 接続情報を恒久的に置いておらず、`supabase/` を触ったPRのときだけ
 * ワークフローがブランチ別に注入する。注入されないPRで必ずビルドが落ちると、
 * CIが常に赤くなって「本当に見るべき失敗」が埋もれる。
 *
 * Preview で読み替えた場合、DBに触る画面は動かない。Preview はレビュー時に
 * 画面を見るための場で、本番の機能でも可用性の要件でもないため、
 * 「ビルドは通るが接続はできない」で困らない。
 */

export type RequirePublicEnvParams = {
  /** 環境変数名。エラーメッセージに出す */
  name: string;
  value: string | undefined;
  /**
   * Preview で未設定だったときに使う値。
   * URLとして解釈される変数もあるので、形の整った文字列を渡す。
   */
  previewFallback: string;
  /** Vercel が渡す実行環境（production / preview / development） */
  vercelEnv: string | undefined;
  /** 差し替え可能にしておく（テストで警告を数えるため） */
  warn?: (message: string) => void;
};

export function requirePublicEnv(params: RequirePublicEnvParams): string {
  const { name, value, previewFallback, vercelEnv } = params;

  if (value !== undefined && value !== "") return value;

  if (vercelEnv !== "preview") {
    throw new Error(`環境変数 ${name} が設定されていません`);
  }

  const warn = params.warn ?? console.warn;
  warn(
    `[env] ${name} が未設定のため、Preview用の値で起動する。` +
      "この環境ではデータベースに接続できない。"
  );
  return previewFallback;
}
