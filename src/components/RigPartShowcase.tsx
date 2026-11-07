import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { AnyRigPart, RigState, TargetFishProfile, TargetId } from '../data/rigCatalog';

interface RigPartShowcaseProps {
  part: AnyRigPart;
  isSelected?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'wide' | 'checkout' | 'swatch';
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
 * 各パーツ画像のスタジオ背景オフホワイト値（RGB 240〜254）を純白 #FFFFFF へ正規化し、
 * カードやステージ上でグレーの四角い境界線が一切出ないようにするフィルター設定
 */
export function getPartStudioFilter(partOrCategory: AnyRigPart | AnyRigPart['category']): string {
  const category =
    typeof partOrCategory === 'string' ? partOrCategory : partOrCategory.category;
  switch (category) {
    case 'reel':
      // Saltiga 14000XH / 20000H, Stella 18000HG の RGB(240-245) 背景を純白へ飛ばしつつ金属コントラストを強調
      return 'contrast(1.09) brightness(1.05)';
    case 'lure':
      // Ryan / Bazoo / Zorro の RGB(246-251) 背景および Gamma 90 の微細内枠を純白へ統一
      return 'contrast(1.06) brightness(1.035)';
    case 'line':
      return 'contrast(1.04) brightness(1.025)';
    case 'rod':
      return 'contrast(1.03) brightness(1.015)';
  }
}

/**
 * ロッド画像（右端 x=1.00 でブランクスが切れているスタジオ素材）をオープンステージ上で
 * 自然にフェードさせ、空中で垂直にスパッと切れて見える現象を防ぐマスクスタイル
 */
export const ROD_OPEN_STAGE_MASK_STYLE: React.CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 82%, transparent 99.5%)',
  maskImage: 'linear-gradient(to right, #000 0%, #000 82%, transparent 99.5%)',
};

/**
 * 魚種ビジュアル（1376x768 = 16:9）の被写体位置（頭部・目・水飛沫）に合わせた最適フォーカルポイント
 */
export function getFishFocalPosition(
  targetOrUrl: TargetId | string,
  variant: 'hero' | 'card' | 'banner' | 'stage' = 'card'
): string {
  const key = targetOrUrl.toLowerCase();
  if (key === 'pe6' || key.includes('hiramasa')) {
    // 左下の主役ヒラマサ＆右中段のキハダの両方が収まり、上部の空波を減らす位置
    return variant === 'hero' ? '50% 64%' : '48% 66%';
  }
  if (key === 'pe8' || key.includes('bluefin')) {
    // 右上へ突き上げるクロマグロの精悍な頭部・目・太陽光線を確実に捉える位置（頭切れ・吻先切れ防止）
    return variant === 'hero' ? '66% 30%' : variant === 'banner' ? '66% 30%' : '68% 32%';
  }
  if (key === 'pe10' || key.includes('monster')) {
    // 左右で並び跳躍する100kg超マグロ＆GTの全身と黄金の水飛沫を上中段に収め、下部暗水に文字を載せる位置
    return variant === 'hero' ? '50% 34%' : '50% 35%';
  }
  if (key.includes('sub-gt')) {
    return '52% 46%';
  }
  if (key.includes('sub-kihada')) {
    return '50% 48%';
  }
  return '50% 50%';
}

