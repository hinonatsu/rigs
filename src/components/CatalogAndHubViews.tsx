import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getPresetRigState,
  RIG_PRESETS,
  TargetFishProfile,
  TargetId,
} from '../data/rigCatalog';
import {
  getFishFocalPosition,
  getPartStudioFilter,
  resolvePartStudioImage,
} from './RigPartShowcase';

interface TargetSelectHomeViewProps {
  currentTargetId?: TargetId;
  onSelectTargetAndGoGarage: (targetId: TargetId) => void;
}

const TARGET_CLASS_META: Record<
  TargetId,
  {
    categoryLabel: string;
    shortBadge: string;
    classTitle: string;
    speciesSubtitle: string;
    tagline: string;
  }
> = {
  pe6: {
    categoryLabel: 'オフショア キャスティング // PE6号・14000番基準',
    shortBadge: 'NEARSHORE STANDARD',
    classTitle: 'PE6号クラス',
    speciesSubtitle: '近海ヒラマサ (10〜20kg) ＆ キハダマグロ',
    tagline: '1日300投の誘い出しと初動3秒の根ズレ制圧を両立する近海スタンダード',
  },
  pe8: {
    categoryLabel: 'ヘビー キャスティング // PE8号・18000番基準',
    shortBadge: 'HEAVY TUNA & GIANT KINGFISH',
    classTitle: 'PE8号クラス',
    speciesSubtitle: '大型クロマグロ (40〜80kg) ＆ オオマサ',
    tagline: '高負荷ドラグ15kg超で深場へのファーストランをねじ伏せるパワー構成',
  },
  pe10: {
    categoryLabel: 'モンスター エクスペディション // PE10号・20000番基準',
    shortBadge: '100KG+ MONSTER EXPEDITION',
    classTitle: 'PE10号クラス',
    speciesSubtitle: '100kg超クロマグロ ＆ 離島遠征GT',
    tagline: '最大ドラグ30kg・耐熱Si-Xラインで100kg超の巨魚と真っ向勝負する決戦仕様',
  },
};

