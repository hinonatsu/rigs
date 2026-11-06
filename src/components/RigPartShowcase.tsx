import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AnyRigPart, RigState, TargetFishProfile } from '../data/rigCatalog';

interface RigPartShowcaseProps {
  part: AnyRigPart;
  isSelected?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'checkout' | 'swatch';
}

const LOCAL_FALLBACK_MAP: Record<string, string> = {
  'reel-stella-14000xg': './images/gear/reel-stella-14000xg.jpg',
  'reel-saltiga-14000xh': './images/gear/reel-saltiga-14000xh.jpg',
  'reel-stella-18000hg': './images/gear/reel-stella-18000hg.jpg',
  'reel-saltiga-20000h': './images/gear/reel-saltiga-20000h.jpg',
  'rod-aquila-82-36': './images/gear/rod-aquila-82-36.jpg',
  'rod-explosion-865hf': './images/gear/rod-explosion-865hf.jpg',
  'rod-ultimo-83m': './images/gear/rod-ultimo-83m.jpg',
  'rod-bigtuna-83': './images/gear/rod-bigtuna-83.jpg',
  'line-varivas-smp-pe6': './images/gear/line-varivas-smp-pe6.jpg',
  'line-ygk-oddport-pe8': './images/gear/line-ygk-oddport-pe8.jpg',
  'line-varivas-six-pe10': './images/gear/line-varivas-six-pe10.jpg',
  'lure-cbone-ryan-200': './images/gear/lure-cbone-ryan-200.jpg',
  'lure-carpenter-gamma-90': './images/gear/lure-carpenter-gamma-90.jpg',
  'lure-cbone-bazoo-200': './images/gear/lure-cbone-bazoo-200.jpg',
  'lure-cbone-zorro-240': './images/gear/lure-cbone-zorro-240.jpg',
};

export function resolvePartStudioImage(part: AnyRigPart, useFallback = false): string {
  if (useFallback && LOCAL_FALLBACK_MAP[part.id]) {
    return LOCAL_FALLBACK_MAP[part.id];
  }
  return part.image || LOCAL_FALLBACK_MAP[part.id] || '';
}

/**
 * Tesla スタイルのクリーンな白スタジオ背景を活かしたプロダクト・ショーケース
 * 白背景スタジオ写真に mix-blend-multiply を適用し、金属光沢・シルバー・ホログラムを損なわずに背景へ溶け込ませる
 */
export const RigPartShowcase: React.FC<RigPartShowcaseProps> = ({
  part,
  isSelected = false,
  size = 'md',
}) => {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [part.id, part.image]);

  const imgSrc = resolvePartStudioImage(part, useFallback);

  if (size === 'swatch') {
    return (
      <div className="relative w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center p-1.5 shadow-inner border border-black/5">
        <img
          src={imgSrc}
          alt={part.shortName}
          loading="lazy"
          onError={() => {
            if (!useFallback) setUseFallback(true);
          }}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    );
  }

  const sizeClass =
    size === 'xs'
      ? 'w-14 h-14 p-1.5 shrink-0 rounded-xl'
      : size === 'sm'
      ? 'w-20 h-20 p-2 shrink-0 rounded-xl'
      : size === 'checkout'
      ? 'w-24 h-24 sm:w-28 sm:h-28 p-2.5 shrink-0 rounded-2xl'
      : size === 'lg'
      ? 'w-full h-52 sm:h-64 p-5 rounded-2xl'
      : 'w-full h-36 sm:h-40 p-3.5 rounded-xl';

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center transition-all duration-300 bg-white ${sizeClass} ${
        isSelected ? 'border border-[#171A20]/15 shadow-sm' : 'border border-black/5'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 50%, #FFFFFF 65%, #F6F7F9 100%)',
      }}
    >
      <img
        src={imgSrc}
        alt={part.name}
        loading="lazy"
        onError={() => {
          if (!useFallback) setUseFallback(true);
        }}
        className="relative z-10 w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
      />
    </div>
  );
};

// ============================================================================
// Tesla Model 3 風 メイン・スタジオ・コンフィギュレーター・ステージ（白スタジオ統一）
// （引き出し線＋[＋]コールアウト ＆ 下部 < ● ○ ○ ○ ○ > カルーセル搭載）
// ============================================================================

interface TeslaHeroConfiguratorStageProps {
  rig: RigState;
  target: TargetFishProfile;
  activeSlide: number;
  onChangeSlide: (slideIndex: number) => void;
  onOpenFeatureModal: (featureIndex?: number) => void;
  isAllCompatible: boolean;
}

