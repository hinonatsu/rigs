import React from 'react';
import { AnyGearProduct, RodProduct } from '../types/tackle';

interface GearSchematicProps {
  item: AnyGearProduct;
  compact?: boolean;
}

/**
 * 装飾的なAIイラストではなく、番手・寸法・号数・フック規格を視覚伝達する
 * 精密CAD図面スタイルのテクニカル・ダイアグラム描画コンポーネント
 */
export const GearSchematic: React.FC<GearSchematicProps> = ({ item, compact = false }) => {
  const isShimano = item.brand.toUpperCase().includes('SHIMANO');
  const isDaiwa = item.brand.toUpperCase().includes('DAIWA');
  const accentStroke = isShimano ? '#D4AF37' : isDaiwa ? '#38BDF8' : '#00D2FF';

  if (item.category === 'reel') {
    const isMonster = item.specs.sizeClass >= 18000;
    return (
      <div
        className={`relative flex items-center justify-center bg-carbon-950 border border-carbon-700/80 overflow-hidden ${
          compact ? 'w-16 h-14' : 'w-full h-28'
        }`}
      >
        {/* Technical Grid Background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #2E3543 1px, transparent 1px), linear-gradient(to bottom, #2E3543 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <svg
          viewBox="0 0 180 96"
          className="w-full h-full p-1.5"
          role="img"
          aria-label={`${item.brand} ${item.modelName} 寸法図`}
        >
          {/* Reel Foot & Stem */}
          <path
            d="M72 10 L114 10 L108 16 L96 16 L92 44 L82 44 L86 16 L76 16 Z"
            fill="#171B22"
            stroke="#64748B"
            strokeWidth="1.2"
          />
          {/* Main Monocoque / Hagane Body */}
          <path
            d="M66 42 C66 34, 108 34, 114 48 C118 62, 106 78, 86 78 C70 78, 64 64, 66 42 Z"
            fill="#12151A"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          {/* Rotor */}
          <path
            d="M52 30 L66 36 L66 66 L52 72"
            fill="none"
            stroke={accentStroke}
            strokeWidth="1.5"
          />
          {/* Deep Spool */}
          <rect
            x="24"
            y={isMonster ? '24' : '28'}
            width={isMonster ? '30' : '26'}
            height={isMonster ? '54' : '46'}
            rx="2"
            fill="#0D0F12"
            stroke="#CBD5E1"
            strokeWidth="1.4"
          />
          {/* Spool Lip & Gold/Blue Anodized Band */}
          <line
            x1="28"
            y1={isMonster ? '24' : '28'}
            x2="28"
            y2={isMonster ? '78' : '74'}
            stroke={accentStroke}
            strokeWidth="2.2"
          />
          <line
            x1="48"
            y1={isMonster ? '26' : '30'}
            x2="48"
            y2={isMonster ? '76' : '72'}
            stroke={accentStroke}
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          {/* Power Handle & Round Knob */}
          <line x1="88" y1="56" x2="132" y2="76" stroke="#CBD5E1" strokeWidth="2" />
          <circle
            cx="142"
            cy="80"
            r={isMonster ? '11' : '9'}
            fill="#171B22"
            stroke={accentStroke}
            strokeWidth="1.6"
          />
          {!compact && (
            <>
              <text
                x="130"
                y="24"
                fill="#94A3B8"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                #{item.specs.sizeClass}
              </text>
              <text
                x="130"
                y="36"
                fill="#00D2FF"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                {item.specs.retrieveCm}cm/rev
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
        className={`relative flex items-center justify-center bg-carbon-950 border border-carbon-700/80 overflow-hidden ${
          compact ? 'w-16 h-14' : 'w-full h-24'
        }`}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #2E3543 1px, transparent 1px), linear-gradient(to bottom, #2E3543 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />
        <svg
          viewBox="0 0 220 72"
          className="w-full h-full p-1.5"
          role="img"
          aria-label={`${item.brand} ${item.modelName} ロッド構造図`}
        >
          {/* Dimension line */}
          {!compact && (
            <>
              <line
                x1="12"
                y1="16"
                x2="208"
                y2="16"
                stroke="#475569"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              <text
                x="14"
                y="13"
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
              >
                LEN: {item.specs.lengthFtIn} ({item.specs.lengthCm}cm) / WT: {item.specs.weightG}g
              </text>
            </>
          )}
          {/* EVA Rear Grip &Reel Seat */}
          <rect x="10" y="38" width="44" height="7" rx="1.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
          <rect x="54" y="37" width="16" height="9" rx="1" fill="#0F172A" stroke={accentStroke} strokeWidth="1.2" />
          <rect x="70" y="38" width="24" height="6.5" rx="1" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
          {/* Tapered Carbon Blank */}
          <polygon
            points={
              isHeavyTuna
                ? '94,39 208,40.5 208,42.5 94,44'
                : '94,39.5 208,40.8 208,42.2 94,43.5'
            }
            fill="#CBD5E1"
          />
          {/* Ocean Guides (Double foot RV/MN guides) */}
          {[112, 138, 162, 184, 204].map((gx, idx) => (
            <g key={gx}>
              <path
                d={`M${gx - 3} 40 L${gx} ${31 + idx * 1.3} L${gx + 3} 40`}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.1"
              />
              <circle
                cx={gx}
                cy={30 + idx * 1.3}
                r={Math.max(1.8, 3.8 - idx * 0.45)}
                fill="none"
                stroke="#00D2FF"
                strokeWidth="1"
              />
            </g>
          ))}
          {!compact && (
            <text
              x="14"
              y="62"
              fill="#00D2FF"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
            >
              MAX PE {item.specs.maxPe} / DRAG MAX {item.specs.maxDragKg}kg (45°)
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
        className={`relative flex items-center justify-center bg-carbon-950 border border-carbon-700/80 overflow-hidden ${
          compact ? 'w-16 h-14' : 'w-full h-24'
        }`}
      >
        <svg
          viewBox="0 0 180 76"
          className="w-full h-full p-1.5"
          role="img"
          aria-label={`${item.brand} ${item.modelName} スプール図`}
        >
          <circle
            cx={compact ? '90' : '46'}
            cy="38"
            r="26"
            fill="#12151A"
            stroke={isPe ? '#00D2FF' : '#F59E0B'}
            strokeWidth="1.8"
          />
          <circle
            cx={compact ? '90' : '46'}
            cy="38"
            r="19"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          <circle cx={compact ? '90' : '46'} cy="38" r="9" fill="#08090B" stroke="#64748B" strokeWidth="1.2" />
          {!compact && (
            <>
              <text
                x="84"
                y="28"
                fill="#F8FAFC"
                fontSize="11"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {isPe ? `PE #${item.specs.peNumber}` : `LEADER ${item.specs.strengthLb}lb`}
              </text>
              <text
                x="84"
                y="43"
                fill="#00D2FF"
                fontSize="9.5"
                fontFamily="JetBrains Mono, monospace"
              >
                LEN: {item.specs.lengthM}m
              </text>
              <text
                x="84"
                y="57"
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
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
      className={`relative flex items-center justify-center bg-carbon-950 border border-carbon-700/80 overflow-hidden ${
        compact ? 'w-16 h-14' : 'w-full h-24'
      }`}
    >
      <svg
        viewBox="0 0 200 76"
        className="w-full h-full p-1.5"
        role="img"
        aria-label={`${item.brand} ${item.modelName} 構造図`}
      >
        {isPlug ? (
          <>
            {/* Diving Pencil / Popper Silhouette */}
            <path
              d="M24 38 C52 23, 128 24, 168 38 C128 50, 52 51, 24 38 Z"
              fill="#171B22"
              stroke="#00D2FF"
              strokeWidth="1.5"
            />
            {/* Lateral Line & Eye */}
            <line
              x1="34"
              y1="38"
              x2="160"
              y2="38"
              stroke="#475569"
              strokeWidth="0.9"
              strokeDasharray="3 2"
            />
            <circle cx="40" cy="35" r="2.8" fill="#00D2FF" />
            {/* Belly & Tail Eyelets + Hook Hang Indicators */}
            <circle cx="94" cy="47" r="2.2" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
            <circle cx="170" cy="38" r="2.2" fill="none" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M94 49 L94 60 L99 56" fill="none" stroke="#F59E0B" strokeWidth="1.3" />
            <path d="M170 40 L174 52 L178 48" fill="none" stroke="#F59E0B" strokeWidth="1.3" />
            {!compact && (
              <>
                <text
                  x="24"
                  y="16"
                  fill="#94A3B8"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {item.specs.lengthMm}mm / BODY {item.specs.weightG}g
                </text>
                <text
                  x="112"
                  y="66"
                  fill="#F59E0B"
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  REQ: {item.specs.hookCode.replace('CLASS_', '#').replace('_', '/')}
                </text>
              </>
            )}
          </>
        ) : (
          <>
            {/* Heavy Wire Hook & Split Ring Schematic */}
            <circle cx="52" cy="36" r="10" fill="none" stroke="#CBD5E1" strokeWidth="2.2" />
            <path
              d="M62 36 L98 36 C114 36, 118 58, 100 58 C88 58, 86 46, 94 43"
              fill="none"
              stroke="#00D2FF"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {!compact && (
              <>
                <text
                  x="24"
                  y="17"
                  fill="#F8FAFC"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  TOTAL METAL WT: {item.specs.weightG}g
                </text>
                <text
                  x="124"
                  y="42"
                  fill="#00D2FF"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
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
    <div className="mt-2 pt-2 border-t border-carbon-700/70">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
        <span>
          ロッド許容: {lureMinG}–{lureMaxG}g (最適 {lureSweetMinG}–{lureSweetMaxG}g)
        </span>
        <span
          className={
            isOut ? 'text-red-400 font-semibold' : isSweet ? 'text-electric font-semibold' : 'text-amber-300'
          }
        >
          針込 {totalLureWeightG}g
        </span>
      </div>
      <div className="relative h-2 bg-carbon-950 border border-carbon-700 overflow-hidden">
        {/* Allowed range */}
        <div
          className="absolute top-0 bottom-0 bg-slate-700/60"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        {/* Sweet spot range */}
        <div
          className="absolute top-0 bottom-0 bg-electric/30 border-x border-electric/60"
          style={{ left: `${sweetMinPct}%`, width: `${sweetMaxPct - sweetMinPct}%` }}
        />
        {/* Current Lure Weight Marker */}
        <div
          className={`absolute top-0 bottom-0 w-1.5 -ml-0.5 ${
            isOut ? 'bg-red-500' : isSweet ? 'bg-electric' : 'bg-amber-400'
          }`}
          style={{ left: `${currentPct}%` }}
        />
      </div>
    </div>
  );
};
