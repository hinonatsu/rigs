import React from 'react';
import { AnyGearProduct, RodProduct } from '../types/tackle';

interface GearSchematicProps {
  item: AnyGearProduct;
  compact?: boolean;
}

/**
 * 番手・寸法・号数・フック規格を視覚伝達する
 * サイバーパンク×精密CAD図面スタイルのテクニカル・ダイアグラム描画コンポーネント
 */
export const GearSchematic: React.FC<GearSchematicProps> = ({ item, compact = false }) => {
  const isShimano = item.brand.toUpperCase().includes('SHIMANO');
  const isDaiwa = item.brand.toUpperCase().includes('DAIWA');
  const accentStroke = isShimano ? '#00E5FF' : isDaiwa ? '#38BDF8' : '#00E5FF';
  const secondaryMetal = isShimano ? '#FCD34D' : '#E2E8F0';

  if (item.category === 'reel') {
    const isMonster = item.specs.sizeClass >= 18000;
    return (
      <div
        className={`relative flex items-center justify-center bg-[#1A1A1A]/90 border border-white/10 rounded-xl overflow-hidden shadow-inner ${
          compact ? 'w-16 h-14 shrink-0' : 'w-full h-28'
        }`}
      >
        {/* Cyber Technical Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,229,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.14) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A]/80 via-transparent to-[#00E5FF]/10 pointer-events-none" />
        <svg
          viewBox="0 0 180 96"
          className="w-full h-full p-1.5 relative z-10"
          role="img"
          aria-label={`${item.brand} ${item.modelName} 寸法図`}
        >
          {/* Reel Foot & Stem */}
          <path
            d="M72 10 L114 10 L108 16 L96 16 L92 44 L82 44 L86 16 L76 16 Z"
            fill="#2D2D2D"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          {/* Main Monocoque / Hagane Body */}
          <path
            d="M66 42 C66 34, 108 34, 114 48 C118 62, 106 78, 86 78 C70 78, 64 64, 66 42 Z"
            fill="#1A1A1A"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Rotor */}
          <path
            d="M52 30 L66 36 L66 66 L52 72"
            fill="none"
            stroke={accentStroke}
            strokeWidth="1.6"
          />
          {/* Deep Spool */}
          <rect
            x="24"
            y={isMonster ? '24' : '28'}
            width={isMonster ? '30' : '26'}
            height={isMonster ? '54' : '46'}
            rx="2.5"
            fill="#1A1A1A"
            stroke="#E2E8F0"
            strokeWidth="1.4"
          />
          {/* Spool Lip & Anodized Band */}
          <line
            x1="28"
            y1={isMonster ? '24' : '28'}
            x2="28"
            y2={isMonster ? '78' : '74'}
            stroke={accentStroke}
            strokeWidth="2.4"
          />
          <line
            x1="48"
            y1={isMonster ? '26' : '30'}
            x2="48"
            y2={isMonster ? '76' : '72'}
            stroke={secondaryMetal}
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          {/* Power Handle & Round Knob */}
          <line x1="88" y1="56" x2="132" y2="76" stroke="#E2E8F0" strokeWidth="2" />
          <circle
            cx="142"
            cy="80"
            r={isMonster ? '11' : '9'}
            fill="#2D2D2D"
            stroke={accentStroke}
            strokeWidth="1.6"
          />
          {!compact && (
            <>
              <text
                x="126"
                y="25"
                fill="#F8FAFC"
                fontSize="11"
                fontWeight="600"
                fontFamily="Oswald, sans-serif"
                letterSpacing="0.05em"
              >
                #{item.specs.sizeClass}
              </text>
              <text
                x="126"
                y="39"
                fill="#00E5FF"
                fontSize="9.5"
                fontWeight="500"
                fontFamily="Oswald, sans-serif"
                letterSpacing="0.04em"
              >
                {item.specs.retrieveCm}cm / MAX {item.specs.maxDragKg}kg
              </text>
            </>
          )}
        </svg>
      </div>
    );
  }

  if (item.category === 'rod') {
    const isHeavyTuna = item.specs.maxPe >= 10;
    return (
      <div
        className={`relative flex items-center justify-center bg-[#1A1A1A]/90 border border-white/10 rounded-xl overflow-hidden shadow-inner ${
          compact ? 'w-16 h-14 shrink-0' : 'w-full h-28'
        }`}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,229,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.14) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1A1A]/80 via-transparent to-[#00E5FF]/10 pointer-events-none" />
        <svg
          viewBox="0 0 220 76"
          className="w-full h-full p-1.5 relative z-10"
          role="img"
          aria-label={`${item.brand} ${item.modelName} ロッド構造図`}
        >
          {/* Dimension line */}
          {!compact && (
            <>
              <line
                x1="12"
                y1="17"
                x2="208"
                y2="17"
                stroke="#64748B"
                strokeWidth="0.9"
                strokeDasharray="2 2"
              />
              <text
                x="14"
                y="13"
                fill="#E2E8F0"
                fontSize="9.5"
                fontWeight="500"
                fontFamily="Oswald, sans-serif"
                letterSpacing="0.04em"
              >
                LEN: {item.specs.lengthFtIn} ({item.specs.lengthCm}cm) / WT: {item.specs.weightG}g
              </text>
            </>
          )}
          {/* EVA Rear Grip & Reel Seat */}
          <rect x="10" y="38" width="44" height="7" rx="1.5" fill="#2D2D2D" stroke="#94A3B8" strokeWidth="1" />
          <rect x="54" y="37" width="16" height="9" rx="1" fill="#1A1A1A" stroke="#00E5FF" strokeWidth="1.3" />
          <rect x="70" y="38" width="24" height="6.5" rx="1" fill="#2D2D2D" stroke="#94A3B8" strokeWidth="1" />
          {/* Tapered Carbon Blank */}
          <polygon
            points={
              isHeavyTuna
                ? '94,39 208,40.5 208,42.5 94,44'
                : '94,39.5 208,40.8 208,42.2 94,43.5'
            }
            fill="#F1F5F9"
          />
          {/* Ocean Guides (Double foot RV/MN guides) */}
          {[112, 138, 162, 184, 204].map((gx, idx) => (
            <g key={gx}>
              <path
                d={`M${gx - 3} 40 L${gx} ${31 + idx * 1.3} L${gx + 3} 40`}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.1"
              />
              <circle
                cx={gx}
                cy={30 + idx * 1.3}
                r={Math.max(1.8, 3.8 - idx * 0.45)}
                fill="none"
                stroke="#00E5FF"
                strokeWidth="1.2"
              />
            </g>
          ))}
          {!compact && (
            <text
              x="14"
              y="64"
              fill="#00E5FF"
              fontSize="9.5"
              fontWeight="600"
              fontFamily="Oswald, sans-serif"
              letterSpacing="0.04em"
            >
              MAX PE {item.specs.maxPe} / MAX DRAG {item.specs.maxDragKg}kg (45°)
            </text>
          )}
        </svg>
      </div>
    );
  }

  if (item.category === 'line') {
    const isPe = item.specs.subType === 'pe_main';
    return (
      <div
        className={`relative flex items-center justify-center bg-[#1A1A1A]/90 border border-white/10 rounded-xl overflow-hidden shadow-inner ${
          compact ? 'w-16 h-14 shrink-0' : 'w-full h-28'
        }`}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(0,229,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.14) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <svg
          viewBox="0 0 180 76"
          className="w-full h-full p-1.5 relative z-10"
          role="img"
          aria-label={`${item.brand} ${item.modelName} スプール図`}
        >
          <circle
            cx={compact ? '90' : '46'}
            cy="38"
            r="26"
            fill="#2D2D2D"
            stroke={isPe ? '#00E5FF' : '#FBBF24'}
            strokeWidth="1.8"
          />
          <circle
            cx={compact ? '90' : '46'}
            cy="38"
            r="19"
            fill="none"
            stroke="#64748B"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <circle cx={compact ? '90' : '46'} cy="38" r="9" fill="#1A1A1A" stroke="#CBD5E1" strokeWidth="1.2" />
          {!compact && (
            <>
              <text
                x="84"
                y="27"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="600"
                fontFamily="Oswald, sans-serif"
                letterSpacing="0.04em"
              >
                {isPe ? `PE #${item.specs.peNumber}` : `LEADER ${item.specs.strengthLb}lb`}
              </text>
              <text
                x="84"
                y="43"
                fill="#00E5FF"
                fontSize="10.5"
                fontWeight="500"
                fontFamily="Oswald, sans-serif"
                letterSpacing="0.04em"
              >
                LEN: {item.specs.lengthM}m
              </text>
              <text
                x="84"
                y="58"
                fill="#CBD5E1"
                fontSize="9.5"
                fontFamily="Oswald, sans-serif"
                letterSpacing="0.03em"
              >
                MAX: {item.specs.strengthLb}lb ({Math.round(item.specs.strengthLb * 0.4536)}kg)
              </text>
            </>
          )}
        </svg>
      </div>
    );
  }

  // Lure (Plug or Hook Set)
  const isPlug = item.specs.subType === 'plug_main';
  return (
    <div
      className={`relative flex items-center justify-center bg-[#1A1A1A]/90 border border-white/10 rounded-xl overflow-hidden shadow-inner ${
        compact ? 'w-16 h-14 shrink-0' : 'w-full h-28'
      }`}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,229,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.14) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />
      <svg
        viewBox="0 0 200 76"
        className="w-full h-full p-1.5 relative z-10"
        role="img"
        aria-label={`${item.brand} ${item.modelName} 構造図`}
      >
        {isPlug ? (
          <>
            {/* Diving Pencil / Popper Silhouette */}
            <path
              d="M24 38 C52 23, 128 24, 168 38 C128 50, 52 51, 24 38 Z"
              fill="#2D2D2D"
              stroke="#00E5FF"
              strokeWidth="1.6"
            />
            {/* Lateral Line & Eye */}
            <line
              x1="34"
              y1="38"
              x2="160"
              y2="38"
              stroke="#94A3B8"
              strokeWidth="0.9"
              strokeDasharray="3 2"
            />
            <circle cx="40" cy="35" r="2.8" fill="#00E5FF" />
            {/* Belly & Tail Eyelets + Hook Hang Indicators */}
            <circle cx="94" cy="47" r="2.2" fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
            <circle cx="170" cy="38" r="2.2" fill="none" stroke="#CBD5E1" strokeWidth="1.2" />
            <path d="M94 49 L94 60 L99 56" fill="none" stroke="#FBBF24" strokeWidth="1.4" />
            <path d="M170 40 L174 52 L178 48" fill="none" stroke="#FBBF24" strokeWidth="1.4" />
            {!compact && (
              <>
                <text
                  x="24"
                  y="16"
                  fill="#E2E8F0"
                  fontSize="9.5"
                  fontWeight="500"
                  fontFamily="Oswald, sans-serif"
                  letterSpacing="0.04em"
                >
                  {item.specs.lengthMm}mm / BODY {item.specs.weightG}g
                </text>
                <text
                  x="112"
                  y="67"
                  fill="#00E5FF"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="Oswald, sans-serif"
                  letterSpacing="0.04em"
                >
                  REQ: {item.specs.hookCode.replace('CLASS_', '#').replace('_', '/')}
                </text>
              </>
            )}
          </>
        ) : (
          <>
            {/* Heavy Wire Hook & Split Ring Schematic */}
            <circle cx="52" cy="36" r="10" fill="none" stroke="#E2E8F0" strokeWidth="2.2" />
            <path
              d="M62 36 L98 36 C114 36, 118 58, 100 58 C88 58, 86 46, 94 43"
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {!compact && (
              <>
                <text
                  x="24"
                  y="17"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Oswald, sans-serif"
                  letterSpacing="0.04em"
                >
                  TOTAL METAL WT: {item.specs.weightG}g
                </text>
                <text
                  x="124"
                  y="42"
                  fill="#00E5FF"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Oswald, sans-serif"
                  letterSpacing="0.04em"
                >
                  {item.specs.hookCode.replace('CLASS_', 'CLASS #').replace('_', '/')}
                </text>
              </>
            )}
          </>
        )}
      </svg>
    </div>
  );
};

