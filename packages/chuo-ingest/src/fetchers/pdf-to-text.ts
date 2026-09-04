import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** テキスト化のタイムアウト。数十ページの資料でも十分な長さ。 */
const PDF_TO_TEXT_TIMEOUT_MS = 60_000;

/**
 * PDFを poppler の `pdftotext -layout` でテキストにする。
 *
 * `-layout` を付けるのは、委員会資料に表が多いため。付けないと列が
 * 混ざって、金額と項目の対応が読めなくなる。
 *
 * 2026年2月の資料34件はすべてテキストを含んでいた（スキャン画像は0件）ので、
 * OCRは用意していない。テキストが取れないPDFが出てきたら、そのときは
 * 空文字が返るので呼び出し側で気づける。
 *
 * PDFは一時ファイルに置き、処理後に必ず消す。
 */
export async function pdfToTextWithPoppler(
  pdf: Uint8Array,
  pdfToTextBin = "pdftotext"
): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "chuo-ingest-"));
  try {
    const pdfPath = join(dir, "source.pdf");
    const txtPath = join(dir, "source.txt");
    await writeFile(pdfPath, pdf);
    await execFileAsync(pdfToTextBin, ["-layout", pdfPath, txtPath], {
      timeout: PDF_TO_TEXT_TIMEOUT_MS,
    });
    return await readFile(txtPath, "utf-8");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
