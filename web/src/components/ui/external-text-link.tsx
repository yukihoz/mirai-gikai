import { ExternalLink } from "lucide-react";

interface ExternalTextLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 外部サイトへの文中リンク。
 *
 * 中央区議会サイトへの導線がいくつかの画面に散らばっており、下線の付け方や
 * アイコンの大きさが少しずつ違っていた。見た目と `rel` の指定をここに集める。
 */
export function ExternalTextLink({
  href,
  children,
  className,
}: ExternalTextLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-[3px] hover:opacity-70 ${className ?? ""}`}
    >
      {children}
      <ExternalLink
        className="inline size-3.5 shrink-0 align-[-0.1em]"
        aria-hidden="true"
      />
    </a>
  );
}
