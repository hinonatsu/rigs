import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Crosshair,
  Fish,
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
  const [hoveredTargetId, setHoveredTargetId] = useState<TargetId | null>(null);
  const [expandedMobileTargetId, setExpandedMobileTargetId] = useState<TargetId | null>(null);

  const activeAmbientTarget =
    RIG_PRESETS.find((t) => t.id === (hoveredTargetId ?? currentTargetId)) ?? RIG_PRESETS[0];

  const toggleMobileDetails = (e: React.MouseEvent, targetId: TargetId) => {
    e.stopPropagation();
    setExpandedMobileTargetId((prev) => (prev === targetId ? null : targetId));
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col justify-between gap-8 sm:gap-10 py-4 sm:py-6">
      {/* ==================== 背景アンビエント水中フォトレイヤー ==================== */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700 ${
          hoveredTargetId ? 'opacity-25' : 'opacity-10'
        }`}
      >
        <img
          src={activeAmbientTarget.heroImage}
          alt=""
          className="w-full h-full object-cover scale-110 blur-3xl transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#151515] via-[#151515]/85 to-[#151515]" />
      </div>

      {/* ==================== 上部：STEP 01 タイトル ＆ トラストシグナル（Apple的余白） ==================== */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-6 shrink-0">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[11px] font-oswald font-semibold tracking-[0.2em] text-[#00E5FF]">
            <Crosshair className="w-3.5 h-3.5 animate-pulse" />
            <span>STEP 01 // SELECT TARGET MONSTER</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-white leading-tight">
            どのモンスターを釣りに行きますか？
          </h1>
          <p className="text-xs sm:text-sm font-light text-white/60 leading-relaxed">
            ターゲットを選択するだけで、物理計算済みの推奨4点フルセットが即時ロードされます。
          </p>
        </div>

        {/* 高額決済の安心感を醸成するトラストバー */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-light text-white/70">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#222222]/80 backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>100% 物理互換性検証済</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#222222]/80 backdrop-blur-md border border-white/10">
            <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Secure Checkout (Amazon公式)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#222222]/80 backdrop-blur-md border border-white/10">
            <Truck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>全国送料無料対象</span>
          </span>
        </div>
      </div>

      {/* ==================== メイン：3つのターゲット選択 Bento Grid ==================== */}
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
              onMouseEnter={() => setHoveredTargetId(target.id)}
              onMouseLeave={() => setHoveredTargetId(null)}
              role="button"
              tabIndex={0}
              aria-label={`${displayTitle.mainSpecies}（${target.badge}）を選択`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTargetAndGoGarage(target.id);
                }
              }}
              className={`group relative rounded-2xl bg-[#222222]/85 backdrop-blur-xl overflow-hidden cursor-pointer border transition-all duration-300 ease-out hover:scale-[1.02] flex flex-col justify-between ${
                isSelected
                  ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'border-white/10 hover:border-[#00E5FF]/80 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]'
              }`}
            >
              {/* 1. ビジュアルステージ（最小限のコア情報のみ常時表示） */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#151515]">
                <img
                  src={target.heroImage}
                  alt={target.fishName}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#151515]/50 to-black/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.25),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 上部バッジ（Oswald フォントで力強く） */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 z-20">
                  <span className="px-3.5 py-1 rounded-full bg-[#151515]/85 backdrop-blur-md border border-white/20 text-xs font-oswald font-semibold text-white tracking-wider">
                    LV.0{idx + 1} // {target.weightRange}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#151515]/90 backdrop-blur-md border border-[#00E5FF] text-[#00E5FF] text-xs font-oswald font-semibold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                    <Waves className="w-3.5 h-3.5 shrink-0" />
                    <span>{target.badge}</span>
                  </span>
                </div>

                {/* 【プログレッシブ・ディスクロージャー】PCホバー時のみ表示される実戦負荷テレメトリ */}
                <div
                  aria-hidden="true"
                  className="hidden lg:flex absolute inset-x-5 top-16 z-20 rounded-xl bg-[#151515]/95 backdrop-blur-xl border border-[#00E5FF]/50 p-4 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2">
                    <span className="font-oswald font-semibold text-[#00E5FF] tracking-widest">
                      COMBAT TELEMETRY
                    </span>
                    <span className="text-white/60 font-light">
                      {target.waterDepthText.split('//')[0]}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#222222] p-2.5 border border-white/10">
                      <div className="text-[10px] text-white/60 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-[#00E5FF]" />
                        <span>初動時速</span>
                      </div>
                      <div className="text-base font-oswald font-bold text-white mt-0.5 tabular-nums">
                        {target.strikeSpeedKmh}km/h
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#222222] p-2.5 border border-[#00E5FF]/40">
                      <div className="text-[10px] text-white/60 flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-[#00E5FF]" />
                        <span>初動負荷</span>
                      </div>
                      <div className="text-base font-oswald font-bold text-[#00E5FF] mt-0.5 tabular-nums">
                        {target.initialRunLoadKg}kg
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#222222] p-2.5 border border-white/10">
                      <div className="text-[10px] text-white/60 flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3 text-[#00E5FF]" />
                        <span>1日投数</span>
                      </div>
                      <div className="text-base font-oswald font-bold text-white mt-0.5 tabular-nums">
                        {target.dailyCastCount}投
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/90 bg-[#222222] rounded-lg px-3 py-2 border border-white/10">
                    <Fish className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                    <span className="text-white/60 shrink-0">ベイト:</span>
                    <span className="font-light text-[#00E5FF] truncate">{target.baitSizeMm}</span>
                  </div>
                </div>

                {/* 下部タイトルエリア（長文を排除し、魚種とフィールドのみを洗練表示） */}
                <div className="absolute bottom-5 left-6 right-6 z-10 space-y-1.5">
                  <div className="text-xs font-light text-[#00E5FF] tracking-wide">
                    {displayTitle.subSpecies}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-[#00E5FF] transition-colors tracking-tight leading-tight">
                    {displayTitle.mainSpecies}
                  </h2>
                  <div className="pt-1 flex items-center gap-1.5 text-xs font-light text-white/75">
                    <MapPin className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                    <span className="truncate">{target.field}</span>
                  </div>
                </div>
              </div>

              {/* 2. カード下部：Oswald 価格表示 ＆ 明確に分離された Primary / Secondary CTA */}
              <div className="p-6 bg-[#222222] space-y-5">
                <div className="flex items-baseline justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-light text-white/60 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span>推奨4点フルセット参考価格</span>
                  </span>
                  <span className="font-oswald font-bold text-2xl text-white tracking-tight tabular-nums">
                    ¥{totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* モバイル用：段階的開示アコーディオン */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={(e) => toggleMobileDetails(e, target.id)}
                    aria-expanded={isMobileExpanded}
                    className="w-full py-2 px-3.5 rounded-xl bg-[#151515] border border-white/10 text-xs font-light text-white/70 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>実戦テレメトリ（時速・負荷）を表示</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#00E5FF] transition-transform duration-200 ${
                        isMobileExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMobileExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 p-3.5 rounded-xl bg-[#151515] border border-[#00E5FF]/40 grid grid-cols-3 gap-2 text-center"
                    >
                      <div className="rounded-lg bg-[#222222] p-2">
                        <div className="text-[10px] text-white/60">初動時速</div>
                        <div className="text-sm font-oswald font-bold text-white mt-0.5">
                          {target.strikeSpeedKmh}km/h
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#222222] p-2">
                        <div className="text-[10px] text-white/60">初動負荷</div>
                        <div className="text-sm font-oswald font-bold text-[#00E5FF] mt-0.5">
                          {target.initialRunLoadKg}kg
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#222222] p-2">
                        <div className="text-[10px] text-white/60">1日投数</div>
                        <div className="text-sm font-oswald font-bold text-white mt-0.5">
                          {target.dailyCastCount}投
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary CTA（塗りつぶし・発光・物理スケール）と Secondary CTA（アウトライン）の階層分離 */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTargetAndGoGarage(target.id);
                    }}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#00E5FF] text-[#151515] font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 ease-out hover:scale-105 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-oswald text-[11px] font-bold tracking-[0.18em] uppercase leading-none opacity-80">
                        CONFIGURE LOADOUT
                      </span>
                      <span className="text-sm font-bold tracking-wide mt-1 leading-none">
                        このターゲットで装備を組む
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 stroke-[2.5] shrink-0" />
                  </button>

                  {onSelectTargetAndGoCheckout && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTargetAndGoCheckout(target.id);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-transparent border border-white/15 hover:border-white/40 text-xs font-light text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>推奨セットのまま購入確認へスキップ</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
