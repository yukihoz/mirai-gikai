"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";
import type { DifficultyLevelEnum } from "@/features/bill-difficulty/shared/types";
import { RubyToggle } from "@/lib/rubyful";

interface HamburgerMenuProps {
  difficultyLevel: DifficultyLevelEnum;
}

export function HamburgerMenu({ difficultyLevel }: HamburgerMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="flex flex-col gap-4 py-2">
          <DifficultySelector currentLevel={difficultyLevel} />
          <div className="h-px bg-slate-200 w-full" />
          <div className="flex items-center justify-between">
            <RubyToggle />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
