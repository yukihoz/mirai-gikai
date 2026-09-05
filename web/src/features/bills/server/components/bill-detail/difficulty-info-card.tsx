import Image from "next/image";
import { getDifficultyLevel } from "@/features/bill-difficulty/server/loaders/get-difficulty-level";
import { DifficultySelector } from "@/features/bill-difficulty/client/components/difficulty-selector";

export async function DifficultyInfoCard() {
  const level = await getDifficultyLevel();
  return (
    <div className="relative overflow-hidden rounded-xl border border-mirai-border bg-mirai-surface-gray p-6 my-10 h-44 flex flex-col justify-center">
      <div className="relative z-1 flex flex-col gap-0">
        <p className="text-base font-medium leading-[1.875em] text-gray-800">
          説明の詳しさを
          <br className="pc:hidden" />
          いつでも切り替えられます
        </p>
        <DifficultySelector
          currentLevel={level}
          labelStyle={{ fontSize: "16px" }}
          maintainScrollFromBottom
        />
      </div>
      <div className="absolute right-2 bottom-0 sm:right-4 w-[200px] sm:w-[250px] h-auto flex items-center justify-center">
        <Image
          src="/illustrations/choju74_0020_1.svg"
          alt=""
          width={720}
          height={580}
          className="w-full h-auto max-h-[165px] object-contain"
        />
      </div>
    </div>
  );
}
