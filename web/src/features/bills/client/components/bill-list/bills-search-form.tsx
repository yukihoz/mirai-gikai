"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type BillsSearchParams,
  billsSearchHref,
} from "../../../shared/utils/parse-bills-search-params";

/**
 * 報告資料の検索バー。
 *
 * 入力中はURLを書き換えず、送信のときだけ遷移する。1文字ごとに
 * 遷移すると、変換途中の文字で検索が走って結果がちらつく。
 */
export function BillsSearchForm({ params }: { params: BillsSearchParams }) {
  const router = useRouter();
  const [value, setValue] = useState(params.query);

  const submit = (query: string) => {
    router.push(billsSearchHref(params, { query }) as never);
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit(value.trim());
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mirai-text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="キーワードで探す（例: 保育、防災）"
          aria-label="報告資料をキーワードで探す"
          className="w-full rounded-full border border-mirai-border bg-white pl-9 pr-9 py-2.5 text-sm outline-none focus-visible:border-primary-accent"
        />
        {value !== "" && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              submit("");
            }}
            aria-label="検索語を消す"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-mirai-text-muted hover:opacity-70"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <Button type="submit" className="rounded-full px-5">
        検索
      </Button>
    </form>
  );
}
