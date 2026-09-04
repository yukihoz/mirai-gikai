import type { Utterance } from "../shared/types";
import { extractShiryoNumbers } from "../parsers/extract-shiryo-numbers";

/**
 * みえる議会（https://mierugikai.yukihoz.tokyo/）から議事録を取る。
 *
 * 中央区議会の会議録は `/kaigiroku.cgi/...` にあり、robots.txt が
 * `.cgi` を巡回対象から外す意図を示している。みえる議会は同じ会議録を
 * 整形して公開している自前のサイトなので、そちらを読む。
 *
 * 発言者は `speaker`（議事録の表記。例: 高橋委員）と `category`
 * （正規化した氏名。例: 高橋元気）の両方が入っている。
 */

const DEFAULT_ORIGIN = "https://mierugikai.yukihoz.tokyo";

/** みえる議会が配信する発言1件 */
type MierugikaiRecord = {
  id: string;
  title: string;
  speaker: string;
  category: string;
  body: string;
  date: string;
  type: string;
  is_unofficial: boolean;
};

type Manifest = {
  prefix: string;
  totalChunks: number;
  version: string;
};

export type MierugikaiClientOptions = {
  origin?: string;
  fetchImpl?: typeof globalThis.fetch;
};

export class MierugikaiClient {
  private readonly origin: string;
  private readonly fetchImpl: typeof globalThis.fetch;
  /** チャンクは十数MBあるので、1回の実行では読み直さない */
  private readonly cache = new Map<number, MierugikaiRecord[]>();

  constructor(options: MierugikaiClientOptions = {}) {
    this.origin = options.origin ?? DEFAULT_ORIGIN;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  /**
   * 1つの会議の発言を、議事録の順に返す。
   *
   * 会議は「開催日 + 会議体名」で特定する。みえる議会の `id` は
   * `C20260210-0001` のように会議内の連番になっているので、それで並べる。
   */
  async fetchMeetingUtterances(params: {
    /** 開催日 (YYYY-MM-DD) */
    date: string;
    /** 会議体名（例: 福祉保健委員会） */
    committee: string;
  }): Promise<Utterance[]> {
    const manifest = await this.fetchManifest();
    const wanted = params.date.replaceAll("-", "/");

    const found: MierugikaiRecord[] = [];
    for (let i = 0; i < manifest.totalChunks; i++) {
      const chunk = await this.fetchChunk(manifest, i);
      const hits = chunk.filter(
        (r) => r.date === wanted && r.type === params.committee
      );
      if (hits.length > 0) {
        found.push(...hits);
        // 1つの会議が複数チャンクにまたがることはないので、見つかれば打ち切る
        break;
      }
    }

    return found
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((record, index) => toUtterance(record, index + 1));
  }

  private async fetchManifest(): Promise<Manifest> {
    const res = await this.fetchImpl(`${this.origin}/data/manifest.json`);
    if (!res.ok) {
      throw new Error(`みえる議会のmanifestが取れなかった: ${res.status}`);
    }
    return (await res.json()) as Manifest;
  }

  private async fetchChunk(
    manifest: Manifest,
    index: number
  ): Promise<MierugikaiRecord[]> {
    const cached = this.cache.get(index);
    if (cached !== undefined) return cached;

    const url = `${this.origin}/data/${manifest.prefix}_part_${index}.json?v=${manifest.version}`;
    const res = await this.fetchImpl(url);
    if (!res.ok) {
      throw new Error(`みえる議会のデータが取れなかった: ${res.status}`);
    }
    const records = (await res.json()) as MierugikaiRecord[];
    this.cache.set(index, records);
    return records;
  }
}

/**
 * みえる議会の1件を、パーサーが返すのと同じ形の発言にする。
 *
 * 本文は空行で段落に割る。資料番号は議事録HTMLから読むときと同じ関数で
 * 拾うので、印の付き方は両方の経路でそろう。
 */
export function toUtterance(
  record: { speaker: string; body: string },
  index: number
): Utterance {
  const paragraphs = record.body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");

  return {
    index,
    speaker: record.speaker,
    paragraphs,
    shiryoNumbers: extractShiryoNumbers(record.body),
  };
}
