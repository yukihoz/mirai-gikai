import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { createAdminClient } from "@mirai-gikai/supabase";

const execFileAsync = promisify(execFile);

/** 画像化のタイムアウト */
const RENDER_TIMEOUT_MS = 60_000;

/** 画像の解像度（DPI）。記事の幅で読める程度あればよい */
const RENDER_DPI = 150;

/** 画像を置くバケット */
export const SHIRYO_IMAGE_BUCKET = "shiryo-images";

/**
 * 資料PDFの1ページ目をPNGにする。
 *
 * 記事のタイトルと本文のあいだに、資料そのものを見せるために使う。
 * 解説だけだと「AIが何を読んで書いたのか」が読み手に見えないため、
 * 1枚目だけでも原本を出しておく。
 *
 * PDF本体は保存しない方針を変えないので、ここでも一時ファイルに置いて
 * 処理後に消す。残すのは画像だけ。
 */
export type RenderedPage = {
  png: Uint8Array;
  width: number;
  height: number;
};

export async function renderFirstPagePng(
  pdf: Uint8Array,
  pdfToPpmBin = "pdftoppm"
): Promise<RenderedPage> {
  const dir = await mkdtemp(join(tmpdir(), "chuo-shiryo-"));
  try {
    const pdfPath = join(dir, "source.pdf");
    await writeFile(pdfPath, pdf);

    // -singlefile を付けると連番が付かず、出力は <prefix>.png になる
    await execFileAsync(
      pdfToPpmBin,
      [
        "-png",
        "-singlefile",
        "-r",
        String(RENDER_DPI),
        pdfPath,
        join(dir, "page"),
      ],
      { timeout: RENDER_TIMEOUT_MS }
    );

    const png = new Uint8Array(await readFile(join(dir, "page.png")));
    return { png, ...readPngSize(png) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * 画像をStorageに置き、公開URLを返す。
 *
 * ファイル名は議案IDにする。資料が差し替わったときに上書きしたいので、
 * 内容ハッシュではなく議案に紐づけて固定する。
 */
export async function uploadShiryoImage(params: {
  billId: string;
  png: Uint8Array;
}): Promise<string> {
  const client = createAdminClient();
  const path = `${params.billId}.png`;

  const { error } = await client.storage
    .from(SHIRYO_IMAGE_BUCKET)
    .upload(path, params.png, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(`資料画像を保存できなかった: ${error.message}`);

  const { data } = client.storage.from(SHIRYO_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** 資料画像のURLを議案に紐づける */
export async function saveShiryoImageUrl(params: {
  billId: string;
  imageUrl: string;
  width: number;
  height: number;
}): Promise<void> {
  const { error } = await createAdminClient()
    .from("chuo_bill_sources")
    .update({
      shiryo_image_url: params.imageUrl,
      shiryo_image_width: params.width,
      shiryo_image_height: params.height,
    })
    .eq("bill_id", params.billId);

  if (error) {
    throw new Error(`資料画像のURLを保存できなかった: ${error.message}`);
  }
}

/**
 * PNGヘッダから幅と高さを読む。
 *
 * 資料は縦長・横長どちらもあるため、表示側で比率を決め打ちできない。
 * 画像ライブラリを足すほどの処理ではないので、IHDRを直接読む。
 */
function readPngSize(png: Uint8Array): { width: number; height: number } {
  // 8バイトのシグネチャ + 4バイト長 + "IHDR" のあと、幅と高さがビッグエンディアンで並ぶ
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
