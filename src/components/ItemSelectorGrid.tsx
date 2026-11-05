import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Filter,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  AnyGearProduct,
  ItemEvaluationResult,
  LineProduct,
  LureProduct,
  ReelProduct,
  RodProduct,
  TackleBuildState,
} from '../types/tackle';
import { ActiveSelectorTab } from './TackleBoxDock';
import { GearSchematic, RodWeightWindowBar } from './GearSchematic';

interface EvaluatedCandidate<T extends AnyGearProduct = AnyGearProduct> {
  item: T;
  evalResult: ItemEvaluationResult;
}

interface ItemSelectorGridProps {
  activeTab: ActiveSelectorTab;
  onSelectTab: (tab: ActiveSelectorTab) => void;
  build: TackleBuildState;
  candidates: EvaluatedCandidate[];
  onSelectItem: (item: AnyGearProduct) => void;
}

const TAB_META: Record<
  ActiveSelectorTab,
  { step: string; title: string; subtitle: string }
> = {
  reel: {
    step: 'SLOT 01 / REEL',
    title: 'CHOOSE YOUR SPINNING REEL',
    subtitle:
      'ターゲット魚種とPE号数・糸巻き量の基準となる主軸リール（14000番〜20000番）を選択。',
  },
  rod: {
    step: 'SLOT 02 / ROD',
    title: 'CHOOSE YOUR CASTING ROD',
    subtitle:
      '選択したリール番手・PE号数上限・プラグ総重量（針込）に物理適合するロッドを自動判定。',
  },
  line_pe: {
    step: 'SLOT 03-A / MAIN PE LINE',
    title: 'CHOOSE YOUR PE LINE (SPOOL MATCH)',
    subtitle:
      'リールのスプール容量に対し下巻き不要で100%ジャスト格納でき、ロッド強度上限を超えないPEラインを選択。',
  },
  line_leader: {
    step: 'SLOT 03-B / SUB SHOCK LEADER',
    title: 'FINE-TUNE SHOCK LEADER',
    subtitle:
      'PEラインの直線強力(lb)とガイド抜けに適合するショックリーダー（PE選択時に最適号数が自動セットされます）。',
  },
  lure_plug: {
    step: 'SLOT 04-A / DIVING PENCIL & POPPER',
    title: 'CHOOSE YOUR OFFSHORE PLUG',
    subtitle:
      'プラグ単体重量に「適合太軸フック＆リング重量」を加算した実戦総重量でロッドの許容ウェイト・スイートスポットを判定。',
  },
  lure_hook: {
    step: 'SLOT 04-B / SUB HOOK & SPLIT RING SET',
    title: 'FINE-TUNE HEAVY WIRE HOOK & RING',
    subtitle:
      'プラグの浮力設計規格(#3/0〜#5/0相当)を維持したまま、トレブル仕様またはマグロ用シングル仕様を切り替え可能。',
  },
};

