import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  RotateCcw,
  Sparkles,
  X,
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
import {
  resolvePartStudioImage,
  RigPartShowcase,
  TeslaHeroConfiguratorStage,
} from './RigPartShowcase';
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

  // メインフォトステージのカルーセルスライド番号 (0: ロッド×リール統合, 1: リール単体, 2: ロッド単体, 3: ライン&ルアー, 4: ターゲット魚)
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Tesla風「機能を表示する (コールアウト [＋])」モーダル
  const [featureModalIndex, setFeatureModalIndex] = useState<number | null>(null);

  // Tesla風「タックル仕様を比較する ＞」モーダル
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // フッター価格内訳ドロワー
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState<boolean>(false);

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
    setActiveSlide(0);
    navigateTo(
      {
        view: destination,
        targetId,
        activeStep: 'reel',
      },
      presetRig
    );
  };

  const handleEquipOption = (part: AnyRigPart, preferredSlide?: number) => {
    const nextRig: RigState = {
      ...rig,
      [part.category]: part,
    };
    const nextRoute: RouteState = {
      ...route,
      activeStep: part.category,
    };
    setRig(nextRig);
    setRoute(nextRoute);
    if (typeof preferredSlide === 'number') {
      setActiveSlide(preferredSlide);
    }
    syncUrlInPlace(nextRoute, nextRig);
  };

  // リールまたはロッドの番手変更時に、適合するライン＆ルアーへワンタップで同期するヘルパー
  const handleAutoSyncLineAndLure = () => {
    const currentReel = rig.reel ?? recommendedRig.reel!;
    const currentRod = rig.rod ?? recommendedRig.rod!;

    const matchedRod = currentRod.compatibleReelSizes.includes(currentReel.sizeClass)
      ? currentRod
      : ROD_CATALOG.find((r) => r.compatibleReelSizes.includes(currentReel.sizeClass)) ??
        currentRod;

    const matchedLine =
      LINE_CATALOG.find((l) => l.peNumber === currentReel.peCapacityNum) ??
      rig.line ??
      recommendedRig.line!;

    const matchedLure =
      LURE_CATALOG.find(
        (lu) =>
          lu.totalWeightG >= matchedRod.lureMinG &&
          lu.totalWeightG <= matchedRod.lureMaxG &&
          matchedLine.peNumber >= lu.minPe
      ) ??
      rig.lure ??
      recommendedRig.lure!;

    const nextRig: RigState = {
      reel: currentReel,
      rod: matchedRod,
      line: matchedLine,
      lure: matchedLure,
    };
    setRig(nextRig);
    syncUrlInPlace(route, nextRig);
  };

  const handleResetToRecommended = () => {
    const presetRig = getPresetRigState(route.targetId);
    setRig(presetRig);
    setActiveSlide(0);
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

  const customizedSlotsCount = useMemo(() => {
    return CATEGORY_ORDER.filter((cat) => rig[cat]?.id !== recommendedRig[cat]?.id).length;
  }, [rig, recommendedRig]);

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(buildShareableSpecUrl(rig, route.targetId));
    setHeaderUrlCopied(true);
    setTimeout(() => setHeaderUrlCopied(false), 2500);
  };

  // フィーチャーモーダル用の4大ハイライト定義
  const featureHighlights = useMemo(() => {
    const reel = rig.reel!;
    const rod = rig.rod!;
    const line = rig.line!;
    const lure = rig.lure!;
    return [
      {
        tag: 'ROD ARCHITECTURE // ブランクス設計',
        title: `${rod.brand} ${rod.shortName}`,
        subtitle: rod.subCode,
        description: rod.description,
        image: resolvePartStudioImage(rod),
        metrics: rod.specs,
      },
      {
        tag: 'REEL DRAG & POWERTRAIN // リール制動機構',
        title: `${reel.brand} ${reel.shortName}`,
        subtitle: reel.subCode,
        description: reel.description,
        image: resolvePartStudioImage(reel),
        metrics: reel.specs,
      },
      {
        tag: 'PHYSICAL SYNERGY // ルアー＆ロッド物理適合',
        title: `実戦ルアー総重量 ${lure.totalWeightG}g × ロッド上限 ${rod.lureMaxG}g`,
        subtitle: `${lure.shortName} (${lure.hookSpec})`,
        description: `${lure.description} 選択中のロッド「${rod.shortName}（許容 ${rod.lureMinG}〜${rod.lureMaxG}g）」と組み合わせた際のブランクス負荷率は ${Math.round(
          (lure.totalWeightG / rod.lureMaxG) * 100
        )}% です。`,
        image: resolvePartStudioImage(lure),
        metrics: lure.specs,
      },
      {
        tag: 'LINE CAPACITY & RETRIEVE // 糸巻量＆高速回収',
        title: `${line.shortName} × 1回転 ${reel.retrieveCm}cm`,
        subtitle: line.subCode,
        description: line.description,
        image: resolvePartStudioImage(line),
        metrics: line.specs,
      },
    ];
  }, [rig]);

  return (
    <div className="min-h-dvh bg-white text-[#171A20] font-sans antialiased selection:bg-[#3E6AE1] selection:text-white flex flex-col justify-between">
      {/* ==================== 上部ヘッダー：Tesla Minimal Navigation (白スタジオ統一) ==================== */}
      <header className="sticky top-0 z-30 shrink-0 bg-white/95 backdrop-blur-md border-b border-black/5 px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
          {/* 左：Tesla ワイドレタースペーシング風ブランドロゴ */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => navigateTo({ view: 'garage' })}
              className="flex items-center gap-2 text-left group"
            >
              <span className="font-oswald text-lg sm:text-xl font-bold tracking-[0.42em] text-[#171A20] group-hover:text-[#3E6AE1] transition-colors">
                R I G s
              </span>
            </button>

            <nav aria-label="画面切り替え" className="hidden md:flex items-center gap-1">
              {(
                [
                  { id: 'garage' as PageView, label: 'コンフィギュレーター' },
                  { id: 'home' as PageView, label: 'ターゲット魚種から選ぶ' },
                  { id: 'checkout' as PageView, label: '完成仕様書・注文' },
                ] as const
              ).map((phase) => {
                const isActive = route.view === phase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => navigateTo({ view: phase.id })}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#F4F4F4] text-[#171A20] font-semibold'
                        : 'text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4]/60'
                    }`}
                  >
                    {phase.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 右：モバイル用ナビ ＆ 🌐 JP (URL共有) */}
          <div className="flex items-center gap-2">
            <div className="flex md:hidden items-center gap-1">
              {(
                [
                  { id: 'garage' as PageView, label: 'ビルド' },
                  { id: 'home' as PageView, label: '魚種' },
                  { id: 'checkout' as PageView, label: '注文' },
                ] as const
              ).map((phase) => {
                const isActive = route.view === phase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => navigateTo({ view: phase.id })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                      isActive
                        ? 'bg-[#171A20] text-white'
                        : 'bg-[#F4F4F4] text-[#5C5E62]'
                    }`}
                  >
                    {phase.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#171A20] hover:bg-[#F4F4F4] transition-colors"
              title="現在のカスタム構成URLをコピー"
            >
              {headerUrlCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">COPIED</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>JP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== メインステージ ==================== */}
      <main className="flex-1 min-h-0 w-full flex flex-col bg-white">
        {/* -------------------- 【画面1】ターゲット魚種ガイド画面 -------------------- */}
        {route.view === 'home' && (
          <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 flex-1 flex flex-col">
            <TargetSelectHomeView
              currentTargetId={route.targetId}
              onSelectTargetAndGoGarage={(targetId) => handleSelectTarget(targetId, 'garage')}
              onSelectTargetAndGoCheckout={(targetId) => handleSelectTarget(targetId, 'checkout')}
            />
          </div>
        )}

        {/* =================================================================
            【画面2】Tesla Model 3 型 スプリット・コンフィギュレーター（白スタジオ統一）
            ・左 8 cols (Sticky固定): ロッド＆リール スタジオ写真 ＋ 引き出し線コールアウト [＋] ＋ < ● ○ ○ ○ ○ >
            ・右 4 cols (縦スクロール): ロッド・リール中心の大型セレクター ＋ ライン・ルアー丸型スウォッチ
           ================================================================= */}
        {route.view === 'garage' && (
          <div className="max-w-[1680px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 items-start">
            {/* -----------------------------------------------------------------
                左ペイン (PC: 8 cols Sticky / モバイル: 上部固定フォトステージ)
               ----------------------------------------------------------------- */}
            <div className="lg:col-span-8 lg:sticky lg:top-[57px] lg:h-[calc(100dvh-137px)] w-full flex flex-col justify-between z-20 bg-white border-b lg:border-b-0 border-black/5">
              <TeslaHeroConfiguratorStage
                rig={rig}
                target={targetProfile}
                activeSlide={activeSlide}
                onChangeSlide={(idx) => setActiveSlide(idx)}
                onOpenFeatureModal={(featIdx) => setFeatureModalIndex(featIdx ?? 0)}
                isAllCompatible={isAllSelectedCompatible}
              />
            </div>

            {/* -----------------------------------------------------------------
                右ペイン (PC: 4 cols 縦スクロール / モバイル: 下部ストリーム)
               ----------------------------------------------------------------- */}
            <div className="lg:col-span-4 w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 pb-28">
              {/* 1. モバイル専用：添付画像2枚目の「機能を表示する ＞」枠ボックス */}
              <div className="sm:hidden rounded-xl border-2 border-[#171A20] bg-white p-2.5">
                <button
                  type="button"
                  onClick={() => setFeatureModalIndex(0)}
                  className="w-full rounded-lg px-4 py-3 flex items-center justify-between text-sm font-medium bg-[#F4F4F4] text-[#171A20] hover:bg-[#E8E8EA] transition-colors"
                >
                  <span>機能を表示する</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 2. ターゲットクラス切替 ＆「タックル仕様を比較する ＞」カード */}
              <div className="rounded-2xl p-5 sm:p-6 space-y-4 bg-[#F4F4F4] text-[#171A20]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-oswald tracking-widest uppercase block text-[#5C5E62]">
                      TARGET CLASS // 推奨基準クラス
                    </span>
                    <h2 className="text-base font-bold mt-0.5">
                      ターゲット魚種・海域クラス
                    </h2>
                  </div>
                  {customizedSlotsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetToRecommended}
                      className="text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1 bg-white text-[#5C5E62] hover:text-[#171A20] shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>推奨に戻す</span>
                    </button>
                  )}
                </div>

                {/* Teslaのグレード選択枠スタイル */}
                <div className="grid grid-cols-3 gap-2">
                  {RIG_PRESETS.map((preset) => {
                    const isSelectedTarget = route.targetId === preset.id;
                    const shortLabel =
                      preset.id === 'pe6'
                        ? 'PE6 近海'
                        : preset.id === 'pe8'
                        ? 'PE8 大型'
                        : 'PE10 遠征';
                    const subFish =
                      preset.id === 'pe6'
                        ? 'ヒラマサ・キハダ'
                        : preset.id === 'pe8'
                        ? 'クロマグロ・オオマサ'
                        : '100kg超マグロ・GT';
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectTarget(preset.id, 'garage')}
                        className={`rounded-xl p-2.5 text-left transition-all ${
                          isSelectedTarget
                            ? 'bg-white border-2 border-[#171A20] shadow-sm'
                            : 'bg-white/60 border border-black/10 hover:bg-white'
                        }`}
                      >
                        <div className="font-oswald text-xs font-bold tracking-wider">
                          {shortLabel}
                        </div>
                        <div className="text-[10px] truncate mt-0.5 text-[#5C5E62]">
                          {subFish}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 添付画像の「車両を比較する ＞」と同一デザインの白ボタン行 */}
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="w-full rounded-xl px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm font-medium bg-white hover:bg-[#FAFAFA] text-[#171A20] shadow-sm transition-all"
                >
                  <span>タックル仕様を比較する</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* 番手不一致がある場合のワンタップ自動最適化アシスト */}
                {!isAllSelectedCompatible && (
                  <div className="rounded-xl p-3.5 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-900">
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>選択中のリール番手とライン/ロッドに不一致があります</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoSyncLineAndLure}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs font-medium transition-colors"
                    >
                      自動最適化
                    </button>
                  </div>
                )}
              </div>

              {/* =================================================================
                  3. 【主役セクション 1】リール (REEL) — 大型スタジオフォト選択
                 ================================================================= */}
              <section
                aria-label="リール選択"
                className="rounded-2xl p-5 sm:p-6 space-y-5 bg-[#F4F4F4] text-[#171A20]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      リール
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(1)}
                      className="text-xs font-medium underline underline-offset-4 text-[#5C5E62] hover:text-[#171A20]"
                    >
                      単体写真を拡大
                    </button>
                  </div>

                  {/* Tesla風：選択中モデル名（左） ＆ 価格（右） */}
                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <div className="text-sm sm:text-base font-medium">
                      {rig.reel?.brand} {rig.reel?.shortName}
                    </div>
                    <div className="font-oswald text-base sm:text-lg font-semibold tabular-nums shrink-0">
                      ¥{rig.reel?.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-[#5C5E62]">
                    {rig.reel?.sizeClass}番 ・ 最大ドラグ {rig.reel?.dragMaxKg}kg ・ 自重{' '}
                    {rig.reel?.weightG}g ・ 1回転 {rig.reel?.retrieveCm}cm
                  </div>
                </div>

                {/* リール大型ビジュアルセレクター (2×2 グリッド) */}
                <div className="grid grid-cols-2 gap-3">
                  {REEL_CATALOG.map((reelItem) => {
                    const isSelected = rig.reel?.id === reelItem.id;
                    const isBase = recommendedRig.reel?.id === reelItem.id;
                    return (
                      <button
                        key={reelItem.id}
                        type="button"
                        onClick={() =>
                          handleEquipOption(
                            reelItem,
                            activeSlide === 2 || activeSlide === 3 ? 0 : activeSlide
                          )
                        }
                        className={`group relative rounded-xl p-3 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white ring-2 ring-[#171A20] shadow-md'
                            : 'bg-white/80 hover:bg-white border border-black/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`font-oswald text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#171A20] text-white'
                                : 'bg-[#F4F4F4] text-[#5C5E62]'
                            }`}
                          >
                            #{reelItem.sizeClass}
                          </span>
                          {isBase && (
                            <span className="text-[10px] font-medium text-[#3E6AE1]">
                              標準推奨
                            </span>
                          )}
                        </div>

                        <RigPartShowcase
                          part={reelItem}
                          isSelected={isSelected}
                          size="md"
                        />

                        <div className="mt-2.5 space-y-0.5">
                          <div className="text-[10px] font-medium text-[#5C5E62]">
                            {reelItem.brand}
                          </div>
                          <div className="text-xs sm:text-[13px] font-semibold truncate">
                            {reelItem.shortName}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-oswald text-xs font-bold tabular-nums">
                              ¥{reelItem.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-oswald text-[#5C5E62]">
                              PE{reelItem.peCapacityNum}号
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* =================================================================
                  4. 【主役セクション 2】ロッド (ROD) — 大型スタジオフォト選択
                 ================================================================= */}
              <section
                aria-label="ロッド選択"
                className="rounded-2xl p-5 sm:p-6 space-y-5 bg-[#F4F4F4] text-[#171A20]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      ロッド
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(2)}
                      className="text-xs font-medium underline underline-offset-4 text-[#5C5E62] hover:text-[#171A20]"
                    >
                      単体写真を拡大
                    </button>
                  </div>

                  {/* Tesla風：選択中モデル名（左） ＆ 価格（右） */}
                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <div className="text-sm sm:text-base font-medium">
                      {rig.rod?.brand} {rig.rod?.shortName}
                    </div>
                    <div className="font-oswald text-base sm:text-lg font-semibold tabular-nums shrink-0">
                      ¥{rig.rod?.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-[#5C5E62]">
                    {rig.rod?.lengthFt} ・ ルアー {rig.rod?.lureMinG}〜{rig.rod?.lureMaxG}g ・
                    耐荷重 {rig.rod?.dragMaxKg}kg ・ 自重 {rig.rod?.weightG}g
                  </div>
                </div>

                {/* ロッド大型ビジュアルセレクター (2×2 グリッド) */}
                <div className="grid grid-cols-2 gap-3">
                  {ROD_CATALOG.map((rodItem) => {
                    const isSelected = rig.rod?.id === rodItem.id;
                    const isReelMatched = rig.reel
                      ? rodItem.compatibleReelSizes.includes(rig.reel.sizeClass)
                      : true;
                    return (
                      <button
                        key={rodItem.id}
                        type="button"
                        onClick={() =>
                          handleEquipOption(
                            rodItem,
                            activeSlide === 1 || activeSlide === 3 ? 0 : activeSlide
                          )
                        }
                        className={`group relative rounded-xl p-3 text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-white ring-2 ring-[#171A20] shadow-md'
                            : 'bg-white/80 hover:bg-white border border-black/5'
                        } ${!isReelMatched && !isSelected ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`font-oswald text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-[#171A20] text-white'
                                : 'bg-[#F4F4F4] text-[#5C5E62]'
                            }`}
                          >
                            MAX {rodItem.lureMaxG}g
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              isReelMatched ? 'text-emerald-700' : 'text-amber-600'
                            }`}
                          >
                            {isReelMatched
                              ? `✓ ${rig.reel?.sizeClass}番適合`
                              : `${rodItem.compatibleReelSizes.join('/')}番用`}
                          </span>
                        </div>

                        <RigPartShowcase
                          part={rodItem}
                          isSelected={isSelected}
                          size="md"
                        />

                        <div className="mt-2.5 space-y-0.5">
                          <div className="text-[10px] font-medium truncate text-[#5C5E62]">
                            {rodItem.brand}
                          </div>
                          <div className="text-xs sm:text-[13px] font-semibold truncate">
                            {rodItem.shortName}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="font-oswald text-xs font-bold tabular-nums">
                              ¥{rodItem.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-oswald text-[#5C5E62]">
                              PE{rodItem.minPe}-{rodItem.maxPe}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* =================================================================
                  5. 【サブセクション】ライン ＆ ルアー — Tesla風 丸型スウォッチ (○)
                 ================================================================= */}
              <section
                aria-label="ライン＆ルアー選択"
                className="rounded-2xl p-5 sm:p-6 space-y-6 bg-[#F4F4F4] text-[#171A20]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    ライン ＆ ルアー
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveSlide(3)}
                    className="text-xs font-medium underline underline-offset-4 text-[#5C5E62] hover:text-[#171A20]"
                  >
                    写真を表示
                  </button>
                </div>

                {/* -------- 5-A. PEライン（丸型スウォッチ選択） -------- */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{rig.line?.shortName}</div>
                      <div className="text-[11px] mt-0.5 text-[#5C5E62]">
                        ＋ {rig.line?.pairedLeaderSpec}
                      </div>
                    </div>
                    <div className="font-oswald text-sm sm:text-base font-semibold tabular-nums shrink-0">
                      ¥{rig.line?.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Teslaのカラースウォッチ（丸アイコン）並び */}
                  <div className="flex items-center gap-4 pt-1 pb-2">
                    {LINE_CATALOG.map((lineItem) => {
                      const isSelected = rig.line?.id === lineItem.id;
                      const isCompat = checkPartCompatibility(lineItem, rig).compatible;
                      return (
                        <div key={lineItem.id} className="relative flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => handleEquipOption(lineItem)}
                            aria-label={lineItem.shortName}
                            className={`group relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 ${
                              isSelected
                                ? 'ring-2 ring-[#171A20] ring-offset-2 ring-offset-[#F4F4F4] scale-105'
                                : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            <RigPartShowcase
                              part={lineItem}
                              isSelected={isSelected}
                              size="swatch"
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full font-oswald text-[10px] font-bold shadow ${
                                isSelected
                                  ? 'bg-[#171A20] text-white'
                                  : 'bg-white text-[#171A20] border border-black/15'
                              }`}
                            >
                              {lineItem.peNumber}号
                            </span>
                            {!isCompat && (
                              <span
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center"
                                title="リール番手と容量が異なります"
                              >
                                !
                              </span>
                            )}
                          </button>

                          {isSelected && (
                            <span className="mt-2 px-2 py-0.5 rounded bg-[#222222] text-white text-[10px] font-medium whitespace-nowrap shadow-sm">
                              PE{lineItem.peNumber}号 ({lineItem.strengthLb}lb)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-black/10" />

                {/* -------- 5-B. オフショアルアー（丸型スウォッチ選択） -------- */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{rig.lure?.shortName}</div>
                      <div className="text-[11px] mt-0.5 text-[#5C5E62]">
                        実戦総重量 {rig.lure?.totalWeightG}g ({rig.lure?.hookSpec})
                      </div>
                    </div>
                    <div className="font-oswald text-sm sm:text-base font-semibold tabular-nums shrink-0">
                      ¥{rig.lure?.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Teslaのホイール/インテリア丸スウォッチ並び */}
                  <div className="flex flex-wrap items-start gap-4 pt-1 pb-2">
                    {LURE_CATALOG.map((lureItem) => {
                      const isSelected = rig.lure?.id === lureItem.id;
                      const isCompat = checkPartCompatibility(lureItem, rig).compatible;
                      return (
                        <div key={lureItem.id} className="relative flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => handleEquipOption(lureItem)}
                            aria-label={lureItem.shortName}
                            className={`group relative w-14 h-14 rounded-full p-0.5 transition-all duration-200 ${
                              isSelected
                                ? 'ring-2 ring-[#171A20] ring-offset-2 ring-offset-[#F4F4F4] scale-105'
                                : 'opacity-80 hover:opacity-100 hover:scale-105'
                            }`}
                          >
                            <RigPartShowcase
                              part={lureItem}
                              isSelected={isSelected}
                              size="swatch"
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full font-oswald text-[10px] font-bold shadow ${
                                isSelected
                                  ? 'bg-[#171A20] text-white'
                                  : 'bg-white text-[#171A20] border border-black/15'
                              }`}
                            >
                              {Math.round(lureItem.totalWeightG)}g
                            </span>
                            {!isCompat && (
                              <span
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center"
                                title="ロッドのルアー重量上限を超過しています"
                              >
                                !
                              </span>
                            )}
                          </button>

                          {isSelected && (
                            <span className="mt-2 px-2 py-0.5 rounded bg-[#222222] text-white text-[10px] font-medium whitespace-nowrap shadow-sm">
                              {lureItem.shortName.split(' (')[0]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* -------------------- 【画面3】最終確認・購入（完成仕様書） -------------------- */}
        {route.view === 'checkout' && (
          <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 flex-1 flex flex-col">
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
          </div>
        )}
      </main>

      {/* =================================================================
          最下部固定：Tesla Model 3 スタイル 決済・サマリーバー（白ベース統一）
          ・左：ロッド × リール 構成タイトル ＆ サブ構成
          ・右：¥218,500 ∨ (購入参考価格) ＋ 青い「今すぐ注文」ボタン (#3E6AE1)
         ================================================================= */}
      {route.view !== 'home' && (
        <footer className="sticky bottom-0 z-40 shrink-0 px-4 sm:px-8 lg:px-12 py-3.5 bg-white border-t border-black/10 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] text-[#171A20]">
          {/* 価格内訳ポップオーバー（¥218,500 ∨ をクリックした時に展開） */}
          {isPriceBreakdownOpen && (
            <div className="max-w-[1680px] mx-auto mb-3 p-4 rounded-2xl border border-black/10 bg-[#F8F9FA] text-[#171A20] shadow-xl transition-all">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-black/10">
                <span className="text-xs font-bold tracking-wider uppercase">
                  選択中の4点構成 価格内訳（税込・Amazon参考価格）
                </span>
                <button
                  type="button"
                  onClick={() => setIsPriceBreakdownOpen(false)}
                  className="p-1 rounded-md hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {CATEGORY_ORDER.map((cat) => {
                  const p = rig[cat]!;
                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-xl flex items-center justify-between gap-2 bg-white border border-black/5"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#5C5E62] uppercase">{cat}</div>
                        <div className="font-medium truncate">{p.shortName}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-oswald font-bold">
                          ¥{p.price.toLocaleString()}
                        </div>
                        <a
                          href={buildAmazonAffiliateUrl(p.amazon)}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="text-[10px] text-[#3E6AE1] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Amazon</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-4">
            {/* 左（PC表示）：Teslaの「Model 3 パフォーマンス / デュアルモーターAWD...」と同じ構成サマリー */}
            <div className="hidden md:block min-w-0">
              <div className="flex items-baseline gap-2.5">
                <span className="text-lg font-bold tracking-tight truncate">
                  {rig.rod?.shortName} × {rig.reel?.shortName}
                </span>
                <span className="text-xs font-normal text-[#5C5E62]">
                  {targetProfile.badge}
                </span>
              </div>
              <div className="text-xs truncate mt-0.5 text-[#5C5E62]">
                {rig.line?.shortName} ・ {rig.lure?.shortName} ・ 総重量 {totalWeightG}g
              </div>
            </div>

            {/* 右（PC・モバイル共通）：合計金額（¥218,500 ∨ 購入価格） ＋ 青い「今すぐ注文」ボタン */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 sm:gap-8">
              <button
                type="button"
                onClick={() => setIsPriceBreakdownOpen((prev) => !prev)}
                className="text-left group"
                title="クリックして4点の内訳を表示"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-oswald text-xl sm:text-2xl font-bold tabular-nums tracking-tight">
                    ¥{totalValue.toLocaleString()}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isPriceBreakdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <div className="text-[11px] text-[#5C5E62]">
                  購入価格（4点合計）
                </div>
              </button>

              {route.view === 'garage' ? (
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'checkout' })}
                  className="px-7 sm:px-9 py-3 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-sm shrink-0"
                >
                  今すぐ注文
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'garage' })}
                  className="px-6 py-2.5 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shrink-0"
                >
                  コンフィギュレーターへ戻る
                </button>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* =================================================================
          モーダル1：Tesla風「機能を表示する（コールアウト [＋] 詳細）」スライドモーダル
         ================================================================= */}
      {featureModalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFeatureModalIndex(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-white text-[#171A20] p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-oswald font-bold tracking-widest text-[#3E6AE1] uppercase">
                {featureHighlights[featureModalIndex].tag}
              </span>
              <button
                type="button"
                onClick={() => setFeatureModalIndex(null)}
                className="w-8 h-8 rounded-full bg-[#F4F4F4] hover:bg-[#E5E5E5] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="h-56 sm:h-64 rounded-2xl bg-[#FAFAFA] flex items-center justify-center p-6">
              <img
                src={featureHighlights[featureModalIndex].image}
                alt={featureHighlights[featureModalIndex].title}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold">
                {featureHighlights[featureModalIndex].title}
              </h3>
              <div className="text-xs font-medium text-[#5C5E62]">
                {featureHighlights[featureModalIndex].subtitle}
              </div>
              <p className="text-sm text-[#393C41] leading-relaxed pt-1">
                {featureHighlights[featureModalIndex].description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {featureHighlights[featureModalIndex].metrics.map((m) => (
                <div key={m.label} className="rounded-xl bg-[#F4F4F4] p-3">
                  <div className="text-[11px] text-[#5C5E62]">{m.label}</div>
                  <div className="font-oswald text-sm font-bold text-[#171A20] mt-0.5">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setFeatureModalIndex(
                    (featureModalIndex - 1 + featureHighlights.length) %
                      featureHighlights.length
                  )
                }
                className="px-4 py-2 rounded-lg bg-[#F4F4F4] hover:bg-[#E5E5E5] text-xs font-medium flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>前の機能</span>
              </button>

              <div className="flex items-center gap-2">
                {featureHighlights.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFeatureModalIndex(idx)}
                    className={`w-2 h-2 rounded-full ${
                      featureModalIndex === idx ? 'bg-[#171A20]' : 'bg-[#D0D1D2]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setFeatureModalIndex(
                    (featureModalIndex + 1) % featureHighlights.length
                  )
                }
                className="px-4 py-2 rounded-lg bg-[#F4F4F4] hover:bg-[#E5E5E5] text-xs font-medium flex items-center gap-1.5"
              >
                <span>次の機能</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          モーダル2：Tesla風「タックル仕様を比較する ＞」スペック＆戦闘力比較モーダル
         ================================================================= */}
      {isCompareModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsCompareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl bg-white text-[#171A20] p-6 sm:p-8 shadow-2xl space-y-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="text-xs font-oswald font-bold tracking-widest text-[#3E6AE1] uppercase">
                  SPECIFICATION & TELEMETRY COMPARISON
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  推奨ベース構成とのスペック・戦闘力比較
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F4F4] hover:bg-[#E5E5E5] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setRoute((r) => ({ ...r, activeStep: cat }))}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                    activeStep === cat
                      ? 'bg-[#171A20] text-white'
                      : 'bg-[#F4F4F4] text-[#5C5E62] hover:text-[#171A20]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-[#F4F4F4] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">
                  {equippedPartForStep.shortName} vs 推奨基準 ({basePartForStep.shortName})
                </div>
                <span className="font-oswald text-xs font-bold px-2.5 py-1 rounded-full bg-white">
                  {comparisonReport.priceDeltaText}
                </span>
              </div>

              <p className="text-xs text-[#393C41] leading-relaxed bg-white p-3.5 rounded-xl">
                {comparisonReport.fishFightHeadline} — {comparisonReport.fishFightNarrative}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comparisonReport.statRows.map((row) => (
                  <div key={row.label} className="bg-white rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-oswald text-[#5C5E62]">{row.label}</span>
                      <span className="font-oswald font-bold">{row.candValText}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E5E5E5] overflow-hidden">
                      <div
                        className="h-full bg-[#3E6AE1]"
                        style={{ width: `${row.candPct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#3E6AE1] font-medium">
                      {row.deltaBadge}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3E6AE1]" />
                <span>対「{targetProfile.fishName}」5項目トータルバランス</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {combatStats.map((stat) => (
                  <div key={stat.id} className="rounded-xl bg-[#F4F4F4] p-3 text-center">
                    <div className="text-[10px] font-oswald text-[#5C5E62]">
                      {stat.label}
                    </div>
                    <div className="font-oswald text-xl font-bold text-[#171A20] my-0.5">
                      {stat.score}
                      <span className="text-xs font-normal text-[#5C5E62]">/100</span>
                    </div>
                    <div className="text-[10px] text-[#5C5E62] truncate">
                      {stat.subLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCompareModalOpen(false);
                  navigateTo({ view: 'checkout' });
                }}
                className="px-6 py-2.5 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs font-semibold flex items-center gap-2"
              >
                <span>完成仕様書・注文画面へ進む</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TackleBuilder;