export const TargetSelectHomeView: React.FC<TargetSelectHomeViewProps> = ({
  currentTargetId = 'pe6',
  onSelectTargetAndGoGarage,
}) => {
  // 上段フルワイド・シネマティックヒーローのアクティブスライド (0: PE6, 1: PE8, 2: PE10, 3: 全ラインナップ比較ステージ)
  const initialIdx = Math.max(
    0,
    RIG_PRESETS.findIndex((p) => p.id === currentTargetId)
  );
  const [heroSlide, setHeroSlide] = useState<number>(initialIdx);
  // 「タックル比較・診断」モーダル開閉
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

  const handleHeroPrev = () => {
    setHeroSlide((prev) => (prev - 1 + 4) % 4);
  };

  const handleHeroNext = () => {
    setHeroSlide((prev) => (prev + 1) % 4);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between bg-white text-[#171A20] select-none">
      {/* =====================================================================
          1. 上段：フルワイド・シネマティック オーシャンヒーロー
             ・16:9 魚種ビジュアルを100%鮮明にフルブリード表示（顔・頭部に文字を被せない下部配置）
             ・右下にそのクラスの基準リール＆ロッド構成プレビューを統合
         ===================================================================== */}
      <section
        aria-label="ターゲット別タックル・メインステージ"
        className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] bg-[#070B12] text-white overflow-hidden shrink-0"
      >
        {/* 上部バー：ラインナップ見出し ＆ クイック切替ピル */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/70 via-black/25 to-transparent pt-4 pb-6 px-4 sm:px-8 lg:px-12">
          <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-3">
            <span className="font-oswald text-[11px] sm:text-xs tracking-[0.26em] uppercase text-white/90 truncate">
              RIGs OFFSHORE LINEUP // 100% VERIFIED SYNERGY
            </span>

            <div className="hidden md:flex items-center gap-1.5 bg-black/35 backdrop-blur-md p-1 rounded-full border border-white/15">
              {RIG_PRESETS.map((p, idx) => {
                const active = heroSlide === idx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setHeroSlide(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-white text-[#171A20] shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {TARGET_CLASS_META[p.id].classTitle}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setHeroSlide(3)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  heroSlide === 3
                    ? 'bg-white text-[#171A20] shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                3クラス比較
              </button>
            </div>
          </div>
        </div>

        {/* スライド別ビジュアル */}
        {heroSlide === 3 ? (
          /* スライド3: 全3クラス パノラマ比較ステージ（文字折返し崩れゼロ設計） */
          <div className="relative z-20 w-full h-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 pt-14 pb-12 flex flex-col justify-between">
            <div className="my-auto grid grid-cols-3 gap-2.5 sm:gap-5 lg:gap-7 items-center">
              {RIG_PRESETS.map((preset, idx) => {
                const meta = TARGET_CLASS_META[preset.id];
                const isCenter = idx === 1;
                return (
                  <div
                    key={preset.id}
                    onClick={() => onSelectTargetAndGoGarage(preset.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTargetAndGoGarage(preset.id);
                      }
                    }}
                    className={`group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border border-white/20 hover:border-white/60 shadow-2xl ${
                      isCenter
                        ? 'h-[230px] sm:h-[310px] lg:h-[355px]'
                        : 'h-[210px] sm:h-[285px] lg:h-[330px] opacity-90 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.heroImage}
                      alt={meta.classTitle}
                      style={{ objectPosition: getFishFocalPosition(preset.id, 'card') }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 via-[42%] to-transparent" />
                    <div className="absolute bottom-3 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 space-y-0.5">
                      <div className="hidden sm:block text-[10px] font-oswald tracking-widest text-white/80 uppercase truncate">
                        {preset.badge}
                      </div>
                      <div className="text-xs sm:text-xl lg:text-2xl font-bold text-white tracking-tight whitespace-nowrap">
                        {meta.classTitle}
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/80 truncate">
                        {preset.weightRange}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] sm:text-xs text-white/80 font-medium tracking-wide">
                ターゲットクラスを選ぶと基準パーツが初期設定され、1パーツずつ自由に組み替えできます
              </p>
            </div>
          </div>
        ) : (
          /* スライド 0, 1, 2: 各クラスのフルブリード高迫力シネマティックヒーロー */
          (() => {
            const preset = RIG_PRESETS[heroSlide] ?? RIG_PRESETS[0];
            const meta = TARGET_CLASS_META[preset.id];
            const presetRig = getPresetRigState(preset.id);

            return (
              <div className="relative z-20 w-full h-full">
                {/* 魚種本来の色彩と水飛沫を100%引き出すフルブリード背景 */}
                <img
                  src={preset.heroImage}
                  alt={preset.fishName}
                  style={{ objectPosition: getFishFocalPosition(preset.id, 'hero') }}
                  className="w-full h-full object-cover"
                />

                {/* 被写体（魚の頭部・目・跳躍）を覆わず、下部テキスト領域のみを引き締める局所グラデーション */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-[40%] to-transparent pointer-events-none" />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse 55% 50% at 22% 88%, rgba(0,0,0,0.65) 0%, transparent 75%)',
                  }}
                />

                {/* 下部コンテンツバー（魚の顔に一切被らないロープロファイル配置） */}
                <div className="absolute inset-x-0 bottom-11 sm:bottom-12 max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="space-y-2 sm:space-y-2.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-oswald tracking-wider uppercase text-white whitespace-nowrap">
                        {preset.badge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#3E6AE1]/90 text-[11px] font-oswald tracking-wider text-white whitespace-nowrap">
                        {preset.weightRange}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-none drop-shadow-sm">
                      {meta.classTitle}
                    </h1>

                    <p className="text-xs sm:text-sm lg:text-base text-white/90 font-medium leading-relaxed">
                      {meta.speciesSubtitle} — {preset.catchCopy}
                    </p>

                    <div className="pt-1.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectTargetAndGoGarage(preset.id)}
                        className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-lg cursor-pointer"
                      >
                        <span>このクラスのタックルを組む</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PC右下：基準タックル4点クイックプレビューカード */}
                  {presetRig.reel && presetRig.rod && presetRig.lure && (
                    <div
                      onClick={() => onSelectTargetAndGoGarage(preset.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTargetAndGoGarage(preset.id);
                        }
                      }}
                      className="hidden lg:flex items-center gap-4 rounded-2xl bg-black/55 hover:bg-black/70 backdrop-blur-md border border-white/15 px-4 py-3 cursor-pointer transition-all max-w-md"
                    >
                      <div className="w-16 h-16 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={resolvePartStudioImage(presetRig.reel)}
                          alt={presetRig.reel.shortName}
                          style={{ filter: getPartStudioFilter(presetRig.reel) }}
                          className="w-full h-full object-contain mix-blend-multiply scale-105"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-oswald tracking-widest text-emerald-400 uppercase">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>VERIFIED BASE LOADOUT</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">
                          {presetRig.reel.shortName} × {presetRig.rod.shortName}
                        </div>
                        <div className="text-[11px] text-white/75 truncate">
                          ＋ {presetRig.lure.shortName}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}

        {/* 左右スライド送りボタン（PC） */}
        <button
          type="button"
          onClick={handleHeroPrev}
          aria-label="前のヒーロースライド"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 border border-white/15 text-white items-center justify-center transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleHeroNext}
          aria-label="次のヒーロースライド"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/35 hover:bg-black/60 border border-white/15 text-white items-center justify-center transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* 下部中央：ページネーションドット (● ● ● ●) */}
        <div className="absolute bottom-3.5 left-0 right-0 z-30 flex items-center justify-center gap-2.5">
          {[0, 1, 2, 3].map((dotIdx) => {
            const isActive = heroSlide === dotIdx;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setHeroSlide(dotIdx)}
                aria-label={`ヒーロースライド ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                    : 'w-2 bg-white/45 hover:bg-white/75'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          2. 中段：全3ターゲットクラス 3カラム並置セクション（見切れゼロ・16:10ワイド構図）
             ・魚種写真（16:10ワイド）は文字被りゼロで全身の迫力をそのまま表現
             ・カード下部に基準リール＆プラグの純白スタジオサムネイルを統合
         ===================================================================== */}
      <section
        aria-label="ターゲットクラス一覧"
        className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-8 flex-1 flex flex-col justify-between space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-oswald font-bold tracking-[0.22em] text-[#3E6AE1] uppercase">
              SELECT YOUR TARGET CLASS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#171A20] tracking-tight mt-0.5">
              対象魚・海域から基準タックルを選ぶ
            </h2>
          </div>
          <p className="text-xs text-[#5C5E62]">
            全クラス物理適合検証済（リール番手・PE糸巻量・針込ルアー重量）
          </p>
        </div>

        {/* 3カラム均等グリッド（PCで見切れゼロ・モバイルは縦積みフル幅） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7">
          {RIG_PRESETS.map((target: TargetFishProfile) => {
            const meta = TARGET_CLASS_META[target.id];
            const isSelected = currentTargetId === target.id;
            const presetRig = getPresetRigState(target.id);

            return (
              <article
                key={target.id}
                data-target-card
                onClick={() => onSelectTargetAndGoGarage(target.id)}
                role="button"
                tabIndex={0}
                aria-label={`${meta.classTitle}（${meta.speciesSubtitle}）のタックルを組む`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTargetAndGoGarage(target.id);
                  }
                }}
                className={`group rounded-2xl overflow-hidden bg-white border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#171A20]/25 shadow-lg'
                    : 'border-black/10 hover:border-black/25 shadow-sm hover:shadow-lg'
                }`}
              >
                {/* 上部：16:10 フルワイド魚種フォト（被写体を遮る大文字オーバーレイなし） */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0A0F18]">
                  <img
                    src={target.heroImage}
                    alt={meta.classTitle}
                    style={{ objectPosition: getFishFocalPosition(target.id, 'card') }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* 上部バッジ用の控えめなグラデーションのみ */}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 left-4 right-4 z-10 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] font-oswald font-semibold text-white tracking-wider whitespace-nowrap">
                      {target.badge}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-oswald font-bold text-[#171A20] tracking-wider whitespace-nowrap shadow-sm">
                      {target.weightRange}
                    </span>
                  </div>
                </div>

                {/* 下部：クラス情報 ＋ 基準ギア純白スタジオプレビュー ＋ CTA */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5 bg-white">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-2xl sm:text-[26px] font-bold text-[#171A20] tracking-tight whitespace-nowrap">
                        {meta.classTitle}
                      </h3>
                      <span className="text-[11px] font-oswald tracking-wider text-[#5C5E62] uppercase truncate">
                        MAX {target.initialRunLoadKg}kg LOAD
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      {meta.speciesSubtitle}
                    </div>

                    <p className="text-xs text-[#5C5E62] leading-relaxed">
                      {meta.tagline}
                    </p>
                  </div>

                  {/* 基準タックル（リール・ロッド・プラグ）純白スタジオストリップ */}
                  {presetRig.reel && presetRig.rod && presetRig.lure && (
                    <div className="rounded-xl bg-[#F7F8F9] border border-black/[0.05] p-3 space-y-2.5">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 rounded-lg bg-white border border-black/[0.05] p-1.5 flex items-center justify-center overflow-hidden">
                          <img
                            src={resolvePartStudioImage(presetRig.reel)}
                            alt={presetRig.reel.shortName}
                            style={{ filter: getPartStudioFilter(presetRig.reel) }}
                            className="w-full h-full object-contain mix-blend-multiply scale-105"
                          />
                        </div>
                        <div className="h-16 rounded-lg bg-white border border-black/[0.05] pl-1.5 pr-0 py-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={resolvePartStudioImage(presetRig.rod)}
                            alt={presetRig.rod.shortName}
                            style={{ filter: getPartStudioFilter(presetRig.rod) }}
                            className="w-full h-full object-contain object-right mix-blend-multiply scale-110 translate-x-[2%]"
                          />
                        </div>
                        <div className="h-16 rounded-lg bg-white border border-black/[0.05] px-1 flex items-center justify-center overflow-hidden">
                          <img
                            src={resolvePartStudioImage(presetRig.lure)}
                            alt={presetRig.lure.shortName}
                            style={{ filter: getPartStudioFilter(presetRig.lure) }}
                            className="w-full h-full object-cover object-[50%_52%] mix-blend-multiply"
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-[#5C5E62] truncate">
                        基準：{presetRig.reel.shortName} ／ {presetRig.rod.shortName}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTargetAndGoGarage(target.id);
                    }}
                    className="w-full py-3 px-5 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>{meta.classTitle} でタックルを組む</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          3. 下部セクションバー：タックル比較・診断（カードに被らないクリーン配置）
         ===================================================================== */}
      <div className="w-full bg-[#F8F9FA] border-t border-black/10 py-5 px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs text-[#5C5E62]">
          どのクラスから始めるか迷ったら、対象ウェイトと海域から一括比較できます
        </span>
        <button
          type="button"
          onClick={() => setIsDiagnosticOpen(true)}
          className="py-2.5 px-6 rounded-md bg-white hover:bg-[#EFEFF1] border border-black/15 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#171A20] transition-colors shadow-sm whitespace-nowrap cursor-pointer"
        >
          <span className="w-5 h-5 rounded-full bg-[#3E6AE1] text-white flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </span>
          <span>タックル比較・診断</span>
        </button>
      </div>

      {/* =====================================================================
          モーダル：全3クラス（PE6 / PE8 / PE10）一括比較・クイック診断
         ===================================================================== */}
      {isDiagnosticOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsDiagnosticOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-white text-[#171A20] p-6 sm:p-8 shadow-2xl space-y-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="text-xs font-oswald font-bold tracking-widest text-[#3E6AE1] uppercase">
                  TARGET CLASS COMPARISON &amp; DIAGNOSTIC
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  全3クラス 対象ターゲット＆基準スペック比較
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F4F4] hover:bg-[#E5E5E5] flex items-center justify-center"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RIG_PRESETS.map((preset) => {
                const meta = TARGET_CLASS_META[preset.id];

                return (
                  <div
                    key={preset.id}
                    className="rounded-2xl bg-[#F4F4F4] overflow-hidden flex flex-col justify-between border border-black/5"
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
                      <img
                        src={preset.heroImage}
                        alt={meta.classTitle}
                        style={{ objectPosition: getFishFocalPosition(preset.id, 'card') }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-oswald font-bold text-[#3E6AE1]">
                        {preset.badge}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="text-lg font-bold">{meta.classTitle}</div>
                        <div className="text-xs font-semibold text-[#171A20]">
                          {meta.speciesSubtitle}
                        </div>
                        <p className="text-xs text-[#5C5E62] leading-relaxed">
                          {meta.tagline}
                        </p>

                        <div className="rounded-xl bg-white p-3 space-y-1.5 text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="text-[#5C5E62] shrink-0">対象ウェイト</span>
                            <span className="font-semibold text-right">
                              {preset.weightRange}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[#5C5E62] shrink-0">主な海域</span>
                            <span className="font-semibold text-right truncate">
                              {preset.field}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[#5C5E62] shrink-0">想定初動負荷</span>
                            <span className="font-semibold text-right">
                              約{preset.initialRunLoadKg}kg / 時速{preset.strikeSpeedKmh}km
                            </span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="text-[#5C5E62] shrink-0">1日想定投数</span>
                            <span className="font-semibold text-right">
                              約{preset.dailyCastCount}投
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-black/10">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDiagnosticOpen(false);
                            onSelectTargetAndGoGarage(preset.id);
                          }}
                          className="w-full py-2.5 px-4 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>{meta.classTitle} でタックルを組む</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5E62] pt-2">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3E6AE1]" />
                <span>クラス選択時に基準パーツが初期設定されます</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#3E6AE1]" />
                <span>ビルダー画面で1パーツずつ自由に変更可能</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
