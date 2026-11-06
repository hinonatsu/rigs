import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Compass,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { TARGET_PRESETS } from './data/masterCatalog';
import {
  evaluateCandidateItem,
  evaluateOverallBuild,
} from './engine/compatibilityEngine';
import { CatalogBundle, fetchGearCatalog } from './lib/supabase';
import {
  AnyGearProduct,
  LineProduct,
  LureProduct,
  ReelProduct,
  RodProduct,
  TackleBuildState,
  TargetPreset,
} from './types/tackle';
import { ActiveSelectorTab, TackleBoxDock } from './components/TackleBoxDock';
import { ItemSelectorGrid } from './components/ItemSelectorGrid';
import { SpecSheetModal } from './components/SpecSheetModal';

export const App: React.FC = () => {
  const [catalog, setCatalog] = useState<CatalogBundle | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveSelectorTab>('rod');
  const [activePresetId, setActivePresetId] = useState<string>(TARGET_PRESETS[0].id);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  const dockSectionRef = useRef<HTMLDivElement>(null);
  const selectorSectionRef = useRef<HTMLDivElement>(null);

  const [build, setBuild] = useState<TackleBuildState>({
    reel: null,
    rod: null,
    peLine: null,
    shockLeader: null,
    plug: null,
    hookSet: null,
  });

  // Load 40-item catalog (Supabase or local hybrid fallback) & apply initial preset
  useEffect(() => {
    let mounted = true;
    fetchGearCatalog().then((bundle) => {
      if (!mounted) return;
      setCatalog(bundle);

      // Apply default preset #1 (Hiramasa / Tuna PE6 Standard)
      const defaultPreset = TARGET_PRESETS[0];
      const reel = bundle.reels.find((r) => r.sku === defaultPreset.skus.reel) ?? null;
      const rod = bundle.rods.find((r) => r.sku === defaultPreset.skus.rod) ?? null;
      const peLine = bundle.lines.find((l) => l.sku === defaultPreset.skus.peLine) ?? null;
      const shockLeader =
        bundle.lines.find((l) => l.sku === defaultPreset.skus.shockLeader) ?? null;
      const plug = bundle.lures.find((l) => l.sku === defaultPreset.skus.plug) ?? null;
      const hookSet = bundle.lures.find((l) => l.sku === defaultPreset.skus.hookSet) ?? null;

      setBuild({ reel, rod, peLine, shockLeader, plug, hookSet });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const applyPreset = (preset: TargetPreset) => {
    if (!catalog) return;
    setActivePresetId(preset.id);
    setBuild({
      reel: catalog.reels.find((r) => r.sku === preset.skus.reel) ?? null,
      rod: catalog.rods.find((r) => r.sku === preset.skus.rod) ?? null,
      peLine: catalog.lines.find((l) => l.sku === preset.skus.peLine) ?? null,
      shockLeader: catalog.lines.find((l) => l.sku === preset.skus.shockLeader) ?? null,
      plug: catalog.lures.find((l) => l.sku === preset.skus.plug) ?? null,
      hookSet: catalog.lures.find((l) => l.sku === preset.skus.hookSet) ?? null,
    });
  };

  // Select an item and automatically bind compatible sub-slot (Leader or Hook/Ring)
  const handleSelectItem = (item: AnyGearProduct) => {
    if (!catalog) return;
    setActivePresetId('');

    if (item.category === 'reel') {
      setBuild((prev) => ({ ...prev, reel: item as ReelProduct }));
      // Switch to 'rod' so compatible rods immediately appear with Stagger + Spring animation
      setActiveTab('rod');
      return;
    }

    if (item.category === 'rod') {
      setBuild((prev) => ({ ...prev, rod: item as RodProduct }));
      return;
    }

    if (item.category === 'line') {
      const lineItem = item as LineProduct;
      if (lineItem.specs.subType === 'pe_main') {
        const autoLeader =
          catalog.lines.find(
            (l) =>
              l.specs.subType === 'leader_sub' && l.sku === lineItem.specs.defaultSubLeaderSku
          ) ?? prevLeaderFallback(lineItem, catalog.lines);

        setBuild((prev) => ({
          ...prev,
          peLine: lineItem,
          shockLeader: autoLeader,
        }));
      } else {
        setBuild((prev) => ({
          ...prev,
          shockLeader: lineItem,
        }));
      }
      return;
    }

    if (item.category === 'lure') {
      const lureItem = item as LureProduct;
      if (lureItem.specs.subType === 'plug_main') {
        const autoHook =
          catalog.lures.find(
            (h) =>
              h.specs.subType === 'hook_ring_sub' && h.sku === lureItem.specs.defaultSubHookSku
          ) ??
          catalog.lures.find(
            (h) =>
              h.specs.subType === 'hook_ring_sub' && h.specs.hookCode === lureItem.specs.hookCode
          ) ??
          null;

        setBuild((prev) => ({
          ...prev,
          plug: lureItem,
          hookSet: autoHook,
        }));
      } else {
        setBuild((prev) => ({
          ...prev,
          hookSet: lureItem,
        }));
      }
    }
  };

  const handleRemoveSlot = (slot: keyof TackleBuildState) => {
    setActivePresetId('');
    setBuild((prev) => {
      if (slot === 'peLine') {
        return { ...prev, peLine: null, shockLeader: null };
      }
      if (slot === 'plug') {
        return { ...prev, plug: null, hookSet: null };
      }
      return { ...prev, [slot]: null };
    });
  };

  const handleClearBuild = () => {
    setActivePresetId('');
    setBuild({
      reel: null,
      rod: null,
      peLine: null,
      shockLeader: null,
      plug: null,
      hookSet: null,
    });
    setActiveTab('reel');
  };

  const handleInjectCustomProduct = (newProduct: AnyGearProduct) => {
    setCatalog((prev) => {
      if (!prev) return prev;
      if (newProduct.category === 'reel') {
        return { ...prev, reels: [newProduct as ReelProduct, ...prev.reels] };
      }
      if (newProduct.category === 'rod') {
        return { ...prev, rods: [newProduct as RodProduct, ...prev.rods] };
      }
      if (newProduct.category === 'line') {
        return { ...prev, lines: [newProduct as LineProduct, ...prev.lines] };
      }
      return { ...prev, lures: [newProduct as LureProduct, ...prev.lures] };
    });
  };

  // Evaluate overall build
  const overallEvaluation = useMemo(() => evaluateOverallBuild(build), [build]);

  // Evaluate candidates for currently active selector tab
  const evaluatedCandidates = useMemo(() => {
    if (!catalog) return [];
    let rawItems: AnyGearProduct[] = [];
    if (activeTab === 'reel') rawItems = catalog.reels;
    else if (activeTab === 'rod') rawItems = catalog.rods;
    else if (activeTab === 'line_pe')
      rawItems = catalog.lines.filter((l) => l.specs.subType === 'pe_main');
    else if (activeTab === 'line_leader')
      rawItems = catalog.lines.filter((l) => l.specs.subType === 'leader_sub');
    else if (activeTab === 'lure_plug')
      rawItems = catalog.lures.filter((l) => l.specs.subType === 'plug_main');
    else if (activeTab === 'lure_hook')
      rawItems = catalog.lures.filter((l) => l.specs.subType === 'hook_ring_sub');

    return rawItems.map((item) => ({
      item,
      evalResult: evaluateCandidateItem(item, build, catalog.lures),
    }));
  }, [catalog, activeTab, build]);

  // Compatible sub-items for quick toggle inside the left dock
  const compatibleLeaders = useMemo(() => {
    if (!catalog || !build.peLine || build.peLine.specs.peNumber === null) return [];
    const peNum = build.peLine.specs.peNumber;
    return catalog.lines.filter(
      (l) =>
        l.specs.subType === 'leader_sub' &&
        (l.specs.compatiblePeMin ?? 0) <= peNum &&
        (l.specs.compatiblePeMax ?? 99) >= peNum
    );
  }, [catalog, build.peLine]);

  const compatibleHooks = useMemo(() => {
    if (!catalog || !build.plug) return [];
    return catalog.lures.filter(
      (h) =>
        h.specs.subType === 'hook_ring_sub' && h.specs.hookCode === build.plug!.specs.hookCode
    );
  }, [catalog, build.plug]);

  if (!catalog) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center font-inter text-sm tracking-widest text-[#00E5FF]">
        INITIALIZING RIGs CYBERNETIC COMPATIBILITY ENGINE...
      </div>
    );
  }

  const totalCatalogCount =
    catalog.reels.length + catalog.rods.length + catalog.lines.length + catalog.lures.length;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#F8FAFC] relative flex flex-col pb-24 md:pb-12 selection:bg-[#00E5FF] selection:text-[#1A1A1A]">
      {/* ==================== CYBERPUNK AMBIENT GLOW & PRECISION MESH ==================== */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 12%, rgba(0, 229, 255, 0.16), transparent 38%), radial-gradient(circle at 85% 22%, rgba(0, 229, 255, 0.10), transparent 42%), radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 100% 100%, 28px 28px',
        }}
      />

      {/* ==================== TOP GLASSMORPHISM HEADER ==================== */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl">
        <div className="max-w-[1640px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-3 h-8 rounded-full bg-[#00E5FF] shadow-[0_0_16px_#00E5FF]" />
            <div>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="font-inter text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  RIGs
                </span>
                <span className="font-inter text-xs font-bold text-[#00E5FF] tracking-widest uppercase">
                  // CYBER TACKLE BUILDER
                </span>
              </div>
              <p className="font-jp text-xs font-normal text-slate-200 hidden sm:block">
                数万円〜数十万円の高額決済を後押しする、100%物理互換性判定プラットフォーム
              </p>
            </div>
          </div>

          {/* Telemetry & DB Status Bar */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#2D2D2D]/80 border border-white/10 font-inter text-xs text-slate-200 backdrop-blur-md">
              <Database className="w-4 h-4 text-[#00E5FF]" />
              <span>
                CURATED DB:{' '}
                <strong className="font-oswald text-sm text-white tracking-wider">
                  {totalCatalogCount}
                </strong>{' '}
                ITEMS
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[#00E5FF] font-semibold">
                {catalog.dataSource === 'supabase' ? 'SUPABASE LIVE' : 'HYBRID ENGINE READY'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSpecModalOpen(true)}
              className="cyber-float-hover px-4 py-2 rounded-xl bg-[#2D2D2D] border border-[#00E5FF]/50 font-jp text-xs font-bold text-white flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
              <span>仕様書出力 / AI JSON投入</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN BENTO GRID CONTAINER ==================== */}
      <main className="relative z-10 max-w-[1640px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex-1 flex flex-col gap-6 sm:gap-8">
        {/* ==================== TOP BENTO HERO ROW (12-COLUMN BENTO GRID) ==================== */}
        <section
          aria-label="総合互換性テレメトリー＆海域プリセットBento"
          className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6"
        >
          {/* Bento Cell A: Cybernetic Compatibility Assurance Core */}
          <div className="md:col-span-5 lg:col-span-4 bento-glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                <span className="font-inter text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                  ASSURANCE TELEMETRY
                </span>
              </div>
              <span className="font-jp text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#1A1A1A] border border-white/15 text-slate-200">
                物理整合性保証
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="bg-[#1A1A1A]/85 border border-white/10 rounded-2xl p-3.5">
                <div className="font-jp text-[11px] text-slate-300">適合スコア</div>
                <div className="font-oswald text-2xl sm:text-3xl font-bold text-[#00E5FF] tracking-tight mt-0.5">
                  {overallEvaluation.overallScore}%
                </div>
              </div>
              <div className="bg-[#1A1A1A]/85 border border-white/10 rounded-2xl p-3.5">
                <div className="font-jp text-[11px] text-slate-300">推奨初期ドラグ</div>
                <div className="font-oswald text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                  {overallEvaluation.recommendedInitialDragKg
                    ? `${overallEvaluation.recommendedInitialDragKg.min}–${overallEvaluation.recommendedInitialDragKg.max}kg`
                    : '--'}
                </div>
              </div>
              <div className="bg-[#1A1A1A]/85 border border-white/10 rounded-2xl p-3.5">
                <div className="font-jp text-[11px] text-slate-300">針込ルアー重量</div>
                <div className="font-oswald text-xl sm:text-2xl font-bold text-[#00E5FF] tracking-tight mt-0.5">
                  {overallEvaluation.totalLureWeightG
                    ? `${overallEvaluation.totalLureWeightG}g`
                    : '--'}
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
              <span className="font-jp text-xs text-slate-200">
                現在のビルド総額 ({overallEvaluation.completedSlotsCount}/4 スロット)
              </span>
              <span className="font-oswald text-2xl sm:text-3xl font-bold text-white tabular-nums">
                ¥{overallEvaluation.totalPriceJpy.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bento Cell B: Target Field Preset Bento Grid */}
          <div className="md:col-span-7 lg:col-span-8 bento-glass-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#00E5FF]" />
                <h2 className="font-inter text-xs sm:text-sm font-bold uppercase tracking-widest text-white">
                  FIELD & TARGET PRESET BENTO
                </h2>
                <span className="font-jp text-xs text-slate-200 hidden sm:inline">
                  — 実戦海域・ターゲット基準から100%物理適合ビルドを一括展開
                </span>
              </div>
              <span className="font-inter text-[11px] font-semibold text-[#00E5FF] uppercase tracking-wider">
                ONE-CLICK FULL RIGGING
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              {TARGET_PRESETS.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`cyber-float-hover p-4 rounded-2xl text-left flex flex-col justify-between gap-2.5 border ${
                      isSelected
                        ? 'bento-glass-active'
                        : 'bg-[#1A1A1A]/85 border-white/15 hover:border-[#00E5FF]/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="font-inter text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#2D2D2D] border border-[#00E5FF]/40 text-[#00E5FF]">
                        {preset.fieldTag}
                      </span>
                      <span className="font-oswald text-xs font-semibold text-slate-200 tracking-wider">
                        {preset.targetWeightClass}
                      </span>
                    </div>
                    <div>
                      <div className="font-jp text-sm font-bold text-white leading-snug">
                        {preset.title}
                      </div>
                      <p className="font-jp text-xs font-normal text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10 w-full">
                      <span className="font-inter text-[11px] font-semibold text-[#00E5FF]">
                        {isSelected ? 'ACTIVE PRESET' : 'LOAD PRESET'}
                      </span>
                      <SlidersHorizontal
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-[#00E5FF]' : 'text-slate-300'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== MAIN WORKSPACE BENTO GRID (MOBILE: VERTICAL SCROLL / TABLET 768px+: HORIZONTAL BENTO) ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Bento Column (md:col-span-5 lg:col-span-4): MY TACKLE BOX DOCK */}
          <div
            ref={dockSectionRef}
            className="md:col-span-5 lg:col-span-4 md:sticky md:top-24"
          >
            <TackleBoxDock
              build={build}
              evaluation={overallEvaluation}
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                if (window.innerWidth < 768) {
                  selectorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onClearBuild={handleClearBuild}
              onRemoveSlot={handleRemoveSlot}
              compatibleLeaders={compatibleLeaders}
              compatibleHooks={compatibleHooks}
              onQuickSwitchLeader={(leader) =>
                setBuild((prev) => ({ ...prev, shockLeader: leader }))
              }
              onQuickSwitchHook={(hook) => setBuild((prev) => ({ ...prev, hookSet: hook }))}
              onOpenSpecModal={() => setIsSpecModalOpen(true)}
            />
          </div>

          {/* Right Bento Column (md:col-span-7 lg:col-span-8): ITEM SELECTOR BENTO GRID */}
          <div ref={selectorSectionRef} className="md:col-span-7 lg:col-span-8 min-w-0">
            <ItemSelectorGrid
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              build={build}
              candidates={evaluatedCandidates}
              onSelectItem={handleSelectItem}
            />
          </div>
        </div>
      </main>

      {/* ==================== MOBILE (< 768px) FLOATING GLASS TELEMETRY BAR ==================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/90 backdrop-blur-xl border-t border-white/15 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
            <span className="font-oswald text-sm text-[#00E5FF] font-bold tracking-wider">
              {overallEvaluation.overallScore}% MATCH
            </span>
            <span className="text-white/20">|</span>
            <span className="font-oswald text-base text-white font-bold tabular-nums">
              ¥{overallEvaluation.totalPriceJpy.toLocaleString()}
            </span>
          </div>
          <div className="font-jp text-[11px] text-slate-200">
            選択済 {overallEvaluation.completedSlotsCount}/4 スロット
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dockSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="cyber-float-hover px-3 py-2 rounded-xl bg-[#2D2D2D] border border-white/20 text-white font-jp text-xs font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>構成BOX</span>
          </button>
          <button
            type="button"
            onClick={() => selectorSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="cyber-float-hover px-3 py-2 rounded-xl bg-[#00E5FF] text-[#1A1A1A] font-jp text-xs font-bold flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>機材選択</span>
          </button>
        </div>
      </div>

      {/* ==================== SPEC SHEET & AI JSON MODAL ==================== */}
      <SpecSheetModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        build={build}
        evaluation={overallEvaluation}
        onInjectCustomProduct={handleInjectCustomProduct}
      />
    </div>
  );
};

function prevLeaderFallback(peLine: LineProduct, allLines: LineProduct[]): LineProduct | null {
  if (peLine.specs.peNumber === null) return null;
  const pe = peLine.specs.peNumber;
  return (
    allLines.find(
      (l) =>
        l.specs.subType === 'leader_sub' &&
        (l.specs.compatiblePeMin ?? 0) <= pe &&
        (l.specs.compatiblePeMax ?? 99) >= pe
    ) ?? null
  );
}

export default App;
