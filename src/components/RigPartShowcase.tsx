import React, { useState } from 'react';
import { AnyRigPart } from '../data/rigCatalog';

interface RigPartShowcaseProps {
  part: AnyRigPart;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'checkout';
}

/**
 * 透過PNG製品画像（Product Studio PNG）の配置を前提とした
 * 広大な余白（Whitespace）とアンビエント照明を備えたハードウェア・ショーケースステージ
 */
export const RigPartShowcase: React.FC<RigPartShowcaseProps> = ({
  part,
  isSelected = false,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const hasRealProductPng =
    !imgError && Boolean(part.image) && !part.image.includes('placehold.co');

  const sizeClass =
    size === 'sm'
      ? 'w-20 h-20 p-2.5 shrink-0'
      : size === 'checkout'
      ? 'w-24 h-24 sm:w-28 sm:h-28 p-3 shrink-0'
      : size === 'lg'
      ? 'w-full h-48 sm:h-56 p-6'
      : 'w-full h-36 p-5';

  return (
    <div
      className={`relative rounded-xl bg-[#151515]/90 border overflow-hidden flex items-center justify-center transition-all duration-300 ${sizeClass} ${
        isSelected
          ? 'border-[#00E5FF]/50 shadow-[inset_0_0_28px_rgba(0,229,255,0.14)]'
          : 'border-white/5 group-hover:border-[#00E5FF]/30'
      }`}
    >
      {/* Apple / Tesla 風のスタジオ・スポットライト背景（透過PNGを引き立てる余白と光源） */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
        }`}
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(0, 229, 255, 0.16) 0%, rgba(0, 229, 255, 0.04) 45%, transparent 75%)',
        }}
      />

      {/* 微細な精密グリッドライン */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* 製品ビジュアル本体（実製品画像がある場合は白背景自動透過フィルタ付きimg、フォールバック時は透過スタジオCADレンダー） */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id="rigs-showcase-transparent" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      -0.3333 -0.3333 -0.3333 1 0"
              result="invertedLuma"
            />
            <feComponentTransfer in="invertedLuma" result="alphaMask">
              <feFuncA
                type="table"
                tableValues="0 0.15 0.85 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"
              />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="alphaMask" operator="in" />
          </filter>
        </defs>
      </svg>

      {hasRealProductPng ? (
        <img
          src={part.image}
          alt={part.name}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            filter:
              'url(#rigs-showcase-transparent) drop-shadow(0 14px 20px rgba(0, 0, 0, 0.85))',
          }}
          className="relative z-10 w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-105 drop-shadow-[0_14px_20px_rgba(0,0,0,0.85)]">
          {part.category === 'reel' && (
            <svg
              viewBox="0 0 180 110"
              className="w-full h-full max-h-full"
              role="img"
              aria-label={part.shortName}
            >
              <defs>
                <linearGradient id={`metal-${part.id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#64748B" />
                  <stop offset="50%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id={`spool-${part.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#0F172A" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Reel Foot & Stem */}
              <path
                d="M72 12 L118 12 L112 18 L98 18 L94 46 L82 46 L86 18 L76 18 Z"
                fill={`url(#metal-${part.id})`}
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              {/* Main Hagane/Monocoque Body */}
              <path
                d="M66 44 C66 34, 112 34, 118 50 C122 66, 108 84, 88 84 C70 84, 64 68, 66 44 Z"
                fill={`url(#metal-${part.id})`}
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
              {/* Rotor Arms */}
              <path
                d="M50 30 L66 38 L66 72 L50 80"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="1.8"
              />
              {/* Deep Saltwater Spool */}
              <rect
                x="22"
                y="26"
                width="28"
                height="58"
                rx="3"
                fill={`url(#spool-${part.id})`}
                stroke="#E2E8F0"
                strokeWidth="1.4"
              />
              <line
                x1="27"
                y1="26"
                x2="27"
                y2="84"
                stroke="#00E5FF"
                strokeWidth="2.2"
              />
              {/* Power Handle & Round Metal Knob */}
              <line x1="90" y1="60" x2="136" y2="82" stroke="#E2E8F0" strokeWidth="2.4" />
              <circle
                cx="146"
                cy="86"
                r="11"
                fill={`url(#metal-${part.id})`}
                stroke="#00E5FF"
                strokeWidth="1.8"
              />
            </svg>
          )}

          {part.category === 'rod' && (
            <svg
              viewBox="0 0 220 90"
              className="w-full h-full max-h-full"
              role="img"
              aria-label={part.shortName}
            >
              {/* EVA Rear Grip & Heavy Reel Seat */}
              <rect
                x="8"
                y="46"
                width="46"
                height="8"
                rx="2"
                fill="#1E293B"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              <rect
                x="54"
                y="44"
                width="18"
                height="12"
                rx="1.5"
                fill="#0F172A"
                stroke="#00E5FF"
                strokeWidth="1.5"
              />
              <rect
                x="72"
                y="46"
                width="26"
                height="7.5"
                rx="1.5"
                fill="#1E293B"
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              {/* Carbon Blank */}
              <polygon
                points="98,47.5 212,49 212,51 98,52.5"
                fill="#E2E8F0"
              />
              {/* Double-Foot Ocean Guides */}
              {[116, 142, 166, 188, 208].map((gx, idx) => (
                <g key={gx}>
                  <path
                    d={`M${gx - 3.5} 48 L${gx} ${36 + idx * 1.4} L${gx + 3.5} 48`}
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx={gx}
                    cy={35 + idx * 1.4}
                    r={Math.max(2, 4.2 - idx * 0.45)}
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1.4"
                  />
                </g>
              ))}
            </svg>
          )}

          {part.category === 'line' && (
            <svg
              viewBox="0 0 180 100"
              className="w-full h-full max-h-full"
              role="img"
              aria-label={part.shortName}
            >
              {/* Spool Outer Rim */}
              <circle
                cx="90"
                cy="50"
                r="36"
                fill="#1E293B"
                stroke="#00E5FF"
                strokeWidth="2"
              />
              {/* Braided PE Line Winding */}
              <circle
                cx="90"
                cy="50"
                r="27"
                fill="none"
                stroke="#00E5FF"
                strokeOpacity="0.55"
                strokeWidth="6"
                strokeDasharray="5 2"
              />
              {/* Inner Core */}
              <circle
                cx="90"
                cy="50"
                r="13"
                fill="#151515"
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
            </svg>
          )}

          {part.category === 'lure' && (
            <svg
              viewBox="0 0 210 90"
              className="w-full h-full max-h-full"
              role="img"
              aria-label={part.shortName}
            >
              <defs>
                <linearGradient id={`lure-foil-${part.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#1E293B" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Aerodynamic Diving Pencil Body */}
              <path
                d="M20 44 C52 24, 136 25, 182 44 C136 60, 52 61, 20 44 Z"
                fill={`url(#lure-foil-${part.id})`}
                stroke="#00E5FF"
                strokeWidth="1.8"
              />
              {/* Lateral Hologram Line & Eye */}
              <line
                x1="34"
                y1="44"
                x2="172"
                y2="44"
                stroke="#151515"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <circle cx="38" cy="40" r="3.5" fill="#151515" stroke="#00E5FF" strokeWidth="1.5" />
              {/* Heavy Wire Hooks */}
              <circle cx="98" cy="56" r="2.5" fill="none" stroke="#E2E8F0" strokeWidth="1.4" />
              <circle cx="184" cy="44" r="2.5" fill="none" stroke="#E2E8F0" strokeWidth="1.4" />
              <path d="M98 58 L98 72 L105 66" fill="none" stroke="#00E5FF" strokeWidth="1.8" />
              <path d="M184 46 L190 60 L196 54" fill="none" stroke="#00E5FF" strokeWidth="1.8" />
            </svg>
          )}
        </div>
      )}

      {/* 右下：Oswald フォントによる主要スペック刻印（小サイズ時は非表示でノイズ排除） */}
      {size !== 'sm' && size !== 'checkout' && (
        <div className="pointer-events-none absolute bottom-2.5 right-3 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151515]/80 backdrop-blur-sm border border-white/10">
          <span className="font-oswald text-[11px] font-semibold tracking-wider text-[#00E5FF]">
            {part.category === 'reel'
              ? `#${part.sizeClass} // ${part.weightG}g`
              : part.category === 'rod'
              ? `${part.lengthFt.replace('フィート', "'").replace('インチ', '"')} // ${part.weightG}g`
              : part.category === 'line'
              ? `PE#${part.peNumber} // ${part.strengthLb}lb`
              : `${part.lengthMm}mm // ${part.totalWeightG}g`}
          </span>
        </div>
      )}
    </div>
  );
};
