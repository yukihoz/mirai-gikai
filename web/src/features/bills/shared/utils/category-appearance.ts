import {
  Accessibility,
  Baby,
  Building2,
  Bus,
  Coins,
  FileCheck,
  HandHeart,
  Landmark,
  Laptop,
  type LucideIcon,
  Palette,
  Recycle,
  School,
  ShieldAlert,
  ShoppingBag,
  Stethoscope,
  Trees,
  Users,
} from "lucide-react";

/**
 * カテゴリの見た目。
 *
 * DBのラベルには絵文字が入っているが、絵文字は環境によって形も色も
 * 変わるうえ、並べたときの大きさが揃わない。表示ではアイコンに置き換える。
 *
 * 形だけだと小さい表示で見分けがつかないので、色でも区別する。
 * 近い話題は近い色にして、暮らし・まちづくり・行政といった系統が
 * ぼんやり分かるようにしている。
 */

export type CategoryAppearance = {
  icon: LucideIcon;
  /**
   * アイコンの色。
   *
   * 面や文字まで色を変えると、並べたときに画面がうるさくなる。
   * 色を持たせるのはアイコンだけにして、面と枠線は共通にする。
   */
  icon_color: string;
};

/** ラベルから絵文字と前後の空白を落とした、対応づけ用のキー */
export function toCategoryKey(label: string): string {
  return (
    label
      .replace(/\p{Extended_Pictographic}/gu, "")
      // 絵文字を消すと異体字セレクタ(U+FE0F)とゼロ幅結合子(U+200D)が残る
      .replace(/[\uFE0F\u200D]/g, "")
      .trim()
  );
}

const APPEARANCES: Record<string, CategoryAppearance> = {
  // 子ども・教育（ピンク〜オレンジ）
  "子育て・保育園": {
    icon: Baby,
    icon_color: "text-pink-500",
  },
  "学校・教育": {
    icon: School,
    icon_color: "text-orange-500",
  },
  "若者・ユース": {
    icon: Users,
    icon_color: "text-amber-500",
  },

  // 福祉・医療（赤〜ローズ）
  "高齢者・介護": {
    icon: Accessibility,
    icon_color: "text-rose-500",
  },
  "健康・医療": {
    icon: Stethoscope,
    icon_color: "text-red-500",
  },
  "福祉・サポート": {
    icon: HandHeart,
    icon_color: "text-fuchsia-500",
  },

  // 安全・環境（緑）
  "防災・安全": {
    icon: ShieldAlert,
    icon_color: "text-emerald-500",
  },
  "公園・水辺・みどり": {
    icon: Trees,
    icon_color: "text-green-500",
  },
  "環境・ゴミ・リサイクル": {
    icon: Recycle,
    icon_color: "text-lime-500",
  },

  // まち・住まい（青〜藍）
  "道路・交通・バス": {
    icon: Bus,
    icon_color: "text-sky-500",
  },
  "住まい・マンション": {
    icon: Landmark,
    icon_color: "text-indigo-500",
  },
  "再開発・まちづくり": {
    icon: Building2,
    icon_color: "text-blue-500",
  },
  "公共施設・インフラ": {
    icon: Landmark,
    icon_color: "text-cyan-500",
  },

  // 地域・文化（紫）
  "地域コミュニティ・町会": {
    icon: Users,
    icon_color: "text-violet-500",
  },
  "商店街・しごと・観光": {
    icon: ShoppingBag,
    icon_color: "text-purple-500",
  },
  "文化・歴史・イベント": {
    icon: Palette,
    icon_color: "text-violet-500",
  },

  // お金・行政（黄土〜灰）
  "税金・家計への支援": {
    icon: Coins,
    icon_color: "text-yellow-500",
  },
  "デジタル・DX": {
    icon: Laptop,
    icon_color: "text-teal-500",
  },
  "行政改革・手続き": {
    icon: FileCheck,
    icon_color: "text-slate-500",
  },
};

/** カテゴリが増えたときに使う、色の付かない見た目 */
export const DEFAULT_CATEGORY_APPEARANCE: CategoryAppearance = {
  icon: FileCheck,
  icon_color: "text-mirai-text-muted",
};

/**
 * カテゴリの見た目を引く。
 *
 * カテゴリは管理画面から増やせるので、知らないラベルは必ず来る。
 * その場合も表示は壊さず、色の付かない見た目で出す。
 */
export function getCategoryAppearance(label: string): CategoryAppearance {
  return APPEARANCES[toCategoryKey(label)] ?? DEFAULT_CATEGORY_APPEARANCE;
}