/**
 * ロッドの許容ルアー重量レンジ＆スイートスポットに対する、ルアー実戦総重量(本体+針)の位置を示すゲージ
 */
export const RodWeightWindowBar: React.FC<{
  rod: RodProduct;
  totalLureWeightG: number;
}> = ({ rod, totalLureWeightG }) => {
  const { lureMinG, lureMaxG, lureSweetMinG, lureSweetMaxG } = rod.specs;
  const scaleMin = Math.max(0, lureMinG - 20);
  const scaleMax = lureMaxG + 30;
  const span = scaleMax - scaleMin;

  const toPct = (val: number) => Math.max(0, Math.min(100, ((val - scaleMin) / span) * 100));

  const minPct = toPct(lureMinG);
  const maxPct = toPct(lureMaxG);
  const sweetMinPct = toPct(lureSweetMinG);
  const sweetMaxPct = toPct(lureSweetMaxG);
  const currentPct = toPct(totalLureWeightG);

  const isOut = totalLureWeightG < lureMinG || totalLureWeightG > lureMaxG;
  const isSweet = totalLureWeightG >= lureSweetMinG && totalLureWeightG <= lureSweetMaxG;

  return (
    <div className="mt-3 pt-2.5 border-t border-white/10">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-300 font-jp font-normal">
          ロッド許容:{' '}
          <strong className="font-oswald tracking-wider text-white font-semibold">
            {lureMinG}–{lureMaxG}g
          </strong>{' '}
          <span className="text-slate-300">
            (最適スイートスポット{' '}
            <span className="font-oswald text-[#00E5FF]">
              {lureSweetMinG}–{lureSweetMaxG}g
            </span>
            )
          </span>
        </span>
        <span
          className={`font-oswald text-sm tracking-wider font-semibold ${
            isOut ? 'text-rose-400' : isSweet ? 'text-[#00E5FF]' : 'text-amber-300'
          }`}
        >
          針込実戦 {totalLureWeightG}g
        </span>
      </div>
      <div className="relative h-2.5 bg-[#1A1A1A] border border-white/15 rounded-full overflow-hidden">
        {/* Allowed range */}
        <div
          className="absolute top-0 bottom-0 bg-white/15"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        {/* Sweet spot range */}
        <div
          className="absolute top-0 bottom-0 bg-[#00E5FF]/30 border-x border-[#00E5FF]/80"
          style={{ left: `${sweetMinPct}%`, width: `${sweetMaxPct - sweetMinPct}%` }}
        />
        {/* Current Lure Weight Marker */}
        <div
          className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full shadow-[0_0_10px_#00E5FF] ${
            isOut ? 'bg-rose-500' : isSweet ? 'bg-[#00E5FF]' : 'bg-amber-400'
          }`}
          style={{ left: `${currentPct}%` }}
        />
      </div>
    </div>
  );
};
