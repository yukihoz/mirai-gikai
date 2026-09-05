import { describe, expect, it } from "vitest";
import {
  DEFAULT_CATEGORY_APPEARANCE,
  getCategoryAppearance,
  toCategoryKey,
} from "./category-appearance";

/** 本番に登録されている19カテゴリ */
const LABELS = [
  "👶 子育て・保育園",
  "🏫 学校・教育",
  "👵 高齢者・介護",
  "🏥 健康・医療",
  "🤝 福祉・サポート",
  "🌋 防災・安全",
  "🌳 公園・水辺・みどり",
  "🚲 道路・交通・バス",
  "🧒 若者・ユース",
  "🏠 住まい・マンション",
  "♻️ 環境・ゴミ・リサイクル",
  "🏢 再開発・まちづくり",
  "🏛️ 公共施設・インフラ",
  "🏘️ 地域コミュニティ・町会",
  "🛍️ 商店街・しごと・観光",
  "🎨 文化・歴史・イベント",
  "💰 税金・家計への支援",
  "💻 デジタル・DX",
  "🗳️ 行政改革・手続き",
];

describe("toCategoryKey", () => {
  it("先頭の絵文字と空白を落とす", () => {
    expect(toCategoryKey("👶 子育て・保育園")).toBe("子育て・保育園");
  });

  it("異体字セレクタ付きの絵文字も落とす", () => {
    // ♻️ や 🏛️ は絵文字の後ろに U+FE0F が付く
    expect(toCategoryKey("♻️ 環境・ゴミ・リサイクル")).toBe(
      "環境・ゴミ・リサイクル"
    );
    expect(toCategoryKey("🏛️ 公共施設・インフラ")).toBe("公共施設・インフラ");
  });

  it("絵文字が無いラベルはそのまま", () => {
    expect(toCategoryKey("防災・安全")).toBe("防災・安全");
  });
});

describe("getCategoryAppearance", () => {
  it("登録済みの19カテゴリすべてに見た目がある", () => {
    for (const label of LABELS) {
      const appearance = getCategoryAppearance(label);
      expect(appearance, `${label} に見た目が無い`).not.toBe(
        DEFAULT_CATEGORY_APPEARANCE
      );
    }
  });

  it("知らないカテゴリでも壊れない", () => {
    // カテゴリは管理画面から増やせるので、知らないラベルは必ず来る
    expect(getCategoryAppearance("🚀 宇宙開発")).toBe(
      DEFAULT_CATEGORY_APPEARANCE
    );
  });

  it("絵文字が外れたラベルでも引ける", () => {
    expect(getCategoryAppearance("子育て・保育園").icon).toBe(
      getCategoryAppearance("👶 子育て・保育園").icon
    );
  });

  it("近い話題は近い色にする", () => {
    // 子ども・教育の系統
    expect(getCategoryAppearance("👶 子育て・保育園").icon_color).toContain(
      "pink"
    );
    expect(getCategoryAppearance("🏫 学校・教育").icon_color).toContain(
      "orange"
    );
    // 環境の系統
    expect(getCategoryAppearance("🌳 公園・水辺・みどり").icon_color).toContain(
      "green"
    );
    expect(
      getCategoryAppearance("♻️ 環境・ゴミ・リサイクル").icon_color
    ).toContain("lime");
  });

  it("色はアイコンにだけ付ける", () => {
    // 面や文字まで色を変えると、並べたときに画面がうるさくなる
    for (const label of LABELS) {
      expect(getCategoryAppearance(label).icon_color).toMatch(/^text-/);
    }
  });
});
