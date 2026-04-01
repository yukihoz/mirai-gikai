import React from "react";

// 簡単な文字列表現からシード（数値）を生成するハッシュ関数
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// 20種類のパターンジェネレーター群
// 共通してcurrentColorを参照し、親要素のtext-colorで色が付く仕組み
const Patterns = {
  Stripes: ({ seed }: { seed: number }) => {
    const angle = (seed % 4) * 45;
    const width = 10 + (seed % 20);
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p1-${seed}`} patternTransform={`rotate(${angle})`} width={width} height={width} patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2={width} stroke="currentColor" strokeWidth={width / 2} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p1-${seed})`} />
      </svg>
    );
  },
  Dots: ({ seed }: { seed: number }) => {
    const radius = 4 + (seed % 8);
    const spacing = radius * 4;
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p2-${seed}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <circle cx={spacing / 2} cy={spacing / 2} r={radius} fill="currentColor" opacity="0.8" />
            <circle cx={0} cy={0} r={radius/2} fill="currentColor" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p2-${seed})`} />
      </svg>
    );
  },
  Waves: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p3-${seed}`} width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q 10 0, 20 10 T 40 10" fill="none" stroke="currentColor" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p3-${seed})`} />
      </svg>
    );
  },
  Circles: ({ seed }: { seed: number }) => {
    const size = 60 + (seed % 40);
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p4-${seed}`} width={size} height={size} patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r={size * 0.4} fill="none" stroke="currentColor" strokeWidth="4" opacity="0.5" />
            <circle cx={size} cy={size} r={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p4-${seed})`} />
      </svg>
    );
  },
  Grid: ({ seed }: { seed: number }) => {
    const size = 20 + (seed % 20);
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p5-${seed}`} width={size} height={size} patternUnits="userSpaceOnUse">
            <path d={`M ${size} 0 L 0 0 0 ${size}`} fill="none" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p5-${seed})`} />
      </svg>
    );
  },
  Zigzag: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p6-${seed}`} width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 20 L 10 0 L 20 20 L 30 0 L 40 20" fill="none" stroke="currentColor" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p6-${seed})`} />
      </svg>
    );
  },
  Crosshatch: ({ seed }: { seed: number }) => {
    const size = 15 + (seed % 15);
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p7-${seed}`} width={size} height={size} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2={size} stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="0" y1="0" x2={size} y2="0" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p7-${seed})`} />
      </svg>
    );
  },
  Triangles: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p8-${seed}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <polygon points="0,40 20,0 40,40" fill="currentColor" opacity="0.3" />
            <polygon points="0,0 20,40 40,0" fill="currentColor" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p8-${seed})`} />
      </svg>
    );
  },
  Hexagons: ({ seed }: { seed: number }) => {
    const s = 15;
    const h = s * Math.sqrt(3);
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p9-${seed}`} width={s * 3} height={h} patternUnits="userSpaceOnUse">
            <path d={`M ${s*-0.5},${h/2} L 0,0 L ${s},0 L ${s*1.5},${h/2} L ${s},${h} L 0,${h} Z`} fill="none" stroke="currentColor" strokeWidth="1" />
            <path d={`M ${s*1.5},${h/2} L ${s*2},0 L ${s*3},0 L ${s*3.5},${h/2} L ${s*3},${h} L ${s*2},${h} Z`} fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p9-${seed})`} />
      </svg>
    );
  },
  Concentric: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p10-${seed}`} width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="30" cy="30" r="5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p10-${seed})`} />
      </svg>
    );
  },
  Squares: ({ seed }: { seed: number }) => {
    const size = 10 + (seed % 10);
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p11-${seed}`} width={size * 2} height={size * 2} patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width={size} height={size} fill="currentColor" opacity="0.4" />
            <rect x={size} y={size} width={size} height={size} fill="currentColor" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p11-${seed})`} />
      </svg>
    );
  },
  Diamonds: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p12-${seed}`} width="40" height="60" patternUnits="userSpaceOnUse">
            <path d="M20 0 L40 30 L20 60 L0 30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M20 30 L40 60 L20 90 L0 60 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p12-${seed})`} />
      </svg>
    );
  },
  Plus: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p13-${seed}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 5 L15 25 M5 15 L25 15" fill="none" stroke="currentColor" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p13-${seed})`} />
      </svg>
    );
  },
  Stars: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p14-${seed}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 20 0 Q 20 20 40 20 Q 20 20 20 40 Q 20 20 0 20 Q 20 20 20 0" fill="currentColor" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p14-${seed})`} />
      </svg>
    );
  },
  Macaroni: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p15-${seed}`} width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M10 10 C 20 0, 40 0, 40 20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
            <path d="M30 40 C 20 50, 0 50, 0 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p15-${seed})`} />
      </svg>
    );
  },
  Rain: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p16-${seed}`} width="30" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            <line x1="10" y1="0" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <line x1="25" y1="20" x2="25" y2="28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p16-${seed})`} />
      </svg>
    );
  },
  Bricks: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p17-${seed}`} width="40" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="40" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="-20" y="10" width="40" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="20" y="10" width="40" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p17-${seed})`} />
      </svg>
    );
  },
  VariedDots: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p18-${seed}`} width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.7" />
            <circle cx="35" cy="25" r="4" fill="currentColor" opacity="0.4" />
            <circle cx="20" cy="40" r="2" fill="currentColor" opacity="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p18-${seed})`} />
      </svg>
    );
  },
  Isometric: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p19-${seed}`} width="34.64" height="60" patternUnits="userSpaceOnUse">
            <path d="M17.32 0 L34.64 10 L17.32 20 L0 10 Z" fill="currentColor" opacity="0.1" />
            <path d="M0 10 L17.32 20 L17.32 40 L0 30 Z" fill="currentColor" opacity="0.3" />
            <path d="M34.64 10 L34.64 30 L17.32 40 L17.32 20 Z" fill="currentColor" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p19-${seed})`} />
      </svg>
    );
  },
  Rings: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`p20-${seed}`} width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="15" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
            <circle cx="15" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
            <circle cx="15" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
            <circle cx="30" cy="15" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p20-${seed})`} />
      </svg>
    );
  }
};

interface DynamicBillThumbnailProps {
  title: string;
  seedString?: string;
  meetingBody?: string | null;
  size?: "large" | "small" | "header"; // large: 注目カード等（文字入り）, small: コンパクトカード等（柄のみ）, header: 個別ページヘッダー（柄のみ・薄い）
}

// 会議体ごとのテーマカラー（Tailwindクラス）を定義する辞書
const meetingBodyColors: Record<string, { bg: string; text: string }> = {
  // 企画総務系 -> 【ブルー系】 (変更指定あり)
  企画総務委員会: { bg: "bg-blue-50", text: "text-blue-500/20" },

  // 本会議・定例会 -> 【パープル系】 (変更指定あり)
  定例会: { bg: "bg-purple-50", text: "text-purple-500/20" },
  臨時会: { bg: "bg-purple-50", text: "text-purple-500/20" },

  // 区民・文教系 -> 【オレンジ・イエロー系】
  区民文教委員会: { bg: "bg-orange-50", text: "text-orange-500/20" },

  // 福祉保健系 -> 【ピンク・赤系】
  福祉保健委員会: { bg: "bg-rose-50", text: "text-rose-500/20" },

  // 環境・建設基盤系 -> 【グリーン・エメラルド系】
  環境建設委員会: { bg: "bg-emerald-50", text: "text-emerald-500/20" },
  築地等都市基盤対策特別委員会: {
    bg: "bg-teal-50",
    text: "text-teal-500/20",
  },

  // その他特別委員会（アンバー・ピンク・レッド系）
  地域活性化対策特別委員会: {
    bg: "bg-amber-50",
    text: "text-amber-500/30",
  },
  "子ども子育て・高齢者対策特別委員会": {
    bg: "bg-pink-50",
    text: "text-pink-500/20",
  },
  防災等安全対策特別委員会: { bg: "bg-red-50", text: "text-red-500/15" },

  // 予算・決算（イエロー・ストーン系）
  予算特別委員会: { bg: "bg-yellow-50", text: "text-yellow-600/30" },
  決算特別委員会: { bg: "bg-stone-50", text: "text-stone-500/20" },

  // デフォルト
  デフォルト: { bg: "bg-gray-50", text: "text-gray-400/20" },
};

export function DynamicBillThumbnail({
  title,
  seedString,
  meetingBody,
  size = "large",
}: DynamicBillThumbnailProps) {
  // 渡された seedString (無ければ title) によるハッシュ化で「どの柄を使うか」を固定する
  const seed = hashString(seedString || title);

  // 20の柄からシードで1つを選択
  const patternKeys = Object.keys(Patterns) as Array<keyof typeof Patterns>;
  const patternIndex = seed % patternKeys.length;
  const variant = patternKeys[patternIndex];
  const PatternComponent = Patterns[variant];

  // 会議体に紐づく色を取得
  const colorTheme =
    meetingBodyColors[meetingBody || ""] || meetingBodyColors["デフォルト"];

  // コンテナのCSS調整
  const containerSizeProps =
    size === "large"
      ? "w-full h-72 md:h-80 rounded-t-[14px]"
      : size === "header"
      ? "w-full h-24 md:h-28 rounded-t-[14px]"
      : "w-24 h-16 rounded-lg";
  
  const innerContent =
    size === "large" ? (
      <div className="z-10 bg-white/85 backdrop-blur-md px-8 py-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/60 max-w-[92%] flex flex-col gap-3 relative"
           style={{ fontFamily: 'var(--font-line-seed), "LINE Seed JP", sans-serif' }}>
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[15px] px-3 py-1 rounded-full font-bold whitespace-nowrap shadow-md">
          {meetingBody || "議案"}
        </span>
        <h3 className="text-[21px] font-bold text-gray-800 line-clamp-3 leading-snug pt-1 text-center">
          {title}
        </h3>
      </div>
    ) : null;

  return (
    <div
      className={`relative ${containerSizeProps} overflow-hidden ${colorTheme.bg} ${colorTheme.text} flex flex-col items-center justify-center p-4 text-center shadow-inner flex-shrink-0 self-center`}
    >
      {/* 背景パターン */}
      <div className="absolute inset-0 z-0 opacity-80">
        <PatternComponent seed={seed} />
      </div>

      {innerContent}
    </div>
  );
}
