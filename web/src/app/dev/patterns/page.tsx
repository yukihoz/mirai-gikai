import React from "react";

// 簡単な文字列表現からシード（数値）を生成するハッシュ関数
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// ==========================================
// 20種類のパターンジェネレーター群
// 共通してcurrentColorを参照し、親要素のtext-colorで色が付く仕組み
// ==========================================
const Patterns = {
  // 1: 斜めストライプ
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
  
  // 2: 水玉 (ドット)
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

  // 3: 波線 (Waves)
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

  // 4: 幾何学な円の重なり (Bauhaus style)
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

  // 5: グリッドクロス
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

  // 6: ジグザグ (Chevron)
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

  // 7: クロスハッチ (斜めの交差)
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

  // 8: 三角形 (Tessellation)
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

  // 9: 六角形 (Honeycomb)
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

  // 10: 同心円 (Target)
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

  // 11: チェッカーボード
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

  // 12: アーガイル (Diamond Grid)
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

  // 13: プラス記号 (Plus)
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

  // 14: 星型クロス (4-point Star)
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

  // 15: マカロニ (Curved Squiggles)
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

  // 16: 雨 (Dashes)
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

  // 17: レンガ (Bricks)
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

  // 18: 大小のドット
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

  // 19: キューブ (Isometric)
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

  // 20: 鎖 (Interlocking Rings)
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

interface DynamicThumbnailProps {
  title: string;
  meetingBody: string;
}

// 会議体ごとのテーマカラー（Tailwindクラス）を定義する辞書
const meetingBodyColors: Record<string, { bg: string, text: string }> = {
  // 企画総務系（ブルー・グレー系）
  "企画総務委員会": { bg: "bg-slate-100", text: "text-slate-500/20" },
  
  // 区民・文教系（オレンジ・イエロー系）
  "区民文教委員会": { bg: "bg-orange-50", text: "text-orange-500/20" },
  
  // 福祉保健系（ピンク・赤系）
  "福祉保健委員会": { bg: "bg-rose-50", text: "text-rose-500/20" },
  
  // 環境・建設基盤系（グリーン・エメラルド系）
  "環境建設委員会": { bg: "bg-emerald-50", text: "text-emerald-500/20" },
  "築地等都市基盤対策特別委員会": { bg: "bg-teal-50", text: "text-teal-500/20" },
  
  // その他特別委員会（パープル系など）
  "地域活性化対策特別委員会": { bg: "bg-amber-50", text: "text-amber-500/30" },
  "子ども子育て・高齢者対策特別委員会": { bg: "bg-pink-50", text: "text-pink-500/20" },
  "防災等安全対策特別委員会": { bg: "bg-red-50", text: "text-red-500/15" },
  
  // 予算・決算（ゴールド・厳粛な色）
  "予算特別委員会": { bg: "bg-yellow-50", text: "text-yellow-600/30" },
  "決算特別委員会": { bg: "bg-stone-100", text: "text-stone-500/20" },
  
  // 本会議・定例会（プライマリーブルー系）
  "定例会": { bg: "bg-blue-50", text: "text-blue-500/20" },
  "臨時会": { bg: "bg-indigo-50", text: "text-indigo-500/20" },
  
  // デフォルト
  "デフォルト": { bg: "bg-gray-50", text: "text-gray-400/20" },
};

function DynamicThumbnail({ title, meetingBody }: DynamicThumbnailProps) {
  // 法案名によるハッシュ化で「どの柄を使うか」を固定する
  const seed = hashString(title);
  
  // 20の柄からシードで1つを選択
  const patternKeys = Object.keys(Patterns) as Array<keyof typeof Patterns>;
  const patternIndex = seed % patternKeys.length;
  const variant = patternKeys[patternIndex];
  const PatternComponent = Patterns[variant];

  // 会議体に紐づく色を取得
  const colorTheme = meetingBodyColors[meetingBody] || meetingBodyColors["デフォルト"];

  return (
    <div className={`relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 ${colorTheme.bg} ${colorTheme.text} flex flex-col items-center justify-center p-6 text-center shadow-inner`}>
      {/* 背景パターン（親要素のtext-color[tailwind class]をcurrentColorとして参照して模様を描画） */}
      <div className="absolute inset-0 z-0">
        <PatternComponent seed={seed} />
      </div>
      
      {/* コンテンツ（上に文字を乗せるパネル） */}
      <div className="z-10 bg-white/85 backdrop-blur-md px-5 py-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-white/60 max-w-[90%] flex flex-col gap-2 relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap shadow-sm">
          {meetingBody}
        </span>
        <h3 className="text-sm font-bold text-gray-800 line-clamp-3 leading-loose pt-1">
          {title}
        </h3>
      </div>
    </div>
  );
}

export default function PatternsDemoPage() {
  const sampleBills = [
    { title: "中央区立公園条例の一部を改正する条例", body: "環境建設委員会" },
    { title: "令和8年度 中央区一般会計予算", body: "予算特別委員会" },
    { title: "中央区自転車の放置防止等に関する条例の一部を改正する条例", body: "地域活性化対策特別委員会" },
    { title: "中央区立児童館条例の一部を改正する条例", body: "子ども子育て・高齢者対策特別委員会" },
    { title: "子ども医療費助成に関する条例", body: "福祉保健委員会" },
    { title: "中央区防災会議条例の一部を改正する条例", body: "防災等安全対策特別委員会" },
    { title: "区立学校のＩＣＴ教育推進に関する補正予算", body: "区民文教委員会" },
    { title: "職員の給与等に関する条例の改正", body: "企画総務委員会" },
    { title: "区長その他の特別職の給与等に関する条例の改正", body: "定例会" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 font-sans">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-4">サムネイル自動生成のサンプル検証 (20柄 × 会議体カラー)</h1>
        <p className="text-gray-600 leading-relaxed mb-4">
          以下のデモでは、**議案の名前（ハッシュ値）によって 20種類 のパターンから1つが選ばれ**、**背景の「色（テーマ）」は所属する会議体（委員会や定例会）によって変化する** 仕組みを実装しています。
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-sm border">
          <h3 className="font-bold mb-2">会議体別のカラーマッピング手法</h3>
          <p className="mb-2">会議体ごとに Tailwind CSS のクラス（背景色 <code>bg-*-50</code> と 文字色 <code>text-*-500/20</code> の組み合わせ）を持たせた辞書（Dictionary）形式で管理しています。SVG側は <code>stroke="currentColor"</code> または <code>fill="currentColor"</code> で描画されるため、親要素の色に応じて自動的に模様の色が変わります。</p>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <li><span className="inline-block w-3 h-3 bg-orange-100 border border-orange-300 mr-1"></span>区民文教: オレンジ</li>
            <li><span className="inline-block w-3 h-3 bg-emerald-100 border border-emerald-300 mr-1"></span>環境建設: エメラルド</li>
            <li><span className="inline-block w-3 h-3 bg-rose-100 border border-rose-300 mr-1"></span>福祉保健: ピンク/レッド</li>
            <li><span className="inline-block w-3 h-3 bg-slate-200 border border-slate-400 mr-1"></span>企画総務: グレー</li>
            <li><span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-400 mr-1"></span>予算決算: イエロー</li>
            <li><span className="inline-block w-3 h-3 bg-blue-100 border border-blue-400 mr-1"></span>定例会等: ブルー</li>
          </ul>
        </div>
      </div>

      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {sampleBills.map((bill, i) => (
             <div key={i} className="flex flex-col gap-2">
                <DynamicThumbnail title={bill.title} meetingBody={bill.body} />
                <div className="text-xs text-center text-gray-500 mt-2 space-y-1">
                  <p>会議体による色: <strong className="text-gray-700">{bill.body}</strong></p>
                  <p>議案名ハッシュによる柄: <strong>Pattern {hashString(bill.title) % 20 + 1}</strong></p>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
