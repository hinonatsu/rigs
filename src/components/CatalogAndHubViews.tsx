import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Crosshair,
  Flame,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
  Waves,
  Zap,
} from 'lucide-react';
import {
  ALL_PARTS,
  RIG_PRESETS,
  TargetFishProfile,
  TargetId,
} from '../data/rigCatalog';

interface TargetSelectHomeViewProps {
  currentTargetId?: TargetId;
  onSelectTargetAndGoGarage: (targetId: TargetId) => void;
  onSelectTargetAndGoCheckout?: (targetId: TargetId) => void;
}

const DISPLAY_TITLE_MAP: Record<
  TargetId,
  {
    mainSpecies: string;
    subSpecies: string;
  }
> = {
  pe6: {
    mainSpecies: '近海ヒラマサ ＆ キハダ',
    subSpecies: 'ヒラマサ 10〜20kg / キハダ 20〜40kg',
  },
  pe8: {
    mainSpecies: '大型クロマグロ ＆ オオマサ',
    subSpecies: 'クロマグロ 40〜80kg / オオマサ 20〜30kg超',
  },
  pe10: {
    mainSpecies: '100kg超クロマグロ ＆ GT',
    subSpecies: 'モンスターマグロ 80〜150kg超 / 離島遠征GT',
  },
};

