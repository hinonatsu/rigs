import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
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
  const [mobileView, setMobileView] = useState<'selector' | 'dock'>('selector');

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
      if (!build.rod) setActiveTab('rod');
      return;
    }

    if (item.category === 'rod') {
      setBuild((prev) => ({ ...prev, rod: item as RodProduct }));
      if (!build.peLine) setActiveTab('line_pe');
      return;
    }

    if (item.category === 'line') {
      const lineItem = item as LineProduct;
      if (lineItem.specs.subType === 'pe_main') {
        // Auto-select recommended shock leader sub-slot
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
        // Auto-select recommended hook & split ring sub-slot matching hookCode
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
      <div className="min-h-screen bg-carbon-950 flex items-center justify-center font-mono text-sm text-electric">
        LOADING RIGS COMPATIBILITY ENGINE...
      </div>
    );
  }

  const totalCatalogCount =
    catalog.reels.length + catalog.rods.length + catalog.lines.length + catalog.lures.length;

  return (
    <div className="min-h-screen bg-carbon-950 text-slate-100 flex flex-col pb-16 lg:pb-0">
      {/* ==================== TOP HEADER ==================== */}
      <header className="border-b border-carbon-700 bg-carbon-900/90 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-6 bg-electric" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold tracking-wider text-white">
                    fun-fishing
                  </span>
                  <span className="font-mono text-xs text-electric tracking-widest uppercase">
                    // RIGS TACKLE BUILDER
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  オフショア・ビッグゲーム（クロマグロ・ヒラマサ）特化型 物理互換性判定エンジン
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry & DB Status Bar */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-carbon-950 border border-carbon-700 font-mono text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-electric" />
              <span>CURATED DB: {totalCatalogCount} ITEMS</span>
              <span className="text-carbon-600">|</span>
              <span className="text-electric">
                {catalog.dataSource === 'supabase' ? 'SUPABASE LIVE' : 'HYBRID ENGINE READY'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSpecModalOpen(true)}
              className="px-3 py-1.5 bg-carbon-800 hover:bg-carbon-700 border border-carbon-600 font-mono text-xs text-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-electric" />
              <span>仕様書出力 / AI JSON投入</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== TARGET FIELD PRESET BAR ==================== */}
      <div className="border-b border-carbon-800 bg-carbon-900/40">
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0">
            <Compass className="w-4 h-4 text-electric" />
            <span>実戦海域・ターゲット基準プリセット:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1 max-w-5xl">
            {TARGET_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-2 text-left border transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-electric/10 border-electric text-white'
                      : 'bg-carbon-900 border-carbon-700 text-slate-300 hover:border-carbon-600'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-1 py-0.2 bg-carbon-950 border border-carbon-700 text-electric">
                        {preset.fieldTag}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {preset.targetWeightClass}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">{preset.title}</div>
                  </div>
                  <SlidersHorizontal
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-electric' : 'text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== MAIN ASYMMETRIC 2-PANE WORKSPACE ==================== */}
      <main className="max-w-[1600px] w-full mx-auto px-4 py-5 flex-1 flex flex-col lg:flex-row items-start gap-6">
        {/* Left Pane: MY TACKLE BOX (Always visible on desktop, toggleable on mobile) */}
        <div
          className={`w-full lg:w-auto ${
            mobileView === 'dock' ? 'block' : 'hidden lg:block'
          } lg:sticky lg:top-20`}
        >
          <TackleBoxDock
            build={build}
            evaluation={overallEvaluation}
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              setMobileView('selector');
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

        {/* Right Pane: ITEM SELECTOR & COMPATIBILITY TELEMETRY */}
        <div
          className={`w-full flex-1 min-w-0 ${
            mobileView === 'selector' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ItemSelectorGrid
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            build={build}
            candidates={evaluatedCandidates}
            onSelectItem={handleSelectItem}
          />
        </div>
      </main>

      {/* ==================== MOBILE STICKY BOTTOM SWITCHER ==================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-carbon-900 border-t border-carbon-700 px-4 py-2.5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <ShieldCheck className="w-4 h-4 text-electric" />
            <span className="text-electric font-bold">{overallEvaluation.overallScore}% 適合</span>
            <span className="text-slate-400">|</span>
            <span className="text-white font-bold tabular-nums">
              ¥{overallEvaluation.totalPriceJpy.toLocaleString()}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            選択済 {overallEvaluation.completedSlotsCount}/4 スロット
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setMobileView((prev) => (prev === 'dock' ? 'selector' : 'dock'))
            }
            className="px-3 py-2 bg-carbon-800 border border-electric text-electric font-mono text-xs font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {mobileView === 'dock' ? '機材一覧へ戻る' : 'MY TACKLE BOXを開く'}
            </span>
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
