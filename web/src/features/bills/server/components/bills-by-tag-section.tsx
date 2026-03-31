import type { BillsByTag } from "../../shared/types";
import { BillsByTagWithFilter } from "../../client/components/bill-list/bills-by-tag-with-filter";

interface BillsByTagSectionProps {
  billsByTag: BillsByTag[];
}

export function BillsByTagSection({ billsByTag }: BillsByTagSectionProps) {
  if (billsByTag.length === 0) {
    return null;
  }

  return <BillsByTagWithFilter billsByTag={billsByTag} />;
}
