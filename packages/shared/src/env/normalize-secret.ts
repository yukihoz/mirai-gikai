/**
 * 環境変数から読んだ秘密の値をならす。
 *
 * ダッシュボードへ貼るときに末尾の改行が一緒に入ることがある。Bearer token
 * として送ると、HTTPのヘッダ値は前後の空白がクライアント側で落ちる（RFC 9110
 * の field value は前後 OWS を含まない）ので、**送り手と受け手が同じ値を
 * 持っていても一致しない**。空白が入ったまま使える場面が無い以上、読んだ
 * ところで落としてしまう。
 *
 * 空白だけの値は「設定されていない」と同じに扱う。空文字を返すと、秘密が
 * 無いのに比較だけは通ってしまう経路を作りかねない。
 */
export function normalizeSecret(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
