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
    <aside className="w-full lg:w-[400px] xl:w-[430px] shrink-0 bg-carbon-900 border border-carbon-700 flex flex-col">
      {/* Dock Header */}
      <div className="px-4 py-3.5 border-b border-carbon-700 flex items-center justify-between bg-carbon-950/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-electric inline-block" />
            <h2 className="font-display text-lg font-bold tracking-wider uppercase text-white">
              MY TACKLE BOX
            </h2>
            <span className="text-xs font-mono px-1.5 py-0.5 bg-carbon-800 border border-carbon-600 text-slate-300">
              {evaluation.completedSlotsCount}/4 SLOTS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            セットアップ構成・物理互換性リアルタイム診断
          </p>
        </div>
        <button
          type="button"
          onClick={onClearBuild}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 border border-carbon-700 hover:border-carbon-600 bg-carbon-850 transition-colors"
          title="構成をリセット"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>リセット</span>
        </button>
      </div>

      {/* 4 Main Slots + Sub-slots */}
      <div className="p-3 space-y-2.5 flex-1">
        {/* ==================== 01 REEL ==================== */}
        <div
          onClick={() => onSelectTab('reel')}
          className={`cursor-pointer border transition-colors p-3 ${
            isSlotActive('reel')
              ? 'bg-carbon-800 border-electric'
              : 'bg-carbon-850 border-carbon-700 hover:border-carbon-600'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-carbon-950 text-electric border border-carbon-700">
                01 REEL
              </span>
              <span className="text-xs text-slate-400">主軸スピニングリール</span>
            </div>
            {build.reel && (
              <span className="font-mono text-xs text-slate-200 tabular-nums">
                ¥{build.reel.priceJpy.toLocaleString()}
              </span>
            )}
          </div>

          {build.reel ? (
            <div className="flex items-center gap-3">
              <GearSchematic item={build.reel} compact />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-electric uppercase tracking-wider">
                  {build.reel.brand}
                </div>
                <div className="font-display text-base font-bold text-white truncate">
                  {build.reel.modelName}
                </div>
                <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums">
                  {build.reel.specs.weightG}g | 巻上{build.reel.specs.retrieveCm}cm | 実用/最大ドラグ{' '}
                  {build.reel.specs.practicalDragKg}/{build.reel.specs.maxDragKg}kg
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSlot('reel');
                }}
                className="text-[11px] text-slate-400 hover:text-red-400 px-1.5 py-0.5"
              >
                解除
              </button>
            </div>
          ) : (
            <div className="py-2 flex items-center justify-between text-xs text-slate-400">
              <span>リールを選択してください（14000番〜20000番）</span>
              <ChevronRight className="w-4 h-4 text-electric" />
            </div>
          )}
        </div>

        {/* ==================== 02 ROD ==================== */}
        <div
          onClick={() => onSelectTab('rod')}
          className={`cursor-pointer border transition-colors p-3 ${
            isSlotActive('rod')
              ? 'bg-carbon-800 border-electric'
              : 'bg-carbon-850 border-carbon-700 hover:border-carbon-600'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-carbon-950 text-electric border border-carbon-700">
                02 ROD
              </span>
              <span className="text-xs text-slate-400">オフショアキャスティングロッド</span>
            </div>
            {build.rod && (
              <span className="font-mono text-xs text-slate-200 tabular-nums">
                ¥{build.rod.priceJpy.toLocaleString()}
              </span>
            )}
          </div>

          {build.rod ? (
            <div className="flex items-center gap-3">
              <GearSchematic item={build.rod} compact />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-mono text-electric uppercase tracking-wider">
                  {build.rod.brand}
                </div>
                <div className="font-display text-base font-bold text-white truncate">
                  {build.rod.modelName}
                </div>
                <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums">
                  {build.rod.specs.lengthFtIn} ({build.rod.specs.weightG}g) | Lure{' '}
                  {build.rod.specs.lureMinG}–{build.rod.specs.lureMaxG}g | MAX PE{' '}
                  {build.rod.specs.maxPe}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveSlot('rod');
                }}
                className="text-[11px] text-slate-400 hover:text-red-400 px-1.5 py-0.5"
              >
                解除
              </button>
            </div>
          ) : (
            <div className="py-2 flex items-center justify-between text-xs text-slate-400">
              <span>ロッドを選択してください</span>
              <ChevronRight className="w-4 h-4 text-electric" />
            </div>
          )}
        </div>

        {/* ==================== 03 LINE (Main PE + Sub Shock Leader) ==================== */}
        <div
          onClick={() => onSelectTab('line_pe')}
          className={`cursor-pointer border transition-colors p-3 ${
            isSlotActive('line')
              ? 'bg-carbon-800 border-electric'
              : 'bg-carbon-850 border-carbon-700 hover:border-carbon-600'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-carbon-950 text-electric border border-carbon-700">
                03 LINE
              </span>
              <span className="text-xs text-slate-400">PEライン ＋ 適合リーダー</span>
            </div>
            {(build.peLine || build.shockLeader) && (
              <span className="font-mono text-xs text-slate-200 tabular-nums">
                ¥{((build.peLine?.priceJpy ?? 0) + (build.shockLeader?.priceJpy ?? 0)).toLocaleString()}
              </span>
            )}
          </div>

          {build.peLine ? (
            <div>
              <div className="flex items-center gap-3">
                <GearSchematic item={build.peLine} compact />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-electric uppercase">
                      {build.peLine.brand}
                    </span>
                    {evaluation.spoolFillRatioPercent !== null && (
                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 border ${
                          evaluation.spoolFillRatioPercent === 100
                            ? 'bg-electric/10 border-electric text-electric'
                            : evaluation.spoolFillRatioPercent > 100
                            ? 'bg-red-950/80 border-red-500 text-red-300'
                            : 'bg-amber-950/80 border-amber-500 text-amber-300'
                        }`}
                      >
                        充填率 {evaluation.spoolFillRatioPercent}%
                      </span>
                    )}
                  </div>
                  <div className="font-display text-base font-bold text-white truncate">
                    {build.peLine.modelName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums">
                    PE {build.peLine.specs.peNumber}号 ({build.peLine.specs.lengthM}m) / 直線強力{' '}
                    {build.peLine.specs.strengthLb}lb (¥{build.peLine.priceJpy.toLocaleString()})
                  </div>
                </div>
              </div>

              {/* Sub-slot: Shock Leader Auto-Set */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('line_leader');
                }}
                className={`mt-2.5 pt-2 border-t border-carbon-700/80 pl-2 border-l-2 ${
                  activeTab === 'line_leader' ? 'border-l-amber-400 bg-carbon-900/90' : 'border-l-electric/70'
                } p-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-electric" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-electric">
                      AUTO-SUB: SHOCK LEADER
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                    {build.shockLeader ? `¥${build.shockLeader.priceJpy.toLocaleString()}` : '未選択'}
                  </span>
                </div>
                {build.shockLeader && (
                  <div className="mt-1">
                    <div className="text-xs font-medium text-white truncate">
                      {build.shockLeader.brand} {build.shockLeader.modelName}
                    </div>
                    {compatibleLeaders.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">適合切替:</span>
                        {compatibleLeaders.map((ldr) => (
                          <button
                            key={ldr.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickSwitchLeader(ldr);
                            }}
                            className={`text-[10px] font-mono px-1.5 py-0.5 border transition-colors ${
                              build.shockLeader?.id === ldr.id
                                ? 'bg-electric text-carbon-950 border-electric font-bold'
                                : 'bg-carbon-950 text-slate-300 border-carbon-700 hover:border-slate-500'
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
            <div className="py-2 flex items-center justify-between text-xs text-slate-400">
              <span>PEラインを選択（適合リーダーが自動セットされます）</span>
              <ChevronRight className="w-4 h-4 text-electric" />
            </div>
          )}
        </div>

        {/* ==================== 04 LURE (Main Plug + Sub Hook & Ring Set) ==================== */}
        <div
          onClick={() => onSelectTab('lure_plug')}
          className={`cursor-pointer border transition-colors p-3 ${
            isSlotActive('lure')
              ? 'bg-carbon-800 border-electric'
              : 'bg-carbon-850 border-carbon-700 hover:border-carbon-600'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-carbon-950 text-electric border border-carbon-700">
                04 LURE
              </span>
              <span className="text-xs text-slate-400">プラグ ＋ 適合太軸フック＆リング</span>
            </div>
            {(build.plug || build.hookSet) && (
              <span className="font-mono text-xs text-slate-200 tabular-nums">
                ¥{((build.plug?.priceJpy ?? 0) + (build.hookSet?.priceJpy ?? 0)).toLocaleString()}
              </span>
            )}
          </div>

          {build.plug ? (
            <div>
              <div className="flex items-center gap-3">
                <GearSchematic item={build.plug} compact />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-electric uppercase">
                      {build.plug.brand}
                    </span>
                    {evaluation.totalLureWeightG !== null && (
                      <span className="text-[10px] font-mono px-1 py-0.2 bg-carbon-950 border border-carbon-600 text-slate-200">
                        針込総重量 {evaluation.totalLureWeightG}g
                      </span>
                    )}
                  </div>
                  <div className="font-display text-base font-bold text-white truncate">
                    {build.plug.modelName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums">
                    {build.plug.specs.lengthMm}mm / 単体 {build.plug.specs.weightG}g (¥
                    {build.plug.priceJpy.toLocaleString()})
                  </div>
                </div>
              </div>

              {/* Sub-slot: Hook & Split Ring Set Auto-Set */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTab('lure_hook');
                }}
                className={`mt-2.5 pt-2 border-t border-carbon-700/80 pl-2 border-l-2 ${
                  activeTab === 'lure_hook' ? 'border-l-amber-400 bg-carbon-900/90' : 'border-l-electric/70'
                } p-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-electric" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-electric">
                      AUTO-SUB: HOOK & RING (+{build.hookSet?.specs.weightG ?? 0}g)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                    {build.hookSet ? `¥${build.hookSet.priceJpy.toLocaleString()}` : '未選択'}
                  </span>
                </div>
                {build.hookSet && (
                  <div className="mt-1">
                    <div className="text-xs font-medium text-white truncate">
                      {build.hookSet.brand} {build.hookSet.modelName}
                    </div>
                    {compatibleHooks.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">仕様切替:</span>
                        {compatibleHooks.map((hk) => {
                          const isSingle = hk.modelName.includes('シングル') || hk.modelName.includes('管ムロ');
                          return (
                            <button
                              key={hk.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickSwitchHook(hk);
                              }}
                              className={`text-[10px] font-mono px-1.5 py-0.5 border transition-colors ${
                                build.hookSet?.id === hk.id
                                  ? 'bg-electric text-carbon-950 border-electric font-bold'
                                  : 'bg-carbon-950 text-slate-300 border-carbon-700 hover:border-slate-500'
                              }`}
                            >
                              {isSingle ? 'シングル仕様' : 'トレブル仕様'} ({hk.specs.weightG}g)
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
            <div className="py-2 flex items-center justify-between text-xs text-slate-400">
              <span>プラグを選択（適合フック＆リングが自動セットされます）</span>
              <ChevronRight className="w-4 h-4 text-electric" />
            </div>
          )}
        </div>
      </div>

      {/* Physical Compatibility Matrix & Total Value Footer */}
      <div className="p-4 bg-carbon-950 border-t border-carbon-700 space-y-3">
        {/* Status Banner */}
        <div
          className={`p-2.5 border flex items-center justify-between ${
            evaluation.criticalIssues.length > 0
              ? 'bg-red-950/30 border-red-500/80 text-red-200'
              : 'bg-electric/10 border-electric text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {evaluation.criticalIssues.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-electric shrink-0" />
            )}
            <div>
              <div className="font-mono text-xs font-bold tracking-wide uppercase">
                {evaluation.criticalIssues.length > 0
                  ? `INCOMPATIBLE (${evaluation.criticalIssues.length}件の物理的不整合)`
                  : `${evaluation.overallScore}% COMPATIBLE (物理整合性クリア)`}
              </div>
              <div className="text-[11px] text-slate-300">
                {evaluation.recommendedInitialDragKg
                  ? `推奨初期ドラグ設定: ${evaluation.recommendedInitialDragKg.min}–${evaluation.recommendedInitialDragKg.max}kg`
                  : 'アイテムを選択すると推奨ドラグ値を自動算出します'}
                {evaluation.totalRigWeightG ? ` / 総重量 ${evaluation.totalRigWeightG}g` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* 6-Point Telemetry Checklist */}
        <div className="space-y-1.5">
          {evaluation.checks.map((chk) => (
            <div
              key={chk.id}
              className="flex items-start gap-2 text-[11px] leading-tight py-0.5"
            >
              {chk.passed === true ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-electric shrink-0 mt-0.5" />
              ) : chk.passed === false ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <span className="w-3.5 h-3.5 inline-block border border-carbon-600 rounded-full shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-slate-300 font-medium">{chk.label}: </span>
                <span
                  className={`font-mono ${
                    chk.passed === false
                      ? 'text-red-400 font-semibold'
                      : chk.passed === true
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  {chk.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price & Action Button */}
        <div className="pt-3 border-t border-carbon-700">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              TOTAL VALUE (税込・金具リーダー込)
            </span>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              ¥{evaluation.totalPriceJpy.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenSpecModal}
            disabled={evaluation.completedSlotsCount === 0}
            className={`w-full py-3 px-4 font-display text-base font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors ${
              evaluation.criticalIssues.length > 0
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-electric hover:bg-electric-dim text-carbon-950'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <FileText className="w-4 h-4" />
            <span>
              {evaluation.criticalIssues.length > 0
                ? '不整合を確認してセッティング表を開く'
                : 'このセッティングを一括購入 / 仕様書出力'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
