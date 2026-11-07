import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Link2,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
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
import {
  getPartStudioFilter,
  resolvePartStudioImage,
  RigPartShowcase,
  ROD_OPEN_STAGE_MASK_STYLE,
  TeslaHeroConfiguratorStage,
} from './RigPartShowcase';
import { SpecCheckoutView } from './SpecCheckoutView';
import {
  DesktopStageRadarDeck,
  MobileStickyStageRadarBar,
  TacklePentagonRadar,
} from './TackleRadarChart';

export type {
  PartCategory,
  ReelPart,
  RodPart,
  LinePart,
  LurePart,
  AnyRigPart,
  RigState,
} from '../data/rigCatalog';

const CLASS_TITLE_MAP: Record<
  TargetId,
  {
    classNameLabel: string;
    roleBadge: string;
    subTitle: string;
  }
> = {
  pe6: {
    classNameLabel: 'PE6号クラス',
    roleBadge: '近海スタンダード',
    subTitle: '14000番基準 ・ 近海ヒラマサ ＆ キハダ',
  },
  pe8: {
    classNameLabel: 'PE8号クラス',
    roleBadge: '大型マグロ・オオマサ',
    subTitle: '18000番基準 ・ 大型クロマグロ ＆ オオマサ',
  },
  pe10: {
    classNameLabel: 'PE10号クラス',
    roleBadge: 'モンスター遠征',
    subTitle: '20000番基準 ・ 100kg超マグロ ＆ 遠征GT',
  },
};

