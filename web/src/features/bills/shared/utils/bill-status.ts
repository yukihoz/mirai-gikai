import { env } from "@/lib/env";
import type { BillStatusEnum } from "../types";

/** カード用の簡略化されたステータスラベルを取得 */
export function getCardStatusLabel(status: BillStatusEnum): string {
  switch (status) {
    case "preparing":
      return "準備中";
    case "introduced":
      return "議案提出済み";
    case "in_originating_house":
    case "in_receiving_house":
      return "付託";
    case "enacted":
      return "議案可決";
    case "rejected":
      return "議案否決";
    case "reported":
      return "報告事項";
    default:
      return "法案提出前";
  }
}

/** ステータスに対応するBadgeのvariantを取得 */
export function getStatusVariant(
  status: BillStatusEnum
): "light" | "default" | "dark" | "muted" {
  switch (status) {
    case "introduced":
    case "in_originating_house":
    case "in_receiving_house":
      return "light";
    case "enacted":
      return "default";
    case "rejected":
      return "dark";
    case "reported":
      return "muted";
    default:
      return "muted";
  }
}
