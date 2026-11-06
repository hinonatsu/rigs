import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronUp,
  Compass,
  ExternalLink,
  FileCheck2,
  Info,
  Link2,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AMAZON_ASSOCIATE_TAG,
  buildAmazonAffiliateUrl,
} from '../config/amazonAssociate';
import {
  ALL_PARTS,
  AnyRigPart,
  CATEGORY_ORDER,
  checkPartCompatibility,
  findPartById,
  getNextUnselectedStep,
  getPresetRigState,
  LINE_CATALOG,
  LURE_CATALOG,
  PartCategory,
  REEL_CATALOG,
  RigPreset,
  RigState,
  ROD_CATALOG,
  STEP_META,
} from '../data/rigCatalog';
import {
  buildShareableSpecUrl,
  buildUrlString,
  PageView,
  parseUrlState,
  RouteState,
} from '../lib/urlRouter';
import { CatalogView, HomeHubView, ItemDetailView } from './CatalogAndHubViews';
import { SpecCheckoutView } from './SpecCheckoutView';

// Re-export types for backward compatibility if imported elsewhere
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
  // 初期状態をURLパラメータから復元（指定がなければPE6号標準プリセット）
  const initialParsed = useMemo(() => parseUrlState(), []);
  const [route, setRoute] = useState<RouteState>(initialParsed.route);
  const [rig, setRig] = useState<RigState>(initialParsed.rig);

  const [mobileRigExpanded, setMobileRigExpanded] = useState<boolean>(false);
  const [activeAssociateTag, setActiveAssociateTag] = useState<string>(AMAZON_ASSOCIATE_TAG);
  const [headerUrlCopied, setHeaderUrlCopied] = useState<boolean>(false);
  const [lastEquippedNotice, setLastEquippedNotice] = useState<{
    partName: string;
    nextStep: PartCategory | null;
  } | null>(null);

  // ブラウザの「戻る / 進む」ボタン (popstate) に完全連動
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlState();
      setRoute(parsed.route);
      setRig(parsed.rig);
      setLastEquippedNotice(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ページ間の遷移（History に pushState して「戻る」で戻れるようにする）
  const navigateTo = (nextRoute: Partial<RouteState>, nextRig?: RigState) => {
    const updatedRig = nextRig ?? rig;
    const updatedRoute: RouteState = {
      ...route,
      ...nextRoute,
    };
    setRoute(updatedRoute);
    if (nextRig) {
      setRig(nextRig);
    }
    const newUrl = buildUrlString(updatedRoute, updatedRig);
    if (typeof window !== 'undefined' && newUrl) {
      window.history.pushState({}, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 同一ページ内の状態更新（タブ切替やパーツ着脱は replaceState でURLをリアルタイム同期）
  const syncUrlInPlace = (updatedRoute: RouteState, updatedRig: RigState) => {
    const newUrl = buildUrlString(updatedRoute, updatedRig);
    if (typeof window !== 'undefined' && newUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  };

  // 合計参考金額のリアルタイム計算
  const totalValue = useMemo(() => {
    return (
      (rig.reel?.price ?? 0) +
      (rig.rod?.price ?? 0) +
      (rig.line?.price ?? 0) +
      (rig.lure?.price ?? 0)
    );
  }, [rig]);

  // 総重量のリアルタイム計算
  const totalWeightG = useMemo(() => {
    return (
      (rig.reel?.weightG ?? 0) +
      (rig.rod?.weightG ?? 0) +
      Math.round(rig.lure?.totalWeightG ?? 0)
    );
  }, [rig]);

  // 全体互換性のリアルタイム検証
  const isAllSelectedCompatible = useMemo(() => {
    const items = [rig.reel, rig.rod, rig.line, rig.lure].filter(
      (i): i is AnyRigPart => i !== null
    );
    return items.length > 0 && items.every((item) => checkPartCompatibility(item, rig).compatible);
  }, [rig]);

  const selectedCount = useMemo(() => {
    return [rig.reel, rig.rod, rig.line, rig.lure].filter(Boolean).length;
  }, [rig]);

  // パーツの選択 / 解除（ビルダー内）
  const handleSelectPartInBuilder = (part: AnyRigPart) => {
    const isSame = rig[part.category]?.id === part.id;
    const nextRig: RigState = {
      ...rig,
      [part.category]: isSame ? null : part,
    };
    setRig(nextRig);
    syncUrlInPlace(route, nextRig);

    if (!isSame) {
      const nextStep = getNextUnselectedStep(nextRig, part.category);
      setLastEquippedNotice({
        partName: `${part.brand} ${part.name}`,
        nextStep,
      });
    } else {
      setLastEquippedNotice(null);
    }
  };

  // 図鑑・詳細ページから「画面移動せず編成にセット/解除」
  const handleToggleEquipInPlace = (part: AnyRigPart) => {
    const isSame = rig[part.category]?.id === part.id;
    const nextRig: RigState = {
      ...rig,
      [part.category]: isSame ? null : part,
    };
    setRig(nextRig);
    syncUrlInPlace(route, nextRig);
  };

  // 図鑑・詳細ページから「このパーツを軸にビルダーで組む（装着して次の未選択ステップへ遷移）」
  const handleEquipAndGoBuilder = (primaryPart: AnyRigPart, optionalPartner?: AnyRigPart) => {
    const nextRig: RigState = {
      ...rig,
      [primaryPart.category]: primaryPart,
      ...(optionalPartner ? { [optionalPartner.category]: optionalPartner } : {}),
    };
    const nextStep =
      getNextUnselectedStep(nextRig, optionalPartner?.category ?? primaryPart.category) ??
      primaryPart.category;

    setLastEquippedNotice({
      partName: optionalPartner
        ? `${primaryPart.name} ＋ ${optionalPartner.name}`
        : `${primaryPart.brand} ${primaryPart.name}`,
      nextStep: getNextUnselectedStep(nextRig, primaryPart.category),
    });

    navigateTo(
      {
        view: 'builder',
        builderStep: nextStep,
      },
      nextRig
    );
  };

  const handleResetRig = () => {
    const emptyRig: RigState = {
      reel: null,
      rod: null,
      line: null,
      lure: null,
    };
    setRig(emptyRig);
    setLastEquippedNotice(null);
    syncUrlInPlace(route, emptyRig);
  };

  const handleApplyPreset = (presetId: RigPreset['id']) => {
    const presetRig = getPresetRigState(presetId);
    setRig(presetRig);
    setLastEquippedNotice(null);
    syncUrlInPlace(route, presetRig);
  };

  const handleApplyPresetAndNavigate = (
    presetId: RigPreset['id'],
    destination: 'builder' | 'spec'
  ) => {
    const presetRig = getPresetRigState(presetId);
    setLastEquippedNotice(null);
    navigateTo(
      {
        view: destination,
        builderStep: 'reel',
      },
      presetRig
    );
  };

  const handleChangeBuilderStep = (step: PartCategory) => {
    const updatedRoute: RouteState = {
      ...route,
      view: 'builder',
      builderStep: step,
    };
    setRoute(updatedRoute);
    setLastEquippedNotice(null);
    syncUrlInPlace(updatedRoute, rig);
  };

  const handleCopyHeaderShareUrl = () => {
    const url = buildShareableSpecUrl(rig);
    navigator.clipboard.writeText(url);
    setHeaderUrlCopied(true);
    setTimeout(() => setHeaderUrlCopied(false), 2500);
  };

  const handleSaveAssociateTag = (cleanedTag: string) => {
    setActiveAssociateTag(cleanedTag);
  };

  // ビルダーの現在アクティブなステップに表示するパーツ一覧
  const activeBuilderCatalog = useMemo((): AnyRigPart[] => {
    switch (route.builderStep) {
      case 'reel':
        return REEL_CATALOG;
      case 'rod':
        return ROD_CATALOG;
      case 'line':
        return LINE_CATALOG;
      case 'lure':
        return LURE_CATALOG;
    }
  }, [route.builderStep]);

  const compatibleCountInCurrentStep = useMemo(() => {
    return activeBuilderCatalog.filter((p) => checkPartCompatibility(p, rig).compatible).length;
  }, [activeBuilderCatalog, rig]);

  // ビルダー内のパーツカード描画
  const renderBuilderPartCard = (part: AnyRigPart) => {
    const isSelected = rig[part.category]?.id === part.id;
    const { compatible, reason } = checkPartCompatibility(part, rig);
    const amazonUrl = buildAmazonAffiliateUrl(part.amazon);

    return (
      <article
        key={part.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectPartInBuilder(part)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectPartInBuilder(part);
          }
        }}
        className={`group relative rounded-2xl bg-[#222222] p-6 cursor-pointer select-none transition-all duration-300 ease-out hover:scale-[1.03] flex flex-col justify-between ${
          isSelected
            ? 'border border-[#00E5FF] shadow-[0_0_22px_rgba(0,229,255,0.5)] opacity-100'
            : compatible
            ? 'border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.35)] hover:border-[#00E5FF] hover:shadow-[0_0_24px_rgba(0,229,255,0.55)] opacity-100'
            : 'border border-white/5 opacity-35 hover:opacity-65 shadow-none'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-light tracking-[0.16em] text-[#A0A0A0]">
              {part.brand}
            </span>
            {isSelected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] text-[11px] font-semibold tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.6)]">
                <Check className="w-3 h-3 stroke-[2.5]" />
                選択中
              </span>
            ) : compatible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF] text-[11px] font-normal tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                適合
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full border border-white/15 text-[#A0A0A0] text-[11px] font-light tracking-wider">
                不適合
              </span>
            )}
          </div>

          {/* 製品画像ステージ */}
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#151515] border border-white/5 mb-5">
            <img
              src={part.image}
              alt={`${part.brand} ${part.name}`}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/85 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                {part.subCode}
              </span>
            </div>
          </div>

          {/* モデル名・参考価格 */}
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h3 className="text-lg font-normal tracking-tight text-[#FFFFFF] leading-snug">
              {part.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="block text-[10px] font-light tracking-wider text-[#A0A0A0]">
                参考価格
              </span>
              <span className="text-lg font-light tracking-wider text-[#FFFFFF] tabular-nums">
                ¥{part.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* スペック一覧 */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-4 border-t border-white/10">
            {part.specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                  {spec.label}:
                </span>
                <span className="text-xs font-light tracking-wide text-[#FFFFFF] tabular-nums">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 適合判定理由 ＆ 詳細逆引き・Amazonリンクフッター */}
        <div className="mt-5 pt-3.5 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[11px] font-light tracking-wide truncate ${
                compatible ? 'text-[#00E5FF]' : 'text-[#A0A0A0]'
              }`}
            >
              {reason}
            </span>
            <span
              className={`text-[11px] font-normal tracking-wider shrink-0 ${
                isSelected
                  ? 'text-[#00E5FF]'
                  : compatible
                  ? 'text-[#FFFFFF] group-hover:text-[#00E5FF]'
                  : 'text-[#A0A0A0]'
              }`}
            >
              {isSelected ? '解除する' : '選択する →'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo({
                  view: 'detail',
                  detailItemId: part.id,
                  detailReturnView: 'builder',
                });
              }}
              className="py-2 px-3 rounded-xl bg-[#151515] hover:bg-white/5 border border-white/10 hover:border-[#00E5FF]/60 text-[11px] font-normal tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-1.5"
            >
              <Info className="w-3 h-3 text-[#00E5FF]" />
              <span>詳細・適合逆引き</span>
            </button>

            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={(e) => e.stopPropagation()}
              className="py-2 px-3 rounded-xl bg-[#151515] hover:bg-[#FF9900]/15 border border-white/10 hover:border-[#FF9900]/60 text-[11px] font-normal tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Amazonで見る</span>
              <ExternalLink className="w-3 h-3 text-[#FF9900]" />
            </a>
          </div>
        </div>
      </article>
    );
  };

  const detailItem = useMemo(
    () => findPartById(route.detailItemId) ?? ALL_PARTS[0],
    [route.detailItemId]
  );

  const nextUnselectedFromCurrent = useMemo(
    () => getNextUnselectedStep(rig, route.builderStep),
    [rig, route.builderStep]
  );

  return (
    <div className="min-h-screen bg-[#151515] text-[#FFFFFF] font-jp antialiased selection:bg-[#00E5FF] selection:text-[#151515] pb-28 lg:pb-16">
      {/* ==================== 全ページ常駐 グローバルナビゲーションバー ==================== */}
      <header className="sticky top-0 z-40 bg-[#151515]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-3">
          {/* ブランドロゴ（クリックで①トップへ） */}
          <button
            type="button"
            onClick={() => navigateTo({ view: 'home' })}
            className="flex items-center gap-3 text-left group shrink-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]" />
            <span className="text-lg font-medium tracking-[0.22em] text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors">
              リグス
            </span>
            <span className="hidden xl:inline-block text-xs font-light tracking-[0.16em] text-[#A0A0A0]">
              // RIGs OFFSHORE ARCHITECT
            </span>
          </button>

          {/* 4ページ遷移ナビゲーションタブ */}
          <nav
            aria-label="メインページナビゲーション"
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1"
          >
            {(
              [
                {
                  id: 'home' as PageView,
                  label: 'トップ',
                  icon: Compass,
                  activeMatch: route.view === 'home',
                },
                {
                  id: 'catalog' as PageView,
                  label: 'パーツ図鑑・逆引き',
                  icon: BookOpen,
                  activeMatch: route.view === 'catalog' || route.view === 'detail',
                },
                {
                  id: 'builder' as PageView,
                  label: 'タックルビルダー',
                  icon: Sliders,
                  activeMatch: route.view === 'builder',
                },
                {
                  id: 'spec' as PageView,
                  label: `仕様書・購入 (${selectedCount}/4)`,
                  icon: FileCheck2,
                  activeMatch: route.view === 'spec',
                },
              ] as const
            ).map((navItem) => {
              const IconComp = navItem.icon;
              return (
                <button
                  key={navItem.id}
                  type="button"
                  onClick={() => navigateTo({ view: navItem.id })}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                    navItem.activeMatch
                      ? 'bg-[#00E5FF] text-[#151515] font-semibold shadow-[0_0_15px_rgba(0,229,255,0.45)]'
                      : 'bg-[#222222] text-[#A0A0A0] hover:text-[#FFFFFF] border border-white/10 hover:border-[#00E5FF]/50'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{navItem.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 右端：ワンクリックURL共有ボタン */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyHeaderShareUrl}
              title="現在の4スロット編成を共有URLとしてコピー"
              className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-xs font-light tracking-wider text-[#FFFFFF] transition-all flex items-center gap-1.5"
            >
              {headerUrlCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="text-[#00E5FF]">共有URLコピー済</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>編成URLを共有</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ==================== メインビューコンテナ ==================== */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-8 lg:pt-10">
        {/* -------------------- VIEW 1: トップ・ハブ画面 -------------------- */}
        {route.view === 'home' && (
          <HomeHubView
            rig={rig}
            selectedCount={selectedCount}
            totalValue={totalValue}
            isAllSelectedCompatible={isAllSelectedCompatible}
            onStartBuilder={(step) =>
              navigateTo({ view: 'builder', builderStep: step ?? route.builderStep })
            }
            onApplyPresetAndNavigate={handleApplyPresetAndNavigate}
            onOpenCatalog={(cat) => navigateTo({ view: 'catalog', catalogCategory: cat })}
            onOpenDetail={(item, returnTo) =>
              navigateTo({
                view: 'detail',
                detailItemId: item.id,
                detailReturnView: returnTo,
              })
            }
            onOpenSpec={() => navigateTo({ view: 'spec' })}
          />
        )}

        {/* -------------------- VIEW 2-A: パーツ図鑑一覧画面 -------------------- */}
        {route.view === 'catalog' && (
          <CatalogView
            rig={rig}
            activeCategory={route.catalogCategory}
            onChangeCategory={(cat) => {
              const updated: RouteState = { ...route, catalogCategory: cat };
              setRoute(updated);
              syncUrlInPlace(updated, rig);
            }}
            onOpenDetail={(item) =>
              navigateTo({
                view: 'detail',
                detailItemId: item.id,
                detailReturnView: 'catalog',
              })
            }
            onEquipAndGoBuilder={(item) => handleEquipAndGoBuilder(item)}
            onToggleEquipInPlace={handleToggleEquipInPlace}
            activeAssociateTag={activeAssociateTag}
          />
        )}

        {/* -------------------- VIEW 2-B: 個別スペック詳細・逆引き画面 -------------------- */}
        {route.view === 'detail' && (
          <ItemDetailView
            item={detailItem}
            rig={rig}
            returnView={route.detailReturnView}
            onBack={() => navigateTo({ view: route.detailReturnView })}
            onEquipAndGoBuilder={handleEquipAndGoBuilder}
            onToggleEquipInPlace={handleToggleEquipInPlace}
            onOpenAnotherDetail={(partner) =>
              navigateTo({
                view: 'detail',
                detailItemId: partner.id,
                detailReturnView: route.detailReturnView,
              })
            }
            activeAssociateTag={activeAssociateTag}
          />
        )}

        {/* -------------------- VIEW 3: タックルビルダー（ハイブリッド方式） -------------------- */}
        {route.view === 'builder' && (
          <div className="flex flex-col lg:flex-row items-start gap-10 xl:gap-14">
            {/* 左カラム（PC時 Sticky 固定）：「現在のセッティング」ドック */}
            <aside
              aria-label="現在のセッティング"
              className="w-full lg:w-[400px] xl:w-[440px] shrink-0 lg:sticky lg:top-24"
            >
              <div className="rounded-3xl bg-[#222222] border border-white/10 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-white/10">
                    <div>
                      <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                        リアルタイム適合診断
                      </span>
                      <h1 className="text-xl sm:text-2xl font-light tracking-[0.08em] text-[#FFFFFF] mt-1">
                        現在のセッティング
                      </h1>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetRig}
                      className="px-3.5 py-1.5 rounded-full bg-[#151515] border border-white/10 text-xs font-light tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] hover:border-[#00E5FF] transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3 text-[#00E5FF]" />
                      <span>リセット</span>
                    </button>
                  </div>

                  {/* クイックプリセットボタン */}
                  <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-light text-[#A0A0A0] mr-1">プリセット:</span>
                    {(
                      [
                        { id: 'pe6', label: 'PE6号 標準' },
                        { id: 'pe8', label: 'PE8号 大型' },
                        { id: 'pe10', label: 'PE10号 遠征' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id)}
                        className="px-2.5 py-1 rounded-full bg-[#151515] border border-white/10 hover:border-[#00E5FF] text-[10px] font-light text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* 適合ステータスバッジ */}
                  <div
                    className={`mt-4 p-4 rounded-2xl bg-[#151515] border flex items-center justify-between ${
                      isAllSelectedCompatible && selectedCount > 0
                        ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#00E5FF] shrink-0" />
                      <div>
                        <div className="text-xs font-normal tracking-wider text-[#FFFFFF]">
                          {selectedCount === 0
                            ? 'パーツを選択してください'
                            : isAllSelectedCompatible
                            ? '物理互換性 100% 適合'
                            : '互換性の不整合あり'}
                        </div>
                        <div className="text-[11px] font-light tracking-wide text-[#A0A0A0] mt-0.5">
                          タックル総重量: {totalWeightG}g ・ 選択数: {selectedCount}/4
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-light tracking-widest text-[#00E5FF]">
                      {selectedCount > 0 && isAllSelectedCompatible ? '適合確認済' : '判定中'}
                    </span>
                  </div>

                  {/* 4スロット一覧（クリックで該当ステップタブへ即座に切替） */}
                  <div className="mt-5 space-y-2.5">
                    {(
                      [
                        {
                          key: 'reel' as PartCategory,
                          step: '01',
                          label: 'リール',
                          item: rig.reel,
                          specSummary: rig.reel
                            ? `最大ドラグ: ${rig.reel.dragMaxKg}kg ・ 糸巻量: ${rig.reel.peCapacityNum}号-${rig.reel.peCapacityMeter}m`
                            : 'スピニングリールを選択',
                        },
                        {
                          key: 'rod' as PartCategory,
                          step: '02',
                          label: 'ロッド',
                          item: rig.rod,
                          specSummary: rig.rod
                            ? `適合ライン: ${rig.rod.minPe}〜${rig.rod.maxPe}号 ・ ルアー: ${rig.rod.lureMinG}〜${rig.rod.lureMaxG}g`
                            : 'キャスティングロッドを選択',
                        },
                        {
                          key: 'line' as PartCategory,
                          step: '03',
                          label: 'ライン',
                          item: rig.line,
                          specSummary: rig.line
                            ? `${rig.line.peNumber}号-${rig.line.lengthM}m ・ 直線強力 ${rig.line.strengthLb}ポンド`
                            : 'メインライン＆リーダーを選択',
                        },
                        {
                          key: 'lure' as PartCategory,
                          step: '04',
                          label: 'ルアー',
                          item: rig.lure,
                          specSummary: rig.lure
                            ? `実戦総重量: ${rig.lure.totalWeightG}g（フック・リング込）`
                            : 'オフショアプラグを選択',
                        },
                      ] as const
                    ).map((slot) => {
                      const isActiveStep = route.builderStep === slot.key;
                      return (
                        <div
                          key={slot.key}
                          onClick={() => handleChangeBuilderStep(slot.key)}
                          className={`group rounded-2xl p-3.5 bg-[#151515] border cursor-pointer transition-all duration-300 ease-out hover:scale-[1.01] ${
                            isActiveStep
                              ? 'border-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.3)]'
                              : slot.item
                              ? 'border-[#00E5FF]/40'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {slot.item ? (
                                <img
                                  src={slot.item.image}
                                  alt={slot.item.name}
                                  className="w-11 h-11 rounded-lg object-cover bg-[#222222] border border-[#00E5FF]/40 shrink-0"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-[#222222] border border-white/10 flex items-center justify-center text-xs font-light text-[#A0A0A0] shrink-0">
                                  {slot.step}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium tracking-wider text-[#00E5FF]">
                                    {slot.step} {slot.label}
                                  </span>
                                  {isActiveStep && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                                      選択中タブ
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm font-normal text-[#FFFFFF] truncate mt-0.5">
                                  {slot.item ? slot.item.name : '未選択（クリックして選ぶ）'}
                                </div>
                                <div className="text-[11px] font-light text-[#A0A0A0] truncate mt-0.5">
                                  {slot.specSummary}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              {slot.item ? (
                                <>
                                  <span className="text-xs font-light tracking-wider text-[#FFFFFF] tabular-nums">
                                    ¥{slot.item.price.toLocaleString()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigateTo({
                                        view: 'detail',
                                        detailItemId: slot.item!.id,
                                        detailReturnView: 'builder',
                                      });
                                    }}
                                    className="text-[10px] font-light text-[#00E5FF] hover:underline"
                                  >
                                    詳細・逆引き
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs font-light tracking-wider text-[#00E5FF]">
                                  選ぶ →
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 合計参考金額 ＆ 完成仕様書・購入ページへ進むCTA */}
                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xs font-light tracking-[0.18em] text-[#A0A0A0] block">
                        合計参考金額
                      </span>
                      <span className="text-[11px] font-light text-[#A0A0A0]">
                        ※最新価格は仕様書・Amazonにて確認
                      </span>
                    </div>
                    <div className="text-3xl font-light tracking-tight text-[#FFFFFF] tabular-nums">
                      ¥{totalValue.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => navigateTo({ view: 'spec' })}
                    className="w-full py-4 px-5 rounded-2xl bg-[#00E5FF] text-[#151515] text-xs sm:text-sm font-semibold tracking-[0.1em] shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_30px_rgba(0,229,255,0.75)] transition-all duration-300 ease-out hover:scale-[1.03] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>完成仕様書・Amazon一括購入へ ({selectedCount}/4)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </aside>

            {/* 右カラム（ハイブリッド・ステップタブ選択エリア） */}
            <main className="flex-1 min-w-0 space-y-8">
              {/* 1. ハイブリッド4ステップ切替バー（自由行き来可能） */}
              <div
                role="tablist"
                aria-label="ビルダーステップ切替"
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {CATEGORY_ORDER.map((cat) => {
                  const meta = STEP_META[cat];
                  const isCurrent = route.builderStep === cat;
                  const equippedPart = rig[cat];

                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => handleChangeBuilderStep(cat)}
                      className={`p-4 rounded-2xl text-left transition-all duration-300 ease-out hover:scale-[1.02] flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-[#222222] border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.35)]'
                          : equippedPart
                          ? 'bg-[#222222] border border-[#00E5FF]/40 hover:border-[#00E5FF]'
                          : 'bg-[#222222] border border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium tracking-[0.16em] text-[#00E5FF]">
                          STEP {meta.stepNum}
                        </div>
                        <div className="text-sm font-normal text-[#FFFFFF] mt-0.5">
                          {meta.label}
                        </div>
                        <div className="text-[11px] font-light text-[#A0A0A0] truncate mt-0.5">
                          {equippedPart ? equippedPart.brand : '未選択'}
                        </div>
                      </div>
                      {equippedPart ? (
                        <span className="w-6 h-6 rounded-full bg-[#00E5FF] text-[#151515] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-white/20 text-[10px] text-[#A0A0A0] flex items-center justify-center shrink-0">
                          {meta.stepNum}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 2. パーツ装着時のハイブリッド次ステップ誘導バナー */}
              {(lastEquippedNotice || rig[route.builderStep]) && (
                <div className="rounded-2xl bg-[#222222] border border-[#00E5FF] p-4 sm:p-5 shadow-[0_0_20px_rgba(0,229,255,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-normal text-[#FFFFFF]">
                        {rig[route.builderStep] ? (
                          <>
                            現在このステップでは{' '}
                            <strong className="text-[#00E5FF]">
                              「{rig[route.builderStep]!.brand} {rig[route.builderStep]!.name}」
                            </strong>{' '}
                            を装着中です
                          </>
                        ) : (
                          <>「{lastEquippedNotice?.partName}」を装着しました</>
                        )}
                      </div>
                      <div className="text-[11px] font-light text-[#A0A0A0] mt-0.5">
                        {nextUnselectedFromCurrent
                          ? `このまま他の${STEP_META[route.builderStep].label}と比較するか、次の未選択ステップ（${STEP_META[nextUnselectedFromCurrent].stepNum} ${STEP_META[nextUnselectedFromCurrent].label}）へ進めます。`
                          : '4スロットすべて選択済みです！完成仕様書ページで最終確認・URL共有・Amazon購入へ進めます。'}
                      </div>
                    </div>
                  </div>

                  {nextUnselectedFromCurrent ? (
                    <button
                      type="button"
                      onClick={() => handleChangeBuilderStep(nextUnselectedFromCurrent)}
                      className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    >
                      <span>
                        次のステップ（{STEP_META[nextUnselectedFromCurrent].stepNum}{' '}
                        {STEP_META[nextUnselectedFromCurrent].label}）へ進む
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigateTo({ view: 'spec' })}
                      className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                    >
                      <span>完成仕様書・Amazon購入ページへ進む</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* 3. 現在選択中ステップのヘッダー */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 gap-3">
                <div>
                  <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                    ステップ {STEP_META[route.builderStep].stepNum} //{' '}
                    {STEP_META[route.builderStep].shortDesc}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    {STEP_META[route.builderStep].fullTitle}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-light text-[#00E5FF]">
                    現在編成への物理適合: {compatibleCountInCurrentStep} /{' '}
                    {activeBuilderCatalog.length} 機種
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo({ view: 'catalog', catalogCategory: route.builderStep })
                    }
                    className="text-xs font-light text-[#A0A0A0] hover:text-[#FFFFFF] underline"
                  >
                    図鑑モードで見る
                  </button>
                </div>
              </div>

              {/* 4. パーツカードグリッド */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {activeBuilderCatalog.map((part) => renderBuilderPartCard(part))}
              </div>

              {/* 5. ステップ下部ページネーション（前後のステップ移動 ＆ 仕様書へ） */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {CATEGORY_ORDER.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleChangeBuilderStep(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs transition-colors ${
                        route.builderStep === cat
                          ? 'bg-[#00E5FF] text-[#151515] font-semibold'
                          : 'bg-[#222222] text-[#A0A0A0] hover:text-[#FFFFFF] border border-white/10'
                      }`}
                    >
                      {STEP_META[cat].stepNum} {STEP_META[cat].label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo({ view: 'spec' })}
                  className="px-6 py-3 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#151515] border border-[#00E5FF] text-xs font-semibold tracking-wider transition-colors flex items-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>完成仕様書・Amazon購入ページを開く ({selectedCount}/4)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </main>
          </div>
        )}

        {/* -------------------- VIEW 4: 完成仕様書 ＆ Amazon一括購入ページ -------------------- */}
        {route.view === 'spec' && (
          <SpecCheckoutView
            rig={rig}
            selectedCount={selectedCount}
            totalValue={totalValue}
            totalWeightG={totalWeightG}
            isAllSelectedCompatible={isAllSelectedCompatible}
            activeAssociateTag={activeAssociateTag}
            onSaveAssociateTag={handleSaveAssociateTag}
            onBackToBuilder={(step) =>
              navigateTo({
                view: 'builder',
                builderStep: step ?? route.builderStep,
              })
            }
            onOpenDetail={(item) =>
              navigateTo({
                view: 'detail',
                detailItemId: item.id,
                detailReturnView: 'builder',
              })
            }
            onApplyPreset={handleApplyPreset}
          />
        )}

        {/* ==================== Amazonアソシエイト 規約必須表記フッター ==================== */}
        <footer className="mt-20 pt-8 pb-6 border-t border-white/10 text-xs font-light text-[#A0A0A0] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[#FFFFFF] font-normal tracking-wide">
                Amazon.co.jp アソシエイト・プログラム参加表記
              </p>
              <p className="leading-relaxed">
                Amazonのアソシエイトとして、RIGs（リグス）は適格販売により収入を得ています。
              </p>
              <p className="text-[11px] text-[#A0A0A0]/80 leading-relaxed">
                ※当サイトに掲載されている商品価格はメーカー希望小売価格または調査時点の参考価格です。Amazon.co.jpにおける最新の販売価格・在庫状況・配送条件につきましては、各商品の「Amazonで購入」リンク先の販売ページにて直接ご確認ください。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => navigateTo({ view: 'home' })}
                className="px-3.5 py-2 rounded-xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] text-xs text-[#FFFFFF] transition-colors"
              >
                トップ
              </button>
              <button
                type="button"
                onClick={() => navigateTo({ view: 'catalog' })}
                className="px-3.5 py-2 rounded-xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] text-xs text-[#FFFFFF] transition-colors"
              >
                パーツ図鑑
              </button>
              <button
                type="button"
                onClick={() => navigateTo({ view: 'builder' })}
                className="px-3.5 py-2 rounded-xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] text-xs text-[#FFFFFF] transition-colors"
              >
                ビルダー
              </button>
              <button
                type="button"
                onClick={() => navigateTo({ view: 'spec' })}
                className="px-3.5 py-2 rounded-xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] text-xs text-[#00E5FF] transition-colors"
              >
                完成仕様書・購入
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ==================== モバイル（375px〜）全ページ常駐 下部固定バー ==================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#151515]/95 backdrop-blur-xl border-t border-white/15">
        {mobileRigExpanded && (
          <div className="px-5 pt-4 pb-3 border-b border-white/10 bg-[#222222] space-y-2.5 max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-light tracking-wider text-[#00E5FF]">
                現在のセッティング内訳 ({selectedCount}/4)
              </span>
              <button
                type="button"
                onClick={() => setMobileRigExpanded(false)}
                className="p-1 text-[#A0A0A0] hover:text-[#FFFFFF]"
                aria-label="内訳を閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(
              [
                { cat: 'reel' as PartCategory, label: '01 リール', item: rig.reel },
                { cat: 'rod' as PartCategory, label: '02 ロッド', item: rig.rod },
                { cat: 'line' as PartCategory, label: '03 ライン', item: rig.line },
                { cat: 'lure' as PartCategory, label: '04 ルアー', item: rig.lure },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-none gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMobileRigExpanded(false);
                    navigateTo({ view: 'builder', builderStep: s.cat });
                  }}
                  className="text-[#00E5FF] font-light tracking-wider shrink-0 hover:underline"
                >
                  {s.label}
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#FFFFFF] font-light truncate max-w-[160px]">
                    {s.item ? s.item.name : '未選択'}
                  </span>
                  {s.item && (
                    <a
                      href={buildAmazonAffiliateUrl(s.item.amazon)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-2 py-0.5 rounded bg-[#FF9900]/20 border border-[#FF9900]/50 text-[10px] text-[#FF9900] shrink-0"
                    >
                      Amazon ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3.5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileRigExpanded((prev) => !prev)}
            className="text-left min-w-0 flex-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                現在編成 ({selectedCount}/4)
              </span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-[#00E5FF] transition-transform duration-300 ${
                  mobileRigExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div className="text-xl font-light tracking-tight text-[#FFFFFF] tabular-nums mt-0.5">
              ¥{totalValue.toLocaleString()}
            </div>
          </button>

          {route.view !== 'builder' && (
            <button
              type="button"
              onClick={() => navigateTo({ view: 'builder' })}
              className="px-3.5 py-3 rounded-xl bg-[#222222] border border-white/15 text-xs text-[#FFFFFF] shrink-0"
            >
              ビルダーへ
            </button>
          )}

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => navigateTo({ view: 'spec' })}
            className="px-4 py-3 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-30 shrink-0 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>仕様書・購入 ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TackleBuilder;
