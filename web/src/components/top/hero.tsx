import Image from "next/image";
import { env } from "@/lib/env";
import { Container } from "@/components/layouts/container";

export function Hero() {
  return (
    <div className="relative w-full h-[40vh] min-h-[200px] md:h-[35vh]">
      <Image
        src="/img/cover2.png"
        alt={env.assemblyName}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
      <div className="absolute inset-0 flex items-center py-4">
        <Container>
          <p className="font-bold text-xl md:text-2xl leading-relaxed">
            いま{env.assemblyName}で議論されていること <br />
            やさしい言葉で説明します
          </p>
          <p className="mt-2 font-lexend text-xs">
            powered by ほづみゆうき & AI
          </p>
        </Container>
      </div>
    </div>
  );
}
