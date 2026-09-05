import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * OGP画像を組み立てるときに使う素材の読み込み。
 *
 * フォントも画像も、リクエストごとに取り直すと画像生成が遅くなる。
 * どちらもモジュールレベルで持ち回す。取得に失敗しても画像そのものは
 * 出したいので、例外は投げずに null を返す。
 */

const FONT_FETCH_TIMEOUT_MS = 3000;

/** タイムアウト付きfetch */
async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = FONT_FETCH_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const fontCache = new Map<number, ArrayBuffer>();

/**
 * Google FontsからNoto Sans JPを取得する。
 * User-Agentを送らないことでTTF形式を取得する（Satoriはwoff2非対応）。
 */
export async function loadOgFont(weight: number): Promise<ArrayBuffer | null> {
  const cached = fontCache.get(weight);
  if (cached) return cached;

  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&display=swap`;
    const cssRes = await fetchWithTimeout(url);
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const fontUrl = css
      .match(/src:\s*url\(([^)]+)\)\s*format\('(opentype|truetype)'\)/)?.[1]
      ?.replace(/^["']|["']$/g, "");
    if (!fontUrl) return null;
    const fontRes = await fetchWithTimeout(fontUrl);
    if (!fontRes.ok) return null;

    const data = await fontRes.arrayBuffer();
    fontCache.set(weight, data);
    return data;
  } catch {
    return null;
  }
}

const imageCache = new Map<string, string>();

/**
 * public 配下の画像を data URI にして返す。
 *
 * Satoriは外部URLの画像を取りに行かないので、埋め込める形にしてから渡す。
 */
export async function loadPublicImageDataUrl(
  /** public からの相対パス（例: img/logo.png） */
  relativePath: string,
  mimeType = "image/png"
): Promise<string | null> {
  const cached = imageCache.get(relativePath);
  if (cached) return cached;

  try {
    const buf = await readFile(join(process.cwd(), "public", relativePath));
    const dataUrl = `data:${mimeType};base64,${buf.toString("base64")}`;
    imageCache.set(relativePath, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}
