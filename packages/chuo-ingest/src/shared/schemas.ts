import { z } from "zod";

/**
 * 資料1件の解説。DBの bill_contents（title / summary / content）に対応する。
 */
export const explanationSchema = z.object({
  /**
   * 区民向けの言い換えタイトル。
   *
   * 正式名称（「病児・病後児保育事業における事前登録方法の見直しについて」）とは
   * 別に、何が変わるのかが一目で分かる言い方を置く。
   */
  title: z
    .string()
    .min(6)
    .max(80)
    .describe(
      "資料の内容が一目で分かる言い換えタイトル。50文字以内を目安にする。" +
        "「〜について」のような正式名称の繰り返しにはしない"
    ),
  /** 一覧カードに出る短い要約 */
  summary: z
    .string()
    .min(20)
    .max(300)
    .describe("何がどう変わるのかを1〜3文で。150文字前後を目安にする"),
  /** 詳細ページの本文（Markdown） */
  content: z
    .string()
    .min(100)
    .describe(
      "解説本文。`## 見出し` でセクションを区切る（サイト側が ## ごとに" +
        "カードで囲む）。箇条書きは `- ` を使う"
    ),
});

export type Explanation = z.infer<typeof explanationSchema>;

/**
 * 資料に付けるカテゴリ。
 *
 * ラベルで受けてから既存のタグに突き合わせる。IDを選ばせると、
 * それらしい形の存在しないIDを作ってくることがある。
 */
export const categorySelectionSchema = z.object({
  categories: z
    .array(z.string().min(1).max(40))
    .max(3)
    .describe("当てはまるカテゴリのラベル。一覧の表記をそのまま返す"),
});

export type CategorySelection = z.infer<typeof categorySelectionSchema>;

/** 委員会で交わされた質疑1件（論点単位） */
export const discussionTopicSchema = z.object({
  /** 論点の見出し（例: なぜ「LoGoフォーム」を使うのか） */
  title: z.string().min(4).max(60),
  /** 質問の要約 */
  question: z.string().min(10).max(400),
  /** 質問した委員の氏名（議事録の表記から役職を外したもの） */
  questioners: z.array(z.string().min(1).max(30)).min(1),
  /** 区側の回答の要約 */
  answer: z.string().min(10).max(600),
  /** 答弁した理事者（例: 左近士 子ども家庭支援センター所長） */
  answerers: z.array(z.string().min(1).max(40)),
  /**
   * この論点の最初の質問がどの発言だったか（議事録に振った通し番号）。
   *
   * モデルは論点をテーマごとにまとめるので、返ってくる順は議事録の順に
   * ならない。並べ直すために、発言番号を必ず答えさせる。
   */
  firstUtteranceNumber: z
    .number()
    .int()
    .min(1)
    .describe("この論点で委員が最初に質問した発言の番号"),
});

export type DiscussionTopic = z.infer<typeof discussionTopicSchema>;

/** 1つの資料に対する質疑 */
export const shiryoDiscussionSchema = z.object({
  /** 資料番号。委員会ページの並び順と対応する */
  shiryoNumber: z.number().int().min(1).max(30),
  topics: z.array(discussionTopicSchema),
});

export type ShiryoDiscussion = z.infer<typeof shiryoDiscussionSchema>;

/**
 * 1回の委員会から取り出した質疑。
 *
 * 中央区の委員会は複数の報告事項への質疑をまとめて行うため、
 * 会議単位で1回モデルに渡し、資料ごとに振り分けて返してもらう。
 */
export const meetingDiscussionsSchema = z.object({
  discussions: z.array(shiryoDiscussionSchema),
});

export type MeetingDiscussions = z.infer<typeof meetingDiscussionsSchema>;
