import { describe, expect, it, vi } from "vitest";
import type { DiscussionInput } from "../prompts/build-discussion-prompt";
import type { MeetingDiscussions } from "../shared/schemas";
import {
  dropUnknownShiryo,
  generateDiscussions,
  sortByUtterance,
} from "./generate-discussions";
import type { ObjectGenerator } from "./generate-explanation";

const input: DiscussionInput = {
  committee: "福祉保健委員会",
  date: "2026-02-10",
  reports: [
    { number: 4, title: "病児・病後児保育事業における事前登録方法の見直し" },
    { number: 6, title: "人とペットの災害対策の推進に向けた連携協定" },
  ],
  utterances: [
    {
      index: 1,
      speaker: "高橋委員",
      paragraphs: ["まず、資料４からお伺いします。"],
      shiryoNumbers: [4],
    },
    {
      index: 2,
      speaker: "左近士子ども家庭支援センター所長",
      paragraphs: ["区でも他の手続で使っているためです。"],
      shiryoNumbers: [],
    },
  ],
};

const valid: MeetingDiscussions = {
  discussions: [
    {
      shiryoNumber: 4,
      topics: [
        {
          title: "なぜ「LoGoフォーム」を使うのか",
          question: "数ある手段のなかでLoGoフォームを選んだ理由を知りたい。",
          questioners: ["高橋"],
          answer: "区の他の手続でも使っており、区民になじみがあるため。",
          answerers: ["左近士 子ども家庭支援センター所長"],
          firstUtteranceNumber: 1,
        },
      ],
    },
  ],
};

function fakeGenerator(value: unknown) {
  const calls: { label: string }[] = [];
  const generate: ObjectGenerator = async ({ label }) => {
    calls.push({ label });
    return value as never;
  };
  return { generate, calls };
}

describe("generateDiscussions", () => {
  it("資料ごとの質疑を返す", async () => {
    const { generate } = fakeGenerator(valid);
    await expect(generateDiscussions({ input, generate })).resolves.toEqual(
      valid.discussions
    );
  });

  it("会議単位で1回だけ生成器を呼ぶ（資料数に比例させない）", async () => {
    const { generate, calls } = fakeGenerator(valid);
    await generateDiscussions({ input, generate });
    expect(calls).toHaveLength(1);
    expect(calls[0].label).toBe("福祉保健委員会 2026-02-10 の質疑");
  });

  it("発言が無ければ生成器を呼ばない", async () => {
    const generate = vi.fn<ObjectGenerator>();
    const result = await generateDiscussions({
      input: { ...input, utterances: [] },
      generate: generate as unknown as ObjectGenerator,
    });
    expect(result).toEqual([]);
    expect(generate).not.toHaveBeenCalled();
  });

  it("質疑が無い会議は空配列を受け入れる", async () => {
    const { generate } = fakeGenerator({ discussions: [] });
    await expect(generateDiscussions({ input, generate })).resolves.toEqual([]);
  });

  it("形式が違う結果は通さない", async () => {
    const { generate } = fakeGenerator({ discussions: [{ topics: [] }] });
    await expect(generateDiscussions({ input, generate })).rejects.toThrow(
      "質疑の形式が想定と違う"
    );
  });

  it("質問者が空の論点は通さない", async () => {
    const { generate } = fakeGenerator({
      discussions: [
        {
          shiryoNumber: 4,
          topics: [{ ...valid.discussions[0].topics[0], questioners: [] }],
        },
      ],
    });
    await expect(generateDiscussions({ input, generate })).rejects.toThrow(
      "質疑の形式が想定と違う"
    );
  });

  it("委員会に出ていない資料番号は落とす", async () => {
    const { generate } = fakeGenerator({
      discussions: [
        ...valid.discussions,
        { shiryoNumber: 9, topics: valid.discussions[0].topics },
      ],
    });
    const result = await generateDiscussions({ input, generate });
    expect(result.map((d) => d.shiryoNumber)).toEqual([4]);
  });
});

describe("dropUnknownShiryo", () => {
  const reports = [{ number: 4 }, { number: 6 }];

  it("委員会に出た資料はそのまま残す", () => {
    expect(dropUnknownShiryo(valid, reports)).toEqual(valid.discussions);
  });

  it("存在しない資料番号を落とす", () => {
    const generated: MeetingDiscussions = {
      discussions: [
        { shiryoNumber: 9, topics: valid.discussions[0].topics },
        ...valid.discussions,
      ],
    };
    expect(
      dropUnknownShiryo(generated, reports).map((d) => d.shiryoNumber)
    ).toEqual([4]);
  });

  it("近い番号に寄せたりしない", () => {
    // 資料7は存在しないが、6に丸めてはいけない
    const generated: MeetingDiscussions = {
      discussions: [{ shiryoNumber: 7, topics: valid.discussions[0].topics }],
    };
    expect(dropUnknownShiryo(generated, reports)).toEqual([]);
  });

  it("資料が1件も無い会議ではすべて落とす", () => {
    expect(dropUnknownShiryo(valid, [])).toEqual([]);
  });
});

describe("sortByUtterance", () => {
  function topic(title: string, firstUtteranceNumber: number) {
    return {
      title,
      question: "この点はどうなっているか。",
      questioners: ["高橋"],
      answer: "現在の運用のとおり進める予定。",
      answerers: ["左近士 子ども家庭支援センター所長"],
      firstUtteranceNumber,
    };
  }

  it("論点を議事録に出てきた順に並べ直す", () => {
    const sorted = sortByUtterance({
      shiryoNumber: 4,
      // モデルはテーマごとにまとめるので、同じ委員の質問が離れて返る
      topics: [topic("LoGoフォームを選んだ理由", 1), topic("紙の申請は残るか", 17), topic("システムの一本化", 5)],
    });

    expect(sorted.topics.map((t) => t.firstUtteranceNumber)).toEqual([1, 5, 17]);
  });

  it("元の配列を書き換えない", () => {
    const original = {
      shiryoNumber: 4,
      topics: [topic("あと", 9), topic("さき", 2)],
    };
    sortByUtterance(original);

    expect(original.topics.map((t) => t.firstUtteranceNumber)).toEqual([9, 2]);
  });
});
