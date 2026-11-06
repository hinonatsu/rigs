import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  ExternalLink,
  FileCheck2,
  Filter,
  Layers,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { buildAmazonAffiliateUrl } from '../config/amazonAssociate';
import {
  ALL_PARTS,
  AnyRigPart,
  CATEGORY_ORDER,
  checkPartCompatibility,
  getCompatiblePartnersForPart,
  PartCategory,
  RIG_PRESETS,
  RigPreset,
  RigState,
  STEP_META,
} from '../data/rigCatalog';

// ============================================================================
// ① トップ・ハブ画面 (HomeHubView)
// ============================================================================

interface HomeHubViewProps {
  rig: RigState;
  selectedCount: number;
  totalValue: number;
  isAllSelectedCompatible: boolean;
  onStartBuilder: (initialStep?: PartCategory) => void;
  onApplyPresetAndNavigate: (presetId: RigPreset['id'], destination: 'builder' | 'spec') => void;
  onOpenCatalog: (category: PartCategory | 'all') => void;
  onOpenDetail: (item: AnyRigPart, returnTo: 'home' | 'catalog' | 'builder') => void;
  onOpenSpec: () => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  rig,
  selectedCount,
  totalValue,
  isAllSelectedCompatible,
  onStartBuilder,
  onApplyPresetAndNavigate,
  onOpenCatalog,
  onOpenDetail,
  onOpenSpec,
}) => {
  return (
    <div className="space-y-16 lg:space-y-20">
      {/* ヒーロー＆3大ナビゲーションハブ */}
      <section className="rounded-3xl bg-[#222222] border border-white/10 p-7 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151515] border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-light tracking-[0.18em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            OFFSHORE BIGGAME TACKLE ARCHITECT
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-[#FFFFFF] leading-tight">
            物理的根拠で組み上げる、
            <br />
            後悔ゼロのオフショアタックル。
          </h1>
          <p className="text-xs sm:text-sm font-light text-[#A0A0A0] leading-relaxed max-w-2xl">
            リールのスプール糸巻量、ロッドの許容負荷、そして太軸フック＆強化リング装着時のルアー実戦総重量まで100%計算。
            「ターゲット魚種」「気になる1つのパーツ（図鑑逆引き）」「自由な4スロット構築」のどこからでも始められます。
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => onStartBuilder('reel')}
              className="px-6 py-3.5 rounded-2xl bg-[#00E5FF] text-[#151515] text-xs sm:text-sm font-semibold tracking-[0.12em] shadow-[0_0_22px_rgba(0,229,255,0.5)] hover:shadow-[0_0_32px_rgba(0,229,255,0.8)] transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>タックルビルダーで組む</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onOpenCatalog('all')}
              className="px-6 py-3.5 rounded-2xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs sm:text-sm font-normal tracking-[0.1em] text-[#FFFFFF] transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#00E5FF]" />
              <span>パーツ図鑑・逆引きから探す</span>
            </button>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onOpenSpec}
                className="px-5 py-3.5 rounded-2xl bg-[#151515] border border-[#00E5FF]/50 hover:border-[#00E5FF] text-xs sm:text-sm font-light tracking-wider text-[#00E5FF] transition-all duration-300 ease-out hover:scale-105 flex items-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>現在の完成仕様書・購入へ ({selectedCount}/4)</span>
              </button>
            )}
          </div>
        </div>

        {/* 現在編成中のセッティング再開バー */}
        {selectedCount > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#00E5FF]">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  現在編成中のセッティング（{selectedCount}/4 スロット選択済 ・ 合計参考金額 ¥
                  {totalValue.toLocaleString()}）
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-light text-[#A0A0A0]">
                <span>01: {rig.reel?.name ?? '未選択'}</span>
                <span>/</span>
                <span>02: {rig.rod?.name ?? '未選択'}</span>
                <span>/</span>
                <span>03: {rig.line?.name ?? '未選択'}</span>
                <span>/</span>
                <span>04: {rig.lure?.name ?? '未選択'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onStartBuilder()}
                className="px-4 py-2 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs text-[#FFFFFF] transition-colors flex items-center gap-1.5"
              >
                <span>ビルダーで続きを編集</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00E5FF]" />
              </button>
              {isAllSelectedCompatible && (
                <button
                  type="button"
                  onClick={onOpenSpec}
                  className="px-4 py-2 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF] text-xs text-[#00E5FF] font-medium hover:bg-[#00E5FF] hover:text-[#151515] transition-colors"
                >
                  仕様書・共有URLを見る
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 海域・号数クラス別 推奨プリセット3選 */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              ROUTE A // TARGET & FIELD PRESETS
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#FFFFFF] mt-1">
              ターゲット魚種・海域プリセットから始める
            </h2>
          </div>
          <p className="text-xs font-light text-[#A0A0A0]">
            プロ基準の100%物理適合セッティングを一括読込し、ビルダーで自在に組み替えられます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {RIG_PRESETS.map((preset) => {
            const pReel = ALL_PARTS.find((p) => p.id === preset.rigIds.reel);
            const pRod = ALL_PARTS.find((p) => p.id === preset.rigIds.rod);
            const pLine = ALL_PARTS.find((p) => p.id === preset.rigIds.line);
            const pLure = ALL_PARTS.find((p) => p.id === preset.rigIds.lure);
            const presetTotal =
              (pReel?.price ?? 0) +
              (pRod?.price ?? 0) +
              (pLine?.price ?? 0) +
              (pLure?.price ?? 0);

            return (
              <div
                key={preset.id}
                className="rounded-2xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] p-6 flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(0,229,255,0.3)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium tracking-[0.16em] px-2.5 py-1 rounded-full bg-[#151515] border border-[#00E5FF]/50 text-[#00E5FF]">
                      {preset.badge}
                    </span>
                    <span className="text-sm font-light text-[#FFFFFF] tabular-nums">
                      ¥{presetTotal.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-normal text-[#FFFFFF] leading-snug">
                      {preset.title}
                    </h3>
                    <div className="text-xs font-light text-[#00E5FF] mt-1">
                      対象: {preset.targetFish}
                    </div>
                    <div className="text-[11px] font-light text-[#A0A0A0] mt-0.5">
                      主要海域: {preset.field}
                    </div>
                  </div>

                  <p className="text-xs font-light text-[#A0A0A0] leading-relaxed">
                    {preset.summary}
                  </p>

                  {/* 構成パーツ内訳 */}
                  <div className="rounded-xl bg-[#151515] border border-white/5 p-3.5 space-y-2 text-xs">
                    {[
                      { code: '01 リール', part: pReel },
                      { code: '02 ロッド', part: pRod },
                      { code: '03 ライン', part: pLine },
                      { code: '04 ルアー', part: pLure },
                    ].map((row) => (
                      <div key={row.code} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-light text-[#00E5FF] shrink-0">
                          {row.code}
                        </span>
                        <span className="text-[11px] font-light text-[#FFFFFF] truncate">
                          {row.part?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => onApplyPresetAndNavigate(preset.id, 'builder')}
                    className="py-2.5 px-3 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                  >
                    <span>ビルダーで開く</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyPresetAndNavigate(preset.id, 'spec')}
                    className="py-2.5 px-3 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs font-light text-[#FFFFFF] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>仕様書・購入へ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* カテゴリ別パーツ図鑑 ＆ 注目パーツ逆引きエントランス */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              ROUTE B // GEAR ENCYCLOPEDIA & REVERSE SYNERGY
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-[#FFFFFF] mt-1">
              パーツ図鑑・手持ち機材の「適合逆引き」から探す
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenCatalog('all')}
            className="text-xs font-normal text-[#00E5FF] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>全{ALL_PARTS.length}機種のパーツ図鑑一覧を見る</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4カテゴリ入口カード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_ORDER.map((cat) => {
            const meta = STEP_META[cat];
            const count = ALL_PARTS.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onOpenCatalog(cat)}
                className="group rounded-2xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] p-5 text-left transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium tracking-[0.18em] text-[#00E5FF]">
                    {meta.stepNum} // {meta.label}図鑑
                  </span>
                  <span className="text-xs font-light px-2.5 py-0.5 rounded-full bg-[#151515] border border-white/10 text-[#A0A0A0]">
                    {count}機種
                  </span>
                </div>
                <div>
                  <div className="text-base font-normal text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors">
                    {meta.fullTitle.replace('を選択', '')}
                  </div>
                  <div className="text-xs font-light text-[#A0A0A0] mt-1">{meta.shortDesc}</div>
                </div>
                <div className="text-xs font-light text-[#00E5FF] flex items-center gap-1">
                  <span>一覧と適合逆引きを見る</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ピックアップ名機（クリックで個別スペック詳細・逆引きへ） */}
        <div className="pt-2">
          <div className="text-xs font-light tracking-wider text-[#A0A0A0] mb-3">
            ピックアップ機種（クリックすると「100%適合する相棒パーツ逆引き」を確認できます）:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ALL_PARTS.find((p) => p.id === 'reel-stella-14000xg')!,
              ALL_PARTS.find((p) => p.id === 'rod-ultimo-83m')!,
              ALL_PARTS.find((p) => p.id === 'line-varivas-smp-pe6')!,
              ALL_PARTS.find((p) => p.id === 'lure-cbone-bazoo-200')!,
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenDetail(item, 'home')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenDetail(item, 'home');
                  }
                }}
                className="rounded-2xl bg-[#151515] border border-white/10 hover:border-[#00E5FF]/70 p-4 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3.5"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover bg-[#222222] border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-light text-[#00E5FF] tracking-wider">
                    {item.brand}
                  </div>
                  <div className="text-xs font-normal text-[#FFFFFF] truncate mt-0.5">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-light text-[#A0A0A0] mt-1 flex items-center justify-between">
                    <span>¥{item.price.toLocaleString()}</span>
                    <span className="text-[#00E5FF]">逆引き詳細 →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// ②-A パーツ図鑑一覧画面 (CatalogView)
// ============================================================================

interface CatalogViewProps {
  rig: RigState;
  activeCategory: PartCategory | 'all';
  onChangeCategory: (cat: PartCategory | 'all') => void;
  onOpenDetail: (item: AnyRigPart) => void;
  onEquipAndGoBuilder: (item: AnyRigPart) => void;
  onToggleEquipInPlace: (item: AnyRigPart) => void;
  activeAssociateTag: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  rig,
  activeCategory,
  onChangeCategory,
  onOpenDetail,
  onEquipAndGoBuilder,
  onToggleEquipInPlace,
  activeAssociateTag,
}) => {
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  const categoryFiltered = useMemo(() => {
    return activeCategory === 'all'
      ? ALL_PARTS
      : ALL_PARTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const brands = useMemo(() => {
    return Array.from(new Set(categoryFiltered.map((p) => p.brand)));
  }, [categoryFiltered]);

  const displayedParts = useMemo(() => {
    return categoryFiltered.filter((p) => (brandFilter === 'ALL' ? true : p.brand === brandFilter));
  }, [categoryFiltered, brandFilter]);

  return (
    <div className="space-y-8">
      {/* 図鑑ヘッダー */}
      <div className="rounded-3xl bg-[#222222] border border-white/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-light tracking-[0.2em] text-[#00E5FF] flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>OFFSHORE GEAR ENCYCLOPEDIA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-[#FFFFFF]">
            パーツ図鑑 ＆ 適合逆引きカタログ
          </h1>
          <p className="text-xs font-light text-[#A0A0A0] max-w-2xl leading-relaxed">
            各パーツの「詳細・適合逆引き」を開くと、そのパーツに100%物理適合する相棒パーツ一覧を確認でき、そのままビルダーの編成へ組み込めます。
          </p>
        </div>

        {/* ブランドフィルタ */}
        <div className="flex items-center gap-2.5 bg-[#151515] border border-white/15 rounded-xl px-3.5 py-2.5 self-start lg:self-auto">
          <Filter className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-xs font-light text-[#A0A0A0]">メーカー:</span>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            aria-label="メーカーで絞り込み"
            className="bg-transparent text-xs font-normal text-[#FFFFFF] focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#222222]">
              すべて表示 ({categoryFiltered.length})
            </option>
            {brands.map((b) => (
              <option key={b} value={b} className="bg-[#222222]">
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* カテゴリ切替ピルバー */}
      <div className="flex flex-wrap items-center gap-2.5">
        {(
          [
            { id: 'all', label: `すべて (${ALL_PARTS.length})` },
            { id: 'reel', label: `01 リール (${ALL_PARTS.filter((p) => p.category === 'reel').length})` },
            { id: 'rod', label: `02 ロッド (${ALL_PARTS.filter((p) => p.category === 'rod').length})` },
            { id: 'line', label: `03 ライン (${ALL_PARTS.filter((p) => p.category === 'line').length})` },
            { id: 'lure', label: `04 ルアー (${ALL_PARTS.filter((p) => p.category === 'lure').length})` },
          ] as const
        ).map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setBrandFilter('ALL');
                onChangeCategory(tab.id);
              }}
              className={`px-4 py-2 rounded-full text-xs tracking-wider transition-all ${
                isActive
                  ? 'bg-[#00E5FF] text-[#151515] font-semibold shadow-[0_0_15px_rgba(0,229,255,0.45)]'
                  : 'bg-[#222222] text-[#A0A0A0] hover:text-[#FFFFFF] border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* カタログカードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedParts.map((part) => {
          const isSelected = rig[part.category]?.id === part.id;
          const { compatible, reason } = checkPartCompatibility(part, rig);
          const amazonUrl = buildAmazonAffiliateUrl(part.amazon);

          return (
            <article
              key={part.id}
              className={`rounded-2xl bg-[#222222] p-6 flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] ${
                isSelected
                  ? 'border border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'border border-white/10 hover:border-[#00E5FF]/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#151515] border border-[#00E5FF]/40 text-[#00E5FF]">
                      {STEP_META[part.category].stepNum} {STEP_META[part.category].label}
                    </span>
                    <span className="text-xs font-light tracking-wider text-[#A0A0A0]">
                      {part.brand}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] text-[10px] font-semibold">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      編成に装着中
                    </span>
                  ) : compatible ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF] text-[10px]">
                      現在編成に適合
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/15 text-[#A0A0A0] text-[10px]">
                      現在編成と不適合
                    </span>
                  )}
                </div>

                {/* 画像クリックで詳細ページへ */}
                <div
                  onClick={() => onOpenDetail(part)}
                  className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#151515] border border-white/5 mb-4 cursor-pointer group"
                >
                  <img
                    src={part.image}
                    alt={part.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px]">
                    <span className="text-[#A0A0A0] font-light truncate">{part.subCode}</span>
                    <span className="text-[#00E5FF] font-normal shrink-0">逆引き詳細 →</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <h2
                    onClick={() => onOpenDetail(part)}
                    className="text-base font-normal text-[#FFFFFF] hover:text-[#00E5FF] cursor-pointer leading-snug"
                  >
                    {part.name}
                  </h2>
                  <span className="text-base font-light text-[#FFFFFF] tabular-nums shrink-0">
                    ¥{part.price.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-white/10 text-xs">
                  {part.specs.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-1">
                      <span className="text-[11px] font-light text-[#A0A0A0]">{s.label}:</span>
                      <span className="text-[11px] font-normal text-[#FFFFFF] tabular-nums">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/10 space-y-2.5">
                <div className="text-[11px] font-light text-[#A0A0A0] truncate" title={reason}>
                  判定: <span className={compatible ? 'text-[#00E5FF]' : 'text-[#A0A0A0]'}>{reason}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(part)}
                    className="py-2.5 px-3 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs font-normal text-[#FFFFFF] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>詳細・逆引き</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEquipAndGoBuilder(part)}
                    className="py-2.5 px-3 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                  >
                    <span>この機材で組む</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onToggleEquipInPlace(part)}
                    className="text-[11px] font-light text-[#00E5FF] hover:underline"
                  >
                    {isSelected ? '✓ 装着中（クリックで解除）' : '＋ 画面移動せず編成にセット'}
                  </button>
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="text-[11px] font-light text-[#FF9900] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Amazon</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// ②-B 個別スペック詳細 ＆ 相棒パーツ逆引き画面 (ItemDetailView)
// ============================================================================

interface ItemDetailViewProps {
  item: AnyRigPart;
  rig: RigState;
  returnView: 'catalog' | 'builder' | 'home';
  onBack: () => void;
  onEquipAndGoBuilder: (primaryPart: AnyRigPart, optionalPartner?: AnyRigPart) => void;
  onToggleEquipInPlace: (part: AnyRigPart) => void;
  onOpenAnotherDetail: (part: AnyRigPart) => void;
  activeAssociateTag: string;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({
  item,
  rig,
  returnView,
  onBack,
  onEquipAndGoBuilder,
  onToggleEquipInPlace,
  onOpenAnotherDetail,
  activeAssociateTag,
}) => {
  const isSelected = rig[item.category]?.id === item.id;
  const { compatible, reason } = checkPartCompatibility(item, rig);
  const partnerGroups = useMemo(() => getCompatiblePartnersForPart(item), [item]);
  const mainAmazonUrl = buildAmazonAffiliateUrl(item.amazon);
  const subAmazonUrl = item.amazon.subItemQuery
    ? buildAmazonAffiliateUrl({ searchQuery: item.amazon.subItemQuery })
    : null;

  const backLabel =
    returnView === 'builder'
      ? 'タックルビルダーへ戻る（編成維持）'
      : returnView === 'home'
      ? 'トップ画面へ戻る'
      : 'パーツ図鑑一覧へ戻る';

  return (
    <div className="space-y-12">
      {/* パンくず ＆ 戻るナビゲーション */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-full bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-xs font-light tracking-wider text-[#FFFFFF] transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>{backLabel}</span>
        </button>

        <div className="text-xs font-light text-[#A0A0A0] flex items-center gap-2">
          <span>パーツ図鑑</span>
          <span>/</span>
          <span className="text-[#00E5FF]">
            {STEP_META[item.category].stepNum} {STEP_META[item.category].label}
          </span>
          <span>/</span>
          <span className="text-[#FFFFFF]">{item.name}</span>
        </div>
      </div>

      {/* メインスペック詳細カード */}
      <section className="rounded-3xl bg-[#222222] border border-white/15 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* 左：ビジュアル＆現在の編成との適合ステータス */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden bg-[#151515] border border-white/10">
              <img
                src={item.image}
                alt={`${item.brand} ${item.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#151515]/90 border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-medium">
                  {STEP_META[item.category].stepNum} {STEP_META[item.category].label}
                </span>
              </div>
            </div>

            {/* 現在の編成との適合ボックス */}
            <div
              className={`rounded-2xl p-4 bg-[#151515] border ${
                compatible ? 'border-[#00E5FF]/60' : 'border-white/15'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-normal text-[#FFFFFF]">
                  現在の編成との物理整合性
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-[#00E5FF] text-[#151515]'
                      : compatible
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50'
                      : 'bg-white/10 text-[#A0A0A0]'
                  }`}
                >
                  {isSelected ? '現在装着中' : compatible ? '100% 適合' : '不適合'}
                </span>
              </div>
              <p className="text-xs font-light text-[#00E5FF] mt-1.5">{reason}</p>
            </div>
          </div>

          {/* 右：スペック数値・解説・アクションボタン */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-xs font-light tracking-[0.2em] text-[#00E5FF]">
                {item.brand} // {item.subCode}
              </div>
              <h1 className="text-2xl sm:text-3xl font-light text-[#FFFFFF] mt-1.5 leading-snug">
                {item.name}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-xs font-light text-[#A0A0A0]">メーカー参考価格</span>
                <span className="text-3xl font-light text-[#FFFFFF] tabular-nums">
                  ¥{item.price.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-light text-[#A0A0A0] leading-relaxed bg-[#151515] p-4 rounded-2xl border border-white/5">
              {item.description}
            </p>

            {/* スペックBentoグリッド */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {item.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl bg-[#151515] border border-white/10 p-3.5"
                >
                  <div className="text-[11px] font-light text-[#A0A0A0]">{spec.label}</div>
                  <div className="text-sm sm:text-base font-normal text-[#FFFFFF] mt-1 tabular-nums">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            {/* アクションCTA群 */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => onEquipAndGoBuilder(item)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-[#00E5FF] text-[#151515] text-xs sm:text-sm font-semibold tracking-[0.1em] shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_30px_rgba(0,229,255,0.75)] transition-all duration-300 ease-out hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>このパーツを軸にビルダーで組む（装着して次ステップへ）</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onToggleEquipInPlace(item)}
                  className="py-4 px-5 rounded-2xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs font-normal text-[#FFFFFF] transition-colors shrink-0"
                >
                  {isSelected ? '装着を解除する' : '現在の編成にセット'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <a
                  href={mainAmazonUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#151515] hover:bg-[#FF9900]/15 border border-white/10 hover:border-[#FF9900]/60 text-xs text-[#FFFFFF] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Amazon.co.jp で単体の在庫・最新価格を確認する</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FF9900]" />
                </a>

                {subAmazonUrl && item.amazon.subItemLabel && (
                  <a
                    href={subAmazonUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="py-3 px-4 rounded-xl bg-[#151515] hover:bg-[#FF9900]/15 border border-[#FF9900]/40 text-xs text-[#FF9900] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>{item.amazon.subItemLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 逆引きシナジー：100%物理適合する相棒パーツ一覧 ==================== */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="text-xs font-light tracking-[0.2em] text-[#00E5FF] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>REVERSE COMPATIBILITY MATRIX</span>
          </div>
          <h2 className="text-2xl font-light text-[#FFFFFF] mt-1">
            「{item.name}」に100%物理適合する相棒パーツ（逆引き）
          </h2>
          <p className="text-xs font-light text-[#A0A0A0] mt-1">
            このパーツのスペック（番手・糸巻量・許容負荷・フック込重量）に対して物理的矛盾が生じないパーツだけを自動抽出しています。
          </p>
        </div>

        <div className="space-y-8">
          {partnerGroups.map((group) => (
            <div key={group.category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-normal text-[#FFFFFF] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00E5FF]" />
                  <span>
                    {group.label} の適合モデル（{group.items.length}機種）
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map(({ part: partner, reason: matchReason }) => (
                  <div
                    key={partner.id}
                    className="rounded-2xl bg-[#222222] border border-[#00E5FF]/35 hover:border-[#00E5FF] p-5 flex flex-col justify-between gap-4 transition-all hover:scale-[1.02]"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[#A0A0A0] font-light">{partner.brand}</span>
                        <span className="text-[#FFFFFF] tabular-nums">
                          ¥{partner.price.toLocaleString()}
                        </span>
                      </div>
                      <h4
                        onClick={() => onOpenAnotherDetail(partner)}
                        className="text-sm font-normal text-[#FFFFFF] hover:text-[#00E5FF] cursor-pointer leading-snug"
                      >
                        {partner.name}
                      </h4>
                      <div className="text-[11px] font-light text-[#00E5FF] mt-2">
                        ✓ {matchReason}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenAnotherDetail(partner)}
                        className="px-3 py-2 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-[11px] text-[#FFFFFF] transition-colors"
                      >
                        詳細を見る
                      </button>
                      <button
                        type="button"
                        onClick={() => onEquipAndGoBuilder(item, partner)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#151515] border border-[#00E5FF]/60 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <span>この2点をセットしてビルダーへ</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
