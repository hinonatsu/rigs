import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Crosshair,
  ExternalLink,
  Flame,
  Gauge,
  Info,
  Link2,
  Lock,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { buildAmazonAffiliateUrl } from '../config/amazonAssociate';
import {
  AnyRigPart,
  calculateOverallCombatStats,
  CATEGORY_ORDER,
  checkPartCompatibility,
  comparePartAgainstRecommended,
  getPresetRigState,
  getTargetProfile,
  LINE_CATALOG,
  LURE_CATALOG,
  PartCategory,
  REEL_CATALOG,
  RIG_PRESETS,
  RigState,
  ROD_CATALOG,
  STEP_META,
  TargetId,
} from '../data/rigCatalog';
import {
  buildShareableSpecUrl,
  buildUrlString,
  PageView,
  parseUrlState,
  RouteState,
} from '../lib/urlRouter';
import { TargetSelectHomeView } from './CatalogAndHubViews';
import { RigPartShowcase } from './RigPartShowcase';
import { SpecCheckoutView } from './SpecCheckoutView';

export type {
  PartCategory,
  ReelPart,
  RodPart,
  LinePart,
  LurePart,
  AnyRigPart,
  RigState,
} from '../data/rigCatalog';

export const TackleBuilder: React.FC = () => {
  const initialParsed = useMemo(() => parseUrlState(), []);
  const [route, setRoute] = useState<RouteState>(initialParsed.route);
  const [rig, setRig] = useState<RigState>(initialParsed.rig);
  const [headerUrlCopied, setHeaderUrlCopied] = useState(false);

  // プログレッシブ・ディスクロージャー（段階的開示）用の開閉ステート
  const [showNarrativeDetail, setShowNarrativeDetail] = useState(false);
  const [showTargetHabit, setShowTargetHabit] = useState(false);
  const [showCombatRadar, setShowCombatRadar] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlState();
      setRoute(parsed.route);
      setRig(parsed.rig);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // スロットやパーツが切り替わったら詳細長文は再び折りたたむ（情報過多の防止）
  useEffect(() => {
    setShowNarrativeDetail(false);
  }, [route.activeStep, rig]);

  const targetProfile = useMemo(
    () => getTargetProfile(route.targetId),
    [route.targetId]
  );

  const recommendedRig = useMemo(
    () => getPresetRigState(route.targetId),
    [route.targetId]
  );

  const navigateTo = (nextRoutePartial: Partial<RouteState>, nextRig?: RigState) => {
    const updatedRig = nextRig ?? rig;
    const updatedRoute: RouteState = {
      ...route,
      ...nextRoutePartial,
    };
    setRoute(updatedRoute);
    if (nextRig) {
      setRig(nextRig);
    }
    const urlStr = buildUrlString(updatedRoute, updatedRig);
    if (typeof window !== 'undefined' && urlStr) {
      window.history.pushState({}, '', urlStr);
    }
  };

  const syncUrlInPlace = (updatedRoute: RouteState, updatedRig: RigState) => {
    const urlStr = buildUrlString(updatedRoute, updatedRig);
    if (typeof window !== 'undefined' && urlStr) {
      window.history.replaceState({}, '', urlStr);
    }
  };

  const handleSelectTarget = (targetId: TargetId, destination: 'garage' | 'checkout') => {
    const presetRig = getPresetRigState(targetId);
    navigateTo(
      {
        view: destination,
        targetId,
        activeStep: 'reel',
      },
      presetRig
    );
  };

  const handleSelectStep = (step: PartCategory) => {
    const nextRoute: RouteState = {
      ...route,
      view: 'garage',
      activeStep: step,
    };
    setRoute(nextRoute);
    syncUrlInPlace(nextRoute, rig);
  };

  const handleEquipOption = (part: AnyRigPart) => {
    const nextRig: RigState = {
      ...rig,
      [part.category]: part,
    };
    setRig(nextRig);
    syncUrlInPlace(route, nextRig);
  };

  const handleResetToRecommended = () => {
    const presetRig = getPresetRigState(route.targetId);
    setRig(presetRig);
    syncUrlInPlace(route, presetRig);
  };

  const totalValue = useMemo(() => {
    return (
      (rig.reel?.price ?? 0) +
      (rig.rod?.price ?? 0) +
      (rig.line?.price ?? 0) +
      (rig.lure?.price ?? 0)
    );
  }, [rig]);

  const totalWeightG = useMemo(() => {
    return (
      (rig.reel?.weightG ?? 0) +
      (rig.rod?.weightG ?? 0) +
      Math.round(rig.lure?.totalWeightG ?? 0)
    );
  }, [rig]);

  const isAllSelectedCompatible = useMemo(() => {
    const items = [rig.reel, rig.rod, rig.line, rig.lure].filter(
      (i): i is AnyRigPart => i !== null
    );
    return items.length === 4 && items.every((item) => checkPartCompatibility(item, rig).compatible);
  }, [rig]);

  const combatStats = useMemo(
    () => calculateOverallCombatStats(rig, targetProfile),
    [rig, targetProfile]
  );

  const activeStep = route.activeStep;
  const basePartForStep = recommendedRig[activeStep]!;
  const equippedPartForStep = rig[activeStep] ?? basePartForStep;

  const stepCatalog = useMemo((): AnyRigPart[] => {
    const raw =
      activeStep === 'reel'
        ? REEL_CATALOG
        : activeStep === 'rod'
        ? ROD_CATALOG
        : activeStep === 'line'
        ? LINE_CATALOG
        : LURE_CATALOG;

    return [...raw].sort((a, b) => {
      if (a.id === basePartForStep.id) return -1;
      if (b.id === basePartForStep.id) return 1;
      const aCompat = checkPartCompatibility(a, rig).compatible ? 1 : 0;
      const bCompat = checkPartCompatibility(b, rig).compatible ? 1 : 0;
      return bCompat - aCompat;
    });
  }, [activeStep, basePartForStep.id, rig]);

  const comparisonReport = useMemo(
    () =>
      comparePartAgainstRecommended(
        basePartForStep,
        equippedPartForStep,
        targetProfile,
        rig
      ),
    [basePartForStep, equippedPartForStep, targetProfile, rig]
  );

  const currentStepIndex = CATEGORY_ORDER.indexOf(activeStep);
  const nextStep: PartCategory | null =
    currentStepIndex < CATEGORY_ORDER.length - 1
      ? CATEGORY_ORDER[currentStepIndex + 1]
      : null;
  const prevStep: PartCategory | null =
    currentStepIndex > 0 ? CATEGORY_ORDER[currentStepIndex - 1] : null;

  const customizedSlotsCount = useMemo(() => {
    return CATEGORY_ORDER.filter((cat) => rig[cat]?.id !== recommendedRig[cat]?.id).length;
  }, [rig, recommendedRig]);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(buildShareableSpecUrl(rig, route.targetId));
    setHeaderUrlCopied(true);
    setTimeout(() => setHeaderUrlCopied(false), 2500);
  };

  return (
    <div className="min-h-dvh bg-[#151515] text-white font-sans font-light antialiased selection:bg-[#00E5FF] selection:text-[#151515] flex flex-col justify-between">
      {/* ==================== 上部常駐：ミニマル・グラスモーフィズムナビゲーション ==================== */}
      <header className="sticky top-0 z-30 shrink-0 bg-[#151515]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 lg:px-12 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* 左：ブランドロゴ ＆ 3フェーズ進行ピル */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => navigateTo({ view: 'home' })}
              className="flex items-center gap-2.5 text-left group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.8)]" />
              <span className="font-oswald text-lg font-bold tracking-[0.28em] text-white group-hover:text-[#00E5FF] transition-colors">
                RIGs
              </span>
            </button>

            <nav aria-label="進行フェーズ" className="flex items-center gap-2">
              {(
                [
                  { id: 'home' as PageView, num: '01', label: 'TARGET' },
                  { id: 'garage' as PageView, num: '02', label: 'CONFIGURATOR' },
                  { id: 'checkout' as PageView, num: '03', label: 'CHECKOUT' },
                ] as const
              ).map((phase, idx) => {
                const isActive = route.view === phase.id;
                const isDisabled = route.view === 'home' && phase.id !== 'home';
                return (
                  <React.Fragment key={phase.id}>
                    {idx > 0 && <span className="text-white/20 text-xs">/</span>}
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => navigateTo({ view: phase.id })}
                      className={`px-4 py-1.5 rounded-full text-xs transition-all duration-300 flex items-center gap-2 ${
                        isActive
                          ? 'bg-[#00E5FF] text-[#151515] font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                          : isDisabled
                          ? 'bg-transparent text-white/25 cursor-not-allowed'
                          : 'bg-[#222222]/80 text-white/70 hover:text-white border border-white/10'
                      }`}
                    >
                      <span className="font-oswald tracking-wider">{phase.num}</span>
                      <span className="font-oswald tracking-widest">{phase.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* 右：スリム化したターゲットスイッチャー ＆ セカンダリ共有ボタン */}
          {route.view === 'home' ? (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#222222]/80 border border-white/10 text-xs text-white/60">
              <Crosshair className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="font-oswald tracking-wider">SELECT TARGET</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#222222]/90 backdrop-blur-md border border-[#00E5FF]/40">
                <img
                  src={targetProfile.heroImage}
                  alt={targetProfile.fishName}
                  className="w-6 h-6 rounded-full object-cover border border-[#00E5FF]/60 shrink-0"
                />
                <select
                  value={route.targetId}
                  onChange={(e) =>
                    handleSelectTarget(
                      e.target.value as TargetId,
                      route.view === 'checkout' ? 'checkout' : 'garage'
                    )
                  }
                  aria-label="ターゲット魚種を切り替え"
                  className="bg-transparent text-xs font-light text-white focus:outline-none cursor-pointer"
                >
                  {RIG_PRESETS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#222222] text-white">
                      {t.fishName} ({t.badge})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent border border-white/15 hover:border-[#00E5FF] text-xs font-light text-white/80 hover:text-white transition-all duration-300"
                title="現在の装備URLをコピー"
              >
                {headerUrlCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="text-[#00E5FF]">COPIED</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>SHARE</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ==================== 中央メインステージ（広大な余白 Whitespace） ==================== */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 flex flex-col">
        {/* -------------------- 【画面1】ホーム：ターゲット選択 -------------------- */}
        {route.view === 'home' && (
          <TargetSelectHomeView
            currentTargetId={route.targetId}
            onSelectTargetAndGoGarage={(targetId) => handleSelectTarget(targetId, 'garage')}
            onSelectTargetAndGoCheckout={(targetId) => handleSelectTarget(targetId, 'checkout')}
          />
        )}

        {/* -------------------- 【画面2】Tesla風スプリット・コンフィギュレーター ＆ Bento Grid -------------------- */}
        {route.view === 'garage' && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* =================================================================
                左ペイン (4 cols)：Tesla風 スティッキー・ロードアウトドック
                （長文を排除し、4スロットの現在状態と段階的開示テレメトリに集約）
               ================================================================= */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6 rounded-2xl bg-[#222222]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-7 shadow-2xl">
              {/* 1. ターゲットロックオン・コンパクトヘッダー（長文はボタンクリック時のみ段階的開示） */}
              <div className="rounded-xl overflow-hidden bg-[#151515] border border-white/10">
                <div className="relative h-28 w-full overflow-hidden">
                  <img
                    src={targetProfile.heroImage}
                    alt={targetProfile.fishName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/50 to-transparent" />
                  <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#151515]/85 backdrop-blur-md border border-[#00E5FF]/50 text-[10px] font-oswald font-semibold text-[#00E5FF] tracking-widest">
                      {targetProfile.badge}
                    </span>
                    <div className="flex items-center gap-2">
                      {customizedSlotsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetToRecommended}
                          className="px-2.5 py-0.5 rounded-full bg-[#151515]/90 border border-white/20 text-[10px] text-white/80 hover:text-[#00E5FF] flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>RESET</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowTargetHabit((prev) => !prev)}
                        className="px-2.5 py-0.5 rounded-full bg-[#151515]/90 border border-white/20 text-[10px] text-[#00E5FF] hover:border-[#00E5FF] flex items-center gap-1 transition-colors"
                        title="ターゲットの習性・ベイト情報を表示"
                      >
                        <Info className="w-3 h-3" />
                        <span>習性データ</span>
                      </button>
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 left-4 right-4 flex items-baseline justify-between gap-2">
                    <div className="text-xs sm:text-sm font-medium text-white truncate">
                      {targetProfile.fishName}
                    </div>
                    <span className="font-oswald text-xs text-[#00E5FF] shrink-0">
                      MAX {targetProfile.initialRunLoadKg}kg LOAD
                    </span>
                  </div>
                </div>

                {/* 段階的開示：クリックした時のみ表示される習性・捕食ベイト情報 */}
                {showTargetHabit && (
                  <div className="p-4 border-t border-white/10 bg-[#151515] space-y-2 text-xs font-light text-white/80">
                    <p className="leading-relaxed">{targetProfile.fishHabit}</p>
                    <div className="text-[11px] text-[#00E5FF] font-normal">
                      ★ 捕食ベイト: {targetProfile.baitSizeMm}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 4つの装備スロット（透過PNGサムネイルステージ ＆ Oswald価格 ＆ 発光State） */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="font-oswald tracking-widest text-white/60 uppercase">
                    LOADOUT SLOTS (4 ITEMS)
                  </span>
                  <span className="font-oswald text-[#00E5FF] tracking-wider">
                    {customizedSlotsCount === 0
                      ? 'RECOMMENDED SPEC'
                      : `${customizedSlotsCount} CUSTOMIZED`}
                  </span>
                </div>

                {CATEGORY_ORDER.map((cat) => {
                  const meta = STEP_META[cat];
                  const item = rig[cat]!;
                  const baseItem = recommendedRig[cat]!;
                  const isActive = activeStep === cat;
                  const isCustom = item.id !== baseItem.id;
                  const { compatible } = checkPartCompatibility(item, rig);

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectStep(cat)}
                      className={`group w-full rounded-xl p-3.5 text-left transition-all duration-300 ease-out hover:scale-105 flex items-center gap-3.5 ${
                        isActive
                          ? 'bg-[#151515] border border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                          : 'bg-[#151515]/75 border border-white/10 hover:border-[#00E5FF]/50'
                      }`}
                    >
                      {/* 透過PNG対応ミニビジュアルステージ */}
                      <RigPartShowcase part={item} isSelected={isActive} size="sm" />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-oswald text-xs font-bold tracking-wider text-[#00E5FF]">
                            {meta.stepNum} {meta.label}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              isCustom
                                ? 'bg-[#00E5FF] text-[#151515] font-bold'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {isCustom ? 'CUSTOM' : 'BASE'}
                          </span>
                          {!compatible && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              要確認
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-normal text-white truncate">
                          {item.shortName}
                        </div>
                        <div className="font-oswald text-sm font-semibold text-white/90 tabular-nums">
                          ¥{item.price.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 3. 対ターゲット総合戦闘力（段階的開示でスッキリ収納可能） */}
              <div className="rounded-xl bg-[#151515] border border-white/10 p-4">
                <button
                  type="button"
                  onClick={() => setShowCombatRadar((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="text-xs font-oswald font-semibold tracking-widest text-[#00E5FF] flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    <span>TOTAL COMBAT TELEMETRY</span>
                  </span>
                  <span className="text-[11px] text-white/60 flex items-center gap-1">
                    <span>{showCombatRadar ? '閉じる' : '5項目展開'}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#00E5FF] transition-transform duration-300 ${
                        showCombatRadar ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {showCombatRadar && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3.5">
                    {combatStats.map((stat) => {
                      const diff = stat.score - stat.baseScore;
                      return (
                        <div key={stat.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="truncate">
                              <span className="font-oswald tracking-wider text-white">
                                {stat.label}
                              </span>
                              <span className="text-white/50 ml-2 text-[10px]">
                                {stat.subLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                              <span className="font-oswald text-xs font-bold text-white">
                                {stat.score}
                              </span>
                              {diff !== 0 && (
                                <span
                                  className={`px-1.5 py-0.5 rounded font-oswald text-[10px] font-bold ${
                                    diff > 0
                                      ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {diff > 0 ? `+${diff}` : `${diff}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-[#222222] relative overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                diff > 0
                                  ? 'bg-[#00E5FF]'
                                  : diff < 0
                                  ? 'bg-amber-400'
                                  : 'bg-[#00E5FF]/80'
                              }`}
                              style={{ width: `${stat.score}%` }}
                            />
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-white"
                              style={{ left: `${stat.baseScore}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* =================================================================
                右ペイン (8 cols)：Bento Grid 製品セレクター ＆ スペック比較ステージ
                （十分な製品画像スペース・Oswald数値・段階的開示）
               ================================================================= */}
            <section className="lg:col-span-8 flex flex-col gap-8">
              {/* 1. アクティブスロットの洗練されたヘッダー（重複タブを排除し広大な余白を確保） */}
              <div className="rounded-2xl bg-[#222222]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] font-oswald text-xs font-bold tracking-widest">
                      SLOT {STEP_META[activeStep].stepNum} // {STEP_META[activeStep].label}
                    </span>
                    <span className="text-xs font-light text-[#00E5FF]">
                      {STEP_META[activeStep].combatRole}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                    {STEP_META[activeStep].fullTitle}
                  </h1>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[11px] font-light text-white/50">現在選択中のモデル</div>
                  <div className="font-oswald text-lg font-semibold text-[#00E5FF]">
                    {equippedPartForStep.shortName}
                  </div>
                </div>
              </div>

              {/* 2. 製品選択 Bento Grid（透過PNG用余白ステージ ＋ 極限まで削ぎ落としたテキスト ＋ ホバー開示） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stepCatalog.map((optionPart, idx) => {
                  const isBase = optionPart.id === basePartForStep.id;
                  const isEquipped = optionPart.id === equippedPartForStep.id;
                  const { compatible, reason } = checkPartCompatibility(optionPart, rig);
                  const priceDiff = optionPart.price - basePartForStep.price;

                  return (
                    <button
                      key={optionPart.id}
                      type="button"
                      onClick={() => handleEquipOption(optionPart)}
                      className={`group relative rounded-2xl p-6 text-left transition-all duration-300 ease-out hover:scale-105 flex flex-col justify-between gap-5 backdrop-blur-xl ${
                        isEquipped
                          ? 'bg-[#222222] border border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                          : compatible
                          ? 'bg-[#222222]/80 border border-white/10 hover:border-[#00E5FF]/60 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                          : 'bg-[#222222]/45 border border-white/5 opacity-65 hover:opacity-95'
                      }`}
                    >
                      {/* 上部：ステータスバッジ ＆ 装着状態 */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span
                          className={`font-oswald text-[11px] tracking-wider font-semibold px-3 py-0.5 rounded-full ${
                            isBase
                              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50'
                              : compatible
                              ? 'bg-white/10 text-white/90'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isBase
                            ? '★ RECOMMENDED BASE'
                            : compatible
                            ? `OPTION 0${idx}`
                            : 'OTHER CLASS'}
                        </span>

                        {isEquipped ? (
                          <span className="px-3 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] font-oswald text-[11px] font-bold tracking-wider flex items-center gap-1 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            EQUIPPED
                          </span>
                        ) : (
                          <span className="font-oswald text-[11px] text-white/40 group-hover:text-[#00E5FF] transition-colors">
                            CLICK TO EQUIP ➔
                          </span>
                        )}
                      </div>

                      {/* 中央：美しい製品画像（透過PNG）が入る広大なショーケース余白 */}
                      <div className="relative w-full">
                        <RigPartShowcase
                          part={optionPart}
                          isSelected={isEquipped}
                          size="md"
                        />

                        {/* 【プログレッシブ・ディスクロージャー】ホバー時のみ浮かび上がる詳細スペックオーバーレイ */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 z-20 rounded-xl bg-[#151515]/95 backdrop-blur-md border border-[#00E5FF]/50 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between pointer-events-none"
                        >
                          <div className="flex items-center justify-between text-[10px] font-oswald tracking-widest text-[#00E5FF] border-b border-white/10 pb-1.5">
                            <span>SPEC TELEMETRY</span>
                            <span>{compatible ? '100% MATCH' : 'CHECK SPEC'}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 my-auto pt-1">
                            {optionPart.specs.slice(0, 4).map((sp) => (
                              <div
                                key={sp.label}
                                className="bg-[#222222] rounded-lg px-2.5 py-1.5 border border-white/5"
                              >
                                <div className="text-[10px] text-white/50 truncate">
                                  {sp.label}
                                </div>
                                <div className="font-oswald text-xs font-semibold text-white truncate">
                                  {sp.value}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-[#00E5FF] truncate pt-1">
                            ✦ {reason}
                          </div>
                        </div>
                      </div>

                      {/* 下部：最小限に削ぎ落としたブランド・製品名・Oswald 価格 */}
                      <div className="w-full pt-2 border-t border-white/10 flex items-end justify-between gap-4">
                        <div className="min-w-0 space-y-0.5">
                          <div className="text-[11px] font-light text-white/50 uppercase tracking-wider">
                            {optionPart.brand}
                          </div>
                          <div className="text-sm sm:text-base font-normal text-white truncate">
                            {optionPart.shortName}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-oswald text-xl font-bold text-white tabular-nums leading-none">
                            ¥{optionPart.price.toLocaleString()}
                          </div>
                          <div
                            className={`font-oswald text-xs mt-1 ${
                              priceDiff === 0
                                ? 'text-white/40'
                                : priceDiff < 0
                                ? 'text-[#00E5FF]'
                                : 'text-amber-300'
                            }`}
                          >
                            {priceDiff === 0
                              ? 'BASE PRICE'
                              : priceDiff > 0
                              ? `+¥${priceDiff.toLocaleString()}`
                              : `-¥${Math.abs(priceDiff).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 3. Bento スペック比較 ＆ 段階的開示インスペクター */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                {/* 左Bento (6 cols): Oswald 定量スペック差分ゲージ */}
                <div className="xl:col-span-6 rounded-2xl bg-[#222222]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-7 flex flex-col justify-between gap-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <span className="font-oswald text-xs font-semibold text-[#00E5FF] tracking-widest block">
                          QUANTITATIVE SPECS
                        </span>
                        <h2 className="text-sm font-normal text-white mt-0.5">
                          {comparisonReport.isSameAsBase
                            ? `推奨ベース「${basePartForStep.shortName}」基準値`
                            : `推奨ベースとの定量スペック比較`}
                        </h2>
                      </div>
                      <span className="font-oswald text-xs px-3 py-1 rounded-full bg-[#151515] border border-white/15 text-white/80">
                        {comparisonReport.priceDeltaText}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {comparisonReport.statRows.map((row) => (
                        <div key={row.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="font-oswald tracking-wider text-white/60 truncate">
                              {row.label}
                            </span>
                            <div className="flex items-center gap-2 shrink-0 tabular-nums">
                              {comparisonReport.isSameAsBase ? (
                                <span className="font-oswald text-sm font-bold text-white">
                                  {row.candValText}
                                </span>
                              ) : (
                                <>
                                  <span className="font-oswald text-xs text-white/40">
                                    {row.baseValText}
                                  </span>
                                  <span className="text-[#00E5FF]">➔</span>
                                  <span className="font-oswald text-sm font-bold text-white">
                                    {row.candValText}
                                  </span>
                                </>
                              )}
                              <span
                                className={`font-oswald text-[11px] font-semibold px-2 py-0.5 rounded ${
                                  row.tone === 'up'
                                    ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                                    : row.tone === 'down'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-white/10 text-white/60'
                                }`}
                              >
                                {row.deltaBadge}
                              </span>
                            </div>
                          </div>

                          <div className="h-2 rounded-full bg-[#151515] relative overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                row.tone === 'up'
                                  ? 'bg-[#00E5FF]'
                                  : row.tone === 'down'
                                  ? 'bg-amber-400'
                                  : 'bg-[#00E5FF]/75'
                              }`}
                              style={{ width: `${row.candPct}%` }}
                            />
                            {!comparisonReport.isSameAsBase && (
                              <div
                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_#fff]"
                                style={{ left: `${row.basePct}%` }}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* パッシブ特性ピル */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                    {equippedPartForStep.propertyTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-light px-3 py-1 rounded-full bg-[#151515] border border-[#00E5FF]/30 text-white/90"
                      >
                        ✦ {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 右Bento (6 cols): 実戦インパクト要約 ＆ 段階的開示（長文はクリック時のみ展開） */}
                <div className="xl:col-span-6 rounded-2xl bg-[#222222]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-7 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#00E5FF]" />
                        <span className="font-oswald text-xs font-semibold text-[#00E5FF] tracking-widest">
                          TACTICAL IMPACT // 実戦変化サマリー
                        </span>
                      </div>
                      <span className="font-oswald text-xs text-white/50">
                        VS {targetProfile.weightRange}
                      </span>
                    </div>

                    {/* 1行で直感的にわかるヘッドラインのみ常時表示 */}
                    <div className="rounded-xl bg-[#151515] border-l-4 border-l-[#00E5FF] p-4">
                      <div className="text-sm font-normal text-white leading-relaxed">
                        {comparisonReport.fishFightHeadline}
                      </div>
                    </div>

                    {/* 互換性アラート（必要な場合のみ） */}
                    {comparisonReport.cascadeNotice && (
                      <div className="rounded-xl bg-amber-950/40 border border-amber-400/40 p-3.5 text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{comparisonReport.cascadeNotice}</span>
                      </div>
                    )}

                    {/* 【プログレッシブ・ディスクロージャー】長文の解説はデフォルト非表示・クリックで段階的開示 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowNarrativeDetail((prev) => !prev)}
                        aria-expanded={showNarrativeDetail}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#151515] border border-white/10 hover:border-[#00E5FF]/50 text-xs font-light text-[#00E5FF] flex items-center justify-between transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {showNarrativeDetail
                              ? '実戦ファイト詳細解説を閉じる'
                              : '＋ 実戦ファイトでの詳細な変化・物理根拠を読む'}
                          </span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            showNarrativeDetail ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {showNarrativeDetail && (
                        <div className="mt-3 p-4 rounded-xl bg-[#151515]/90 border border-white/10 text-xs font-light text-white/80 leading-loose">
                          {comparisonReport.fishFightNarrative}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* セカンダリアクション（アウトライン） */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    {!comparisonReport.isSameAsBase ? (
                      <button
                        type="button"
                        onClick={() => handleEquipOption(basePartForStep)}
                        className="px-3.5 py-2 rounded-xl bg-transparent border border-white/15 hover:border-[#00E5FF] text-xs font-light text-white/70 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>推奨ベースに戻す</span>
                      </button>
                    ) : (
                      <span className="text-xs font-light text-[#00E5FF] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>推奨ベース装備中</span>
                      </span>
                    )}

                    <a
                      href={buildAmazonAffiliateUrl(equippedPartForStep.amazon)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-3.5 py-2 rounded-xl bg-transparent border border-white/15 hover:border-white/40 text-xs font-light text-white/70 hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                      <span>単体スペックをAmazonで確認</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF]" />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -------------------- 【画面3】最終確認・購入（完成仕様書） -------------------- */}
        {route.view === 'checkout' && (
          <SpecCheckoutView
            target={targetProfile}
            rig={rig}
            totalValue={totalValue}
            totalWeightG={totalWeightG}
            isAllSelectedCompatible={isAllSelectedCompatible}
            onBackToGarage={(step) =>
              navigateTo({
                view: 'garage',
                activeStep: step ?? route.activeStep,
              })
            }
            onBackToTargetSelect={() => navigateTo({ view: 'home' })}
            onResetToRecommended={handleResetToRecommended}
          />
        )}
      </main>

      {/* ==================== 下部常駐：トラストバッジ ＆ 階層化CTAドック ==================== */}
      {route.view !== 'home' && (
        <footer className="sticky bottom-0 z-30 shrink-0 bg-[#151515]/90 backdrop-blur-xl border-t border-white/10 px-4 sm:px-8 lg:px-12 py-4">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-6">
            {/* 左：Oswald 合計金額・総重量 ＆ 25万円決済の安心感を高めるトラストアイコン群 */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-baseline gap-4">
                <div>
                  <div className="text-[10px] font-light text-white/50 uppercase tracking-wider">
                    TOTAL BUILD PRICE
                  </div>
                  <div className="font-oswald text-2xl sm:text-3xl font-bold text-[#00E5FF] tabular-nums leading-none mt-0.5">
                    ¥{totalValue.toLocaleString()}
                  </div>
                </div>
                <div className="border-l border-white/15 pl-4">
                  <div className="text-[10px] font-light text-white/50 uppercase tracking-wider">
                    TOTAL WEIGHT
                  </div>
                  <div className="font-oswald text-lg font-semibold text-white tabular-nums leading-none mt-0.5">
                    {totalWeightG}g
                  </div>
                </div>
              </div>

              {/* トラストシグナル（Secure Checkout / 送料無料 / 物理適合保証） */}
              <div className="hidden xl:flex items-center gap-4 text-xs font-light text-white/75 border-l border-white/15 pl-6">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Secure Checkout</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>全国送料無料</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>
                    {isAllSelectedCompatible ? '100% 物理適合保証' : '番手バランス要確認'}
                  </span>
                </span>
              </div>
            </div>

            {/* 右：Secondary（アウトライン）と Primary（塗りつぶし＋Glow＋Scale 1.05）を完全分離 */}
            <div className="flex items-center gap-3">
              {route.view === 'garage' && (
                <>
                  {/* Secondary Action: 前のスロット / 魚種変更（アウトライン・軽量） */}
                  {prevStep ? (
                    <button
                      type="button"
                      onClick={() => handleSelectStep(prevStep)}
                      className="px-4 py-2.5 rounded-xl bg-transparent border border-white/15 hover:border-white/40 text-xs font-light text-white/80 hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>{STEP_META[prevStep].label}へ戻る</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigateTo({ view: 'home' })}
                      className="px-4 py-2.5 rounded-xl bg-transparent border border-white/15 hover:border-white/40 text-xs font-light text-white/80 hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>魚を選び直す</span>
                    </button>
                  )}

                  {/* Secondary Action: 次のスロット確認（アウトライン・軽量） */}
                  {nextStep && (
                    <button
                      type="button"
                      onClick={() => handleSelectStep(nextStep)}
                      className="px-4 py-2.5 rounded-xl bg-[#222222] border border-[#00E5FF]/50 hover:border-[#00E5FF] text-xs font-medium text-[#00E5FF] transition-all duration-300 flex items-center gap-2"
                    >
                      <span>
                        次へ：{STEP_META[nextStep].stepNum} {STEP_META[nextStep].label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Primary Action: 唯一の塗りつぶしメインCTA（視覚的重さを圧倒的に集中） */}
                  <button
                    type="button"
                    onClick={() => navigateTo({ view: 'checkout' })}
                    className="px-6 py-3 rounded-xl bg-[#00E5FF] text-[#151515] text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2.5"
                  >
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>この構成で購入確認へ進む</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </>
              )}

              {route.view === 'checkout' && (
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'garage' })}
                  className="px-5 py-2.5 rounded-xl bg-transparent border border-white/20 hover:border-[#00E5FF] text-xs font-light text-white hover:text-[#00E5FF] transition-all duration-300 flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>コンフィギュレーターへ戻る</span>
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default TackleBuilder;