export const TackleBuilder: React.FC = () => {
  const initialParsed = useMemo(() => parseUrlState(), []);
  const [route, setRoute] = useState<RouteState>(initialParsed.route);
  const [rig, setRig] = useState<RigState>(initialParsed.rig);
  const [headerUrlCopied, setHeaderUrlCopied] = useState(false);
  const [inlineSavedCopied, setInlineSavedCopied] = useState(false);

  // Tesla ホーム画面右上の「メニュー」ドロワー開閉
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);

  // メインフォトステージのカルーセルスライド番号 (0: ロッド×リール統合, 1: リール単体, 2: ロッド単体, 3: ライン&ルアー, 4: ターゲット魚)
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // PCで右カラムの道具カードにマウスホバーした際の先行レーダー比較プレビュー用ステート
  const [hoveredPart, setHoveredPart] = useState<AnyRigPart | null>(null);

  // Tesla風「機能を表示する (コールアウト [＋])」モーダル
  const [featureModalIndex, setFeatureModalIndex] = useState<number | null>(null);

  // Tesla風「タックル仕様を比較する ＞」モーダル
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // フッターおよびインライン決済の「価格詳細を表示 ∨」展開ステート
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState<boolean>(false);
  const [isInlinePriceDetailOpen, setIsInlinePriceDetailOpen] = useState<boolean>(false);

  // インライン決済の「Amazonで注文する」から直接開くディスパッチモーダル
  const [isOrderDispatchModalOpen, setIsOrderDispatchModalOpen] = useState<boolean>(false);
  const [checkedOutSlots, setCheckedOutSlots] = useState<Record<string, boolean>>({});

  // 右カラム最下部「お客様のModel PE6」インライン決済セクションのRef & 可視状態
  const inlineCheckoutRef = useRef<HTMLDivElement | null>(null);
  const [isInlineCheckoutVisible, setIsInlineCheckoutVisible] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlState();
      setRoute(parsed.route);
      setRig(parsed.rig);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 添付2枚目・3枚目の連動：右カラム最下部の「お客様のModel PE6」が画面内に入ったら下部スティッキーバーを自動で隠す
  useEffect(() => {
    if (route.view !== 'garage') {
      setIsInlineCheckoutVisible(false);
      return;
    }
    const el = inlineCheckoutRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInlineCheckoutVisible(Boolean(entry && entry.isIntersecting));
      },
      {
        threshold: 0.2,
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [route.view]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const syncUrlInPlace = (updatedRoute: RouteState, updatedRig: RigState) => {
    const urlStr = buildUrlString(updatedRoute, updatedRig);
    if (typeof window !== 'undefined' && urlStr) {
      window.history.replaceState({}, '', urlStr);
    }
  };

  const handleSelectTarget = (targetId: TargetId) => {
    const presetRig = getPresetRigState(targetId);
    setActiveSlide(0);
    setHoveredPart(null);

    navigateTo(
      {
        view: 'garage',
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
    setHoveredPart(null);
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
    setHoveredPart(null);
    setRig(nextRig);
    syncUrlInPlace(route, nextRig);
  };

  const handleResetToRecommended = () => {
    const presetRig = getPresetRigState(route.targetId);
    setHoveredPart(null);
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

  const shareUrl = useMemo(
    () => buildShareableSpecUrl(rig, route.targetId),
    [rig, route.targetId]
  );

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setHeaderUrlCopied(true);
    setTimeout(() => setHeaderUrlCopied(false), 2500);
  };

  const handleSaveDesignInline = () => {
    navigator.clipboard.writeText(shareUrl);
    setInlineSavedCopied(true);
    setTimeout(() => setInlineSavedCopied(false), 2500);
  };

  const handleStickyOrderClick = () => {
    if (inlineCheckoutRef.current) {
      inlineCheckoutRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else {
      setIsOrderDispatchModalOpen(true);
    }
  };

  // フィーチャーモーダル用の4大ハイライト定義
  const featureHighlights = useMemo(() => {
    const reel = rig.reel!;
    const rod = rig.rod!;
    const line = rig.line!;
    const lure = rig.lure!;
    return [
      {
        category: 'rod' as const,
        tag: 'ROD ARCHITECTURE // ブランクス設計',
        title: `${rod.brand} ${rod.shortName}`,
        subtitle: rod.subCode,
        description: rod.description,
        image: resolvePartStudioImage(rod),
        metrics: rod.specs,
      },
      {
        category: 'reel' as const,
        tag: 'REEL DRAG & DRIVE // ドラグ制動・巻上機構',
        title: `${reel.brand} ${reel.shortName}`,
        subtitle: reel.subCode,
        description: reel.description,
        image: resolvePartStudioImage(reel),
        metrics: reel.specs,
      },
      {
        category: 'lure' as const,
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
        category: 'line' as const,
        tag: 'LINE CAPACITY & RETRIEVE // 糸巻量＆高速回収',
        title: `${line.shortName} × 1回転 ${reel.retrieveCm}cm`,
        subtitle: line.subCode,
        description: line.description,
        image: resolvePartStudioImage(line),
        metrics: line.specs,
      },
    ];
  }, [rig]);

  const currentClassInfo = CLASS_TITLE_MAP[route.targetId];

  return (
    <div className="min-h-dvh bg-white text-[#171A20] font-sans antialiased selection:bg-[#3E6AE1] selection:text-white flex flex-col justify-between">
      {/* =====================================================================
          上部ヘッダー：Minimal Studio Navigation
          ・左：R I G s ワイドレタースペーシングロゴ（クリックでホームへ）
          ・右：ビルダー/仕様書時は「構成URLをコピー」＋「メニュー」、ホーム時は「メニュー」
         ===================================================================== */}
      <header className="sticky top-0 z-40 shrink-0 bg-white/95 backdrop-blur-md border-b border-black/5 px-4 sm:px-8 lg:px-12 py-3.5">
        <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* 左：ワイドレタースペーシング ブランドロゴ（折返し防止） */}
          <button
            type="button"
            onClick={() => navigateTo({ view: 'home' })}
            className="flex items-center gap-2 text-left group shrink-0 whitespace-nowrap"
            title="RIGs ホームへ戻る"
          >
            <span className="font-oswald text-lg sm:text-xl font-bold tracking-[0.36em] sm:tracking-[0.42em] text-[#171A20] group-hover:text-[#3E6AE1] transition-colors whitespace-nowrap">
              R I G s
            </span>
          </button>

          {/* 右：構成URL共有ボタン ＋ メニューボタン */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {route.view !== 'home' && (
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium text-[#171A20] hover:bg-[#F4F4F4] transition-colors whitespace-nowrap shrink-0"
                title="現在のカスタム構成URLをコピー"
              >
                {headerUrlCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-600 font-semibold whitespace-nowrap">コピー完了</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5 text-[#5C5E62] shrink-0" />
                    <span className="whitespace-nowrap">
                      <span className="hidden sm:inline">構成</span>URLをコピー
                    </span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMenuDrawerOpen(true)}
              className="px-3.5 sm:px-4 py-1.5 rounded-md bg-[#F4F4F4] hover:bg-[#E5E5E5] text-xs font-semibold text-[#171A20] transition-colors whitespace-nowrap shrink-0"
            >
              メニュー
            </button>
          </div>
        </div>
      </header>

      {/* ==================== メインステージ ==================== */}
      <main className="flex-1 min-h-0 w-full flex flex-col bg-white">
        {/* -------------------- 【画面1】ホーム画面 -------------------- */}
        {route.view === 'home' && (
          <div className="w-full flex-1 flex flex-col">
            <TargetSelectHomeView
              currentTargetId={route.targetId}
              onSelectTargetAndGoGarage={(targetId) =>
                handleSelectTarget(targetId)
              }
            />
          </div>
        )}

        {/* =================================================================
            【画面2】Tesla Model 3 型 スプリット・コンフィギュレーター ＆ インライン決済（添付2・3枚目）
            ・左 8 cols (Sticky固定): ロッド＆リール スタジオ写真 ＋ 引き出し線コールアウト [＋] ＋ < ● ○ ○ ○ ○ >
            ・右 4 cols (縦スクロール):
                上部: モデル名・現金/分割タブ・3大数値・縦積みグレード選択・「タックル仕様を比較する ＞」
                中盤: リール・ロッド・ライン・ルアー選択
                最下部: 標準パッケージ枠 ＋ 「お客様のModel PE6」＋ 黒太枠「Amazonで注文する」
           ================================================================= */}
        {route.view === 'garage' && (
          <div className="w-full flex-1 flex flex-col">
            {/* モバイル・タブレット縦 (lg未満) 専用：上部Sticky固定「ミニ写真 ＋ ミニ5軸レーダー」スリムバー */}
            <MobileStickyStageRadarBar
              rig={rig}
              target={targetProfile}
              activeSlide={activeSlide}
              onChangeSlide={(idx) => setActiveSlide(idx)}
              onOpenFeatureModal={(featIdx) => setFeatureModalIndex(featIdx ?? 0)}
              onResetToRecommended={handleResetToRecommended}
            />

            <div className="max-w-[1680px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 items-start">
              {/* -----------------------------------------------------------------
                  左ペイン (PC専用: 8 cols Sticky固定 — 上段スタジオ写真 ＋ 下段推奨比較レーダーデッキ)
                 ----------------------------------------------------------------- */}
              <div className="hidden lg:flex lg:col-span-8 lg:sticky lg:top-[57px] lg:h-[calc(100dvh-132px)] lg:min-h-[540px] w-full flex-col justify-between z-20 bg-white overflow-hidden">
                <div className="flex-1 min-h-0 w-full">
                  <TeslaHeroConfiguratorStage
                    rig={rig}
                    target={targetProfile}
                    activeSlide={activeSlide}
                    onChangeSlide={(idx) => setActiveSlide(idx)}
                    onOpenFeatureModal={(featIdx) => setFeatureModalIndex(featIdx ?? 0)}
                    isAllCompatible={isAllSelectedCompatible}
                  />
                </div>
                <div className="shrink-0 w-full">
                  <DesktopStageRadarDeck
                    rig={rig}
                    previewPart={hoveredPart}
                    target={targetProfile}
                    onResetToRecommended={handleResetToRecommended}
                  />
                </div>
              </div>

            {/* -----------------------------------------------------------------
                右ペイン (PC: 4 cols 縦スクロール / モバイル: 下部ストリーム)
               ----------------------------------------------------------------- */}
            <div className="lg:col-span-4 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24">
              {/* =================================================================
                  1. ターゲットクラス大見出し
                 ================================================================= */}
              <div className="pt-1 text-center space-y-1">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A20]">
                  {currentClassInfo.classNameLabel}
                </h1>
                <div className="text-xs text-[#5C5E62]">
                  {currentClassInfo.subTitle}
                </div>
              </div>

              {/* =================================================================
                  2. 上部コアスペック＆仕様比較コンテナ
                     ・3列コアスペック数値
                     ・「タックル仕様を比較する ＞」白ボタン
                 ================================================================= */}
              <div className="rounded-2xl p-5 sm:p-6 space-y-5 bg-[#F4F4F4] text-[#171A20]">
                {/* 3列の主要スペック数値（箱なしクリーン表示） */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <div className="font-oswald text-xl sm:text-2xl font-bold text-[#171A20] tabular-nums">
                      {rig.reel?.dragMaxKg}
                      <span className="text-xs sm:text-sm font-semibold ml-0.5">kg</span>
                    </div>
                    <div className="text-[11px] text-[#5C5E62] mt-0.5">最大ドラグ力</div>
                  </div>

                  <div>
                    <div className="font-oswald text-xl sm:text-2xl font-bold text-[#171A20] tabular-nums">
                      {totalWeightG.toLocaleString()}
                      <span className="text-xs sm:text-sm font-semibold ml-0.5">g</span>
                    </div>
                    <div className="text-[11px] text-[#5C5E62] mt-0.5">装備総重量</div>
                  </div>

                  <div>
                    <div className="font-oswald text-xl sm:text-2xl font-bold text-[#171A20] tabular-nums">
                      {rig.lure?.totalWeightG}
                      <span className="text-xs sm:text-sm font-semibold ml-0.5">g</span>
                    </div>
                    <div className="text-[11px] text-[#5C5E62] mt-0.5">
                      針込ルアー重量
                    </div>
                  </div>
                </div>

                {/* スペック比較モーダル導線 */}
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="w-full rounded-lg px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm font-medium bg-white hover:bg-[#FAFAFA] text-[#171A20] shadow-sm transition-all"
                >
                  <span>タックル仕様を比較する</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* カスタム変更時のリセット＆番手不一致時のワンタップ自動最適化 */}
                {customizedSlotsCount > 0 && (
                  <div className="flex items-center justify-between pt-1 text-xs text-[#5C5E62]">
                    <span>{customizedSlotsCount}箇所のパーツを変更中</span>
                    <button
                      type="button"
                      onClick={handleResetToRecommended}
                      className="font-medium underline underline-offset-2 hover:text-[#171A20] inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>初期設定に戻す</span>
                    </button>
                  </div>
                )}

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

              {/* モバイル専用：「各パーツのスペック・適合詳細を見る ＞」ボタン */}
              <div className="sm:hidden rounded-2xl bg-[#F4F4F4] p-3">
                <button
                  type="button"
                  onClick={() => setFeatureModalIndex(0)}
                  className="w-full rounded-lg px-4 py-3.5 flex items-center justify-between text-xs font-medium bg-white text-[#171A20] hover:bg-[#FAFAFA] shadow-sm transition-colors"
                >
                  <span>各パーツのスペック・適合詳細を見る</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                    <div className="font-oswald text-sm sm:text-base font-semibold tabular-nums shrink-0">
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
                    return (
                      <button
                        key={reelItem.id}
                        type="button"
                        onMouseEnter={() => setHoveredPart(reelItem)}
                        onMouseLeave={() => setHoveredPart(null)}
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
                    <div className="font-oswald text-sm sm:text-base font-semibold tabular-nums shrink-0">
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
                        onMouseEnter={() => setHoveredPart(rodItem)}
                        onMouseLeave={() => setHoveredPart(null)}
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
                        <div className="flex items-center justify-between gap-1 mb-1.5 min-h-[20px]">
                          <span
                            className={`font-oswald text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                              isSelected
                                ? 'bg-[#171A20] text-white'
                                : 'bg-[#F4F4F4] text-[#5C5E62]'
                            }`}
                          >
                            MAX {rodItem.lureMaxG}g
                          </span>
                          <span
                            className={`text-[10px] font-medium whitespace-nowrap truncate ${
                              isReelMatched ? 'text-[#5C5E62]' : 'text-amber-600'
                            }`}
                          >
                            {isReelMatched
                              ? `✓ #${rig.reel?.sizeClass}`
                              : `#${rodItem.compatibleReelSizes.join('/')}`}
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

                {/* -------- 5-A. PEライン（3カラム 純白スタジオビジュアル選択） -------- */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#171A20] truncate">
                        {rig.line?.shortName}
                      </div>
                      <div className="text-[11px] mt-0.5 text-[#5C5E62] truncate">
                        ＋ {rig.line?.pairedLeaderSpec}
                      </div>
                    </div>
                    <div className="font-oswald text-sm sm:text-base font-semibold tabular-nums shrink-0 whitespace-nowrap">
                      ¥{rig.line?.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {LINE_CATALOG.map((lineItem) => {
                      const isSelected = rig.line?.id === lineItem.id;
                      const isCompat = checkPartCompatibility(lineItem, rig).compatible;
                      return (
                        <button
                          key={lineItem.id}
                          type="button"
                          onMouseEnter={() => setHoveredPart(lineItem)}
                          onMouseLeave={() => setHoveredPart(null)}
                          onClick={() => handleEquipOption(lineItem)}
                          aria-label={lineItem.shortName}
                          className={`group relative rounded-xl p-2 text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white ring-2 ring-[#171A20] shadow-sm'
                              : 'bg-white/80 hover:bg-white border border-black/5'
                          }`}
                        >
                          <div className="w-full h-[72px] rounded-lg bg-white flex items-center justify-center p-1 overflow-hidden">
                            <img
                              src={resolvePartStudioImage(lineItem)}
                              alt={lineItem.shortName}
                              style={{ filter: getPartStudioFilter(lineItem) }}
                              className="w-full h-full object-contain mix-blend-multiply scale-105 group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          <div className="mt-1.5 text-center">
                            <div className="font-oswald text-xs font-bold text-[#171A20] whitespace-nowrap">
                              PE {lineItem.peNumber}号
                            </div>
                            <div className="text-[10px] text-[#5C5E62] whitespace-nowrap">
                              {lineItem.strengthLb}lb・300m
                            </div>
                          </div>

                          {!isCompat && (
                            <span
                              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                              title="リール番手と容量が異なります"
                            >
                              !
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-black/10" />

                {/* -------- 5-B. オフショアルアー（2×2 ワイドスタジオカード選択 — プラグ全体像を鮮明表示） -------- */}
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#171A20] truncate">
                        {rig.lure?.shortName}
                      </div>
                      <div className="text-[11px] mt-0.5 text-[#5C5E62] truncate">
                        実戦総重量 {rig.lure?.totalWeightG}g ({rig.lure?.hookSpec})
                      </div>
                    </div>
                    <div className="font-oswald text-sm sm:text-base font-semibold tabular-nums shrink-0 whitespace-nowrap">
                      ¥{rig.lure?.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {LURE_CATALOG.map((lureItem) => {
                      const isSelected = rig.lure?.id === lureItem.id;
                      const isCompat = checkPartCompatibility(lureItem, rig).compatible;
                      const cleanModelLabel = lureItem.shortName.split(' (')[0];
                      return (
                        <button
                          key={lureItem.id}
                          type="button"
                          onMouseEnter={() => setHoveredPart(lureItem)}
                          onMouseLeave={() => setHoveredPart(null)}
                          onClick={() => handleEquipOption(lureItem)}
                          aria-label={lureItem.shortName}
                          className={`group relative rounded-xl p-2.5 text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white ring-2 ring-[#171A20] shadow-sm'
                              : 'bg-white/80 hover:bg-white border border-black/5'
                          }`}
                        >
                          <RigPartShowcase
                            part={lureItem}
                            isSelected={isSelected}
                            size="wide"
                          />

                          <div className="mt-2 space-y-0.5">
                            <div className="text-[11px] sm:text-xs font-semibold text-[#171A20] truncate">
                              {cleanModelLabel}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#5C5E62]">
                              <span className="font-oswald font-bold text-[#171A20] whitespace-nowrap">
                                針込 {lureItem.totalWeightG}g
                              </span>
                              <span className="font-oswald whitespace-nowrap">
                                ¥{lureItem.price.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {!isCompat && (
                            <span
                              className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center z-20 shadow-sm"
                              title="ロッドのルアー重量上限を超過しています"
                            >
                              !
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* =================================================================
                  6. 物理適合・ペアリング案内枠
                 ================================================================= */}
              <section
                aria-label="物理適合・ペア金具計算"
                className="rounded-2xl p-5 sm:p-6 space-y-5 bg-[#F4F4F4] text-[#171A20]"
              >
                <div className="rounded-lg border border-[#8E8E93] bg-white/80 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-[#5C5E62]">
                      物理適合 ＆ ノット結束ペアリング
                    </span>
                    <span className="font-medium text-[#5C5E62]">自動計算済</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5C5E62] leading-relaxed">
                    ショックリーダー（{rig.line?.pairedLeaderLb}lb）および太軸フック（
                    {rig.lure?.hookSpec}）の実戦重量・強度バランスを反映しています。
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setFeatureModalIndex(2)}
                    className="px-7 py-2 rounded-md bg-white hover:bg-[#FAFAFA] text-xs font-semibold text-[#171A20] shadow-sm transition-colors"
                  >
                    適合データを見る
                  </button>
                </div>

                <p className="text-[11px] text-[#5C5E62] leading-relaxed">
                  ※スプール糸巻量・ロッド許容ルアー重量（上限
                  {rig.rod?.lureMaxG}g）・最大ドラグ負荷（{rig.rod?.dragMaxKg}
                  kg）をフック＆リング込みの実戦重量で検証しています。実釣時はノット結束強度および初期ドラグ設定をご確認のうえご使用ください。全パーツ一覧は
                  <button
                    type="button"
                    onClick={() => navigateTo({ view: 'checkout' })}
                    className="underline underline-offset-2 text-[#393C41] hover:text-[#171A20] ml-0.5 mr-0.5"
                  >
                    完成装備仕様書
                  </button>
                  で確認・出力できます。
                </p>
              </section>

              {/* =================================================================
                  7. インライン構成サマリー・購入リスト導線
                 ================================================================= */}
              <section
                ref={inlineCheckoutRef}
                aria-label="タックル構成サマリー"
                className="pt-8 pb-6 px-1 sm:px-2 bg-white text-[#171A20] space-y-6"
              >
                {/* 中央揃えヘッダー部 */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#171A20]">
                    選択中のタックル構成
                  </h2>
                  <div className="text-xs font-medium text-[#5C5E62]">
                    {currentClassInfo.classNameLabel}（{currentClassInfo.roleBadge}）
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleSaveDesignInline}
                      className="text-xs sm:text-[13px] text-[#5C5E62] hover:text-[#171A20] underline underline-offset-4 transition-colors"
                    >
                      {inlineSavedCopied
                        ? '✓ 構成URLをクリップボードにコピーしました'
                        : 'この構成URLをコピー'}
                    </button>
                  </div>

                  <div className="text-xs sm:text-[13px] text-[#393C41] pt-0.5">
                    購入先：Amazon.co.jp 公式ストア（在庫・配送目安は各商品ページにて確認）
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsInlinePriceDetailOpen((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-[#171A20] hover:opacity-75 transition-opacity"
                    >
                      <span>価格詳細を表示</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isInlinePriceDetailOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* 「価格詳細を表示 ∨」を展開した際の4点内訳リスト */}
                {isInlinePriceDetailOpen && (
                  <div className="rounded-xl bg-[#F4F4F4] p-4 space-y-2.5 text-xs border border-black/5">
                    {CATEGORY_ORDER.map((cat) => {
                      const part = rig[cat];
                      if (!part) return null;
                      return (
                        <div
                          key={cat}
                          className="flex items-center justify-between gap-2 py-1.5 border-b border-black/5 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-oswald text-[#5C5E62] uppercase mr-2">
                              {STEP_META[cat].label}
                            </span>
                            <span className="font-medium text-[#171A20] truncate">
                              {part.brand} {part.shortName}
                            </span>
                          </div>
                          <span className="font-oswald font-bold tabular-nums shrink-0">
                            ¥{part.price.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#5C5E62]">
                      <span>適合リーダー（{rig.line?.pairedLeaderLb}lb）＆太軸フック（{rig.lure?.hookSpec}）</span>
                      <span>購入リストから同時確認可能</span>
                    </div>
                  </div>
                )}

                {/* 選択構成 参考合計 行 */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-base sm:text-lg font-bold text-[#171A20]">
                      選択構成 参考合計
                    </span>
                    <span className="font-oswald text-lg sm:text-xl font-bold text-[#171A20] tabular-nums">
                      ¥{totalValue.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C5E62] leading-relaxed">
                    ※各パーツはAmazon公式ストアにて1点ずつ個別に確認・購入できます。ショックリーダーやフック等の適合ペア金具も購入リストから個別確認可能です。
                  </p>
                </div>

                {/* Amazon購入リストを開く ボタン */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOrderDispatchModalOpen(true)}
                    className="w-full py-3.5 px-6 rounded-md border-2 border-[#171A20] bg-white hover:bg-[#171A20] text-[#171A20] hover:text-white font-bold text-xs sm:text-sm tracking-wide transition-colors text-center shadow-sm"
                  >
                    Amazon購入リストを開く
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigateTo({ view: 'checkout' })}
                      className="text-xs font-medium text-[#5C5E62] hover:text-[#171A20] underline underline-offset-4"
                    >
                      完成装備仕様書（フル画面ビュー・印刷用）を開く
                    </button>
                  </div>
                </div>
              </section>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- 【画面3】最終確認・購入（完成仕様書フルビュー） -------------------- */}
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
          最下部固定：Tesla Model 3 スタイル 決済・サマリーバー（添付3枚目）
          ・スクロール途中では表示され、右カラム最下部の「お客様のModel PE6」到達時は自動で隠れる（添付2枚目）
         ================================================================= */}
      {route.view === 'garage' && !isInlineCheckoutVisible && (
        <footer className="sticky bottom-0 z-40 shrink-0 px-4 sm:px-8 lg:px-12 py-3.5 bg-white border-t border-black/10 shadow-[0_-8px_24px_rgba(0,0,0,0.05)] text-[#171A20] transition-all duration-300">
          {/* 価格内訳ポップオーバー（¥228,090 ∨ をクリックした時に展開） */}
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
            {/* 左（PC表示）：選択中クラス＆4点構成サマリー */}
            <div className="hidden md:block min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tracking-tight">
                  {currentClassInfo.classNameLabel}
                </span>
                <span className="text-sm font-normal text-[#393C41]">
                  {currentClassInfo.roleBadge}
                </span>
              </div>
              <div className="text-xs truncate mt-0.5 text-[#5C5E62]">
                {rig.rod?.shortName} ・ {rig.reel?.shortName} ・ {rig.line?.shortName} ・{' '}
                {rig.lure?.shortName}
              </div>
            </div>

            {/* 右（PC・モバイル共通）：参考合計金額 ＋ 購入リストへ進むボタン */}
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
                    className={`w-4 h-4 text-[#5C5E62] transition-transform duration-200 ${
                      isPriceBreakdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <div className="text-[11px] text-[#5C5E62]">
                  選択構成 参考合計（4点）
                </div>
              </button>

              <button
                type="button"
                onClick={handleStickyOrderClick}
                className="px-7 sm:px-9 py-3 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-sm shrink-0"
              >
                購入リストへ進む
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* =================================================================
          ドロワー：「メニュー」スライドオーバー
         ================================================================= */}
      {isMenuDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
          onClick={() => setIsMenuDrawerOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-oswald text-base font-bold tracking-[0.35em] text-[#171A20]">
                  R I G s
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuDrawerOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-[#F4F4F4] flex items-center justify-center"
                  aria-label="メニューを閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-oswald tracking-widest text-[#5C5E62] uppercase px-3 pb-1">
                  TARGET CLASSES // ターゲットクラス
                </div>
                {RIG_PRESETS.map((preset) => {
                  const info = CLASS_TITLE_MAP[preset.id];
                  const isCurrent =
                    route.view === 'garage' && route.targetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setIsMenuDrawerOpen(false);
                        handleSelectTarget(preset.id);
                      }}
                      className={`w-full px-3 py-3 rounded-lg text-left flex items-center justify-between transition-colors ${
                        isCurrent ? 'bg-[#F4F4F4] font-bold' : 'hover:bg-[#F4F4F4]/60'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[#171A20]">
                          {info.classNameLabel}
                        </div>
                        <div className="text-xs text-[#5C5E62]">{info.subTitle}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#5C5E62]" />
                    </button>
                  );
                })}
              </div>

              <div className="h-[1px] bg-black/10" />

              <div className="space-y-1">
                <div className="text-[11px] font-oswald tracking-widest text-[#5C5E62] uppercase px-3 pb-1">
                  NAVIGATION // 画面切替
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    navigateTo({ view: 'home' });
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    route.view === 'home'
                      ? 'bg-[#F4F4F4] font-bold'
                      : 'hover:bg-[#F4F4F4]/60'
                  }`}
                >
                  ホーム（ターゲットクラス一覧）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    navigateTo({ view: 'garage' });
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    route.view === 'garage'
                      ? 'bg-[#F4F4F4] font-bold'
                      : 'hover:bg-[#F4F4F4]/60'
                  }`}
                >
                  タックルビルダー（装備カスタム）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    navigateTo({ view: 'checkout' });
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                    route.view === 'checkout'
                      ? 'bg-[#F4F4F4] font-bold'
                      : 'hover:bg-[#F4F4F4]/60'
                  }`}
                >
                  完成装備仕様書（一覧・共有）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuDrawerOpen(false);
                    setIsCompareModalOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium hover:bg-[#F4F4F4]/60 transition-colors"
                >
                  タックル仕様を比較する
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-black/10 space-y-3">
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F4F4F4] hover:bg-[#E5E5E5] text-xs font-semibold text-[#171A20] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#5C5E62]" />
                  <span>現在の構成URLをコピー</span>
                </span>
                {headerUrlCopied && (
                  <span className="text-emerald-600 font-bold">コピー完了</span>
                )}
              </button>
            </div>
          </div>
        </div>
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

            <div className="h-56 sm:h-64 rounded-2xl bg-white border border-black/10 flex items-center justify-center p-5 overflow-hidden">
              <div
                style={
                  featureHighlights[featureModalIndex].category === 'rod'
                    ? ROD_OPEN_STAGE_MASK_STYLE
                    : undefined
                }
                className={`h-full flex items-center justify-center ${
                  featureHighlights[featureModalIndex].category === 'rod'
                    ? 'aspect-square max-w-full'
                    : 'w-full'
                }`}
              >
                <img
                  src={featureHighlights[featureModalIndex].image}
                  alt={featureHighlights[featureModalIndex].title}
                  style={{
                    filter: getPartStudioFilter(
                      featureHighlights[featureModalIndex].category
                    ),
                  }}
                  className={`w-full h-full mix-blend-multiply ${
                    featureHighlights[featureModalIndex].category === 'lure'
                      ? 'object-cover object-[50%_52%] max-w-[420px]'
                      : featureHighlights[featureModalIndex].category === 'rod'
                      ? 'object-contain'
                      : 'object-contain scale-105'
                  }`}
                />
              </div>
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
                <span>前の項目</span>
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
                <span>次の項目</span>
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
                  SPECIFICATION &amp; TELEMETRY COMPARISON
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  初期設定（基準）とのスペック・バランス比較
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
                  {equippedPartForStep.shortName} vs 初期設定 ({basePartForStep.shortName})
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
                <span>対「{targetProfile.fishName}」5項目トータルバランス（推奨比較）</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl bg-[#F4F4F4] p-4">
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[260px]">
                    <TacklePentagonRadar
                      stats={combatStats}
                      isCompatible={isAllSelectedCompatible}
                      variant="desktop"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[11px] text-[#5C5E62] mt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3.5 h-0 border-t-2 border-dashed border-[#8E8E93] inline-block" />
                      <span>推奨構成</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#171A20]">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm inline-block ${
                          isAllSelectedCompatible ? 'bg-[#3E6AE1]' : 'bg-amber-600'
                        }`}
                      />
                      <span>現在構成</span>
                    </span>
                  </div>
                </div>
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-5 md:grid-cols-1 gap-2">
                  {combatStats.map((stat) => {
                    const diff = stat.score - stat.baseScore;
                    const diffLabel = diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`;
                    return (
                      <div
                        key={stat.id}
                        className="rounded-xl bg-white px-3.5 py-2.5 flex items-center justify-between gap-2 border border-black/5"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#171A20]">
                            {stat.shortJpLabel}
                            <span className="text-[10px] font-oswald font-normal text-[#5C5E62] ml-1.5">
                              {stat.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5C5E62] truncate">
                            {stat.metricText}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 tabular-nums">
                          <span className="font-oswald text-lg font-bold text-[#171A20]">
                            {stat.score}
                          </span>
                          <span
                            className={`font-oswald text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              diff > 0
                                ? 'bg-blue-50 text-blue-700'
                                : diff < 0
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-[#F4F4F4] text-[#5C5E62]'
                            }`}
                          >
                            {diffLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2.5 rounded-md bg-[#F4F4F4] hover:bg-[#E5E5E5] text-xs font-semibold text-[#171A20]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          モーダル3：インラインサマリー「Amazon購入リストを開く」から直接開く購入ディスパッチモーダル
         ================================================================= */}
      {isOrderDispatchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inline-order-modal-title"
          onClick={() => setIsOrderDispatchModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white text-[#171A20] shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#F4F4F4] border-b border-black/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#3E6AE1]" />
                <div>
                  <div className="text-[10px] font-oswald font-bold tracking-[0.18em] text-[#3E6AE1]">
                    TACKLE PURCHASE LIST
                  </div>
                  <h3
                    id="inline-order-modal-title"
                    className="text-base font-bold text-[#171A20]"
                  >
                    {currentClassInfo.classNameLabel} 選択構成（参考合計 ¥
                    {totalValue.toLocaleString()}）— Amazon購入リスト
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderDispatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#E5E5E5] flex items-center justify-center"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="rounded-xl bg-[#F4F4F4] p-3.5 flex flex-wrap items-center justify-around gap-3 text-xs text-[#171A20]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#3E6AE1]" />
                  <span>Amazon公式安全決済</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#3E6AE1]" />
                  <span>Amazon.co.jp 公式ストア</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#3E6AE1]" />
                  <span>100%物理適合確認済</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-[#5C5E62]">
                  各アイテムの「Amazonで購入」ボタンから公式ストアの商品ページを開いてカートへ追加してください：
                </div>
                {CATEGORY_ORDER.map((cat) => {
                  const meta = STEP_META[cat];
                  const item = rig[cat];
                  if (!item) return null;
                  const url = buildAmazonAffiliateUrl(item.amazon);
                  const subUrl =
                    item.amazon.subItemAsin || item.amazon.subItemQuery
                      ? buildAmazonAffiliateUrl({
                          asin: item.amazon.subItemAsin,
                          searchQuery: item.amazon.subItemQuery ?? '',
                        })
                      : null;
                  const isVisited = Boolean(checkedOutSlots[cat]);

                  return (
                    <div
                      key={cat}
                      className="rounded-xl bg-[#F4F4F4] p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <RigPartShowcase part={item} isSelected={isVisited} size="sm" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-oswald text-[#3E6AE1] font-bold tracking-wider">
                              {meta.stepNum} {meta.label}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-[#171A20] truncate">
                              {item.brand} — {item.name}
                            </div>
                            <div className="font-oswald text-sm text-[#171A20] tabular-nums mt-0.5">
                              ¥{item.price.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={() =>
                            setCheckedOutSlots((prev) => ({ ...prev, [cat]: true }))
                          }
                          className={`px-4 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                            isVisited
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#3E6AE1] hover:bg-[#3457B1] text-white'
                          }`}
                        >
                          {isVisited ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>確認済</span>
                            </>
                          ) : (
                            <>
                              <span>Amazonで購入</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </>
                          )}
                        </a>
                      </div>

                      {subUrl && item.amazon.subItemLabel && (
                        <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-[#5C5E62] truncate">
                            ＋ {item.amazon.subItemLabel}
                          </span>
                          <a
                            href={subUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-[#3E6AE1] hover:underline shrink-0 inline-flex items-center gap-1 font-medium"
                          >
                            <span>ペア金具も確認</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-[#F4F4F4] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#171A20]">
                    構成の保存・完成仕様書ページ
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrderDispatchModalOpen(false);
                      navigateTo({ view: 'checkout' });
                    }}
                    className="text-xs font-semibold text-[#3E6AE1] hover:underline"
                  >
                    フル画面仕様書を開く ＞
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDesignInline}
                    className="py-3 px-4 rounded-md bg-[#171A20] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    {inlineSavedCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    <span>
                      {inlineSavedCopied ? '共有URLをコピーしました' : '構成URLをコピー'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const lines = [
                        `【RIGs — ${currentClassInfo.classNameLabel} タックル構成仕様書】`,
                        `■ 01 REEL: ${rig.reel?.name ?? ''}`,
                        `■ 02 ROD: ${rig.rod?.name ?? ''}`,
                        `■ 03 LINE: ${rig.line?.name ?? ''}`,
                        `■ 04 LURE: ${rig.lure?.name ?? ''} (針込 ${rig.lure?.totalWeightG ?? 0}g)`,
                        `■ 4点参考合計: ¥${totalValue.toLocaleString()}`,
                        shareUrl,
                      ];
                      navigator.clipboard.writeText(lines.join('\n'));
                      setInlineSavedCopied(true);
                      setTimeout(() => setInlineSavedCopied(false), 2500);
                    }}
                    className="py-3 px-4 rounded-md bg-white hover:bg-[#EAEAEA] border border-black/15 text-xs font-semibold text-[#171A20] flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>仕様書テキストをコピー</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TackleBuilder;
