import { formatDateWithDots } from "@/lib/utils/date";
import { env } from "@/lib/env";
import type { DietSession } from "../../shared/types";

type CurrentDietSessionProps = {
  session: DietSession | null;
};

export function CurrentDietSession({ session }: CurrentDietSessionProps) {
  if (!session) {
    return null;
  }

  return (
    <div className="w-full bg-mirai-surface-warm px-6 py-6">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-xl font-bold text-gray-800 leading-[0.9]">
            本日は
          </h2>
          <div
            className="inline-flex items-center justify-center px-5 py-1.5 rounded-[50px] shrink-0 bg-mirai-gradient"
          >
            <span className="text-base font-bold leading-[1.48]">
              {env.assemblyName}会期中
            </span>
          </div>
        </div>
          <div className="text-sm leading-[1.5] shrink-0">
            <div>{session.name}</div>
            <div>{formatDateWithDots(session.start_date)}〜</div>
          </div>
      </div>
    </div>
  );
}
