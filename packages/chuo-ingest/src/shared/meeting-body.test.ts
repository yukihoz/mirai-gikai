import { describe, expect, it } from "vitest";
import { toMeetingBody } from "./meeting-body";

describe("toMeetingBody", () => {
  it("会議体名をそのまま返す", () => {
    expect(toMeetingBody("福祉保健委員会")).toBe("福祉保健委員会");
    expect(toMeetingBody("築地まちづくり・環境対策特別委員会")).toBe(
      "築地まちづくり・環境対策特別委員会"
    );
  });

  it("63バイトを超える正式名称もそのまま扱える", () => {
    // meeting_body が enum だったころは入らなかった名前。
    // text にしたので区の表記のまま保存できる。
    const name = "区制施行８０周年等にぎわいの向上・創出対策特別委員会";
    expect(new TextEncoder().encode(name).length).toBeGreaterThan(63);
    expect(toMeetingBody(name)).toBe(name);
  });
});
