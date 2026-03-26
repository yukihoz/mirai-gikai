export type SortOrder = "recommended" | "latest";

export const sortOrderLabels: Record<SortOrder, string> = {
  recommended: "おすすめ順",
  latest: "新着順",
};

export const sortOrderOptions: SortOrder[] = ["recommended", "latest"];
