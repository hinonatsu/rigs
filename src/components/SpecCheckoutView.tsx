import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  Copy,
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
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 py-2 items-start text-[#171A20]">
      {/* ==================== 左カラム (5 cols): 注文サマリー・トラスト保証・Primary CTA ==================== */}
      <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col justify-between rounded-2xl bg-[#F4F4F4] p-6 sm:p-8 space-y-6">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div className="space-y-1">
              <div className="text-[11px] font-oswald font-bold tracking-[0.2em] text-[#3E6AE1] uppercase">
                ORDER SUMMARY &amp; SPEC SHEET
              </div>
              <h1 className="text-xl font-bold text-[#171A20]">
                完成装備仕様書 ＆ ご注文手続き
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onBackToGarage()}
              className="px-3.5 py-2 rounded-md bg-white hover:bg-[#EAEAEA] text-xs font-medium text-[#171A20] transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>再調整</span>
            </button>
          </div>

          {/* ターゲットビジュアル ＆ 3大コアスペック */}
          <div className="rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm">
            <div className="relative h-28 w-full overflow-hidden">
              <img
                src={target.heroImage}
                alt={target.fishName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-oswald font-bold text-[#171A20] tracking-wider flex items-center gap-1">
                  {isAllSelectedCompatible ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>{target.badge}</span>
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-oswald font-bold tracking-wider ${
                    isAllSelectedCompatible
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {isAllSelectedCompatible ? '100% COMPATIBLE' : 'CHECK BALANCE'}
                </span>
              </div>
              <div className="absolute bottom-2.5 left-4 right-4">
                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {target.fishName}
                </div>
              </div>
            </div>

            <div className="p-4 grid grid-cols-3 gap-2.5 text-center bg-white">
              <div className="bg-[#F4F4F4] rounded-xl p-3">
                <div className="text-[10px] text-[#5C5E62]">推奨初期ドラグ</div>
                <div className="font-oswald text-sm sm:text-base font-bold text-[#3E6AE1] tabular-nums mt-0.5">
                  {recommendedDragText}
                </div>
              </div>
              <div className="bg-[#F4F4F4] rounded-xl p-3">
                <div className="text-[10px] text-[#5C5E62]">装備総重量</div>
                <div className="font-oswald text-sm sm:text-base font-bold text-[#171A20] tabular-nums mt-0.5">
                  {totalWeightG}g
                </div>
              </div>
              <div className="bg-[#F4F4F4] rounded-xl p-3">
                <div className="text-[10px] text-[#5C5E62]">針込ルアー重量</div>
                <div className="font-oswald text-sm sm:text-base font-bold text-[#171A20] tabular-nums mt-0.5">
                  {rig.lure?.totalWeightG ?? 0}g
                </div>
              </div>
            </div>
          </div>

          {/* 合計金額 ＆ Primary CTA (Tesla ロイヤルブルーボタン) */}
          <div className="rounded-2xl bg-white border border-black/5 p-5 space-y-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#5C5E62]">
                    4点フルセット 合計金額
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                    税込・送料無料
                  </span>
                </div>
                <span className="font-oswald text-xs text-[#3E6AE1] block mt-1">
                  {priceDiffFromBase === 0
                    ? 'RECOMMENDED BASE PRICE'
                    : priceDiffFromBase > 0
                    ? `+¥${priceDiffFromBase.toLocaleString()} FROM BASE`
                    : `-¥${Math.abs(priceDiffFromBase).toLocaleString()} SAVED`}
                </span>
              </div>
              <div className="font-oswald text-3xl sm:text-4xl font-bold text-[#171A20] tabular-nums tracking-tight">
                ¥{totalValue.toLocaleString()}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="group w-full py-4 px-6 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-sm sm:text-base font-bold leading-tight">
                    Amazon公式ストアで購入手続きへ進む
                  </div>
                  <div className="text-[11px] text-white/80 mt-0.5">
                    4点＋推奨ペア金具の購入リストを開く
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-black/5 text-xs">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#F4F4F4] px-3.5 py-2.5">
                <span className="font-semibold text-[#171A20] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#3E6AE1]" />
                  <span>Secure Checkout</span>
                </span>
                <span className="text-[11px] text-[#5C5E62]">
                  Amazon.co.jp 公式SSL暗号化決済
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-[#F4F4F4] px-3.5 py-2.5">
                <span className="font-semibold text-[#171A20] flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#3E6AE1]" />
                  <span>全国送料無料</span>
                </span>
                <span className="text-[11px] text-[#5C5E62]">
                  最短翌日お届け対応
                </span>
              </div>
            </div>
          </div>

          {/* 5項目能力値アコーディオン */}
          <div className="rounded-xl bg-white border border-black/5 p-4">
            <button
              type="button"
              onClick={() => setShowCombatDetails((prev) => !prev)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-xs font-oswald font-bold tracking-widest text-[#171A20] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3E6AE1]" />
                <span>COMBAT PARAMETERS (5項目バランス)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#5C5E62] transition-transform duration-300 ${
                  showCombatDetails ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showCombatDetails && (
              <div className="mt-4 pt-4 border-t border-black/10 space-y-3">
                {combatStats.map((stat) => {
                  const diff = stat.score - stat.baseScore;
                  return (
                    <div key={stat.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-oswald font-semibold text-[#171A20]">
                          {stat.label}
                        </span>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="text-[#5C5E62] text-[10px]">{stat.metricText}</span>
                          <span className="font-oswald font-bold text-[#3E6AE1]">
                            {stat.score}
                          </span>
                          {diff !== 0 && (
                            <span className="font-oswald text-[10px] text-[#3E6AE1]">
                              ({diff > 0 ? `+${diff}` : diff})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E5E5E5] overflow-hidden">
                        <div
                          className="h-full bg-[#3E6AE1]"
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
                    className="text-[11px] font-medium text-[#5C5E62] hover:text-[#171A20] inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>推奨ベースにリセット</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* シェアボタン */}
        <div className="pt-4 border-t border-black/10 space-y-2">
          <div className="text-[10px] font-oswald tracking-widest text-[#5C5E62]">
            SHARE YOUR CONFIGURATION
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="py-2.5 px-3 rounded-lg bg-white hover:bg-[#EAEAEA] border border-black/10 text-xs font-medium text-[#171A20] transition-colors flex items-center justify-center gap-2"
            >
              {urlCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Link2 className="w-3.5 h-3.5 text-[#5C5E62]" />
              )}
              <span>{urlCopied ? 'URLコピー済' : '構成URLをコピー'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-lg bg-white hover:bg-[#EAEAEA] border border-black/10 text-xs font-medium text-[#171A20] transition-colors flex items-center justify-center gap-2"
            >
              {textCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-[#5C5E62]" />
              )}
              <span>{textCopied ? 'コピー完了' : '仕様書テキスト保存'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 右カラム (7 cols): 決定した4点装備リスト（白スタジオカード） ==================== */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#F4F4F4] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-oswald font-bold tracking-[0.2em] text-[#3E6AE1] block uppercase">
              FINAL CONFIGURATION // 4-PIECE LOADOUT
            </span>
            <h2 className="text-lg font-bold text-[#171A20]">
              選択中の装備一式（各アイテムの「変更」から再選択可能）
            </h2>
          </div>
          <button
            type="button"
            onClick={onBackToTargetSelect}
            className="text-xs font-medium text-[#5C5E62] hover:text-[#171A20] underline"
          >
            ターゲット変更
          </button>
        </div>

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
                className={`group rounded-2xl bg-white border p-5 sm:p-6 transition-all shadow-sm ${
                  compatible ? 'border-black/5 hover:border-black/20' : 'border-amber-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                    <RigPartShowcase part={item} isSelected={compatible} size="checkout" />

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-oswald text-xs font-bold tracking-wider text-[#3E6AE1]">
                          {meta.stepNum} {meta.label}
                        </span>
                        <span
                          className={`font-oswald text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-wider ${
                            isCustomized
                              ? 'bg-[#171A20] text-white'
                              : 'bg-[#F4F4F4] text-[#5C5E62]'
                          }`}
                        >
                          {isCustomized ? 'CUSTOMIZED' : 'STANDARD'}
                        </span>
                      </div>

                      <div className="text-[11px] font-medium text-[#5C5E62] uppercase tracking-wider">
                        {item.brand}
                      </div>

                      <div className="text-sm sm:text-base font-bold text-[#171A20] truncate">
                        {item.name}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCardCat((prev) => (prev === cat ? null : cat))
                        }
                        className="text-[11px] font-medium text-[#3E6AE1] hover:underline inline-flex items-center gap-1"
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

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => onBackToGarage(cat)}
                      className="px-2.5 py-1 rounded-md bg-[#F4F4F4] hover:bg-[#E5E5E5] text-xs font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>変更</span>
                    </button>

                    <div className="font-oswald text-2xl font-bold text-[#171A20] tabular-nums leading-none">
                      ¥{item.price.toLocaleString()}
                    </div>

                    <a
                      href={mainAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() =>
                        setCheckedOutSlots((prev) => ({ ...prev, [cat]: true }))
                      }
                      className="px-4 py-2 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5"
                    >
                      <span>Amazonで購入</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-black/10 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.propertyTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F4F4F4] text-[#171A20]"
                        >
                          ✦ {tag}
                        </span>
                      ))}
                      <span className="text-xs text-[#5C5E62] ml-1">— {reason}</span>
                    </div>

                    {subAmazonUrl && item.amazon.subItemLabel && (
                      <div className="rounded-xl bg-[#F4F4F4] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-medium text-[#171A20]">
                          ＋ 推奨ペアリング：{item.amazon.subItemLabel}
                        </span>
                        <a
                          href={subAmazonUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="self-start sm:self-auto px-3.5 py-1.5 rounded-md bg-white border border-black/10 hover:bg-[#FAFAFA] text-xs font-semibold text-[#3E6AE1] transition-colors inline-flex items-center gap-1.5"
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

        <div className="pt-4 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#5C5E62]">
          <span>
            Amazonのアソシエイトとして、RIGsは適格販売により収入を得ています。
          </span>
          <span>※最新価格・在庫状況は遷移先のAmazon公式ページにてご確認ください</span>
        </div>
      </div>

      {/* ==================== 購入手配モーダル（白ベース） ==================== */}
      {isCheckoutModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-modal-title"
          onClick={() => setIsCheckoutModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white text-[#171A20] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#F4F4F4] border-b border-black/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#3E6AE1]" />
                <div>
                  <div className="text-[10px] font-oswald font-bold tracking-[0.18em] text-[#3E6AE1]">
                    ORDER DISPATCH LIST
                  </div>
                  <h3 id="checkout-modal-title" className="text-base font-bold text-[#171A20]">
                    構成4点セット（合計 ¥{totalValue.toLocaleString()}）— 購入リスト
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
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
                  <span>送料無料対象</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#3E6AE1]" />
                  <span>100%物理適合確認済</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-[#5C5E62]">
                  各アイテムの「Amazonで購入」ボタンから公式ストアのカートへ追加してください：
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
                <div className="text-sm font-bold text-[#171A20]">
                  このタックル構成を保存・シェアする
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="py-3 px-4 rounded-md bg-[#171A20] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    {urlCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    <span>{urlCopied ? '共有URLをコピーしました' : '構成URLをコピー'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="py-3 px-4 rounded-md bg-white hover:bg-[#EAEAEA] border border-black/15 text-xs font-semibold text-[#171A20] flex items-center justify-center gap-2"
                  >
                    {textCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{textCopied ? 'コピー完了' : '仕様書テキストをコピー'}</span>
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
