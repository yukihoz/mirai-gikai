import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface LinkButtonProps {
  href: string;
  icon: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  children: ReactNode;
  target?: string;
  rel?: string;
  className?: string;
}

export function LinkButton({
  href,
  icon,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
  className,
}: LinkButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      className={`rounded-full px-5 h-11 flex items-center justify-center gap-1.5 ${className ?? "w-fit"}`}
    >
      <a href={href} target={target} rel={rel}>
        <Image
          src={icon.src}
          alt={icon.alt}
          width={icon.width}
          height={icon.height}
          className="flex-shrink-0"
        />
        <span className="text-xs font-bold whitespace-nowrap mt-0.5">{children}</span>
        <Image
          src="/icons/arrow-right.svg"
          alt=""
          width={14}
          height={13}
          className="flex-shrink-0"
        />
      </a>
    </Button>
  );
}
