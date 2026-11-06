import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  BuildOverallEvaluation,
  GearCategory,
  LineProduct,
  LureProduct,
  TackleBuildState,
} from '../types/tackle';
import { GearSchematic } from './GearSchematic';

export type ActiveSelectorTab =
  | 'reel'
  | 'rod'
  | 'line_pe'
  | 'line_leader'
  | 'lure_plug'
  | 'lure_hook';

interface TackleBoxDockProps {
  build: TackleBuildState;
  evaluation: BuildOverallEvaluation;
  activeTab: ActiveSelectorTab;
  onSelectTab: (tab: ActiveSelectorTab) => void;
  onClearBuild: () => void;
  onRemoveSlot: (slot: keyof TackleBuildState) => void;
  compatibleLeaders: LineProduct[];
  compatibleHooks: LureProduct[];
  onQuickSwitchLeader: (leader: LineProduct) => void;
  onQuickSwitchHook: (hook: LureProduct) => void;
  onOpenSpecModal: () => void;
}

export const TackleBoxDock: React.FC<TackleBoxDockProps> = ({
  build,
  evaluation,
  activeTab,
  onSelectTab,
  onClearBuild,
  onRemoveSlot,
  compatibleLeaders,
  compatibleHooks,
  onQuickSwitchLeader,
  onQuickSwitchHook,
  onOpenSpecModal,
}) => {
  const isSlotActive = (category: GearCategory) => {
    if (category === 'reel') return activeTab === 'reel';
    if (category === 'rod') return activeTab === 'rod';
    if (category === 'line') return activeTab === 'line_pe' || activeTab === 'line_leader';
    return activeTab === 'lure_plug' || activeTab === 'lure_hook';
  };

  return (
    <aside
      aria-label="マイタックルボックス・物理互換性ドック"
      className="w-full flex flex-col gap-4 sm:gap-5"
    >
      {/* ==================== BENTO CARD 1: DOCK HEADER & OVERVIEW ==================== */}
      <div className="bento-glass-card rounded-2xl p-5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] inline-block" />
            <h2 className="font-inter text-base sm:text-lg font-bold tracking-wider uppercase text-white">
              MY TACKLE BENTO
            </h2>
            <span className="font-oswald text-xs tracking-wider px-2.5 py-0.5 rounded-full bg-[#1A1A1A] border border-[#00E5FF]/50 text-[#00E5FF] font-semibold">
              {evaluation.completedSlotsCount} / 4 SLOTS
            </span>
          </div>
          <p className="font-jp text-xs font-normal text-slate-200 mt-1">
            選択済みパーツの物理整合性・糸巻き量・針込ルアー重量をリアルタイム監視
          </p>
        </div>

        <button
          type="button"
          onClick={onClearBuild}
          className="cyber-float-hover shrink-0 text-xs font-jp font-medium text-slate-200 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-[#1A1A1A]/80"
          title="構成をすべてリセット"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>リセット</span>
        </button>
      </div>

      {/* ==================== BENTO CARD 2: 4 RIGGING SLOTS BENTO STACK ==================== */}
      <div className="grid grid-cols-1 gap-3.5">
        {/* -------------------- SLOT 01: REEL -------------------- */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectTab('reel')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('reel');
            }
          }}
          className={`cyber-float-hover cursor-pointer rounded-2xl p-4 sm:p-5 ${
            isSlotActive('reel') ? 'bento-glass-active' : 'bento-glass-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-inter text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md bg-[#1A1A1A] text-[#00E5FF] border border-[#00E5FF]/40">
                01 REEL
              </span>
              <span className="font-jp text-xs font-medium text-slate-200">
                主軸スピニングリール
              </span>
            </div>
            {build.reel && (
              <span className="font-oswald text-lg font-semibold text-white tracking-wide tabular-nums">
                ¥{build.reel.priceJpy.toLocaleString()}
              </span>
            )}
          </div>

          {build.reel ? (
            <div className="flex items-center gap-3.5">
              <GearSchematic item={build.reel} compact />
              <div className="flex-1 min-w-0">
                <div className="font-inter text-[11px] font-bold text-[#00E5FF] uppercase tracking-widest">
                  {build.reel.brand}
                </div>
                <div className="font-inter text-base font-bold text-white truncate mt-0.5">
                  {build.reel.modelName}
                </div>
                <div className="font-jp text-xs text-slate-200 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>
                    自重{' '}
                    <strong className="font-oswald text-white font-semibold tracking-wide">
                      {build.reel.specs.weightG}g
                    </strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    巻上{' '}
                    <strong className="font-oswald text-white font-semibold tracking-wide">
                      {build.reel.specs.retrieveCm}cm
                    </strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    実用/最大ドラグ{' '}
                    <strong className="font-oswald text-[#00E5FF] font-semibold tracking-wide">
                      {build.reel.specs.practicalDragKg}/{build.reel.specs.maxDragKg}kg
                    </strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="リールの選択を解除"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSlot('reel');
                }}
                className="cyber-float-hover text-xs text-slate-300 hover:text-rose-300 p-2 rounded-lg bg-[#1A1A1A]/70 border border-white/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-2.5 flex items-center justify-between text-xs font-jp text-slate-200">
              <span>リールを選択してください（14000番〜20000番）</span>
              <ChevronRight className="w-4 h-4 text-[#00E5FF]" />
            </div>
          )}
        </div>

        {/* -------------------- SLOT 02: ROD -------------------- */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectTab('rod')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('rod');
            }
          }}
          className={`cyber-float-hover cursor-pointer rounded-2xl p-4 sm:p-5 ${
            isSlotActive('rod') ? 'bento-glass-active' : 'bento-glass-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-inter text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md bg-[#1A1A1A] text-[#00E5FF] border border-[#00E5FF]/40">
                02 ROD
              </span>
              <span className="font-jp text-xs font-medium text-slate-200">
                オフショアキャスティングロッド
              </span>
            </div>
            {build.rod && (
              <span className="font-oswald text-lg font-semibold text-white tracking-wide tabular-nums">
                ¥{build.rod.priceJpy.toLocaleString()}
              </span>
            )}
          </div>

          {build.rod ? (
            <div className="flex items-center gap-3.5">
              <GearSchematic item={build.rod} compact />
              <div className="flex-1 min-w-0">
                <div className="font-inter text-[11px] font-bold text-[#00E5FF] uppercase tracking-widest">
                  {build.rod.brand}
                </div>
                <div className="font-inter text-base font-bold text-white truncate mt-0.5">
                  {build.rod.modelName}
                </div>
                <div className="font-jp text-xs text-slate-200 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-oswald text-white font-semibold tracking-wide">
                    {build.rod.specs.lengthFtIn} ({build.rod.specs.weightG}g)
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    Lure{' '}
                    <strong className="font-oswald text-[#00E5FF] font-semibold tracking-wide">
                      {build.rod.specs.lureMinG}–{build.rod.specs.lureMaxG}g
                    </strong>
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>
                    MAX PE{' '}
                    <strong className="font-oswald text-white font-semibold">
                      {build.rod.specs.maxPe}
                    </strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="ロッドの選択を解除"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSlot('rod');
                }}
                className="cyber-float-hover text-xs text-slate-300 hover:text-rose-300 p-2 rounded-lg bg-[#1A1A1A]/70 border border-white/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-2.5 flex items-center justify-between text-xs font-jp text-slate-200">
              <span>適合ロッドを選択してください</span>
              <ChevronRight className="w-4 h-4 text-[#00E5FF]" />
            </div>
          )}
        </div>

        {/* -------------------- SLOT 03: LINE + AUTO SHOCK LEADER -------------------- */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectTab('line_pe')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('line_pe');
            }
          }}
          className={`cyber-float-hover cursor-pointer rounded-2xl p-4 sm:p-5 ${
            isSlotActive('line') ? 'bento-glass-active' : 'bento-glass-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-inter text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md bg-[#1A1A1A] text-[#00E5FF] border border-[#00E5FF]/40">
                03 LINE
              </span>
              <span className="font-jp text-xs font-medium text-slate-200">
                PEライン ＋ 適合リーダー
              </span>
            </div>
            {(build.peLine || build.shockLeader) && (
              <span className="font-oswald text-lg font-semibold text-white tracking-wide tabular-nums">
                ¥
                {(
                  (build.peLine?.priceJpy ?? 0) + (build.shockLeader?.priceJpy ?? 0)
                ).toLocaleString()}
              </span>
            )}
          </div>

          {build.peLine ? (
            <div>
              <div className="flex items-center gap-3.5">
                <GearSchematic item={build.peLine} compact />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-[11px] font-bold text-[#00E5FF] uppercase tracking-widest">
                      {build.peLine.brand}
                    </span>
                    {evaluation.spoolFillRatioPercent !== null && (
                      <span
                        className={`font-oswald text-xs px-2 py-0.5 rounded-md border tracking-wide ${
                          evaluation.spoolFillRatioPercent === 100
                            ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                            : evaluation.spoolFillRatioPercent > 100
                            ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                            : 'bg-amber-950/90 border-amber-400 text-amber-200'
                        }`}
                      >
                        SPOOL FILL {evaluation.spoolFillRatioPercent}%
                      </span>
                    )}
                  </div>
                  <div className="font-inter text-base font-bold text-white truncate mt-0.5">
                    {build.peLine.modelName}
                  </div>
                  <div className="font-jp text-xs text-slate-200 mt-1">
                    PE{' '}
                    <strong className="font-oswald text-white font-semibold">
                      {build.peLine.specs.peNumber}
                    </strong>
                    号 (
                    <span className="font-oswald text-white">
                      {build.peLine.specs.lengthM}m
                    </span>
                    ) / 直線強力{' '}
                    <strong className="font-oswald text-[#00E5FF] font-semibold">
                      {build.peLine.specs.strengthLb}lb
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="ラインの選択を解除"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSlot('peLine');
                  }}
                  className="cyber-float-hover text-xs text-slate-300 hover:text-rose-300 p-2 rounded-lg bg-[#1A1A1A]/70 border border-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-slot: Shock Leader Auto-Set */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('line_leader');
                }}
                className={`mt-3 pt-2.5 border-t border-white/10 pl-3 border-l-2 rounded-r-xl transition-colors ${
                  activeTab === 'line_leader'
                    ? 'border-l-[#00E5FF] bg-[#1A1A1A]/90'
                    : 'border-l-[#00E5FF]/60 bg-[#1A1A1A]/50'
                } p-2.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-[#00E5FF]">
                      AUTO-BOUND: SHOCK LEADER
                    </span>
                  </div>
                  <span className="font-oswald text-sm text-slate-200 tabular-nums">
                    {build.shockLeader
                      ? `¥${build.shockLeader.priceJpy.toLocaleString()}`
                      : '未選択'}
                  </span>
                </div>
                {build.shockLeader && (
                  <div className="mt-1">
                    <div className="font-jp text-xs font-medium text-white truncate">
                      {build.shockLeader.brand} {build.shockLeader.modelName}
                    </div>
                    {compatibleLeaders.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="font-jp text-[11px] text-slate-300">適合号数切替:</span>
                        {compatibleLeaders.map((ldr) => (
                          <button
                            key={ldr.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickSwitchLeader(ldr);
                            }}
                            className={`cyber-float-hover font-oswald text-xs px-2.5 py-0.5 rounded-md border tracking-wide ${
                              build.shockLeader?.id === ldr.id
                                ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF] font-bold'
                                : 'bg-[#1A1A1A] text-slate-200 border-white/20 hover:border-[#00E5FF]'
                            }`}
                          >
                            {ldr.specs.strengthLb}lb ({ldr.specs.lengthM}m)
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2.5 flex items-center justify-between text-xs font-jp text-slate-200">
              <span>PEラインを選択（適合リーダーが自動セットされます）</span>
              <ChevronRight className="w-4 h-4 text-[#00E5FF]" />
            </div>
          )}
        </div>

        {/* -------------------- SLOT 04: LURE + AUTO HOOK & RING SET -------------------- */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectTab('lure_plug')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTab('lure_plug');
            }
          }}
          className={`cyber-float-hover cursor-pointer rounded-2xl p-4 sm:p-5 ${
            isSlotActive('lure') ? 'bento-glass-active' : 'bento-glass-card'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="font-inter text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md bg-[#1A1A1A] text-[#00E5FF] border border-[#00E5FF]/40">
                04 LURE
              </span>
              <span className="font-jp text-xs font-medium text-slate-200">
                プラグ ＋ 適合太軸フック＆リング
              </span>
            </div>
            {(build.plug || build.hookSet) && (
              <span className="font-oswald text-lg font-semibold text-white tracking-wide tabular-nums">
                ¥
                {(
                  (build.plug?.priceJpy ?? 0) + (build.hookSet?.priceJpy ?? 0)
                ).toLocaleString()}
              </span>
            )}
          </div>

          {build.plug ? (
            <div>
              <div className="flex items-center gap-3.5">
                <GearSchematic item={build.plug} compact />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-inter text-[11px] font-bold text-[#00E5FF] uppercase tracking-widest">
                      {build.plug.brand}
                    </span>
                    {evaluation.totalLureWeightG !== null && (
                      <span className="font-oswald text-xs px-2 py-0.5 rounded-md bg-[#00E5FF]/15 border border-[#00E5FF]/60 text-[#00E5FF] tracking-wide">
                        TOTAL {evaluation.totalLureWeightG}g (針込)
                      </span>
                    )}
                  </div>
                  <div className="font-inter text-base font-bold text-white truncate mt-0.5">
                    {build.plug.modelName}
                  </div>
                  <div className="font-jp text-xs text-slate-200 mt-1">
                    全長{' '}
                    <strong className="font-oswald text-white font-semibold">
                      {build.plug.specs.lengthMm}mm
                    </strong>{' '}
                    / 本体単体{' '}
                    <strong className="font-oswald text-white font-semibold">
                      {build.plug.specs.weightG}g
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="ルアーの選択を解除"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSlot('plug');
                  }}
                  className="cyber-float-hover text-xs text-slate-300 hover:text-rose-300 p-2 rounded-lg bg-[#1A1A1A]/70 border border-white/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-slot: Hook & Split Ring Set Auto-Set */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('lure_hook');
                }}
                className={`mt-3 pt-2.5 border-t border-white/10 pl-3 border-l-2 rounded-r-xl transition-colors ${
                  activeTab === 'lure_hook'
                    ? 'border-l-[#00E5FF] bg-[#1A1A1A]/90'
                    : 'border-l-[#00E5FF]/60 bg-[#1A1A1A]/50'
                } p-2.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-[#00E5FF]">
                      AUTO-BOUND: HOOK & RING (+{build.hookSet?.specs.weightG ?? 0}g)
                    </span>
                  </div>
                  <span className="font-oswald text-sm text-slate-200 tabular-nums">
                    {build.hookSet ? `¥${build.hookSet.priceJpy.toLocaleString()}` : '未選択'}
                  </span>
                </div>
                {build.hookSet && (
                  <div className="mt-1">
                    <div className="font-jp text-xs font-medium text-white truncate">
                      {build.hookSet.brand} {build.hookSet.modelName}
                    </div>
                    {compatibleHooks.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="font-jp text-[11px] text-slate-300">仕様切替:</span>
                        {compatibleHooks.map((hk) => {
                          const isSingle =
                            hk.modelName.includes('シングル') || hk.modelName.includes('管ムロ');
                          return (
                            <button
                              key={hk.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickSwitchHook(hk);
                              }}
                              className={`cyber-float-hover font-jp text-xs px-2.5 py-0.5 rounded-md border ${
                                build.hookSet?.id === hk.id
                                  ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF] font-bold'
                                  : 'bg-[#1A1A1A] text-slate-200 border-white/20 hover:border-[#00E5FF]'
                              }`}
                            >
                              {isSingle ? 'シングル仕様' : 'トレブル仕様'}{' '}
                              <span className="font-oswald">({hk.specs.weightG}g)</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2.5 flex items-center justify-between text-xs font-jp text-slate-200">
              <span>プラグを選択（適合フック＆リングが自動セットされます）</span>
              <ChevronRight className="w-4 h-4 text-[#00E5FF]" />
            </div>
          )}
        </div>
      </div>

      {/* ==================== BENTO CARD 3: 6-POINT TELEMETRY & CHECKOUT CTA ==================== */}
      <div className="bento-glass-card rounded-2xl p-5 space-y-4">
        {/* Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
            evaluation.criticalIssues.length > 0
              ? 'bg-rose-950/40 border-rose-400/80 text-rose-100'
              : 'bg-[#00E5FF]/10 border-[#00E5FF]/80 text-white animate-electric-glow'
          }`}
        >
          <div className="flex items-center gap-3">
            {evaluation.criticalIssues.length > 0 ? (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-[#00E5FF] shrink-0" />
            )}
            <div>
              <div className="font-inter text-xs font-bold tracking-wider uppercase flex items-center gap-2">
                {evaluation.criticalIssues.length > 0 ? (
                  <span>
                    INCOMPATIBLE ({evaluation.criticalIssues.length}件の物理的不整合)
                  </span>
                ) : (
                  <>
                    <span className="font-oswald text-base text-[#00E5FF]">
                      {evaluation.overallScore}%
                    </span>
                    <span>PHYSICAL MATCH VERIFIED</span>
                  </>
                )}
              </div>
              <div className="font-jp text-xs text-slate-200 mt-0.5">
                {evaluation.recommendedInitialDragKg ? (
                  <>
                    推奨初期ドラグ:{' '}
                    <strong className="font-oswald text-[#00E5FF] text-sm tracking-wide">
                      {evaluation.recommendedInitialDragKg.min}–
                      {evaluation.recommendedInitialDragKg.max}kg
                    </strong>
                  </>
                ) : (
                  'アイテムを選択すると推奨ドラグ値を自動算出します'
                )}
                {evaluation.totalRigWeightG ? (
                  <>
                    {' '}
                    / 総重量{' '}
                    <strong className="font-oswald text-white text-sm tracking-wide">
                      {evaluation.totalRigWeightG}g
                    </strong>
                  </>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6-Point Telemetry Checklist */}
        <div className="space-y-2 pt-1">
          <div className="font-inter text-[11px] font-semibold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>6-POINT RIGGING TELEMETRY</span>
          </div>
          {evaluation.checks.map((chk) => (
            <div
              key={chk.id}
              className="flex items-start gap-2.5 text-xs leading-relaxed py-1 border-b border-white/5 last:border-none"
            >
              {chk.passed === true ? (
                <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5" />
              ) : chk.passed === false ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <span className="w-4 h-4 inline-block border border-white/25 rounded-full shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0 font-jp">
                <span className="text-white font-medium">{chk.label}: </span>
                <span
                  className={
                    chk.passed === false
                      ? 'text-rose-300 font-semibold'
                      : chk.passed === true
                      ? 'text-slate-200 font-normal'
                      : 'text-slate-300 font-light'
                  }
                >
                  {chk.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price & Action Button */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-baseline justify-between mb-3.5">
            <div>
              <span className="font-inter text-[11px] font-semibold uppercase tracking-widest text-slate-300 block">
                TOTAL PACKAGE VALUE
              </span>
              <span className="font-jp text-[11px] text-slate-300">
                税込・適合リーダー＆フック一式込
              </span>
            </div>
            <span className="font-oswald text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums">
              ¥{evaluation.totalPriceJpy.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenSpecModal}
            disabled={evaluation.completedSlotsCount === 0}
            className={`cyber-float-hover w-full py-3.5 px-5 rounded-xl font-jp text-sm sm:text-base font-bold tracking-wider flex items-center justify-center gap-2.5 ${
              evaluation.criticalIssues.length > 0
                ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400'
                : 'bg-[#00E5FF] text-[#1A1A1A] border border-[#00E5FF] shadow-[0_0_24px_-4px_rgba(0,229,255,0.5)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>
              {evaluation.criticalIssues.length > 0
                ? '不整合を確認してセッティング仕様書を開く'
                : '完全適合セットを一括決済 / 仕様書出力'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
