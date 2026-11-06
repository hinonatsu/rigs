import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Check,
  Crosshair,
  Eye,
  EyeOff,
  Filter,
  Gauge,
  Info,
  ShieldCheck,
  Sparkles,
  Zap,
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
  { step: string; title: string; jpTitle: string; subtitle: string }
> = {
  reel: {
    step: 'BENTO MODULE 01 // SPINNING REEL',
    title: 'SELECT CORE SPINNING REEL',
    jpTitle: '主軸スピニングリールの選択',
    subtitle:
      'ターゲット魚種とPE号数・糸巻き量の基準となる主軸リール（14000番〜20000番）を選択。選択すると適合ロッドが自動計算されます。',
  },
  rod: {
    step: 'BENTO MODULE 02 // OFFSHORE ROD',
    title: 'COMPATIBLE CASTING RODS',
    jpTitle: '物理適合キャスティングロッドの選択',
    subtitle:
      '選択したリール番手・PE号数上限・プラグ総重量（針込）に物理適合するロッドを自動判定し、バネ挙動で展開します。',
  },
  line_pe: {
    step: 'BENTO MODULE 03-A // MAIN PE LINE',
    title: 'SPOOL-MATCHED PE LINE',
    jpTitle: 'スプール100%適合 PEラインの選択',
    subtitle:
      'リールのスプール容量に対し下巻き不要で100%ジャスト格納でき、ロッド強度上限を超えないPEラインを選択。',
  },
  line_leader: {
    step: 'BENTO MODULE 03-B // SHOCK LEADER',
    title: 'FINE-TUNE SHOCK LEADER',
    jpTitle: '適合ショックリーダーの微調整',
    subtitle:
      'PEラインの直線強力(lb)とガイド抜けに適合するショックリーダー（PE選択時に最適号数が自動セットされます）。',
  },
  lure_plug: {
    step: 'BENTO MODULE 04-A // OFFSHORE PLUG',
    title: 'SELECT DIVING PENCIL & POPPER',
    jpTitle: 'オフショアプラグの選択（針込重量判定）',
    subtitle:
      'プラグ単体重量に「適合太軸フック＆リング重量」を加算した実戦総重量でロッドの許容ウェイト・スイートスポットを判定。',
  },
  lure_hook: {
    step: 'BENTO MODULE 04-B // HEAVY HOOK & RING',
    title: 'HEAVY WIRE HOOK & RING SET',
    jpTitle: '太軸フック＆強化スプリットリング仕様切替',
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
  const [animGeneration, setAnimGeneration] = useState<number>(0);

  // Trigger Staggered Spring entrance animation whenever activeTab, reel, or rod changes
  useEffect(() => {
    setBrandFilter('ALL');
    setAnimGeneration((prev) => prev + 1);
  }, [activeTab, build.reel?.id, build.rod?.id]);

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

  const renderSpecBentoCells = (item: AnyGearProduct, evalResult: ItemEvaluationResult) => {
    if (item.category === 'reel') {
      const r = item as ReelProduct;
      const capStr = Object.entries(r.specs.peCapacityMap)
        .map(([pe, m]) => `PE${pe}:${m}m`)
        .join(' / ');
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mt-4 border-t border-white/10">
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">番手 / 自重</div>
            <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
              #{r.specs.sizeClass} / {r.specs.weightG}g
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">ギア比 / 巻上長</div>
            <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
              {r.specs.gearRatio} ({r.specs.retrieveCm}cm)
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">実用 / 最大ドラグ</div>
            <div className="font-oswald text-sm sm:text-base text-[#00E5FF] font-semibold tracking-wide leading-relaxed">
              {r.specs.practicalDragKg}kg / {r.specs.maxDragKg}kg
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">PE糸巻き量</div>
            <div
              className="font-oswald text-sm sm:text-base text-[#00E5FF] font-semibold tracking-wide truncate leading-relaxed"
              title={capStr}
            >
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mt-4 border-t border-white/10">
            <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
              <div className="font-jp text-[11px] text-slate-300 leading-relaxed">全長 / 自重</div>
              <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
                {rod.specs.lengthFtIn} ({rod.specs.weightG}g)
              </div>
            </div>
            <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
              <div className="font-jp text-[11px] text-slate-300 leading-relaxed">適合ルアー (最適域)</div>
              <div className="font-oswald text-sm sm:text-base text-[#00E5FF] font-semibold tracking-wide leading-relaxed">
                {rod.specs.lureMinG}–{rod.specs.lureMaxG}g ({rod.specs.lureSweetMinG}–
                {rod.specs.lureSweetMaxG}g)
              </div>
            </div>
            <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
              <div className="font-jp text-[11px] text-slate-300 leading-relaxed">適合PEライン</div>
              <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
                PE {rod.specs.minPe}–{rod.specs.maxPe}号
              </div>
            </div>
            <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
              <div className="font-jp text-[11px] text-slate-300 leading-relaxed">最大ドラグ / 推奨番手</div>
              <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
                {rod.specs.maxDragKg}kg / #{rod.specs.compatibleReelSizes.join('・')}
              </div>
            </div>
          </div>
          {evalResult.subMetrics?.totalLureWeightG !== undefined && (
            <RodWeightWindowBar
              rod={rod}
              totalLureWeightG={evalResult.subMetrics.totalLureWeightG}
            />
          )}
        </div>
      );
    }

    if (item.category === 'line') {
      const ln = item as LineProduct;
      const isPe = ln.specs.subType === 'pe_main';
      return (
        <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-white/10">
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">
              {isPe ? 'PE号数 / 長さ' : 'リーダー長さ'}
            </div>
            <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
              {isPe ? `PE ${ln.specs.peNumber}号 (${ln.specs.lengthM}m)` : `${ln.specs.lengthM}m`}
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">直線最大強力</div>
            <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
              {ln.specs.strengthLb}lb ({Math.round(ln.specs.strengthLb * 0.4536)}kg)
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">
              {isPe ? '自動ペアリングリーダー' : '適合PE号数レンジ'}
            </div>
            <div className="font-oswald text-sm sm:text-base text-[#00E5FF] font-semibold tracking-wide truncate leading-relaxed">
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
        <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-white/10">
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">
              {isPlug ? '全長 / 本体単体' : '前後セット総重量'}
            </div>
            <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
              {isPlug ? `${lr.specs.lengthMm}mm / ${lr.specs.weightG}g` : `${lr.specs.weightG}g`}
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">
              {isPlug ? '実戦総重量 (適合針込)' : '適合プラグ規格'}
            </div>
            <div className="font-oswald text-sm sm:text-base text-[#00E5FF] font-semibold tracking-wide leading-relaxed">
              {isPlug
                ? `${evalResult.subMetrics?.totalLureWeightG ?? lr.specs.weightG}g`
                : lr.specs.hookCode.replace('CLASS_', '#').replace('_', '/')}
            </div>
          </div>
          <div className="bg-[#1A1A1A]/85 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="font-jp text-[11px] text-slate-300 leading-relaxed">推奨ライン下限</div>
            <div className="font-oswald text-sm sm:text-base text-white font-semibold tracking-wide leading-relaxed">
              PE {lr.specs.minPe}号+
            </div>
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
    <section
      aria-label="パーツセレクター＆互換性Bentoグリッド"
      className="flex-1 min-w-0 flex flex-col gap-6"
    >
      {/* ==================== BENTO STEP NAVIGATION BAR ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(
          [
            {
              id: 'reel',
              code: '01 REEL',
              label: '主軸リール',
              sub: build.reel ? `#${build.reel.specs.sizeClass}` : 'Unselected',
              selected: Boolean(build.reel),
            },
            {
              id: 'rod',
              code: '02 ROD',
              label: '適合ロッド',
              sub: build.rod ? build.rod.specs.lengthFtIn : 'Unselected',
              selected: Boolean(build.rod),
            },
            {
              id: 'line_pe',
              code: '03 LINE',
              label: 'PE＆リーダー',
              sub: build.peLine ? `PE#${build.peLine.specs.peNumber}` : 'Unselected',
              selected: Boolean(build.peLine),
            },
            {
              id: 'lure_plug',
              code: '04 LURE',
              label: 'プラグ＆金具',
              sub: build.plug ? `${build.plug.specs.weightG}g+Hook` : 'Unselected',
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
              className={`cyber-float-hover p-4 rounded-2xl text-left flex items-center justify-between gap-2 ${
                active ? 'bento-glass-active' : 'bento-glass-card'
              }`}
            >
              <div className="min-w-0 space-y-2">
                <div className="font-inter text-[11px] font-bold tracking-widest text-[#00E5FF] uppercase leading-relaxed">
                  {step.code}
                </div>
                <div className="font-jp text-sm font-bold text-white truncate leading-relaxed">
                  {step.label}
                </div>
                <div className="font-oswald text-xs text-slate-300 tracking-wider leading-relaxed">
                  {step.sub}
                </div>
              </div>
              {step.selected && (
                <span className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF] text-[#00E5FF] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,229,255,0.35)]">
                  <Check className="w-4 h-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== SELECTED ROD SPRING-STAGGER SYNERGY BENTO ==================== */}
      {build.rod && (
        <div
          key={`rod-synergy-${build.rod.id}`}
          className="bento-glass-card rounded-2xl p-6 border border-[#00E5FF]/40"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 leading-relaxed">
              <Zap className="w-4 h-4 text-[#00E5FF]" />
              <span className="font-inter text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                SELECTED ROD SYNERGY TELEMETRY
              </span>
              <span className="font-jp text-xs text-slate-200">
                — 選択中ロッド「{build.rod.brand} {build.rod.modelName}」の物理適合パラメータ
              </span>
            </div>
            <span className="font-oswald text-xs px-2 py-0 leading-6 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/60 text-[#00E5FF] tracking-wider self-start sm:self-auto">
              SPRING-SYNC ACTIVE
            </span>
          </div>

          {/* 4 Bento Sub-Modules that Stagger + Spring in when a compatible rod is selected */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Crosshair,
                label: '推奨リール番手整合',
                value: `#${build.rod.specs.compatibleReelSizes.join(' / #')}`,
                sub: build.reel
                  ? `現在装着: #${build.reel.specs.sizeClass} (${
                      build.rod.specs.compatibleReelSizes.includes(build.reel.specs.sizeClass)
                        ? '完全適合'
                        : '番手不一致'
                    })`
                  : 'リール未選択',
              },
              {
                icon: Gauge,
                label: '許容ルアー＆最適スイート域',
                value: `${build.rod.specs.lureMinG}–${build.rod.specs.lureMaxG}g`,
                sub: `最適: ${build.rod.specs.lureSweetMinG}–${build.rod.specs.lureSweetMaxG}g (針込基準)`,
              },
              {
                icon: ShieldCheck,
                label: '最大ドラグ負荷 (45°)',
                value: `MAX ${build.rod.specs.maxDragKg} kg`,
                sub: `推奨初期ドラグ ${(build.rod.specs.maxDragKg * 0.6).toFixed(1)}–${(
                  build.rod.specs.maxDragKg * 0.78
                ).toFixed(1)}kg`,
              },
              {
                icon: Activity,
                label: '適合PEラインレンジ',
                value: `PE ${build.rod.specs.minPe}–${build.rod.specs.maxPe}号`,
                sub: `ロッド自重 ${build.rod.specs.weightG}g / 全長 ${build.rod.specs.lengthFtIn}`,
              },
            ].map((metric, mIdx) => {
              const IconComp = metric.icon;
              return (
                <div
                  key={metric.label}
                  style={{ animationDelay: `${mIdx * 75}ms` }}
                  className="animate-spring-stagger bg-[#1A1A1A]/90 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between text-slate-300 leading-relaxed">
                    <span className="font-jp text-[11px] font-medium">{metric.label}</span>
                    <IconComp className="w-3.5 h-3.5 text-[#00E5FF]" />
                  </div>
                  <div className="font-oswald text-lg sm:text-xl font-bold text-white tracking-wide leading-relaxed">
                    {metric.value}
                  </div>
                  <div className="font-jp text-[11px] text-[#00E5FF] truncate leading-relaxed">
                    {metric.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== SUB-SLOT TOGGLE BAR (LINE OR LURE) ==================== */}
      {(activeTab === 'line_pe' || activeTab === 'line_leader') && (
        <div className="bento-glass-card rounded-2xl p-4 flex flex-wrap items-center gap-2">
          <span className="font-jp text-xs font-medium text-slate-200 px-2 leading-relaxed">
            LINE システム構成要素:
          </span>
          <button
            type="button"
            onClick={() => onSelectTab('line_pe')}
            className={`cyber-float-hover px-4 py-2 rounded-xl text-xs font-jp font-bold border leading-4 ${
              activeTab === 'line_pe'
                ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF]'
                : 'bg-[#1A1A1A] text-slate-200 border-white/15'
            }`}
          >
            MAIN: PEライン (6種)
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('line_leader')}
            className={`cyber-float-hover px-4 py-2 rounded-xl text-xs font-jp font-bold border leading-4 ${
              activeTab === 'line_leader'
                ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF]'
                : 'bg-[#1A1A1A] text-slate-200 border-white/15'
            }`}
          >
            SUB: ショックリーダー (4種)
          </button>
        </div>
      )}

      {(activeTab === 'lure_plug' || activeTab === 'lure_hook') && (
        <div className="bento-glass-card rounded-2xl p-4 flex flex-wrap items-center gap-2">
          <span className="font-jp text-xs font-medium text-slate-200 px-2 leading-relaxed">
            LURE システム構成要素:
          </span>
          <button
            type="button"
            onClick={() => onSelectTab('lure_plug')}
            className={`cyber-float-hover px-4 py-2 rounded-xl text-xs font-jp font-bold border leading-4 ${
              activeTab === 'lure_plug'
                ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF]'
                : 'bg-[#1A1A1A] text-slate-200 border-white/15'
            }`}
          >
            MAIN: ダイビングペンシル＆ポッパー (8種)
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('lure_hook')}
            className={`cyber-float-hover px-4 py-2 rounded-xl text-xs font-jp font-bold border leading-4 ${
              activeTab === 'lure_hook'
                ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF]'
                : 'bg-[#1A1A1A] text-slate-200 border-white/15'
            }`}
          >
            SUB: 太軸フック＆強化リングセット (6種)
          </button>
        </div>
      )}

      {/* ==================== BENTO HEADER & FILTER CONTROLS ==================== */}
      <div className="bento-glass-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="font-inter text-xs font-bold text-[#00E5FF] tracking-widest uppercase leading-relaxed">
            {meta.step}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 leading-relaxed">
            <h1 className="font-inter text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {meta.title}
            </h1>
            <span className="font-jp text-sm font-medium text-slate-200">
              / {meta.jpTitle}
            </span>
          </div>
          <p className="font-jp text-xs sm:text-sm font-normal text-slate-200 leading-relaxed">
            {meta.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Brand Filter */}
          <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/20 rounded-xl px-4 py-2">
            <Filter className="w-4 h-4 text-[#00E5FF]" />
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              aria-label="ブランドで絞り込み"
              className="bg-transparent text-xs font-inter font-semibold text-white focus:outline-none cursor-pointer leading-4"
            >
              <option value="ALL" className="bg-[#2D2D2D] text-white">
                ALL BRANDS ({candidates.length})
              </option>
              {allBrands.map((b) => (
                <option key={b} value={b} className="bg-[#2D2D2D] text-white">
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
              className={`cyber-float-hover px-4 py-2 rounded-xl text-xs font-jp font-semibold border flex items-center gap-2 leading-4 ${
                showIncompatible
                  ? 'bg-[#2D2D2D] border-white/25 text-white'
                  : 'bg-[#1A1A1A] border-white/15 text-slate-300'
              }`}
            >
              {showIncompatible ? (
                <Eye className="w-4 h-4 text-[#00E5FF]" />
              ) : (
                <EyeOff className="w-4 h-4 text-slate-300" />
              )}
              <span>不適合品 ({incompatibleList.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== 1. COMPATIBLE ITEMS BENTO GRID ==================== */}
      <div className="flex items-center justify-between px-2 leading-relaxed">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] inline-block" />
          <h3 className="font-jp text-sm font-bold tracking-wide text-white">
            物理適合アイテム{' '}
            <span className="font-oswald text-[#00E5FF] text-base ml-2">
              ({compatibleList.length} MODELS)
            </span>
          </h3>
        </div>
        <span className="font-jp text-xs text-slate-200 hidden sm:inline">
          スイートスポット適合スコア順 • Staggered Spring 展開
        </span>
      </div>

      {compatibleList.length === 0 ? (
        <div className="bento-glass-card rounded-2xl p-10 text-center font-jp text-sm text-slate-200 leading-relaxed">
          現在の絞り込み条件に適合するアイテムがありません。ブランドフィルタまたは他スロットの選択を見直してください。
        </div>
      ) : (
        <div
          key={`bento-grid-${activeTab}-${animGeneration}`}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          {compatibleList.map(({ item, evalResult }, idx) => {
            const selected = isCurrentlySelected(item);
            const isTopPick = idx === 0 && evalResult.score >= 100;
            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                style={{ animationDelay: `${idx * 75}ms` }}
                onClick={() => onSelectItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectItem(item);
                  }
                }}
                className={`animate-spring-stagger cyber-float-hover cursor-pointer rounded-2xl p-6 flex flex-col justify-between ${
                  selected ? 'bento-glass-active' : 'bento-glass-card'
                }`}
              >
                <div>
                  {/* Top Status Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-inter text-xs font-extrabold text-[#00E5FF] uppercase tracking-widest px-2 py-0 leading-6 rounded-md bg-[#1A1A1A] border border-[#00E5FF]/40">
                        {item.brand}
                      </span>
                      {isTopPick && (
                        <span className="font-inter text-[11px] font-bold px-2 py-0 leading-6 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          BEST SWEET SPOT
                        </span>
                      )}
                      {selected && (
                        <span className="font-inter text-[11px] font-extrabold px-2 py-0 leading-6 rounded-full bg-[#00E5FF] text-[#1A1A1A] shadow-[0_0_12px_rgba(0,229,255,0.5)]">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-oswald text-2xl font-bold text-white tracking-tight tabular-nums leading-relaxed">
                        ¥{item.priceJpy.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Schematic + Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-5">
                      <GearSchematic item={item} />
                    </div>
                    <div className="sm:col-span-7 space-y-2">
                      <h4 className="font-inter text-lg sm:text-xl font-bold text-white leading-relaxed">
                        {item.modelName}
                      </h4>
                      <div className="inline-block font-jp text-xs font-medium px-2 py-0 leading-6 rounded-lg bg-[#1A1A1A] border border-[#00E5FF]/50 text-[#00E5FF]">
                        {evalResult.headlineMetric}
                      </div>
                      <p className="font-jp text-xs sm:text-[13px] font-normal text-slate-200 leading-relaxed">
                        {item.expertNote}
                      </p>
                    </div>
                  </div>

                  {/* Quantitative Spec Bento Cells */}
                  {renderSpecBentoCells(item, evalResult)}
                </div>

                {/* Match Ground / Action Footer */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="font-jp text-xs text-slate-200 flex items-start gap-2 min-w-0 leading-relaxed">
                    <Check className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0" />
                    <span className="truncate font-medium">
                      {evalResult.reasons[0] ?? '現在のセットアップ構成に100%物理適合'}
                    </span>
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    className={`cyber-float-hover shrink-0 px-4 py-2 rounded-xl font-jp text-xs font-bold flex items-center gap-2 border leading-4 ${
                      selected
                        ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                        : 'bg-[#1A1A1A] text-white border-white/25 hover:border-[#00E5FF] hover:text-[#00E5FF]'
                    }`}
                  >
                    <span>{selected ? '装着中' : 'この機材を装着'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ==================== 2. INCOMPATIBLE ITEMS (WITH PHYSICAL FAILURE REASONS) ==================== */}
      {incompatibleList.length > 0 && showIncompatible && (
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 leading-relaxed">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <h3 className="font-jp text-sm font-bold text-rose-200">
                現在の構成に対して物理的不適合なアイテム ({incompatibleList.length}機種)
              </h3>
            </div>
            <span className="font-jp text-xs text-slate-200 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#00E5FF]" />
              ロッド破損・スプール糸溢れ・ルアー浮力破綻を防ぐため物理根拠を表示しています
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {incompatibleList.map(({ item, evalResult }) => (
              <article
                key={item.id}
                className="bento-glass-card rounded-2xl border-rose-500/40 p-6 opacity-85 hover:opacity-100 transition-opacity flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-inter text-xs font-bold text-slate-200 uppercase tracking-wider leading-relaxed">
                        {item.brand}
                      </span>
                      <span className="font-inter text-[11px] px-2 py-0 leading-6 rounded-full bg-rose-950 border border-rose-400 text-rose-200 font-bold">
                        INCOMPATIBLE (物理不適合)
                      </span>
                    </div>
                    <span className="font-oswald text-lg font-semibold text-slate-200 tabular-nums leading-relaxed">
                      ¥{item.priceJpy.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="font-inter text-lg font-bold text-white leading-relaxed">
                        {item.modelName}
                      </h4>
                      <div className="font-jp text-xs text-slate-200 leading-relaxed">
                        {evalResult.headlineMetric}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="cyber-float-hover font-jp text-xs font-semibold px-4 py-2 rounded-xl border border-white/25 bg-[#1A1A1A] text-white hover:border-[#00E5FF] hover:text-[#00E5FF] shrink-0 leading-4"
                      title="このアイテムを基準に組み直す"
                    >
                      この機材を基準に変更
                    </button>
                  </div>

                  {/* Physical Failure Reasons Box */}
                  <div className="mt-4 p-4 rounded-xl bg-rose-950/50 border border-rose-400/50 space-y-2">
                    {evalResult.reasons.map((reason, rIdx) => (
                      <div
                        key={rIdx}
                        className="font-jp text-xs text-rose-100 flex items-start gap-2 leading-relaxed"
                      >
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0" />
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
