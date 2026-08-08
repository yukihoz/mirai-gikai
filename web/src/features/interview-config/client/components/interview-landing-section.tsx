import { ArrowRight, Check } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

interface InterviewLandingSectionProps {
  billId: string;
}

function getCheckPoints(): string[] {
  return [
    "所要時間は約5分〜",
    "AIがあなたのご意見を深掘り",
    "今後の政策検討に活用",
  ];
}

function _CheckPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1">
      <Check className="size-5 text-black flex-shrink-0" />
      <span className="text-[13px] font-medium leading-[1.8]">{text}</span>
    </div>
  );
}

function _CheckPointsList() {
  const checkPoints = getCheckPoints();
  return (
    <div className="flex flex-col gap-2">
      {checkPoints.map((text) => (
        <_CheckPoint key={text} text={text} />
      ))}
    </div>
  );
}

function _InterviewCTAButton({ billId }: { billId: string }) {
  return (
    <Link
      href={routes.interviewLP(billId) as Route}
      className="block w-full max-w-[224px]"
    >
      <Button className="w-full bg-mirai-gradient text-black border border-black rounded-3xl h-[42px] px-5 font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
        <span>AIインタビューを受ける</span>
        <ArrowRight className="size-4" />
      </Button>
    </Link>
  );
}

function _InterviewIllustration() {
  return (
    <div className="absolute right-[-10px] sm:right-4 bottom-[-16px] w-[160px] sm:w-[210px] h-auto pointer-events-none">
      <Image
        src="/illustrations/choju113_0015_1.svg"
        alt=""
        width={720}
        height={391}
        className="w-full h-auto object-contain"
      />
    </div>
  );
}

export function InterviewLandingSection({
  billId,
}: InterviewLandingSectionProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-white p-6">
      <_InterviewIllustration />

      <div className="relative z-1 flex flex-col gap-2">
        <div className="space-y-2">
          <h2 className="text-lg font-bold leading-[1.67]">
            本提案についてのご意見を
            <br className="pc:hidden" />
            お聞かせください
          </h2>

          {/* 右下のイラストと重ならないよう、下部コンテンツに右余白を確保する */}
          <div className="flex flex-col gap-2 pr-[100px] sm:pr-[140px]">
            <_CheckPointsList />

            <div className="pt-2">
              <_InterviewCTAButton billId={billId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
