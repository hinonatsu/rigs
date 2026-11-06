import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  ExternalLink,
  Fish,
  Flame,
  Gauge,
  Link2,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
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

  // ブラウザの「戻る / 進む」ボタン連動
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlState();
      setRoute(parsed.route);
      setRig(parsed.rig);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const targetProfile = useMemo(
    () => getTargetProfile(route.targetId),
    [route.targetId]
  );

  const recommendedRig = useMemo(
    () => getPresetRigState(route.targetId),
    [route.targetId]
  );

  // ページ間の遷移（History pushState）
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

  // 同一画面内のスロット切替・パーツ変更（History replaceState）
  const syncUrlInPlace = (updatedRoute: RouteState, updatedRig: RigState) => {
    const urlStr = buildUrlString(updatedRoute, updatedRig);
    if (typeof window !== 'undefined' && urlStr) {
      window.history.replaceState({}, '', urlStr);
    }
  };

  // ホームで「何を釣るか」を選択したときの処理
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

  // スロットタブの切り替え
  const handleSelectStep = (step: PartCategory) => {
    const nextRoute: RouteState = {
      ...route,
      view: 'garage',
      activeStep: step,
    };
    setRoute(nextRoute);
    syncUrlInPlace(nextRoute, rig);
  };

  // 変更オプションのパーツを選択（即時装備＆ステータス差分更新）
  const handleEquipOption = (part: AnyRigPart) => {
    const nextRig: RigState = {
      ...rig,
      [part.category]: part,
    };
    setRig(nextRig);
    syncUrlInPlace(route, nextRig);
  };

  // 現在のターゲットの推奨ベースに戻す
  const handleResetToRecommended = () => {
    const presetRig = getPresetRigState(route.targetId);
    setRig(presetRig);
    syncUrlInPlace(route, presetRig);
  };

  // 合計金額・総重量・物理適合判定
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

  // 現在アクティブなスロットの推奨ベースパーツ、現在装備パーツ、および候補リスト
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

    // 推奨ベースを先頭に、次に適合品、最後に他番手品を並べる
    return [...raw].sort((a, b) => {
      if (a.id === basePartForStep.id) return -1;
      if (b.id === basePartForStep.id) return 1;
      const aCompat = checkPartCompatibility(a, rig).compatible ? 1 : 0;
      const bCompat = checkPartCompatibility(b, rig).compatible ? 1 : 0;
      return bCompat - aCompat;
    });
  }, [activeStep, basePartForStep.id, rig]);

  // 推奨ベース vs 現在選択中パーツのゲーム式比較レポート
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

  // 次のステップ計算
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
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden bg-[#151515] text-[#FFFFFF] font-jp antialiased selection:bg-[#00E5FF] selection:text-[#151515] flex flex-col justify-between">
      {/* ==================== 上部常駐：グローバルステップバー ＆ TARGET LOCK-ON HUD ==================== */}
      <header className="shrink-0 bg-[#151515]/95 border-b border-white/10 px-4 sm:px-6 lg:px-10 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* 左：ロゴ ＆ 3ステップ進行ナビ */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateTo({ view: 'home' })}
              className="flex items-center gap-2.5 text-left group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
              <span className="text-base font-semibold tracking-[0.22em] text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors">
                RIGs
              </span>
            </button>

            <nav aria-label="進行フェーズ" className="flex items-center gap-1.5">
              {(
                [
                  { id: 'home' as PageView, num: '01', label: '釣る魚を選択' },
                  { id: 'garage' as PageView, num: '02', label: '推奨タックル＆変更比較' },
                  { id: 'checkout' as PageView, num: '03', label: '最終確認・購入' },
                ] as const
              ).map((phase, idx) => {
                const isActive = route.view === phase.id;
                return (
                  <React.Fragment key={phase.id}>
                    {idx > 0 && <span className="text-white/20 text-xs">➔</span>}
                    <button
                      type="button"
                      onClick={() => navigateTo({ view: phase.id })}
                      className={`px-3 py-1 rounded-full text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#00E5FF] text-[#151515] font-bold shadow-[0_0_14px_rgba(0,229,255,0.45)]'
                          : 'bg-[#222222] text-[#A0A0A0] hover:text-[#FFFFFF] border border-white/10'
                      }`}
                    >
                      <span className="font-mono text-[10px]">{phase.num}</span>
                      <span>{phase.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* 右：常駐 TARGET LOCK-ON HUD（常に釣る魚を意識させるパネル） */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#222222] border border-[#00E5FF]/50">
              <Fish className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
              <span className="text-[10px] font-mono text-[#00E5FF] tracking-wider uppercase hidden sm:inline">
                TARGET LOCKED:
              </span>
              <select
                value={route.targetId}
                onChange={(e) =>
                  handleSelectTarget(
                    e.target.value as TargetId,
                    route.view === 'home' ? 'garage' : route.view
                  )
                }
                aria-label="ターゲット魚種を切り替え"
                className="bg-transparent text-xs font-medium text-[#FFFFFF] focus:outline-none cursor-pointer"
              >
                {RIG_PRESETS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#222222] text-[#FFFFFF]">
                    {t.fishName} ({t.badge})
                  </option>
                ))}
              </select>
              <span className="hidden xl:inline-flex items-center gap-2 text-[11px] text-[#A0A0A0] border-l border-white/15 pl-2.5">
                <span>初動時速 {targetProfile.strikeSpeedKmh}km</span>
                <span>•</span>
                <span className="text-[#00E5FF]">初動負荷 {targetProfile.initialRunLoadKg}kg</span>
                <span>•</span>
                <span>1日 {targetProfile.dailyCastCount}投</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-[11px] text-[#FFFFFF] transition-colors"
              title="現在の装備URLをコピー"
            >
              {headerUrlCopied ? (
                <>
                  <Check className="w-3 h-3 text-[#00E5FF]" />
                  <span className="text-[#00E5FF]">URLコピー済</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3 h-3 text-[#00E5FF]" />
                  <span>装備URL共有</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 中央メインステージ（1画面固定・スクロールレス領域） ==================== */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-2 flex flex-col">
        {/* -------------------- 【画面1】ホーム：何を釣るかを選択 -------------------- */}
        {route.view === 'home' && (
          <TargetSelectHomeView
            currentTargetId={route.targetId}
            onSelectTargetAndGoGarage={(targetId) => handleSelectTarget(targetId, 'garage')}
            onSelectTargetAndGoCheckout={(targetId) => handleSelectTarget(targetId, 'checkout')}
          />
        )}

        {/* -------------------- 【画面2】装備ガレージ：推奨タックル ＆ 変更オプション比較 -------------------- */}
        {route.view === 'garage' && (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch py-0.5">
            {/* =================================================================
                左ペイン (4 cols)：4つの装備スロット ＆ 対ターゲット総合戦闘力ゲージ
               ================================================================= */}
            <aside className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-[#222222] border border-white/15 p-4 space-y-3">
              {/* 1. ターゲット魚種の攻略条件ミニHUD */}
              <div className="rounded-xl bg-[#151515] border-l-2 border-l-[#00E5FF] border border-white/10 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-[#00E5FF] tracking-wider flex items-center gap-1">
                    <Crosshair className="w-3 h-3" />
                    <span>VS {targetProfile.fishName}</span>
                  </span>
                  {customizedSlotsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetToRecommended}
                      className="text-[10px] text-[#A0A0A0] hover:text-[#00E5FF] flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>推奨に戻す</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] font-light text-[#FFFFFF]/90 leading-snug">
                  {targetProfile.fishHabit}
                </p>
              </div>

              {/* 2. 4つの装備スロット（クリックで比較対象カテゴリを即切替） */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#A0A0A0] px-1">
                  <span>EQUIPPED SLOTS（クリックして変更オプションを比較）</span>
                  <span className="text-[#00E5FF]">
                    {customizedSlotsCount === 0
                      ? '推奨ベース構成'
                      : `${customizedSlotsCount}箇所 カスタム中`}
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
                      className={`w-full rounded-xl p-2.5 text-left transition-all flex items-center justify-between gap-2.5 ${
                        isActive
                          ? 'bg-[#151515] border-2 border-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.3)]'
                          : 'bg-[#151515]/75 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-[#00E5FF]">
                            {meta.stepNum} {meta.label}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              isCustom
                                ? 'bg-[#00E5FF] text-[#151515]'
                                : 'bg-white/10 text-[#A0A0A0]'
                            }`}
                          >
                            {isCustom ? '変更済' : '推奨'}
                          </span>
                          {!compatible && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              番手注意
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-normal text-[#FFFFFF] truncate mt-0.5">
                          {item.shortName}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-light text-[#FFFFFF] tabular-nums">
                          ¥{item.price.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#00E5FF]">
                          {isActive ? '比較中 ▶' : 'オプションを見る'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 3. ゲーム風「対ターゲット総合戦闘力（5項目ゲージ）」 */}
              <div className="rounded-xl bg-[#151515] border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#00E5FF] flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    <span>TOTAL COMBAT STATS (対ターゲット総合能力)</span>
                  </span>
                  <span className="text-[10px] text-[#A0A0A0]">白線＝推奨基準</span>
                </div>

                <div className="space-y-1.5">
                  {combatStats.map((stat) => {
                    const diff = stat.score - stat.baseScore;
                    return (
                      <div key={stat.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="truncate">
                            <span className="font-mono font-semibold text-[#FFFFFF]">
                              {stat.label}
                            </span>
                            <span className="text-[#A0A0A0] ml-1.5">{stat.subLabel}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 tabular-nums">
                            <span className="text-[#FFFFFF] font-mono">{stat.score}</span>
                            {diff !== 0 && (
                              <span
                                className={`px-1 rounded text-[9px] font-bold ${
                                  diff > 0
                                    ? 'bg-[#00E5FF]/20 text-[#00E5FF]'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {diff > 0 ? `▲+${diff}` : `▼${diff}`}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* デュアルゲージバー */}
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
                          {/* 推奨ベース位置のマーカー */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_#fff]"
                            style={{ left: `${stat.baseScore}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* =================================================================
                右ペイン (8 cols)：変更オプション選択 ＆ ゲーム式ステータス・実戦変化比較
               ================================================================= */}
            <section className="lg:col-span-8 flex flex-col justify-between rounded-2xl bg-[#222222] border border-white/15 p-4 sm:p-5 space-y-3.5">
              {/* 1. スロットの役割ヘッダー（魚との対峙フェーズ） */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00E5FF] text-[#151515] font-mono text-[10px] font-bold">
                      SLOT {STEP_META[activeStep].stepNum} // {STEP_META[activeStep].label}
                    </span>
                    <span className="text-xs font-medium text-[#00E5FF]">
                      {STEP_META[activeStep].combatRole}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-normal text-[#FFFFFF] mt-1">
                    推奨パーツと変更オプションの比較（クリックで装備切替＆差分確認）
                  </h2>
                </div>

                {/* 4スロット快速タブ */}
                <div className="flex items-center gap-1 shrink-0">
                  {CATEGORY_ORDER.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectStep(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                        activeStep === cat
                          ? 'bg-[#00E5FF] text-[#151515] font-bold'
                          : 'bg-[#151515] text-[#A0A0A0] hover:text-[#FFFFFF] border border-white/10'
                      }`}
                    >
                      {STEP_META[cat].stepNum} {STEP_META[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 推奨パーツ ＆ 変更オプション選択ストリップ（横並びカード） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {stepCatalog.map((optionPart, idx) => {
                  const isBase = optionPart.id === basePartForStep.id;
                  const isEquipped = optionPart.id === equippedPartForStep.id;
                  const { compatible } = checkPartCompatibility(optionPart, rig);
                  const priceDiff = optionPart.price - basePartForStep.price;

                  return (
                    <button
                      key={optionPart.id}
                      type="button"
                      onClick={() => handleEquipOption(optionPart)}
                      className={`rounded-xl p-3 text-left transition-all flex flex-col justify-between gap-2 ${
                        isEquipped
                          ? 'bg-[#151515] border-2 border-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.35)] scale-[1.01]'
                          : compatible
                          ? 'bg-[#151515]/80 border border-white/15 hover:border-[#00E5FF]/60'
                          : 'bg-[#151515]/40 border border-white/5 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isBase
                                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50'
                                : compatible
                                ? 'bg-white/10 text-[#FFFFFF]'
                                : 'bg-white/5 text-[#A0A0A0]'
                            }`}
                          >
                            {isBase
                              ? '★ 推奨ベース'
                              : compatible
                              ? `変更オプション 0${idx}`
                              : '他番手オプション'}
                          </span>
                          {isEquipped && (
                            <span className="text-[10px] font-bold text-[#00E5FF] flex items-center gap-0.5">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              装備中
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-[#A0A0A0]">{optionPart.brand}</div>
                        <div className="text-xs font-medium text-[#FFFFFF] leading-snug line-clamp-2 mt-0.5">
                          {optionPart.shortName}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-baseline justify-between gap-1">
                        <span className="text-xs font-light text-[#FFFFFF] tabular-nums">
                          ¥{optionPart.price.toLocaleString()}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            priceDiff === 0
                              ? 'text-[#A0A0A0]'
                              : priceDiff < 0
                              ? 'text-[#00E5FF]'
                              : 'text-amber-300'
                          }`}
                        >
                          {priceDiff === 0
                            ? '基準価格'
                            : priceDiff > 0
                            ? `+¥${priceDiff.toLocaleString()}`
                            : `-¥${Math.abs(priceDiff).toLocaleString()}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 3. ゲーム式ステータス比較 ＆ 釣る魚に対する実戦変化インスペクター（左右2分割） */}
              <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
                {/* 左半分 (6 cols): 定量スペック増減ゲージ（数字で何が違うか）＋ 装備プロパティ */}
                <div className="xl:col-span-6 rounded-xl bg-[#151515] border border-white/10 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div>
                        <span className="text-[10px] font-mono font-semibold text-[#00E5FF] tracking-wider block">
                          QUANTITATIVE STAT COMPARISON
                        </span>
                        <h3 className="text-xs sm:text-sm font-medium text-[#FFFFFF]">
                          {comparisonReport.isSameAsBase
                            ? `推奨ベース「${basePartForStep.shortName}」のステータス`
                            : `推奨「${basePartForStep.shortName}」➔「${equippedPartForStep.shortName}」の数値差`}
                        </h3>
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                          comparisonReport.priceDeltaTone === 'up'
                            ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                            : comparisonReport.priceDeltaTone === 'down'
                            ? 'bg-amber-500/15 border-amber-400 text-amber-200'
                            : 'bg-[#222222] border-white/15 text-[#A0A0A0]'
                        }`}
                      >
                        価格差: {comparisonReport.priceDeltaText}
                      </span>
                    </div>

                    {/* 各スペックのデュアル比較ゲージ */}
                    <div className="space-y-2.5">
                      {comparisonReport.statRows.map((row) => (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] gap-2">
                            <span className="font-mono text-[#A0A0A0] text-[10px] truncate">
                              {row.label}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                              {comparisonReport.isSameAsBase ? (
                                <span className="text-xs font-semibold text-[#FFFFFF]">
                                  {row.candValText}
                                </span>
                              ) : (
                                <>
                                  <span className="text-[11px] text-[#A0A0A0]">
                                    {row.baseValText}
                                  </span>
                                  <span className="text-[#00E5FF]">➔</span>
                                  <span className="text-xs font-semibold text-[#FFFFFF]">
                                    {row.candValText}
                                  </span>
                                </>
                              )}
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  row.tone === 'up'
                                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                                    : row.tone === 'down'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                    : 'bg-white/10 text-[#A0A0A0]'
                                }`}
                              >
                                {row.deltaBadge}
                              </span>
                            </div>
                          </div>

                          {/* ゲージバー（白線＝推奨ベース、バー＝選択中パーツ） */}
                          <div className="h-2 rounded-full bg-[#222222] relative overflow-hidden border border-white/5">
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
                                title={`推奨ベース: ${row.baseValText}`}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 装備固有プロパティ（パッシブ特性タグ） */}
                  <div className="pt-2.5 border-t border-white/10 space-y-1.5">
                    <div className="text-[10px] font-mono text-[#00E5FF] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>PASSIVE PROPERTIES // この装備の固有特性</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {equippedPartForStep.propertyTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#222222] border border-[#00E5FF]/40 text-[#FFFFFF]"
                        >
                          ✦ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右半分 (6 cols): それによって「釣る魚」との実戦で何が変わるか（文章解説） */}
                <div className="xl:col-span-6 rounded-xl bg-[#151515] border border-[#00E5FF]/40 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-[#00E5FF]" />
                        <span className="text-[10px] font-mono font-semibold text-[#00E5FF] tracking-wider">
                          TACTICAL IMPACT ON TARGET FISH // 実戦で何が変わるか
                        </span>
                      </div>
                      <span className="text-[10px] text-[#A0A0A0]">
                        対 {targetProfile.weightRange}
                      </span>
                    </div>

                    {/* 数字と直結した変化のヘッドライン */}
                    <div className="rounded-xl bg-[#222222] border-l-4 border-l-[#00E5FF] p-3">
                      <div className="text-xs sm:text-sm font-medium text-[#00E5FF] leading-snug">
                        {comparisonReport.fishFightHeadline}
                      </div>
                    </div>

                    {/* 実戦での変化の文章解説 */}
                    <p className="text-xs font-light text-[#FFFFFF]/90 leading-relaxed">
                      {comparisonReport.fishFightNarrative}
                    </p>

                    {/* 他スロットとの物理互換性に関する注意（もし他番手オプションを選んだ場合） */}
                    {comparisonReport.cascadeNotice && (
                      <div className="rounded-xl bg-amber-950/50 border border-amber-400/50 p-2.5 text-[11px] text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{comparisonReport.cascadeNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* 単体Amazon確認リンク ＆ 推奨へ戻すボタン */}
                  <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    {!comparisonReport.isSameAsBase ? (
                      <button
                        type="button"
                        onClick={() => handleEquipOption(basePartForStep)}
                        className="px-3 py-1.5 rounded-lg bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-[11px] text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3 text-[#00E5FF]" />
                        <span>このスロットを推奨（{basePartForStep.shortName}）に戻す</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#00E5FF] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        現在「推奨ベース」を装備しています
                      </span>
                    )}

                    <a
                      href={buildAmazonAffiliateUrl(equippedPartForStep.amazon)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#FF9900]/15 border border-white/10 hover:border-[#FF9900]/60 text-[11px] text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-1"
                    >
                      <span>Amazonで単体価格・在庫を見る</span>
                      <ExternalLink className="w-3 h-3 text-[#FF9900]" />
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

      {/* ==================== 下部常駐：コマンド＆進捗バー ==================== */}
      <footer className="shrink-0 bg-[#151515]/95 border-t border-white/10 px-4 sm:px-6 lg:px-10 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* 左：現在の装備ステータス・総重量・合計金額 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAllSelectedCompatible
                    ? 'bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-medium text-[#FFFFFF]">
                {isAllSelectedCompatible ? '物理互換性 100% 適合' : '番手・重量バランス要確認'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs text-[#A0A0A0] border-l border-white/15 pl-4">
              <span>
                装備総重量:{' '}
                <strong className="text-[#FFFFFF] font-normal tabular-nums">
                  {totalWeightG}g
                </strong>
              </span>
              <span>•</span>
              <span>
                合計参考金額:{' '}
                <strong className="text-[#00E5FF] font-semibold text-sm tabular-nums">
                  ¥{totalValue.toLocaleString()}
                </strong>
              </span>
            </div>
          </div>

          {/* 右：ステップ進行 ＆ 購入へのメインCTA */}
          <div className="flex items-center gap-2.5">
            {route.view === 'garage' && (
              <>
                {prevStep ? (
                  <button
                    type="button"
                    onClick={() => handleSelectStep(prevStep)}
                    className="px-3.5 py-2 rounded-xl bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-xs text-[#FFFFFF] transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>
                      {STEP_META[prevStep].stepNum} {STEP_META[prevStep].label}へ戻る
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigateTo({ view: 'home' })}
                    className="px-3.5 py-2 rounded-xl bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-xs text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>魚を選び直す</span>
                  </button>
                )}

                {nextStep ? (
                  <button
                    type="button"
                    onClick={() => handleSelectStep(nextStep)}
                    className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-bold tracking-wider shadow-[0_0_16px_rgba(0,229,255,0.45)] hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    <span>
                      次へ：{STEP_META[nextStep].stepNum} {STEP_META[nextStep].label}を確認・比較
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'checkout' })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center gap-1.5 ${
                    !nextStep
                      ? 'bg-[#00E5FF] text-[#151515] shadow-[0_0_20px_rgba(0,229,255,0.55)]'
                      : 'bg-[#222222] text-[#00E5FF] border border-[#00E5FF]/60 hover:bg-[#00E5FF] hover:text-[#151515]'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>この装備で決定・Amazon購入へ進む ➔</span>
                </button>
              </>
            )}

            {route.view === 'home' && (
              <button
                type="button"
                onClick={() => navigateTo({ view: 'garage' })}
                className="px-5 py-2 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-bold tracking-wider flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>選択中の魚（{targetProfile.badge}）で装備ガレージを開く</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {route.view === 'checkout' && (
              <button
                type="button"
                onClick={() => navigateTo({ view: 'garage' })}
                className="px-4 py-2 rounded-xl bg-[#222222] border border-[#00E5FF]/60 text-xs text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#151515] font-semibold transition-colors flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>ガレージに戻ってステータスを再調整する</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TackleBuilder;