/**
 * クリーンな純白スタジオ背景を活かしたプロダクト・ショーケース
 * 白レベル正規化フィルタ＋mix-blend-multiply により、背景との境界線を完全にゼロ化
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
  const studioFilter = getPartStudioFilter(part);

  if (size === 'swatch') {
    return (
      <div className="relative w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center p-1.5 border border-black/10">
        <img
          src={imgSrc}
          alt={part.shortName}
          loading="lazy"
          onError={() => {
            if (!useFallback) setUseFallback(true);
          }}
          style={{ filter: studioFilter }}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    );
  }

  // 横長プラグ（ルアー）の造形・ホログラムを大きく鮮明に見せるワイドスタジオ枠
  if (size === 'wide') {
    return (
      <div
        className={`relative w-full aspect-[1.85/1] rounded-xl overflow-hidden flex items-center justify-center bg-white transition-all duration-300 ${
          isSelected ? 'border border-[#171A20]/15' : 'border border-black/[0.06]'
        }`}
      >
        <img
          src={imgSrc}
          alt={part.name}
          loading="lazy"
          onError={() => {
            if (!useFallback) setUseFallback(true);
          }}
          style={{ filter: studioFilter }}
          className={`relative z-10 w-full h-full mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105 ${
            part.category === 'lure'
              ? 'object-cover object-[50%_52%] px-1'
              : 'object-contain p-2'
          }`}
        />
      </div>
    );
  }

  const isRod = part.category === 'rod';
  const isLure = part.category === 'lure';

  const sizeClass =
    size === 'xs'
      ? `w-14 h-14 ${isRod ? 'pl-1.5 pr-0 py-1' : 'p-1'} shrink-0 rounded-xl`
      : size === 'sm'
      ? `w-20 h-20 ${isRod ? 'pl-2 pr-0 py-1.5' : isLure ? 'px-1 py-1.5' : 'p-1.5'} shrink-0 rounded-xl`
      : size === 'checkout'
      ? `w-24 h-24 sm:w-32 sm:h-28 ${
          isRod ? 'pl-2.5 pr-0 py-2' : isLure ? 'px-1.5 py-2' : 'p-2'
        } shrink-0 rounded-2xl`
      : size === 'lg'
      ? `w-full h-52 sm:h-64 ${isRod ? 'pl-5 pr-0 py-4' : 'p-4'} rounded-2xl`
      : `w-full h-36 sm:h-40 ${
          isRod ? 'pl-3 pr-0 py-2.5' : isLure ? 'px-2 py-2.5' : 'p-2.5'
        } rounded-xl`;

  // チェックアウト枠は横長比率（sm: 128x112）のため、ルアーを大きく見せつつ左右切れを防ぐ
  const imgFitClass = isRod
    ? 'w-full h-full object-contain object-right scale-[1.08] translate-x-[2%] group-hover:scale-[1.13]'
    : isLure
    ? 'w-full h-full object-contain scale-[1.06] group-hover:scale-[1.12]'
    : 'w-full h-full object-contain scale-[1.04] group-hover:scale-[1.09]';

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center transition-all duration-300 bg-white ${sizeClass} ${
        isSelected ? 'border border-[#171A20]/15 shadow-xs' : 'border border-black/[0.06]'
      }`}
    >
      <img
        src={imgSrc}
        alt={part.name}
        loading="lazy"
        onError={() => {
          if (!useFallback) setUseFallback(true);
        }}
        style={{ filter: studioFilter }}
        className={`relative z-10 mix-blend-multiply transition-transform duration-500 ease-out ${imgFitClass}`}
      />
    </div>
  );
};

// ============================================================================
// メイン・スタジオ・コンフィギュレーター・ステージ（純白スタジオ統一）
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
  const [fishGalleryIdx, setFishGalleryIdx] = useState(0);

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

  useEffect(() => {
    setFishGalleryIdx(0);
  }, [target.id]);

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

  const activeFishMedia = target.gallery[fishGalleryIdx] ?? {
    url: target.heroImage,
    label: target.fishName,
    tag: 'MAIN TARGET',
    caption: target.fishHabit,
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none bg-white text-[#171A20]">
      {/* 上部ステータスラベル＆スライド切替タブ（モバイル・PC両対応） */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 pt-3 sm:pt-4 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden md:inline-block text-[11px] font-medium tracking-wider uppercase px-3 py-1 rounded-full bg-[#F4F4F4] text-[#5C5E62] truncate">
            {slideLabels[activeSlide]}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
              isAllCompatible
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isAllCompatible ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>物理バランス100%適合</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>番手バランス要確認</span>
              </>
            )}
          </span>
        </div>

        {/* スライドクイックピル */}
        <div className="flex items-center gap-1 shrink-0">
          {(['SET', 'REEL', 'ROD', 'RIG', 'FISH'] as const).map((tab, idx) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChangeSlide(idx)}
              className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-oswald tracking-wider transition-all whitespace-nowrap ${
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
          中央：純白スタジオ・フォトキャンバス（グレー枠ゼロ・高迫力スケール）
         ================================================================= */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[430px] lg:min-h-[500px] w-full flex items-center justify-center px-3 sm:px-8 py-2 overflow-hidden">
        <div className="relative w-full max-w-[960px] h-full min-h-[245px] sm:min-h-[400px] lg:min-h-[470px] rounded-3xl flex items-center justify-center bg-white">
          {/* ---------------- SLIDE 0: ロッド × リール 統合スタジオビュー ---------------- */}
          {activeSlide === 0 && (
            <div className="relative w-full h-full flex items-center justify-center py-4 sm:py-8">
              {/* コールアウト1（左上：ロッド特性） */}
              <div className="hidden sm:flex flex-col items-start absolute top-3 lg:top-5 left-[5%] lg:left-[7%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(0)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    {rod.propertyTags[0] || `${rod.lengthFt} 高反発ブランクス`}
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-xs border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
                <div className="flex flex-col items-center ml-3 mt-1">
                  <div className="w-[1px] h-10 lg:h-14 bg-[#C4C6C8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                </div>
              </div>

              {/* コールアウト2（右上：リール最大ドラグ＆機構） */}
              <div className="hidden sm:flex flex-col items-end absolute top-3 lg:top-5 right-[5%] lg:right-[7%] z-30">
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(1)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    最大ドラグ {reel.dragMaxKg}kg・{reel.propertyTags[0]}
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-xs border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
                <div className="flex flex-col items-center mr-8 mt-1">
                  <div className="w-[1px] h-8 lg:h-12 bg-[#C4C6C8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                </div>
              </div>

              {/* メイン・デュアルフォトコンポジット（左〜中央：ロッド、中央〜右：大型リール） */}
              <div className="relative z-10 w-full max-w-[880px] h-[230px] sm:h-[360px] lg:h-[420px] flex items-center justify-center">
                <div
                  onClick={() => onChangeSlide(2)}
                  title="クリックしてロッド単体を拡大"
                  style={ROD_OPEN_STAGE_MASK_STYLE}
                  className="w-[58%] sm:w-[60%] h-full flex items-center justify-center cursor-pointer group -mr-6 sm:-mr-12 lg:-mr-16 z-10"
                >
                  <img
                    src={resolvePartStudioImage(rod, rodFallback)}
                    alt={rod.name}
                    onError={() => {
                      if (!rodFallback) setRodFallback(true);
                    }}
                    style={{ filter: getPartStudioFilter(rod) }}
                    className="w-full h-full object-contain mix-blend-multiply scale-[1.06] transition-transform duration-500 group-hover:scale-[1.11]"
                  />
                </div>

                <div
                  onClick={() => onChangeSlide(1)}
                  title="クリックしてリール単体を拡大"
                  className="w-[52%] sm:w-[50%] h-[94%] flex items-center justify-center cursor-pointer group z-20"
                >
                  <img
                    src={resolvePartStudioImage(reel, reelFallback)}
                    alt={reel.name}
                    onError={() => {
                      if (!reelFallback) setReelFallback(true);
                    }}
                    style={{ filter: getPartStudioFilter(reel) }}
                    className="w-full h-full object-contain mix-blend-multiply scale-[1.06] transition-transform duration-500 group-hover:scale-[1.11]"
                  />
                </div>
              </div>

              {/* コールアウト3（左下：適合ルアー＆ドラグ耐荷重） */}
              <div className="hidden sm:flex flex-col items-start absolute bottom-3 lg:bottom-4 left-[6%] lg:left-[9%] z-30">
                <div className="flex flex-col items-center ml-3 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                  <div className="w-[1px] h-8 lg:h-11 bg-[#C4C6C8]" />
                </div>
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(2)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    適合ルアー MAX {rod.lureMaxG}g (耐荷重 {rod.dragMaxKg}kg)
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-xs border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
              </div>

              {/* コールアウト4（右下：巻上スピード＆スプール糸巻量） */}
              <div className="hidden sm:flex flex-col items-end absolute bottom-3 lg:bottom-4 right-[5%] lg:right-[8%] z-30">
                <div className="flex flex-col items-center mr-8 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                  <div className="w-[1px] h-8 lg:h-11 bg-[#C4C6C8]" />
                </div>
                <button
                  type="button"
                  onClick={() => onOpenFeatureModal(3)}
                  className="group flex items-center gap-2 text-left hover:opacity-80 transition-opacity bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md"
                >
                  <span className="text-xs lg:text-[13px] font-medium text-[#393C41] tracking-tight">
                    1回転 {reel.retrieveCm}cm・PE{reel.peCapacityNum}号-{reel.peCapacityMeter}m
                  </span>
                  <span className="w-5 h-5 rounded bg-[#F4F4F4] group-hover:bg-[#E2E3E5] text-[#171A20] flex items-center justify-center transition-colors shadow-xs border border-black/5">
                    <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- SLIDE 1: リール単体 スタジオ・クローズアップ ---------------- */}
          {activeSlide === 1 && (
            <div className="relative w-full h-full flex items-center justify-center py-4 sm:py-8">
              <div className="hidden sm:flex flex-col items-start absolute top-4 left-[10%] z-30">
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
                <div className="flex flex-col items-center ml-3 mt-1">
                  <div className="w-[1px] h-12 bg-[#C4C6C8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end absolute top-4 right-[10%] z-30">
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
                <div className="flex flex-col items-center mr-8 mt-1">
                  <div className="w-[1px] h-12 bg-[#C4C6C8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                </div>
              </div>

              <div className="w-[250px] sm:w-[390px] lg:w-[460px] h-[230px] sm:h-[350px] lg:h-[415px] flex items-center justify-center">
                <img
                  src={resolvePartStudioImage(reel, reelFallback)}
                  alt={reel.name}
                  onError={() => {
                    if (!reelFallback) setReelFallback(true);
                  }}
                  style={{ filter: getPartStudioFilter(reel) }}
                  className="w-full h-full object-contain mix-blend-multiply scale-[1.06] transition-all duration-500"
                />
              </div>

              <div className="hidden sm:flex flex-col items-start absolute bottom-4 left-[12%] z-30">
                <div className="flex flex-col items-center ml-3 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                  <div className="w-[1px] h-10 bg-[#C4C6C8]" />
                </div>
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

              <div className="hidden sm:flex flex-col items-end absolute bottom-4 right-[12%] z-30">
                <div className="flex flex-col items-center mr-8 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                  <div className="w-[1px] h-10 bg-[#C4C6C8]" />
                </div>
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
            <div className="relative w-full h-full flex items-center justify-center py-4 sm:py-8">
              <div className="hidden sm:flex flex-col items-start absolute top-4 left-[10%] z-30">
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
                <div className="flex flex-col items-center ml-3 mt-1">
                  <div className="w-[1px] h-12 bg-[#C4C6C8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                </div>
              </div>

              <div className="hidden sm:flex flex-col items-end absolute top-4 right-[10%] z-30">
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
                <div className="flex flex-col items-center mr-8 mt-1">
                  <div className="w-[1px] h-12 bg-[#C4C6C8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                </div>
              </div>

              <div
                style={ROD_OPEN_STAGE_MASK_STYLE}
                className="w-[300px] sm:w-[540px] lg:w-[660px] h-[230px] sm:h-[350px] lg:h-[415px] flex items-center justify-center"
              >
                <img
                  src={resolvePartStudioImage(rod, rodFallback)}
                  alt={rod.name}
                  onError={() => {
                    if (!rodFallback) setRodFallback(true);
                  }}
                  style={{ filter: getPartStudioFilter(rod) }}
                  className="w-full h-full object-contain mix-blend-multiply scale-[1.06] transition-all duration-500"
                />
              </div>

              <div className="hidden sm:flex flex-col items-start absolute bottom-4 left-[12%] z-30">
                <div className="flex flex-col items-center ml-3 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                  <div className="w-[1px] h-10 bg-[#C4C6C8]" />
                </div>
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

              <div className="hidden sm:flex flex-col items-end absolute bottom-4 right-[12%] z-30">
                <div className="flex flex-col items-center mr-8 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E8E93]" />
                  <div className="w-[1px] h-10 bg-[#C4C6C8]" />
                </div>
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
            <div className="relative w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 lg:gap-14 py-6 px-4 sm:px-8">
              <div className="flex flex-col items-center text-center max-w-[300px]">
                <div className="w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center bg-white">
                  <img
                    src={resolvePartStudioImage(line, lineFallback)}
                    alt={line.name}
                    onError={() => {
                      if (!lineFallback) setLineFallback(true);
                    }}
                    style={{ filter: getPartStudioFilter(line) }}
                    className="w-full h-full object-contain mix-blend-multiply scale-[1.05]"
                  />
                </div>
                <span className="text-[11px] font-oswald tracking-widest text-[#3E6AE1] font-bold uppercase mt-2">
                  PE LINE &amp; SHOCK LEADER
                </span>
                <div className="text-sm sm:text-base font-bold text-[#171A20] mt-0.5">
                  {line.shortName}
                </div>
                <div className="text-xs text-[#5C5E62] mt-0.5">
                  ＋ {line.pairedLeaderSpec}
                </div>
              </div>

              <div className="hidden sm:block w-[1px] h-56 bg-black/10" />

              <div className="flex flex-col items-center text-center max-w-[380px]">
                <div className="w-64 sm:w-80 lg:w-[370px] aspect-[1.85/1] flex items-center justify-center bg-white overflow-hidden">
                  <img
                    src={resolvePartStudioImage(lure, lureFallback)}
                    alt={lure.name}
                    onError={() => {
                      if (!lureFallback) setLureFallback(true);
                    }}
                    style={{ filter: getPartStudioFilter(lure) }}
                    className="w-full h-full object-cover object-[50%_52%] mix-blend-multiply px-1"
                  />
                </div>
                <span className="text-[11px] font-oswald tracking-widest text-[#3E6AE1] font-bold uppercase mt-3">
                  OFFSHORE PLUG &amp; HEAVY HOOK
                </span>
                <div className="text-sm sm:text-base font-bold text-[#171A20] mt-0.5">
                  {lure.shortName}
                </div>
                <div className="text-xs text-[#5C5E62] mt-0.5">
                  本体 {lure.bodyWeightG}g ＋ {lure.hookSpec} (+{lure.hookRingWeightG}g)
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SLIDE 4: ターゲット魚 ＆ 実戦海域（16:9 高迫力フルステージ） ---------------- */}
          {activeSlide === 4 && (
            <div className="relative w-full h-full min-h-[245px] sm:min-h-[400px] lg:min-h-[465px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black">
              <img
                src={activeFishMedia.url}
                alt={activeFishMedia.label}
                style={{
                  objectPosition: getFishFocalPosition(
                    fishGalleryIdx === 0 ? target.id : activeFishMedia.url,
                    'stage'
                  ),
                }}
                className="w-full h-full object-cover transition-all duration-500"
              />
              {/* 魚の顔・胴体を暗くせず、下部テキスト領域のみ自然に引き締めるグラデーション */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-[38%] to-transparent pointer-events-none" />

              {/* 右上：実戦ギャラリー切替サムネイル（3シーン） */}
              {target.gallery.length > 1 && (
                <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20 flex items-center gap-2 bg-black/45 backdrop-blur-md p-1.5 rounded-xl border border-white/15">
                  {target.gallery.map((item, gIdx) => {
                    const isCurrentMedia = fishGalleryIdx === gIdx;
                    return (
                      <button
                        key={item.url + gIdx}
                        type="button"
                        onClick={() => setFishGalleryIdx(gIdx)}
                        title={item.label}
                        className={`relative w-12 h-8 sm:w-16 sm:h-10 rounded-lg overflow-hidden transition-all ${
                          isCurrentMedia
                            ? 'ring-2 ring-white scale-105 opacity-100'
                            : 'opacity-65 hover:opacity-95'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          style={{ objectPosition: getFishFocalPosition(item.url, 'card') }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white space-y-1.5 z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-oswald tracking-wider">
                    {target.badge} // MAX {target.initialRunLoadKg}kg LOAD
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#3E6AE1]/85 text-[10px] font-oswald tracking-widest uppercase">
                    {activeFishMedia.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-2xl font-bold tracking-tight drop-shadow-xs">
                  {fishGalleryIdx === 0 ? target.fishName : activeFishMedia.label}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {fishGalleryIdx === 0 ? target.fishHabit : activeFishMedia.caption}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================
          下部：カルーセルコントロール (< ● ○ ○ ○ ○ >)
         ================================================================= */}
      <div className="relative z-20 px-4 sm:px-6 pb-3 sm:pb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenFeatureModal(0)}
          title="タックル適合ハイライト・スペック詳細を表示"
          aria-label="タックル適合ハイライト・スペック詳細を表示"
          className="flex w-10 h-9 rounded-md items-center justify-center transition-colors bg-[#EAEBEC] hover:bg-[#DADBDD] text-[#171A20]"
        >
          <ShieldCheck className="w-4 h-4 stroke-[2]" />
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