export const ItemSelectorGrid: React.FC<ItemSelectorGridProps> = ({
  activeTab,
  onSelectTab,
  build,
  candidates,
  onSelectItem,
}) => {
  const [showIncompatible, setShowIncompatible] = useState<boolean>(true);
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  const meta = TAB_META[activeTab];

  const allBrands = Array.from(new Set(candidates.map((c) => c.item.brand)));

  const filteredCandidates = candidates.filter((c) =>
    brandFilter === 'ALL' ? true : c.item.brand === brandFilter
  );

  // Sort compatible items by score descending, then price
  const compatibleList = filteredCandidates
    .filter((c) => c.evalResult.status !== 'incompatible')
    .sort((a, b) => b.evalResult.score - a.evalResult.score);

  const incompatibleList = filteredCandidates.filter(
    (c) => c.evalResult.status === 'incompatible'
  );

  const isCurrentlySelected = (item: AnyGearProduct): boolean => {
    if (item.category === 'reel') return build.reel?.id === item.id;
    if (item.category === 'rod') return build.rod?.id === item.id;
    if (item.category === 'line') {
      return item.specs.subType === 'pe_main'
        ? build.peLine?.id === item.id
        : build.shockLeader?.id === item.id;
    }
    return item.specs.subType === 'plug_main'
      ? build.plug?.id === item.id
      : build.hookSet?.id === item.id;
  };

  const renderSpecTable = (item: AnyGearProduct, evalResult: ItemEvaluationResult) => {
    if (item.category === 'reel') {
      const r = item as ReelProduct;
      const capStr = Object.entries(r.specs.peCapacityMap)
        .map(([pe, m]) => `PE${pe}号:${m}m`)
        .join(' / ');
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 mt-2.5 border-t border-carbon-700/80 font-mono text-xs tabular-nums">
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">番手 / 自重</div>
            <div className="text-slate-100 font-semibold">
              #{r.specs.sizeClass} / {r.specs.weightG}g
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">ギア比 / 最大巻上長</div>
            <div className="text-slate-100 font-semibold">
              {r.specs.gearRatio} ({r.specs.retrieveCm}cm)
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">実用 / 最大ドラグ</div>
            <div className="text-slate-100 font-semibold">
              {r.specs.practicalDragKg}kg / {r.specs.maxDragKg}kg
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">PE糸巻き量</div>
            <div className="text-electric font-semibold truncate" title={capStr}>
              {capStr}
            </div>
          </div>
        </div>
      );
    }

    if (item.category === 'rod') {
      const rod = item as RodProduct;
      return (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 mt-2.5 border-t border-carbon-700/80 font-mono text-xs tabular-nums">
            <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
              <div className="text-[10px] text-slate-400">全長 / 自重</div>
              <div className="text-slate-100 font-semibold">
                {rod.specs.lengthFtIn} ({rod.specs.weightG}g)
              </div>
            </div>
            <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
              <div className="text-[10px] text-slate-400">適合ルアー (最適域)</div>
              <div className="text-electric font-semibold">
                {rod.specs.lureMinG}–{rod.specs.lureMaxG}g ({rod.specs.lureSweetMinG}–
                {rod.specs.lureSweetMaxG}g)
              </div>
            </div>
            <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
              <div className="text-[10px] text-slate-400">適合PEライン</div>
              <div className="text-slate-100 font-semibold">
                PE {rod.specs.minPe}–{rod.specs.maxPe}号
              </div>
            </div>
            <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
              <div className="text-[10px] text-slate-400">最大ドラグ (45°) / 推奨番手</div>
              <div className="text-slate-100 font-semibold">
                {rod.specs.maxDragKg}kg / #{rod.specs.compatibleReelSizes.join('・')}
              </div>
            </div>
          </div>
          {evalResult.subMetrics?.totalLureWeightG !== undefined && (
            <RodWeightWindowBar rod={rod} totalLureWeightG={evalResult.subMetrics.totalLureWeightG} />
          )}
        </div>
      );
    }

    if (item.category === 'line') {
      const ln = item as LineProduct;
      const isPe = ln.specs.subType === 'pe_main';
      return (
        <div className="grid grid-cols-3 gap-2 pt-2.5 mt-2.5 border-t border-carbon-700/80 font-mono text-xs tabular-nums">
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">{isPe ? 'PE号数 / 長さ' : 'リーダー長さ'}</div>
            <div className="text-slate-100 font-semibold">
              {isPe ? `PE ${ln.specs.peNumber}号 (${ln.specs.lengthM}m)` : `${ln.specs.lengthM}mスプール`}
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">直線最大強力</div>
            <div className="text-slate-100 font-semibold">
              {ln.specs.strengthLb}lb ({Math.round(ln.specs.strengthLb * 0.4536)}kg)
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">
              {isPe ? '自動セット推奨リーダー' : '適合PE号数レンジ'}
            </div>
            <div className="text-electric font-semibold truncate">
              {isPe
                ? ln.specs.defaultSubLeaderSku?.replace('LEADER-VARIVAS-OR-', '') ?? '-'
                : `PE ${ln.specs.compatiblePeMin}–${ln.specs.compatiblePeMax}号`}
            </div>
          </div>
        </div>
      );
    }

    // Lure
    const lr = item as LureProduct;
    const isPlug = lr.specs.subType === 'plug_main';
    return (
      <div>
        <div className="grid grid-cols-3 gap-2 pt-2.5 mt-2.5 border-t border-carbon-700/80 font-mono text-xs tabular-nums">
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">
              {isPlug ? '全長 / 本体重量' : '前後セット総重量'}
            </div>
            <div className="text-slate-100 font-semibold">
              {isPlug ? `${lr.specs.lengthMm}mm / ${lr.specs.weightG}g` : `${lr.specs.weightG}g`}
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">
              {isPlug ? '実戦総重量 (適合針込)' : '適合プラグ規格'}
            </div>
            <div className="text-electric font-semibold">
              {isPlug
                ? `${evalResult.subMetrics?.totalLureWeightG ?? lr.specs.weightG}g`
                : lr.specs.hookCode.replace('CLASS_', '#').replace('_', '/')}
            </div>
          </div>
          <div className="bg-carbon-950/80 px-2.5 py-1.5 border border-carbon-800">
            <div className="text-[10px] text-slate-400">推奨ライン下限</div>
            <div className="text-slate-100 font-semibold">PE {lr.specs.minPe}号以上</div>
          </div>
        </div>
        {isPlug && build.rod && evalResult.subMetrics?.totalLureWeightG !== undefined && (
          <RodWeightWindowBar
            rod={build.rod}
            totalLureWeightG={evalResult.subMetrics.totalLureWeightG}
          />
        )}
      </div>
    );
  };

  return (
    <section className="flex-1 min-w-0 flex flex-col">
      {/* Category Step Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4">
        {(
          [
            { id: 'reel', code: '01 REEL', label: '主軸リール', selected: Boolean(build.reel) },
            { id: 'rod', code: '02 ROD', label: 'ロッド', selected: Boolean(build.rod) },
            {
              id: 'line_pe',
              code: '03 LINE',
              label: 'PE＆リーダー',
              selected: Boolean(build.peLine),
            },
            {
              id: 'lure_plug',
              code: '04 LURE',
              label: 'プラグ＆金具',
              selected: Boolean(build.plug),
            },
          ] as const
        ).map((step) => {
          const active =
            activeTab === step.id ||
            (step.id === 'line_pe' && activeTab === 'line_leader') ||
            (step.id === 'lure_plug' && activeTab === 'lure_hook');
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectTab(step.id)}
              className={`px-3 py-2.5 text-left border transition-colors flex items-center justify-between ${
                active
                  ? 'bg-carbon-800 border-electric text-white'
                  : 'bg-carbon-900 border-carbon-700 text-slate-400 hover:border-carbon-600 hover:text-slate-200'
              }`}
            >
              <div>
                <div className="font-mono text-[10px] tracking-wider text-electric">{step.code}</div>
                <div className="text-xs font-bold mt-0.5">{step.label}</div>
              </div>
              {step.selected && (
                <span className="w-5 h-5 bg-electric/15 border border-electric text-electric flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-slot Toggle Bar when in LINE or LURE */}
      {(activeTab === 'line_pe' || activeTab === 'line_leader') && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-carbon-900 border border-carbon-700">
          <span className="text-xs text-slate-400 px-2">LINE 構成要素:</span>
          <button
            type="button"
            onClick={() => onSelectTab('line_pe')}
            className={`px-3 py-1 text-xs font-mono border transition-colors ${
              activeTab === 'line_pe'
                ? 'bg-electric text-carbon-950 border-electric font-bold'
                : 'bg-carbon-950 text-slate-300 border-carbon-700'
            }`}
          >
            MAIN: PEライン (6種)
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('line_leader')}
            className={`px-3 py-1 text-xs font-mono border transition-colors ${
              activeTab === 'line_leader'
                ? 'bg-electric text-carbon-950 border-electric font-bold'
                : 'bg-carbon-950 text-slate-300 border-carbon-700'
            }`}
          >
            SUB: ショックリーダー (4種)
          </button>
        </div>
      )}

      {(activeTab === 'lure_plug' || activeTab === 'lure_hook') && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-carbon-900 border border-carbon-700">
          <span className="text-xs text-slate-400 px-2">LURE 構成要素:</span>
          <button
            type="button"
            onClick={() => onSelectTab('lure_plug')}
            className={`px-3 py-1 text-xs font-mono border transition-colors ${
              activeTab === 'lure_plug'
                ? 'bg-electric text-carbon-950 border-electric font-bold'
                : 'bg-carbon-950 text-slate-300 border-carbon-700'
            }`}
          >
            MAIN: ダイビングペンシル＆ポッパー (8種)
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('lure_hook')}
            className={`px-3 py-1 text-xs font-mono border transition-colors ${
              activeTab === 'lure_hook'
                ? 'bg-electric text-carbon-950 border-electric font-bold'
                : 'bg-carbon-950 text-slate-300 border-carbon-700'
            }`}
          >
            SUB: 太軸フック＆強化リングセット (6種)
          </button>
        </div>
      )}

      {/* Section Header & Filter Controls */}
      <div className="bg-carbon-900 border border-carbon-700 p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-electric tracking-wider uppercase">{meta.step}</div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-white mt-0.5">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-300 mt-1">{meta.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Brand Filter */}
          <div className="flex items-center gap-1 bg-carbon-950 border border-carbon-700 px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              aria-label="ブランドで絞り込み"
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
            >
              <option value="ALL" className="bg-carbon-900">
                ALL BRANDS ({candidates.length})
              </option>
              {allBrands.map((b) => (
                <option key={b} value={b} className="bg-carbon-900">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Incompatible Visibility */}
          {incompatibleList.length > 0 && (
            <button
              type="button"
              onClick={() => setShowIncompatible((prev) => !prev)}
              className={`px-2.5 py-1 text-xs font-mono border flex items-center gap-1.5 transition-colors ${
                showIncompatible
                  ? 'bg-carbon-800 border-carbon-600 text-slate-200'
                  : 'bg-carbon-950 border-carbon-700 text-slate-400'
              }`}
            >
              {showIncompatible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>不適合品 ({incompatibleList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== 1. COMPATIBLE ITEMS GRID ==================== */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-electric inline-block" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            物理適合アイテム ({compatibleList.length}機種)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          スイートスポット適合スコア順
        </span>
      </div>

      {compatibleList.length === 0 ? (
        <div className="p-8 bg-carbon-900 border border-carbon-700 text-center text-sm text-slate-400 mb-6">
          現在の絞り込み条件に適合するアイテムがありません。ブランドフィルタまたは他スロットの選択を見直してください。
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 mb-8">
          {compatibleList.map(({ item, evalResult }, idx) => {
            const selected = isCurrentlySelected(item);
            const isTopPick = idx === 0 && evalResult.score >= 100;
            return (
              <article
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`cursor-pointer border transition-colors flex flex-col justify-between p-4 ${
                  selected
                    ? 'bg-carbon-800 border-electric'
                    : 'bg-carbon-900 border-carbon-700 hover:border-slate-500 hover:bg-carbon-850'
                }`}
              >
                <div>
                  {/* Top Status Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-electric uppercase tracking-wider">
                        {item.brand}
                      </span>
                      {isTopPick && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-electric/15 border border-electric text-electric flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          BEST SWEET SPOT
                        </span>
                      )}
                      {selected && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-electric text-carbon-950 font-bold">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      ¥{item.priceJpy.toLocaleString()}
                    </span>
                  </div>

                  {/* Schematic + Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <GearSchematic item={item} />
                    </div>
                    <div className="sm:col-span-7">
                      <h4 className="font-display text-xl font-bold text-white leading-tight">
                        {item.modelName}
                      </h4>
                      <div className="mt-1.5 inline-block font-mono text-[11px] px-2 py-0.5 bg-carbon-950 border border-carbon-700 text-electric">
                        {evalResult.headlineMetric}
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {item.expertNote}
                      </p>
                    </div>
                  </div>

                  {/* Quantitative Spec Table */}
                  {renderSpecTable(item, evalResult)}
                </div>

                {/* Match Ground / Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-carbon-700/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-300 flex items-start gap-1.5 min-w-0">
                    <Check className="w-3.5 h-3.5 text-electric shrink-0 mt-0.5" />
                    <span className="truncate">
                      {evalResult.reasons[0] ?? '現在のセットアップ構成に100%物理適合'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`shrink-0 px-3 py-1 font-mono text-xs font-semibold flex items-center gap-1 border transition-colors ${
                      selected
                        ? 'bg-electric text-carbon-950 border-electric'
                        : 'bg-carbon-950 text-slate-200 border-carbon-600 hover:border-electric hover:text-electric'
                    }`}
                  >
                    <span>{selected ? '装着中' : 'セットする'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ==================== 2. INCOMPATIBLE ITEMS (GRAYED OUT WITH PHYSICAL REASONS) ==================== */}
      {incompatibleList.length > 0 && showIncompatible && (
        <div className="pt-4 border-t border-carbon-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-red-300">
                現在の構成に対して物理的不適合なアイテム ({incompatibleList.length}機種)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              破損・スプール溢れ・飛距離低下を防ぐため警告表示しています
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {incompatibleList.map(({ item, evalResult }) => (
              <article
                key={item.id}
                className="bg-carbon-900/50 border border-red-900/60 p-4 opacity-70 hover:opacity-95 transition-opacity flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 uppercase">
                        {item.brand}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-red-950 border border-red-500/80 text-red-300 font-bold">
                        INCOMPATIBLE (不適合)
                      </span>
                    </div>
                    <span className="font-mono text-sm text-slate-400 tabular-nums">
                      ¥{item.priceJpy.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-display text-lg font-bold text-slate-200">
                        {item.modelName}
                      </h4>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {evalResult.headlineMetric}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="text-[11px] font-mono px-2.5 py-1 border border-carbon-600 bg-carbon-950 text-slate-300 hover:border-red-400 hover:text-white shrink-0"
                      title="強制的にこのアイテムを基準に組み直す"
                    >
                      この機材を基準に変更
                    </button>
                  </div>

                  {/* Physical Failure Reasons Box */}
                  <div className="mt-3 p-2.5 bg-red-950/40 border border-red-500/60 space-y-1">
                    {evalResult.reasons.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className="text-xs text-red-200 flex items-start gap-1.5 leading-snug"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
