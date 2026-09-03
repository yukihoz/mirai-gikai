import { createHash } from "node:crypto";
import { isCrawlableUrl } from "../shared/urls";
import { pdfToTextWithPoppler } from "./pdf-to-text";

/** 既定のUser-Agent。相手が問い合わせ先をたどれるよう連絡先を入れる。 */
const DEFAULT_USER_AGENT =
  "mirai-gikai-chuo/0.1 (+https://mirai-gikai.yukihoz.tokyo/)";

/** 連続アクセスの間隔。自治体サイトに負荷をかけないため既定で1秒あける。 */
const DEFAULT_MIN_INTERVAL_MS = 1000;

export type FetchedResource = {
  url: string;
  /** 取得内容のSHA-256。前回と同じなら再解析をスキップするために使う */
  contentHash: string;
  etag: string | null;
  lastModified: string | null;
};

export type FetchedText = FetchedResource & { text: string };

export type ChuoSiteClientOptions = {
  /** 連続アクセスの間隔（ミリ秒） */
  minIntervalMs?: number;
  userAgent?: string;
  fetchImpl?: typeof globalThis.fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  /** PDFをテキストにする関数。既定は poppler の pdftotext */
  pdfToText?: (pdf: Uint8Array) => Promise<string>;
};

/**
 * 中央区議会サイトからHTML/PDFを取得するクライアント。
 *
 * 相手は自治体のサイトなので、
 *
 * - リクエストの間隔を必ずあける（既定1秒）
 * - User-Agent に連絡先を入れて素性を明かす
 * - robots.txt が巡回してほしくないと示しているURLは取りに行かない
 *
 * を守る。取得したPDFそのものは保存せず、テキスト化して捨てる。資料は区が
 * 公開しているものなので、こちらで複製を溜める必要がない。
 */
export class ChuoSiteClient {
  private readonly minIntervalMs: number;
  private readonly userAgent: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly pdfToText: (pdf: Uint8Array) => Promise<string>;
  private lastRequestAt = 0;

  constructor(options: ChuoSiteClientOptions = {}) {
    this.minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    this.sleep =
      options.sleep ??
      ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.now = options.now ?? (() => Date.now());
    this.pdfToText = options.pdfToText ?? pdfToTextWithPoppler;
  }

  /** HTMLを取得する。中央区議会サイトはUTF-8。 */
  async fetchHtml(url: string): Promise<FetchedText> {
    const { bytes, headers } = await this.fetchBinary(url);
    return {
      url,
      text: new TextDecoder("utf-8").decode(bytes),
      contentHash: sha256(bytes),
      ...headers,
    };
  }

  /** PDFを取得してテキストにする。PDFそのものは残さない。 */
  async fetchPdfText(url: string): Promise<FetchedText> {
    const { bytes, headers } = await this.fetchBinary(url);
    return {
      url,
      text: await this.pdfToText(bytes),
      // ハッシュはPDFの中身から取る。テキスト化の実装を変えても、
      // 「同じPDFかどうか」の判定が揺れないようにする。
      contentHash: sha256(bytes),
      ...headers,
    };
  }

  private async fetchBinary(url: string): Promise<{
    bytes: Uint8Array;
    headers: { etag: string | null; lastModified: string | null };
  }> {
    if (!isCrawlableUrl(url)) {
      throw new Error(`取得対象外のURL: ${url}`);
    }

    await this.throttle();

    const response = await this.fetchImpl(url, {
      headers: { "User-Agent": this.userAgent },
    });
    if (!response.ok) {
      throw new Error(`${url} が ${response.status} を返した`);
    }

    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      headers: {
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified"),
      },
    };
  }

  /**
   * 前回のリクエストから一定時間あける。
   *
   * 待つのはリクエストを送る直前で、送った時刻を基準に次を待たせる。
   * レスポンスが返った時刻を基準にすると、遅いレスポンスのぶんだけ
   * 間隔が伸びて、全体が必要以上に遅くなる。
   */
  private async throttle(): Promise<void> {
    const elapsed = this.now() - this.lastRequestAt;
    if (this.lastRequestAt > 0 && elapsed < this.minIntervalMs) {
      await this.sleep(this.minIntervalMs - elapsed);
    }
    this.lastRequestAt = this.now();
  }
}

function sha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}