export const TeslaHeroConfiguratorStage: React.FC<TeslaHeroConfiguratorStageProps> = ({
  rig,
  target,
  activeSlide,
  onChangeSlide,
  onOpenFeatureModal,
  isAllCompatible,
}) => {
  const [rodFallback, setRodFallback] = useState(false);
  const [reelFallback, setReelFallback] = useState(false);
  const [lineFallback, setLineFallback] = useState(false);
  const [lureFallback, setLureFallback] = useState(false);

  const reel = rig.reel!;
  const rod = rig.rod!;
  const line = rig.line!;
  const lure = rig.lure!;

  useEffect(() => {
    setRodFallback(false);
  }, [rod.id]);

  useEffect(() => {
    setReelFallback(false);
  }, [reel.id]);

  useEffect(() => {
    setLineFallback(false);
  }, [line.id]);

  useEffect(() => {
    setLureFallback(false);
  }, [lure.id]);

  const totalSlides = 5;
  const slideLabels = [
    'ロッド × リール 統合ビュー',
    `リール単体 (${reel.shortName})`,
    `ロッド単体 (${rod.shortName})`,
    'ライン ＆ ルアー 構成',
    `ターゲット (${target.fishName.split(' ')[0]})`,
  ];

  const handlePrev = () => {
    onChangeSlide((activeSlide - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    onChangeSlide((activeSlide + 1) % totalSlides);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none bg-white text-[#171A20]">
      {/* 上部微細ステータスラベル（PCのみ控えめに表示） */}
      <div className="hidden sm:flex items-center justify-between px-6 pt-4 z-20">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-medium tracking-widest uppercase px-3 py-1 rounded-full bg-[#F4F4F4] text-[#5C5E62]">
            {slideLabels[activeSlide]}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${
              isAllCompatible
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isAllCompatible ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>物理バランス100%適合</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>番手バランス要確認</span>
              </>
            )}
          </span>
        </div>

        {/* スライドクイックピル */}
        <div className="flex items-center gap-1.5">
          {(['SET', 'REEL', 'ROD', 'RIG', 'FISH'] as const).map((tab, idx) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeSlide(idx)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-oswald tracking-wider transition-all ${
                activeSlide === idx
                  ? 'bg-[#171A20] text-white font-semibold'
                  : 'text-[#5C5E62] hover:bg-[#F4F4F4]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================
          中央：巨大スタジオ・フォトキャンバス ＋ Tesla風「引き出し線＋[＋]」コールアウト
         ================================================================= */}
      <div className="relative flex-1 min-h-[270px] sm:min-h-[440px] lg:min-h-[520px] w-full flex items-center justify-center px-4 sm:px-10 py-2 overflow-hidden">
        <div
          className="relative w-full max-w-[920px] h-full min-h-[250px] sm:min-h-[400px] lg:min-h-[470px] rounded-3xl flex items-center justify-center bg-white"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, #FFFFFF 75%, #F8F9FA 100%)',
          }}
        >
          {/* ---------------- SLIDE 0: ロッド × リール 統合スタジオビュー ---------------- */}
          {activeSlide === 0 && (
            <div className="relative w-full h-full flex items-center justify-center py-6 sm:py-12">
              {/* Tesla風 コールアウト1（左上：ロッド特性） */}
              <div className="hidden sm:flex flex-col items-start absolute top-6 left-[8%] lg:left-[10%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(0)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    {rod.propertyTags[0] || `${rod.lengthFt} 高反発ブランクス`}
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-sm border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
                <div className="w-[1px] h-14 lg:h-20 bg-[#D0D1D2] ml-1 mt-1" />
              </div>

              {/* Tesla風 コールアウト2（右上：リール最大ドラグ＆機構） */}
              <div className="hidden sm:flex flex-col items-start absolute top-6 right-[8%] lg:right-[12%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(1)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    最大ドラグ {reel.dragMaxKg}kg・{reel.propertyTags[0]}
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-sm border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
                <div className="w-[1px] h-12 lg:h-16 bg-[#D0D1D2] ml-1 mt-1" />
              </div>

              {/* メイン・デュアルフォトコンポジット（左〜中央：ロッド、中央〜右：大型リール） */}
              <div className="relative z-10 w-full max-w-[780px] h-[220px] sm:h-[320px] lg:h-[370px] flex items-center justify-center">
                <div
                  onClick={() => onChangeSlide(2)}
                  title="クリックしてロッド単体を拡大"
                  className="w-[58%] sm:w-[60%] h-full flex items-center justify-center cursor-pointer group -mr-8 sm:-mr-14 z-10"
                >
                  <img
                    src={resolvePartStudioImage(rod, rodFallback)}
                    alt={rod.name}
                    onError={() => {
                      if (!rodFallback) setRodFallback(true);
                    }}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div
                  onClick={() => onChangeSlide(1)}
                  title="クリックしてリール単体を拡大"
                  className="w-[52%] sm:w-[50%] h-[92%] flex items-center justify-center cursor-pointer group z-20"
                >
                  <img
                    src={resolvePartStudioImage(reel, reelFallback)}
                    alt={reel.name}
                    onError={() => {
                      if (!reelFallback) setReelFallback(true);
                    }}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Tesla風 コールアウト3（左下：適合ルアー＆ドラグ耐荷重） */}
              <div className="hidden sm:flex flex-col items-start absolute bottom-5 left-[10%] lg:left-[14%] z-30">
                <div className="w-[1px] h-10 lg:h-14 bg-[#D0D1D2] ml-1 mb-1.5" />
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(2)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    適合ルアー MAX {rod.lureMaxG}g (耐荷重 {rod.dragMaxKg}kg)
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-sm border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
              </div>

              {/* Tesla風 コールアウト4（右下：巻上スピード＆スプール糸巻量） */}
              <div className="hidden sm:flex flex-col items-start absolute bottom-5 right-[8%] lg:right-[12%] z-30">
                <div className="w-[1px] h-10 lg:h-14 bg-[#D0D1D2] ml-1 mb-1.5" />
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(3)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    1回転 {reel.retrieveCm}cm・PE{reel.peCapacityNum}号-{reel.peCapacityMeter}m
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-sm border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SLIDE 1: リール単体 スタジオ・クローズアップ ---------------- */}
          {activeSlide === 1 && (
            <div className="relative w-full h-full flex items-center justify-center py-6 sm:py-10">
              <div className="hidden sm:flex flex-col items-start absolute top-6 left-[12%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(1)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    PE{reel.peCapacityNum}号-{reel.peCapacityMeter}m フル格納スプール
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="w-[1px] h-16 bg-[#D0D1D2] ml-1 mt-1" />
              </div>

              <div className="hidden sm:flex flex-col items-start absolute top-6 right-[12%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(1)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    {reel.propertyTags[0]} (自重 {reel.weightG}g)
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="w-[1px] h-16 bg-[#D0D1D2] ml-1 mt-1" />
              </div>

              <div className="w-[240px] sm:w-[360px] lg:w-[420px] h-[220px] sm:h-[320px] lg:h-[370px] flex items-center justify-center">
                <img
                  src={resolvePartStudioImage(reel, reelFallback)}
                  alt={reel.name}
                  onError={() => {
                    if (!reelFallback) setReelFallback(true);
                  }}
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-500"
                />
              </div>

              <div className="hidden sm:flex flex-col items-start absolute bottom-6 left-[15%] z-30">
                <div className="w-[1px] h-12 bg-[#D0D1D2] ml-1 mb-1" />
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(1)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    最大ドラグ力 {reel.dragMaxKg}kg (実用 {reel.practicalDragKg}kg)
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex flex-col items-start absolute bottom-6 right-[14%] z-30">
                <div className="w-[1px] h-12 bg-[#D0D1D2] ml-1 mb-1" />
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(3)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    ギア比 {reel.gearRatio} 高速回収
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SLIDE 2: ロッド単体 スタジオ・クローズアップ ---------------- */}
          {activeSlide === 2 && (
            <div className="relative w-full h-full flex items-center justify-center py-6 sm:py-10">
              <div className="hidden sm:flex flex-col items-start absolute top-6 left-[12%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(0)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    全長 {rod.lengthFt} (自重 {rod.weightG}g)
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="w-[1px] h-16 bg-[#D0D1D2] ml-1 mt-1" />
              </div>

              <div className="hidden sm:flex flex-col items-start absolute top-6 right-[12%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(2)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    適合ルアー {rod.lureMinG}〜{rod.lureMaxG}g
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
                <div className="w-[1px] h-16 bg-[#D0D1D2] ml-1 mt-1" />
              </div>

              <div className="w-[280px] sm:w-[460px] lg:w-[540px] h-[220px] sm:h-[320px] lg:h-[370px] flex items-center justify-center">
                <img
                  src={resolvePartStudioImage(rod, rodFallback)}
                  alt={rod.name}
                  onError={() => {
                    if (!rodFallback) setRodFallback(true);
                  }}
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-500"
                />
              </div>

              <div className="hidden sm:flex flex-col items-start absolute bottom-6 left-[14%] z-30">
                <div className="w-[1px] h-12 bg-[#D0D1D2] ml-1 mb-1" />
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(0)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    最大ドラグ負荷 {rod.dragMaxKg}kg (45°)
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              <div className="hidden sm:flex flex-col items-start absolute bottom-6 right-[14%] z-30">
                <div className="w-[1px] h-12 bg-[#D0D1D2] ml-1 mb-1" />
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(2)}
                  className="group flex items-center gap-2 text-left"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41]">
                    適合ライン PE {rod.minPe}〜{rod.maxPe}号
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] text-[#171A20] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SLIDE 3: ライン ＆ ルアー ペアビュー ---------------- */}
          {activeSlide === 3 && (
            <div className="relative w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-6 px-6">
              <div className="flex flex-col items-center text-center max-w-[260px]">
                <div className="w-36 h-36 sm:w-52 sm:h-52 flex items-center justify-center">
                  <img
                    src={resolvePartStudioImage(line, lineFallback)}
                    alt={line.name}
                    onError={() => {
                      if (!lineFallback) setLineFallback(true);
                    }}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <span className="text-[11px] font-oswald tracking-widest text-[#5C5E62] uppercase mt-2">
                  PE LINE & SHOCK LEADER
                </span>
                <div className="text-sm font-semibold text-[#171A20] mt-0.5">
                  {line.shortName}
                </div>
                <div className="text-xs text-[#5C5E62] mt-0.5">
                  ＋ {line.pairedLeaderSpec}
                </div>
              </div>

              <div className="hidden sm:block w-[1px] h-48 bg-black/10" />

              <div className="flex flex-col items-center text-center max-w-[280px]">
                <div className="w-40 h-36 sm:w-60 sm:h-52 flex items-center justify-center">
                  <img
                    src={resolvePartStudioImage(lure, lureFallback)}
                    alt={lure.name}
                    onError={() => {
                      if (!lureFallback) setLureFallback(true);
                    }}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <span className="text-[11px] font-oswald tracking-widest text-[#5C5E62] uppercase mt-2">
                  OFFSHORE PLUG & HOOK
                </span>
                <div className="text-sm font-semibold text-[#171A20] mt-0.5">
                  {lure.shortName}
                </div>
                <div className="text-xs text-[#5C5E62] mt-0.5">
                  本体 {lure.bodyWeightG}g ＋ {lure.hookSpec} (+{lure.hookRingWeightG}g)
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SLIDE 4: ターゲット魚 ＆ 実戦海域 ---------------- */}
          {activeSlide === 4 && (
            <div className="relative w-full h-full min-h-[240px] sm:min-h-[380px] rounded-2xl overflow-hidden m-3 sm:m-6">
              <img
                src={target.heroImage}
                alt={target.fishName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-oswald tracking-wider">
                  {target.badge} // MAX {target.initialRunLoadKg}kg LOAD
                </span>
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                  {target.fishName}
                </h3>
                <p className="text-xs sm:text-sm text-white/85 max-w-2xl leading-relaxed">
                  {target.fishHabit}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================
          下部：Tesla Model 3 スタイル カルーセルコントロール (< ● ○ ○ ○ ○ >)
         ================================================================= */}
      <div className="relative z-20 px-6 pb-3 sm:pb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenFeatureModal(0)}
          title="機能・物理適合テレメトリーを表示"
          className="hidden sm:flex w-10 h-9 rounded-md items-center justify-center transition-colors bg-[#8E8E93]/80 hover:bg-[#171A20] text-white"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        <div className="mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="前のスライド"
            className="w-9 h-9 rounded-md flex items-center justify-center transition-colors bg-[#F4F4F4] hover:bg-[#E5E5E5] text-[#171A20]"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <div className="h-9 px-4 rounded-md flex items-center gap-2.5 bg-[#F4F4F4]">
            {Array.from({ length: totalSlides }).map((_, idx) => {
              const isCurrent = activeSlide === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangeSlide(idx)}
                  aria-label={`スライド ${idx + 1}: ${slideLabels[idx]}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    isCurrent
                      ? 'bg-[#171A20] scale-110'
                      : 'bg-[#B5B6B8] hover:bg-[#757678]'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="次のスライド"
            className="w-9 h-9 rounded-md flex items-center justify-center transition-colors bg-[#F4F4F4] hover:bg-[#E5E5E5] text-[#171A20]"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        <div className="hidden sm:block w-10" />
      </div>
    </div>
  );
};
