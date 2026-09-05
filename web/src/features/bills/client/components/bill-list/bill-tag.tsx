import type { BillTag as BillTagType } from "../../../shared/types";
import {
  getCategoryAppearance,
  toCategoryKey,
} from "../../../shared/utils/category-appearance";

interface BillTagProps {
  tag: BillTagType;
}

/**
 * カテゴリのタグ。
 *
 * ラベルに入っている絵文字は環境で形も大きさも変わるので、アイコンに
 * 置き換える。小さい表示では形だけだと見分けがつかないため、色でも分ける。
 */
export function BillTag({ tag }: BillTagProps) {
  const { icon: Icon, icon_color } = getCategoryAppearance(tag.label);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-mirai-surface-tag px-2.5 py-0.5 text-xs font-medium text-black">
      <Icon className={`size-3.5 shrink-0 ${icon_color}`} aria-hidden="true" />
      {toCategoryKey(tag.label)}
    </span>
  );
}
