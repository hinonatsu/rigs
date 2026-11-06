import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  Copy,
  Crosshair,
  ExternalLink,
  Link2,
  Lock,
  Pencil,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { buildAmazonAffiliateUrl } from '../config/amazonAssociate';
import {
  calculateOverallCombatStats,
  CATEGORY_ORDER,
  checkPartCompatibility,
  getPresetRigState,
  PartCategory,
  RigState,
  STEP_META,
  TargetFishProfile,
} from '../data/rigCatalog';
import { buildShareableSpecUrl } from '../lib/urlRouter';
import { RigPartShowcase } from './RigPartShowcase';

interface SpecCheckoutViewProps {
  target: TargetFishProfile;
  rig: RigState;
  totalValue: number;
  totalWeightG: number;
  isAllSelectedCompatible: boolean;
  onBackToGarage: (step?: PartCategory) => void;
  onBackToTargetSelect: () => void;
  onResetToRecommended: () => void;
}

export const SpecCheckoutView: React.FC<SpecCheckoutViewProps> = ({
  target,
  rig,
  totalValue,
  totalWeightG,
  isAllSelectedCompatible,
  onBackToGarage,
  onBackToTargetSelect,
  onResetToRecommended,
}) => {
  const [urlCopied, setUrlCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [showCombatDetails, setShowCombatDetails] = useState(false);
  const [expandedCardCat, setExpandedCardCat] = useState<PartCategory | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkedOutSlots, setCheckedOutSlots] = useState<Record<string, boolean>>({});

  const baseRig = useMemo(() => getPresetRigState(target.id), [target.id]);
  const combatStats = useMemo(() => calculateOverallCombatStats(rig, target), [rig, target]);
  const shareUrl = useMemo(() => buildShareableSpecUrl(rig, target.id), [rig, target.id]);

  const baseTotalPrice =
    (baseRig.reel?.price ?? 0) +
    (baseRig.rod?.price ?? 0) +
    (baseRig.line?.price ?? 0) +
    (baseRig.lure?.price ?? 0);
  const priceDiffFromBase = totalValue - baseTotalPrice;

  const recommendedDragText = rig.rod
    ? `${(rig.rod.dragMaxKg * 0.6).toFixed(1)}–${(rig.rod.dragMaxKg * 0.8).toFixed(1)}kg`
    : '8.0–11.0kg';

  const primaryReelAmazonUrl = rig.reel
    ? buildAmazonAffiliateUrl(rig.reel.amazon)
    : 'https://www.amazon.co.jp';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2500);
  };

  const handleCopyText = () => {
    const lines = [
      `【RIGs — 対「${target.fishName}」最終装備仕様書】`,
      `■ 01 REEL: ${rig.reel?.name ?? '未選択'}`,
      `■ 02 ROD: ${rig.rod?.name ?? '未選択'}`,
      `■ 03 LINE: ${rig.line?.name ?? '未選択'}`,
      `■ 04 LURE: ${rig.lure?.name ?? '未選択'} (針込 ${rig.lure?.totalWeightG ?? 0}g)`,
      `■ 推奨初期ドラグ: ${recommendedDragText} / 装備総重量: ${totalWeightG}g / 合計: ¥${totalValue.toLocaleString()}`,
      shareUrl,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2500);
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-2 items-start">
      {/* ==================== 左カラム (5 cols): 決済サマリー・トラスト保証・Primary CTA ==================== */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col justify-between rounded-2xl bg-[#222222]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-oswald font-semibold tracking-[0.2em] text-[#00E5FF]">
                <Crosshair className="w-3.5 h-3.5" />
                <span>STEP 03 // FINAL SPEC & CHECKOUT</span>
              </div>
              <h1 className="text-xl font-light text-white">
                完成装備仕様書 ＆ 購入手続き
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onBackToGarage()}
              className="px-3.5 py-2 rounded-xl bg-transparent border border-white/15 hover:border-[#00E5FF] text-xs font-light text-white/80 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>再調整</span>
            </button>
          </div>

          {/* ターゲットビジュアル ＆ 3大コアスペック（Oswald 数値） */}
          <div
            className={`rounded-xl overflow-hidden bg-[#151515] border ${
              isAllSelectedCompatible
                ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'border-rose-500/60'
            }`}
          >
            <div className="relative h-28 w-full overflow-hidden">
              <img
                src={target.heroImage}
                alt={target.fishName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/50 to-transparent" />
              <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#151515]/90 border border-[#00E5FF]/60 text-[10px] font-oswald font-semibold text-[#00E5FF] tracking-wider flex items-center gap-1.5">
                  {isAllSelectedCompatible ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span>{target.badge}</span>
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] font-oswald font-bold tracking-wider">
                  {isAllSelectedCompatible ? '100% COMPATIBLE' : 'CHECK BALANCE'}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-4 right-4">
                <div className="text-xs sm:text-sm font-medium text-white truncate">
                  {target.fishName}
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-[#222222] rounded-lg p-3 border border-white/5">
                <div className="text-[10px] font-light text-white/50">推奨初期ドラグ</div>
                <div className="font-oswald text-sm sm:text-base font-bold text-[#00E5FF] tabular-nums mt-0.5">
                  {recommendedDragText}
                </div>
              </div>
              <div className="bg-[#222222] rounded-lg p-3 border border-white/5">
                <div className="text-[10px] font-light text-white/50">装備総重量</div>
                <div className="font-oswald text-sm sm:text-base font-bold text-white tabular-nums mt-0.5">
                  {totalWeightG}g
                </div>
              </div>
              <div className="bg-[#222222] rounded-lg p-3 border border-white/5">
                <div className="text-[10px] font-light text-white/50">針込ルアー重量</div>
                <div className="font-oswald text-sm sm:text-base font-bold text-white tabular-nums mt-0.5">
                  {rig.lure?.totalWeightG ?? 0}g
                </div>
              </div>
            </div>
          </div>

          {/* 合計金額 ＆ Primary CTA (PROCEED TO SECURE CHECKOUT) ＆ トラストシグナル */}
          <div className="rounded-xl bg-[#151515] border border-white/10 p-5 space-y-5">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-light text-white/70">
                    4点フルセット 合計金額
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[10px] font-semibold text-[#00E5FF]">
                    税込・送料無料
                  </span>
                </div>
                <span className="font-oswald text-xs text-[#00E5FF] block mt-1">
                  {priceDiffFromBase === 0
                    ? 'RECOMMENDED BASE PRICE'
                    : priceDiffFromBase > 0
                    ? `+¥${priceDiffFromBase.toLocaleString()} FROM BASE`
                    : `-¥${Math.abs(priceDiffFromBase).toLocaleString()} SAVED`}
                </span>
              </div>
              <div className="font-oswald text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                ¥{totalValue.toLocaleString()}
              </div>
            </div>

            {/* 【解決策1】Primary CTA: PROCEED TO SECURE CHECKOUT（最も大きく・ネオンブルーで強く発光） */}
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="group w-full py-4 px-6 rounded-xl bg-[#00E5FF] hover:bg-[#33ECFF] text-[#151515] font-bold text-sm tracking-wide shadow-[0_0_28px_rgba(0,229,255,0.65)] hover:shadow-[0_0_42px_rgba(0,229,255,0.95)] transition-all duration-300 ease-out hover:scale-[1.02] flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="w-10 h-10 rounded-lg bg-[#151515]/15 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5 stroke-[2.5] text-[#151515]" />
                </span>
                <div>
                  <div className="font-oswald text-sm sm:text-base font-extrabold tracking-[0.12em] uppercase text-[#151515] leading-none">
                    PROCEED TO SECURE CHECKOUT
                  </div>
                  <div className="text-xs font-bold text-[#151515]/85 mt-1 leading-tight">
                    この究極装備一式を購入手続きへ進める
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 stroke-[2.5] shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {/* 【解決策2】CHECKOUTボタン直下のトラストシグナル（安心感・マイクロコピーとアイコン） */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#222222]/90 px-3.5 py-2.5 border border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Lock className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span className="text-xs font-semibold text-white">
                    🔒 Secure Checkout
                  </span>
                </div>
                <span className="text-[11px] font-light text-white/60 truncate">
                  Stripe / Amazon公式 SSL暗号化安全決済
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#222222]/90 px-3.5 py-2.5 border border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Truck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span className="text-xs font-semibold text-white">
                    🚚 送料無料
                  </span>
                </div>
                <span className="text-[11px] font-light text-white/60 truncate">
                  高額プロ機材・全国送料無料（最短翌日配送）
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#222222]/90 px-3.5 py-2.5 border border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span className="text-xs font-semibold text-white">
                    🛡️ 正規取扱店・100%品質保証
                  </span>
                </div>
                <span className="text-[11px] font-light text-white/60 truncate">
                  国内正規メーカー保証・100%物理適合検品済
                </span>
              </div>
            </div>
          </div>

          {/* 段階的開示：5項目ステータス詳細は必要な時のみ開閉 */}
          <div className="rounded-xl bg-[#151515] border border-white/10 p-4">
            <button
              type="button"
              onClick={() => setShowCombatDetails((prev) => !prev)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-xs font-oswald font-semibold tracking-widest text-[#00E5FF] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMBAT PARAMETERS (5項目能力値)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#00E5FF] transition-transform duration-300 ${
                  showCombatDetails ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showCombatDetails && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                {combatStats.map((stat) => {
                  const diff = stat.score - stat.baseScore;
                  return (
                    <div key={stat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-oswald text-white tracking-wider">
                          {stat.label}
                        </span>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-white/50 text-[10px]">{stat.metricText}</span>
                          <span className="font-oswald font-bold text-[#00E5FF]">
                            {stat.score}
                          </span>
                          {diff !== 0 && (
                            <span className="font-oswald text-[10px] text-[#00E5FF]">
                              ({diff > 0 ? `+${diff}` : diff})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#222222] overflow-hidden">
                        <div
                          className="h-full bg-[#00E5FF]"
                          style={{ width: `${stat.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 text-right">
                  <button
                    type="button"
                    onClick={onResetToRecommended}
                    className="text-[11px] font-light text-white/60 hover:text-[#00E5FF] inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>推奨ベースにリセット</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 【解決策1】Secondary Action: SHARE YOUR ULTIMATE RIG は塗りつぶしのないアウトライン（枠線のみ）に降格 */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-oswald tracking-widest text-white/45">
            <span>SHARE YOUR ULTIMATE RIG</span>
            <span>SECONDARY</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="py-2.5 px-3 rounded-xl bg-transparent border border-white/15 hover:border-white/40 text-xs font-light text-white/65 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              {urlCopied ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Link2 className="w-3.5 h-3.5 text-white/50" />}
              <span>{urlCopied ? 'URLコピー済' : 'SHARE RIG (URL)'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-transparent border border-white/15 hover:border-white/40 text-xs font-light text-white/65 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              {textCopied ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Share2 className="w-3.5 h-3.5 text-white/50" />}
              <span>{textCopied ? 'コピー完了' : '仕様書テキスト保存'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 右カラム (7 cols): FINAL RIG SETTING（透過PNG余白設計 ＆ EDIT後戻り導線） ==================== */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#222222]/85 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-oswald font-semibold tracking-[0.2em] text-[#00E5FF] block">
              FINAL RIG SETTING // VERIFIED 4-PIECE LOADOUT
            </span>
            <h2 className="text-lg font-light text-white">
              決定した装備一式（各パーツ右端の「EDIT / 変更」から個別修正可能）
            </h2>
          </div>
          <button
            type="button"
            onClick={onBackToTargetSelect}
            className="text-xs font-light text-white/60 hover:text-[#00E5FF] underline"
          >
            ターゲット変更
          </button>
        </div>

        {/* 4スロットの購入カードリスト（透過高画質製品画像の余白設計 ＋ 右端EDITリンク ＋ 段階的開示） */}
        <div className="space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const meta = STEP_META[cat];
            const item = rig[cat];
            const baseItem = baseRig[cat];
            if (!item) return null;

            const isCustomized = baseItem && baseItem.id !== item.id;
            const { compatible, reason } = checkPartCompatibility(item, rig);
            const mainAmazonUrl = buildAmazonAffiliateUrl(item.amazon);
            const subAmazonUrl =
              item.amazon.subItemAsin || item.amazon.subItemQuery
                ? buildAmazonAffiliateUrl({
                    asin: item.amazon.subItemAsin,
                    searchQuery: item.amazon.subItemQuery ?? '',
                  })
                : null;
            const isExpanded = expandedCardCat === cat;

            return (
              <div
                key={cat}
                className={`group rounded-2xl bg-[#151515] border p-5 sm:p-6 transition-all duration-300 ease-out hover:scale-[1.01] ${
                  compatible
                    ? 'border-white/10 hover:border-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : 'border-rose-500/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  {/* 左：【解決策3】背景透過された高画質な製品画像が入る余白設計ショーケース */}
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                    <RigPartShowcase part={item} isSelected={compatible} size="checkout" />

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-oswald text-xs font-bold tracking-wider text-[#00E5FF]">
                          {meta.stepNum} {meta.label}
                        </span>
                        <span
                          className={`font-oswald text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-wider ${
                            isCustomized
                              ? 'bg-[#00E5FF] text-[#151515]'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {isCustomized ? `CUSTOMIZED (元: ${baseItem?.shortName})` : 'RECOMMENDED'}
                        </span>
                      </div>

                      <div className="text-[11px] font-light text-white/50 uppercase tracking-wider">
                        {item.brand}
                      </div>

                      <div className="text-sm sm:text-base font-medium text-white truncate">
                        {item.name}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCardCat((prev) => (prev === cat ? null : cat))
                        }
                        className="text-[11px] font-light text-[#00E5FF]/80 hover:text-[#00E5FF] inline-flex items-center gap-1"
                      >
                        <span>
                          {isExpanded
                            ? '適合詳細・ペア金具を閉じる'
                            : '＋ 物理適合データ・必須ペア金具を表示'}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* 右端：【解決策4】鉛筆アイコン付き「EDIT / 変更」リンク（STEP 02の該当タブへ直行） ＆ 価格 ＆ Amazon購入 */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    {/* 控えめかつ直感的な「EDIT / 変更」リンク（クリックでSTEP 02の該当パーツのタブへシームレスに戻る） */}
                    <button
                      type="button"
                      onClick={() => onBackToGarage(cat)}
                      title={`現在の状態を保持したまま、STEP 02の「${meta.stepNum} ${meta.label}」タブへ戻って再選択します`}
                      className="px-2.5 py-1 rounded-lg bg-transparent hover:bg-white/5 border border-transparent hover:border-white/15 text-xs font-light text-white/55 hover:text-[#00E5FF] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3 h-3" />
                      <span className="font-oswald tracking-wider">EDIT</span>
                      <span className="text-[11px]">変更</span>
                    </button>

                    <div className="font-oswald text-2xl font-bold text-white tabular-nums leading-none">
                      ¥{item.price.toLocaleString()}
                    </div>

                    <a
                      href={mainAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() =>
                        setCheckedOutSlots((prev) => ({ ...prev, [cat]: true }))
                      }
                      className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#151515] border border-[#00E5FF]/50 hover:border-[#00E5FF] text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5"
                    >
                      <span>Amazonで単体購入</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
                    </a>
                  </div>
                </div>

                {/* 【プログレッシブ・ディスクロージャー】展開時のみ表示される物理適合根拠＆ペア金具 */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.propertyTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-light px-2.5 py-1 rounded-full bg-[#222222] border border-[#00E5FF]/30 text-white/90"
                        >
                          ✦ {tag}
                        </span>
                      ))}
                      <span className="text-xs font-light text-white/60 ml-1">
                        — {reason}
                      </span>
                    </div>

                    {subAmazonUrl && item.amazon.subItemLabel && (
                      <div className="rounded-xl bg-[#222222] p-3.5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-light text-[#00E5FF]">
                          ＋ 推奨ペアリング：{item.amazon.subItemLabel}
                        </span>
                        <a
                          href={subAmazonUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-transparent border border-[#00E5FF]/50 hover:border-[#00E5FF] text-xs font-medium text-[#00E5FF] transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>ペア金具もAmazonで確認</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* フッター規約表記 */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-light text-white/40">
          <span>
            Amazonのアソシエイトとして、RIGsは適格販売により収入を得ています。
          </span>
          <span>※リアルタイム在庫・最新価格は遷移先のAmazon公式ページにてご確認ください</span>
        </div>
      </div>

      {/* ==================== PROCEED TO SECURE CHECKOUT 決済手配 ＆ サンクスページモーダル ==================== */}
      {isCheckoutModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#1C1C1C] border border-[#00E5FF]/60 shadow-[0_0_50px_rgba(0,229,255,0.28)] overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="px-6 py-4 bg-[#151515] border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
                <div>
                  <div className="text-[10px] font-oswald font-bold tracking-[0.18em] text-[#00E5FF]">
                    SECURE CHECKOUT &amp; ORDER DISPATCH
                  </div>
                  <h3 id="checkout-modal-title" className="text-base font-bold text-white">
                    究極装備4点セット（合計 ¥{totalValue.toLocaleString()}）— 購入手配・決済リスト
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-2 rounded-lg bg-[#222222] text-white/60 hover:text-white border border-white/10"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* 3大トラストシグナル帯 */}
              <div className="rounded-xl bg-[#151515] border border-[#00E5FF]/30 p-3.5 flex flex-wrap items-center justify-around gap-3 text-xs text-white/90">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>🔒 Secure Checkout</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>🚚 送料無料</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>🛡️ 正規取扱店・100%品質保証</span>
                </span>
              </div>

              {/* 各アイテムのクイック購入チェックリスト */}
              <div className="space-y-3">
                <div className="text-xs text-white/70">
                  以下の各アイテムを公式ストア（Amazon.co.jp）のカートへ追加して決済を完了してください：
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
                      className="rounded-xl bg-[#151515] border border-white/10 p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <RigPartShowcase part={item} isSelected={isVisited} size="sm" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-oswald text-[#00E5FF] font-bold tracking-wider">
                              {meta.stepNum} {meta.label}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-white truncate">
                              {item.brand} — {item.name}
                            </div>
                            <div className="font-oswald text-sm text-white/80 tabular-nums mt-0.5">
                              ¥{item.price.toLocaleString()}{' '}
                              <span className="text-[10px] font-sans text-[#00E5FF]">
                                (税込・送料無料)
                              </span>
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
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                            isVisited
                              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                              : 'bg-[#00E5FF] hover:bg-[#33ECFF] text-[#151515] shadow-[0_0_16px_rgba(0,229,255,0.45)]'
                          }`}
                        >
                          {isVisited ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>商品ページ確認済</span>
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
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-white/65 truncate">
                            ＋ {item.amazon.subItemLabel}
                          </span>
                          <a
                            href={subUrl}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-[#00E5FF] hover:underline shrink-0 inline-flex items-center gap-1 font-medium"
                          >
                            <span>ペア金具の商品ページへ</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 【解決策1】購入後（サンクス画面）において SHARE YOUR ULTIMATE RIG を最も目立たせる */}
              <div className="rounded-2xl bg-gradient-to-br from-[#00E5FF]/15 via-[#151515] to-[#151515] border-2 border-[#00E5FF] p-5 space-y-4 shadow-[0_0_24px_rgba(0,229,255,0.25)]">
                <div className="space-y-1">
                  <div className="text-[11px] font-oswald font-bold tracking-[0.18em] text-[#00E5FF] uppercase">
                    THANK YOU // SHARE YOUR ULTIMATE RIG
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    最高峰のタックル構成を仲間にシェアしましょう！
                  </h4>
                  <p className="text-xs text-white/65">
                    あなたが組み上げた対「{target.fishName}」完全適合セッティングをURLや仕様書テキストで共有できます。
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="py-3.5 px-4 rounded-xl bg-[#00E5FF] hover:bg-[#33ECFF] text-[#151515] text-xs font-extrabold tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all flex items-center justify-center gap-2"
                  >
                    {urlCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    <span>
                      {urlCopied ? '共有URLをコピーしました！' : 'SHARE YOUR ULTIMATE RIG (URL)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="py-3.5 px-4 rounded-xl bg-[#222222] hover:bg-white/10 border border-[#00E5FF] text-xs font-bold text-[#00E5FF] transition-all flex items-center justify-center gap-2"
                  >
                    {textCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{textCopied ? '仕様書テキストをコピー済！' : '仕様書テキストをコピー'}</span>
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
