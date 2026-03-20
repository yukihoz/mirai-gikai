"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import { TableHead } from "@/components/ui/table";
import type { SortColumn, SortOrder } from "../../shared/types";

interface SortableTableHeadProps {
  column: SortColumn;
  currentSortBy: SortColumn;
  currentSortOrder: SortOrder;
  className?: string;
  children: React.ReactNode;
}

export function SortableTableHead({
  column,
  currentSortBy,
  currentSortOrder,
  className,
  children,
}: SortableTableHeadProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = currentSortBy === column;
  const nextOrder = isActive && currentSortOrder === "desc" ? "asc" : "desc";

  const params = new URLSearchParams(searchParams.toString());
  params.set("sortBy", column);
  params.set("sortOrder", nextOrder);
  params.set("page", "1");

  return (
    <TableHead className={className}>
      <Link
        href={`${pathname}?${params.toString()}`}
        className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        {children}
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
        )}
      </Link>
    </TableHead>
  );
}
