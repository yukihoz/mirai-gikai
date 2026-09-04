import React from "react";
import { getMeetingBodyColor } from "@/features/bills/shared/utils/meeting-body-colors";

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
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p1-${seed}`}
            patternTransform={`rotate(${angle})`}
            width={width}
            height={width}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={width}
              stroke="currentColor"
              strokeWidth={width / 2}
            />
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
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p2-${seed}`}
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={radius}
              fill="currentColor"
              opacity="0.8"
            />
            <circle
              cx={0}
              cy={0}
              r={radius / 2}
              fill="currentColor"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p2-${seed})`} />
      </svg>
    );
  },
  Waves: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p3-${seed}`}
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10 Q 10 0, 20 10 T 40 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p3-${seed})`} />
      </svg>
    );
  },
  Circles: ({ seed }: { seed: number }) => {
    const size = 60 + (seed % 40);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p4-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="0"
              cy="0"
              r={size * 0.4}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.5"
            />
            <circle
              cx={size}
              cy={size}
              r={size * 0.6}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p4-${seed})`} />
      </svg>
    );
  },
  Grid: ({ seed }: { seed: number }) => {
    const size = 20 + (seed % 20);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p5-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${size} 0 L 0 0 0 ${size}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p5-${seed})`} />
      </svg>
    );
  },
  Zigzag: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p6-${seed}`}
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 20 L 10 0 L 20 20 L 30 0 L 40 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p6-${seed})`} />
      </svg>
    );
  },
  Crosshatch: ({ seed }: { seed: number }) => {
    const size = 15 + (seed % 15);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p7-${seed}`}
            width={size}
            height={size}
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={size}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="0"
              y1="0"
              x2={size}
              y2="0"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p7-${seed})`} />
      </svg>
    );
  },
  Triangles: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p8-${seed}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points="0,40 20,0 40,40"
              fill="currentColor"
              opacity="0.3"
            />
            <polygon
              points="0,0 20,40 40,0"
              fill="currentColor"
              opacity="0.1"
            />
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
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p9-${seed}`}
            width={s * 3}
            height={h}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${s * -0.5},${h / 2} L 0,0 L ${s},0 L ${s * 1.5},${h / 2} L ${s},${h} L 0,${h} Z`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d={`M ${s * 1.5},${h / 2} L ${s * 2},0 L ${s * 3},0 L ${s * 3.5},${h / 2} L ${s * 3},${h} L ${s * 2},${h} Z`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p9-${seed})`} />
      </svg>
    );
  },
  Concentric: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p10-${seed}`}
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="30"
              cy="30"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            />
            <circle
              cx="30"
              cy="30"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.6"
            />
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
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p11-${seed}`}
            width={size * 2}
            height={size * 2}
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="0"
              y="0"
              width={size}
              height={size}
              fill="currentColor"
              opacity="0.4"
            />
            <rect
              x={size}
              y={size}
              width={size}
              height={size}
              fill="currentColor"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p11-${seed})`} />
      </svg>
    );
  },
  Diamonds: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p12-${seed}`}
            width="40"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 0 L40 30 L20 60 L0 30 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M20 30 L40 60 L20 90 L0 60 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p12-${seed})`} />
      </svg>
    );
  },
  Plus: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p13-${seed}`}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M15 5 L15 25 M5 15 L25 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p13-${seed})`} />
      </svg>
    );
  },
  Stars: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p14-${seed}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 Q 20 20 40 20 Q 20 20 20 40 Q 20 20 0 20 Q 20 20 20 0"
              fill="currentColor"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p14-${seed})`} />
      </svg>
    );
  },
  Macaroni: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p15-${seed}`}
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M10 10 C 20 0, 40 0, 40 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M30 40 C 20 50, 0 50, 0 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p15-${seed})`} />
      </svg>
    );
  },
  Rain: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p16-${seed}`}
            width="30"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(15)"
          >
            <line
              x1="10"
              y1="0"
              x2="10"
              y2="15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.8"
            />
            <line
              x1="25"
              y1="20"
              x2="25"
              y2="28"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p16-${seed})`} />
      </svg>
    );
  },
  Bricks: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p17-${seed}`}
            width="40"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="0"
              y="0"
              width="40"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="-20"
              y="10"
              width="40"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="20"
              y="10"
              width="40"
              height="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p17-${seed})`} />
      </svg>
    );
  },
  VariedDots: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p18-${seed}`}
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
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
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p19-${seed}`}
            width="34.64"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M17.32 0 L34.64 10 L17.32 20 L0 10 Z"
              fill="currentColor"
              opacity="0.1"
            />
            <path
              d="M0 10 L17.32 20 L17.32 40 L0 30 Z"
              fill="currentColor"
              opacity="0.3"
            />
            <path
              d="M34.64 10 L34.64 30 L17.32 40 L17.32 20 Z"
              fill="currentColor"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p19-${seed})`} />
      </svg>
    );
  },
  Rings: ({ seed }: { seed: number }) => {
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p20-${seed}`}
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="0"
              cy="15"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.7"
            />
            <circle
              cx="15"
              cy="0"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.7"
            />
            <circle
              cx="15"
              cy="30"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.7"
            />
            <circle
              cx="30"
              cy="15"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p20-${seed})`} />
      </svg>
    );
  },
  // ── ここから追加の20柄（p21〜p40）──────────────────────────
  // 既存と同じく seed で寸法や角度を振り、currentColor で会議体の色を受ける。
  Chevrons: ({ seed }: { seed: number }) => {
    const size = 16 + (seed % 10);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p21-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 ${size * 0.7} L${size / 2} ${size * 0.2} L${size} ${size * 0.7}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p21-${seed})`} />
      </svg>
    );
  },
  Scales: ({ seed }: { seed: number }) => {
    const size = 20 + (seed % 12);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p22-${seed}`}
            width={size}
            height={size / 2}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 ${size / 2} A ${size / 2} ${size / 2} 0 0 1 ${size} ${size / 2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p22-${seed})`} />
      </svg>
    );
  },
  Lattice: ({ seed }: { seed: number }) => {
    const size = 18 + (seed % 14);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p23-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 0 L${size} ${size} M${size} 0 L0 ${size}`}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p23-${seed})`} />
      </svg>
    );
  },
  Pills: ({ seed }: { seed: number }) => {
    const w = 22 + (seed % 10);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p24-${seed}`}
            width={w}
            height={w / 2}
            patternTransform={`rotate(${(seed % 3) * 30})`}
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="2"
              y="2"
              width={w - 8}
              height={w / 2 - 6}
              rx={(w / 2 - 6) / 2}
              fill="currentColor"
              opacity="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p24-${seed})`} />
      </svg>
    );
  },
  Sprinkles: ({ seed }: { seed: number }) => {
    const size = 26 + (seed % 10);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p25-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="2"
              y1="4"
              x2="8"
              y2="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1={size - 10}
              y1={size - 12}
              x2={size - 4}
              y2={size - 6}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="4"
              y1={size - 6}
              x2="10"
              y2={size - 12}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p25-${seed})`} />
      </svg>
    );
  },
  Windmill: ({ seed }: { seed: number }) => {
    const size = 24 + (seed % 12);
    const h = size / 2;
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p26-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 0 L${h} 0 L${h} ${h} Z M${size} 0 L${size} ${h} L${h} ${h} Z M${size} ${size} L${h} ${size} L${h} ${h} Z M0 ${size} L0 ${h} L${h} ${h} Z`}
              fill="currentColor"
              opacity="0.55"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p26-${seed})`} />
      </svg>
    );
  },
  Ticks: ({ seed }: { seed: number }) => {
    const gap = 12 + (seed % 8);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p27-${seed}`}
            width={gap}
            height={gap * 2}
            patternTransform={`rotate(${(seed % 4) * 22})`}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1={gap / 2}
              y1="0"
              x2={gap / 2}
              y2={gap}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p27-${seed})`} />
      </svg>
    );
  },
  Bubbles: ({ seed }: { seed: number }) => {
    const size = 34 + (seed % 14);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p28-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={size * 0.25}
              cy={size * 0.3}
              r={size * 0.14}
              fill="currentColor"
            />
            <circle
              cx={size * 0.7}
              cy={size * 0.65}
              r={size * 0.09}
              fill="currentColor"
            />
            <circle
              cx={size * 0.8}
              cy={size * 0.2}
              r={size * 0.05}
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p28-${seed})`} />
      </svg>
    );
  },
  Steps: ({ seed }: { seed: number }) => {
    const size = 20 + (seed % 10);
    const h = size / 2;
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p29-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 ${size} L0 ${h} L${h} ${h} L${h} 0 L${size} 0`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p29-${seed})`} />
      </svg>
    );
  },
  Weave: ({ seed }: { seed: number }) => {
    const size = 16 + (seed % 10);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p30-${seed}`}
            width={size * 2}
            height={size * 2}
            patternUnits="userSpaceOnUse"
          >
            <rect
              width={size}
              height={size}
              fill="currentColor"
              opacity="0.6"
            />
            <rect
              x={size}
              y={size}
              width={size}
              height={size}
              fill="currentColor"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p30-${seed})`} />
      </svg>
    );
  },
  Arrows: ({ seed }: { seed: number }) => {
    const size = 22 + (seed % 10);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p31-${seed}`}
            width={size}
            height={size}
            patternTransform={`rotate(${(seed % 4) * 90})`}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M${size / 2} ${size * 0.2} L${size * 0.8} ${size * 0.6} L${size / 2} ${size * 0.45} L${size * 0.2} ${size * 0.6} Z`}
              fill="currentColor"
              opacity="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p31-${seed})`} />
      </svg>
    );
  },
  Petals: ({ seed }: { seed: number }) => {
    const size = 28 + (seed % 12);
    const r = size * 0.22;
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p32-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <ellipse
              cx={size / 2}
              cy={size * 0.28}
              rx={r * 0.6}
              ry={r}
              fill="currentColor"
            />
            <ellipse
              cx={size / 2}
              cy={size * 0.72}
              rx={r * 0.6}
              ry={r}
              fill="currentColor"
            />
            <ellipse
              cx={size * 0.28}
              cy={size / 2}
              rx={r}
              ry={r * 0.6}
              fill="currentColor"
            />
            <ellipse
              cx={size * 0.72}
              cy={size / 2}
              rx={r}
              ry={r * 0.6}
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p32-${seed})`} />
      </svg>
    );
  },
  Notches: ({ seed }: { seed: number }) => {
    const size = 18 + (seed % 12);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p33-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 0 L${size * 0.35} 0 L0 ${size * 0.35} Z`}
              fill="currentColor"
              opacity="0.7"
            />
            <path
              d={`M${size} ${size} L${size * 0.65} ${size} L${size} ${size * 0.65} Z`}
              fill="currentColor"
              opacity="0.7"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p33-${seed})`} />
      </svg>
    );
  },
  Ripples: ({ seed }: { seed: number }) => {
    const size = 30 + (seed % 16);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p34-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.4}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.22}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size * 0.06}
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p34-${seed})`} />
      </svg>
    );
  },
  Bars: ({ seed }: { seed: number }) => {
    const unit = 10 + (seed % 6);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p35-${seed}`}
            width={unit * 4}
            height={unit * 3}
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="0"
              y={unit}
              width={unit * 1.4}
              height={unit * 2}
              fill="currentColor"
              opacity="0.7"
            />
            <rect
              x={unit * 1.8}
              y={unit * 1.6}
              width={unit * 1.4}
              height={unit * 1.4}
              fill="currentColor"
              opacity="0.45"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p35-${seed})`} />
      </svg>
    );
  },
  Seigaiha: ({ seed }: { seed: number }) => {
    const size = 24 + (seed % 12);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p36-${seed}`}
            width={size}
            height={size / 2}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 1}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 3}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p36-${seed})`} />
      </svg>
    );
  },
  Sparks: ({ seed }: { seed: number }) => {
    const size = 26 + (seed % 12);
    const c = size / 2;
    const a = size * 0.3;
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p37-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M${c} ${c - a} L${c} ${c + a} M${c - a} ${c} L${c + a} ${c}`}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={`M${c - a * 0.6} ${c - a * 0.6} L${c + a * 0.6} ${c + a * 0.6} M${c + a * 0.6} ${c - a * 0.6} L${c - a * 0.6} ${c + a * 0.6}`}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p37-${seed})`} />
      </svg>
    );
  },
  Terrace: ({ seed }: { seed: number }) => {
    const size = 20 + (seed % 12);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p38-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <rect
              x={size * 0.15}
              y={size * 0.15}
              width={size * 0.7}
              height={size * 0.7}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <rect
              x={size * 0.35}
              y={size * 0.35}
              width={size * 0.3}
              height={size * 0.3}
              fill="currentColor"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p38-${seed})`} />
      </svg>
    );
  },
  Threads: ({ seed }: { seed: number }) => {
    const size = 14 + (seed % 10);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p39-${seed}`}
            width={size * 2}
            height={size * 2}
            patternTransform={`rotate(${(seed % 2) * 45})`}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 ${size} Q ${size / 2} 0 ${size} ${size} T ${size * 2} ${size}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p39-${seed})`} />
      </svg>
    );
  },
  Confetti: ({ seed }: { seed: number }) => {
    const size = 30 + (seed % 14);
    return (
      <svg width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern
            id={`p40-${seed}`}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <rect
              x={size * 0.15}
              y={size * 0.2}
              width={size * 0.18}
              height={size * 0.1}
              transform={`rotate(30 ${size * 0.24} ${size * 0.25})`}
              fill="currentColor"
            />
            <rect
              x={size * 0.6}
              y={size * 0.55}
              width={size * 0.18}
              height={size * 0.1}
              transform={`rotate(-25 ${size * 0.69} ${size * 0.6})`}
              fill="currentColor"
              opacity="0.7"
            />
            <circle
              cx={size * 0.78}
              cy={size * 0.22}
              r={size * 0.05}
              fill="currentColor"
              opacity="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#p40-${seed})`} />
      </svg>
    );
  },
};

interface DynamicBillThumbnailProps {
  title: string;
  seedString?: string;
  meetingBody?: string | null;
  size?: "large" | "small" | "header"; // large: 注目カード等（文字入り）, small: コンパクトカード等（柄のみ）, header: 個別ページヘッダー（柄のみ・薄い）
}

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
  const colorTheme = getMeetingBodyColor(meetingBody);

  // コンテナのCSS調整
  const containerSizeProps =
    size === "large"
      ? "w-full h-72 md:h-80 rounded-t-[14px]"
      : size === "header"
        ? "w-full h-24 md:h-28 rounded-t-[14px]"
        : "w-24 h-16 rounded-lg";

  const innerContent =
    size === "large" ? (
      <div
        className="z-10 bg-white/85 backdrop-blur-md px-8 py-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/60 max-w-[92%] flex flex-col gap-3 relative"
        style={{
          fontFamily: 'var(--font-line-seed), "LINE Seed JP", sans-serif',
        }}
      >
        {meetingBody && (
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[15px] px-3.5 py-1 rounded-full font-bold whitespace-nowrap shadow-md">
            {meetingBody}
          </span>
        )}
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