export const TargetSelectHomeView: React.FC<TargetSelectHomeViewProps> = ({
  currentTargetId,
  onSelectTargetAndGoGarage,
  onSelectTargetAndGoCheckout,
}) => {
  const [expandedMobileTargetId, setExpandedMobileTargetId] = useState<TargetId | null>(null);

  const toggleMobileDetails = (e: React.MouseEvent, targetId: TargetId) => {
    e.stopPropagation();
    setExpandedMobileTargetId((prev) => (prev === targetId ? null : targetId));
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col justify-between gap-8 sm:gap-10 py-2 sm:py-4 text-[#171A20]">
      {/* ==================== 上部：タイトル ＆ トラストシグナル（クリーン・ホワイトスタジオ） ==================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black/10 pb-6 shrink-0">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F4F4] text-[11px] font-oswald font-semibold tracking-[0.2em] text-[#3E6AE1]">
            <Crosshair className="w-3.5 h-3.5" />
            <span>SELECT TARGET MONSTER</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#171A20] leading-tight">
            ターゲット魚種・海域クラスを選択
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5E62] leading-relaxed">
            狙うターゲットを選択すると、物理計算済みの推奨ロッド＆リール構成がコンフィギュレーターにロードされます。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#5C5E62]">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4F4F4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3E6AE1]" />
            <span>100% 物理互換性検証済</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4F4F4]">
            <Lock className="w-3.5 h-3.5 text-[#3E6AE1]" />
            <span>Amazon公式 安全決済</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4F4F4]">
            <Truck className="w-3.5 h-3.5 text-[#3E6AE1]" />
            <span>全国送料無料対象</span>
          </span>
        </div>
      </div>

      {/* ==================== メイン：3つのターゲット選択カード（白＆ライトグレー基調） ==================== */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {RIG_PRESETS.map((target: TargetFishProfile, idx: number) => {
          const displayTitle = DISPLAY_TITLE_MAP[target.id];
          const isSelected = currentTargetId === target.id;
          const isMobileExpanded = expandedMobileTargetId === target.id;

          const pReel = ALL_PARTS.find((p) => p.id === target.rigIds.reel);
          const pRod = ALL_PARTS.find((p) => p.id === target.rigIds.rod);
          const pLine = ALL_PARTS.find((p) => p.id === target.rigIds.line);
          const pLure = ALL_PARTS.find((p) => p.id === target.rigIds.lure);
          const totalPrice =
            (pReel?.price ?? 0) +
            (pRod?.price ?? 0) +
            (pLine?.price ?? 0) +
            (pLure?.price ?? 0);

          return (
            <article
              key={target.id}
              onClick={() => onSelectTargetAndGoGarage(target.id)}
              role="button"
              tabIndex={0}
              aria-label={`${displayTitle.mainSpecies}（${target.badge}）を選択`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTargetAndGoGarage(target.id);
                }
              }}
              className={`group relative rounded-2xl bg-[#F4F4F4] overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-[#171A20] shadow-md'
                  : 'border border-black/5 hover:border-black/20'
              }`}
            >
              {/* 1. ビジュアルステージ */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-white">
                <img
                  src={target.heroImage}
                  alt={target.fishName}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-oswald font-bold text-[#171A20] tracking-wider shadow-sm">
                    CLASS 0{idx + 1} // {target.weightRange}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171A20]/90 text-white text-xs font-oswald font-semibold tracking-wider">
                    <Waves className="w-3.5 h-3.5 shrink-0 text-[#3E6AE1]" />
                    <span>{target.badge}</span>
                  </span>
                </div>

                <div className="absolute bottom-4 left-5 right-5 z-10 space-y-1 text-white">
                  <div className="text-xs font-medium text-white/85">
                    {displayTitle.subSpecies}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight leading-tight">
                    {displayTitle.mainSpecies}
                  </h2>
                  <div className="pt-0.5 flex items-center gap-1.5 text-xs text-white/80">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{target.field}</span>
                  </div>
                </div>
              </div>

              {/* 2. カード下部：スペック要約・価格・CTA */}
              <div className="p-6 bg-[#F4F4F4] space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* 推奨ロッド×リール表示 */}
                  <div className="rounded-xl bg-white p-3.5 border border-black/5 space-y-1">
                    <div className="text-[10px] font-oswald tracking-wider text-[#5C5E62] uppercase">
                      STANDARD RECOMMENDED SETUP
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#171A20] truncate">
                      {pRod?.shortName} × {pReel?.shortName}
                    </div>
                    <div className="text-[11px] text-[#5C5E62] truncate">
                      {pLine?.shortName} ・ {pLure?.shortName}
                    </div>
                  </div>

                  {/* 3大数値 */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white p-2.5 border border-black/5">
                      <div className="text-[10px] text-[#5C5E62] flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-[#3E6AE1]" />
                        <span>初動時速</span>
                      </div>
                      <div className="text-sm font-oswald font-bold text-[#171A20] mt-0.5">
                        {target.strikeSpeedKmh}km/h
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-black/5">
                      <div className="text-[10px] text-[#5C5E62] flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-[#3E6AE1]" />
                        <span>初動負荷</span>
                      </div>
                      <div className="text-sm font-oswald font-bold text-[#3E6AE1] mt-0.5">
                        {target.initialRunLoadKg}kg
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-black/5">
                      <div className="text-[10px] text-[#5C5E62] flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 text-[#3E6AE1]" />
                        <span>1日投数</span>
                      </div>
                      <div className="text-sm font-oswald font-bold text-[#171A20] mt-0.5">
                        {target.dailyCastCount}投
                      </div>
                    </div>
                  </div>

                  {/* モバイル用詳細展開 */}
                  <div className="lg:hidden">
                    <button
                      type="button"
                      onClick={(e) => toggleMobileDetails(e, target.id)}
                      aria-expanded={isMobileExpanded}
                      className="w-full py-2 px-3.5 rounded-xl bg-white border border-black/5 text-xs font-medium text-[#5C5E62] flex items-center justify-between"
                    >
                      <span>ターゲットの習性・ベイトを見る</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isMobileExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isMobileExpanded && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 p-3.5 rounded-xl bg-white text-xs text-[#393C41] leading-relaxed"
                      >
                        {target.fishHabit}（主なベイト: {target.baitSizeMm}）
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-black/10">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium text-[#5C5E62]">
                      推奨4点フルセット価格
                    </span>
                    <span className="font-oswald font-bold text-2xl text-[#171A20] tabular-nums">
                      ¥{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTargetAndGoGarage(target.id);
                      }}
                      className="w-full py-3.5 px-5 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white font-semibold text-sm transition-colors flex items-center justify-between"
                    >
                      <span>このクラスでロッド＆リールを選ぶ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {onSelectTargetAndGoCheckout && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTargetAndGoCheckout(target.id);
                        }}
                        className="w-full py-2.5 px-4 rounded-md bg-white hover:bg-[#EAEAEA] text-xs font-medium text-[#171A20] transition-colors text-center"
                      >
                        推奨セットのまま注文確認へ進む
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
