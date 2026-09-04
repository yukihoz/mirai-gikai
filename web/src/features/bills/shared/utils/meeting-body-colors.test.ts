import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_MEETING_BODY_COLOR,
  getMeetingBodyColor,
} from "./meeting-body-colors";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getMeetingBodyColor", () => {
  it("定義済みの会議体の色を返す", () => {
    expect(getMeetingBodyColor("企画総務委員会").rail).toBe("bg-blue-500");
  });

  it("中黒を含む委員会名も引ける", () => {
    expect(getMeetingBodyColor("子ども子育て・高齢者対策特別委員会").rail).toBe(
      "bg-pink-500"
    );
  });

  it("組み替え後の委員会は旧委員会の系統色を引き継ぐ", () => {
    expect(getMeetingBodyColor("築地まちづくり・環境対策特別委員会")).toEqual(
      getMeetingBodyColor("築地等都市基盤対策特別委員会")
    );
  });

  it("未定義の会議体はデフォルトに落として警告を残す", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getMeetingBodyColor("まだ無い委員会")).toEqual(
      DEFAULT_MEETING_BODY_COLOR
    );
    expect(warn).toHaveBeenCalledOnce();
  });

  it("会議体が無い議案は警告なしでデフォルトを使う", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getMeetingBodyColor(null)).toEqual(DEFAULT_MEETING_BODY_COLOR);
    expect(getMeetingBodyColor("")).toEqual(DEFAULT_MEETING_BODY_COLOR);
    expect(warn).not.toHaveBeenCalled();
  });

  it("柄と面の色は同じ系統でそろえる", () => {
    const color = getMeetingBodyColor("福祉保健委員会");
    expect(color.bg).toContain("rose");
    expect(color.text).toContain("rose");
    expect(color.rail).toContain("rose");
  });
});
