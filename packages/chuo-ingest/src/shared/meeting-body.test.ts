import { describe, expect, it } from "vitest";
import { toMeetingBody } from "./meeting-body";

describe("toMeetingBody", () => {
  it("enum に収まる名前はそのまま返す", () => {
    expect(toMeetingBody("福祉保健委員会")).toBe("福祉保健委員会");
    expect(toMeetingBody("築地まちづくり・環境対策特別委員会")).toBe(
      "築地まちづくり・環境対策特別委員会"
    );
  });

  it("63バイトを超える名前を縮めた名前に対応づける", () => {
    // PostgreSQL の enum ラベル上限を超えるのはこの1件だけ
    expect(
      toMeetingBody("区制施行８０周年等にぎわいの向上・創出対策特別委員会")
    ).toBe("区制施行80周年等にぎわい創出対策特別委員会");
  });

  it("半角数字で来ても同じ名前に対応づける", () => {
    expect(
      toMeetingBody("区制施行80周年等にぎわいの向上・創出対策特別委員会")
    ).toBe("区制施行80周年等にぎわい創出対策特別委員会");
  });

  it("対応づけた名前は63バイトに収まる", () => {
    const name = toMeetingBody(
      "区制施行８０周年等にぎわいの向上・創出対策特別委員会"
    );
    expect(new TextEncoder().encode(name).length).toBeLessThanOrEqual(63);
  });

  it("知らない委員会は丸めずそのまま返す", () => {
    // enum に無ければ INSERT で落ちる。黙って別の値にしないことで気づける
    expect(toMeetingBody("新しくできた特別委員会")).toBe(
      "新しくできた特別委員会"
    );
  });
});
