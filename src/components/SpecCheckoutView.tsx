import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Crosshair,
  ExternalLink,
  Link2,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
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
    ? `${(rig.rod.dragMaxKg * 0.6).toFixed(1)} 〜 ${(rig.rod.dragMaxKg * 0.8).toFixed(1)} kg`
    : '8.0 〜 11.0 kg';

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
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 py-1 items-stretch">
      {/* ==================== 左カラム (5 cols): 対ターゲット最終ステータス ＆ URL共有 ==================== */}
      <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#222222] border border-white/15 p-5 space-y-4">
        <div className="space-y-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-[#00E5FF]">
                <Crosshair className="w-3.5 h-3.5" />
                <span>STEP 03 // FINAL LOADOUT BRIEFING</span>
              </div>
              <h1 className="text-lg sm:text-xl font-normal text-[#FFFFFF] mt-0.5">
                最終装備ステータス ＆ 一括購入
              </h1>
            </div>
            <button
              type="button"
              onClick={() => onBackToGarage()}
              className="px-3 py-1.5 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-[11px] text-[#FFFFFF] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ArrowLeft className="w-3 h-3 text-[#00E5FF]" />
              <span>装備比較へ戻る</span>
            </button>
          </div>

          {/* 狙う魚 ＆ 物理適合サマリー */}
          <div
            className={`rounded-xl p-3.5 bg-[#151515] border ${
              isAllSelectedCompatible ? 'border-[#00E5FF]/70' : 'border-rose-500/60'
            } space-y-2`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#00E5FF] flex items-center gap-1.5">
                {isAllSelectedCompatible ? (
                  <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span>TARGET: {target.fishName}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00E5FF]/15 text-[#00E5FF] font-semibold">
                {isAllSelectedCompatible ? '100% 物理適合' : '要調整'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-[#222222] rounded-lg p-2 border border-white/5">
                <div className="text-[10px] text-[#A0A0A0]">推奨初期ドラグ</div>
                <div className="text-xs font-semibold text-[#00E5FF] tabular-nums mt-0.5">
                  {recommendedDragText}
                </div>
              </div>
              <div className="bg-[#222222] rounded-lg p-2 border border-white/5">
                <div className="text-[10px] text-[#A0A0A0]">装備総重量</div>
                <div className="text-xs font-semibold text-[#FFFFFF] tabular-nums mt-0.5">
                  {totalWeightG}g
                </div>
              </div>
              <div className="bg-[#222222] rounded-lg p-2 border border-white/5">
                <div className="text-[10px] text-[#A0A0A0]">針込ルアー重量</div>
                <div className="text-xs font-semibold text-[#FFFFFF] tabular-nums mt-0.5">
                  {rig.lure?.totalWeightG ?? 0}g
                </div>
              </div>
            </div>
          </div>

          {/* 対ターゲット 5項目ゲームステータスゲージ */}
          <div className="rounded-xl bg-[#151515] border border-white/10 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-[#FFFFFF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>VS TARGET COMBAT PARAMETERS</span>
              </span>
              <button
                type="button"
                onClick={onResetToRecommended}
                className="text-[10px] text-[#A0A0A0] hover:text-[#00E5FF] flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>推奨ベースに戻す</span>
              </button>
            </div>

            {combatStats.map((stat) => {
              const diff = stat.score - stat.baseScore;
              return (
                <div key={stat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-mono font-semibold text-[#FFFFFF]">{stat.label}</span>
                      <span className="text-[#A0A0A0] ml-1.5 text-[10px]">{stat.subLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <span className="text-[10px] text-[#A0A0A0]">{stat.metricText}</span>
                      {diff !== 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
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
                  <div className="h-2 rounded-full bg-[#222222] overflow-hidden relative border border-white/10">
                    <div
                      className="h-full bg-[#00E5FF] transition-all duration-300"
                      style={{ width: `${stat.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 合計金額 ＆ URL共有ボックス */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-light text-[#A0A0A0] block">
                最終装備 合計参考金額
              </span>
              <span className="text-[10px] text-[#00E5FF]">
                {priceDiffFromBase === 0
                  ? '推奨ベースと同額'
                  : priceDiffFromBase > 0
                  ? `推奨ベースより +¥${priceDiffFromBase.toLocaleString()}`
                  : `推奨ベースより -¥${Math.abs(priceDiffFromBase).toLocaleString()} お得`}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-light text-[#FFFFFF] tabular-nums">
              ¥{totalValue.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="py-2.5 px-3 rounded-xl bg-[#151515] border border-[#00E5FF]/50 hover:border-[#00E5FF] text-xs text-[#00E5FF] font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              {urlCopied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{urlCopied ? 'URLコピー完了' : '装備共有URLをコピー'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs text-[#FFFFFF] font-light transition-colors flex items-center justify-center gap-1.5"
            >
              {textCopied ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />}
              <span>{textCopied ? 'テキストコピー済' : '仕様書テキストをコピー'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 右カラム (7 cols): 4スロット装備 ＋ Amazon購入リスト ==================== */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-[#222222] border border-white/15 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.18em] text-[#FF9900]">
              AMAZON.CO.JP OFFICIAL AFFILIATE LINKS
            </span>
            <h2 className="text-base sm:text-lg font-normal text-[#FFFFFF]">
              決定した4スロット装備 ＆ 適合リーダー・フック購入リスト
            </h2>
          </div>
          <button
            type="button"
            onClick={onBackToTargetSelect}
            className="text-[11px] font-light text-[#A0A0A0] hover:text-[#00E5FF] underline"
          >
            釣る魚を選び直す
          </button>
        </div>

        {/* 4スロットのコンパクト購入カードリスト */}
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5">
          {CATEGORY_ORDER.map((cat) => {
            const meta = STEP_META[cat];
            const item = rig[cat];
            const baseItem = baseRig[cat];
            if (!item) return null;

            const isCustomized = baseItem && baseItem.id !== item.id;
            const { compatible, reason } = checkPartCompatibility(item, rig);
            const mainAmazonUrl = buildAmazonAffiliateUrl(item.amazon);
            const subAmazonUrl = item.amazon.subItemQuery
              ? buildAmazonAffiliateUrl({ searchQuery: item.amazon.subItemQuery })
              : null;

            return (
              <div
                key={cat}
                className={`rounded-xl bg-[#151515] border p-3.5 flex flex-col justify-between gap-2 ${
                  compatible ? 'border-white/10 hover:border-[#00E5FF]/50' : 'border-rose-500/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-[#00E5FF] font-mono">
                        {meta.stepNum} {meta.label}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                          isCustomized
                            ? 'bg-[#00E5FF] text-[#151515]'
                            : 'bg-white/10 text-[#A0A0A0]'
                        }`}
                      >
                        {isCustomized ? `変更済 (元: ${baseItem?.shortName})` : '推奨ベース'}
                      </span>
                      <span className="text-[11px] font-light text-[#FFFFFF] tabular-nums">
                        ¥{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-sm font-normal text-[#FFFFFF] truncate">
                      {item.brand} — {item.name}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {item.propertyTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.2 rounded bg-[#222222] border border-white/10 text-[#00E5FF]"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#A0A0A0]">({reason})</span>
                    </div>
                  </div>

                  {/* 右側ボタン群 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onBackToGarage(cat)}
                      className="px-3 py-2 rounded-lg bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-[11px] text-[#FFFFFF] transition-colors"
                    >
                      変更・比較
                    </button>
                    <a
                      href={mainAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-4 py-2 rounded-lg bg-[#FF9900] hover:bg-[#FF9900]/90 text-[#151515] text-xs font-bold tracking-wider transition-transform hover:scale-105 flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,153,0,0.3)]"
                    >
                      <span>Amazonで購入</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 適合サブパーツ（ショックリーダー・太軸フック）の購入リンク */}
                {subAmazonUrl && item.amazon.subItemLabel && (
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-[11px] font-light text-[#00E5FF]">
                      ＋ 必須ペア金具：{item.amazon.subItemLabel}
                    </span>
                    <a
                      href={subAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="self-start sm:self-auto px-2.5 py-1 rounded bg-[#222222] hover:bg-[#FF9900]/20 border border-[#FF9900]/50 text-[10px] font-medium text-[#FF9900] transition-colors inline-flex items-center gap-1"
                    >
                      <span>適合サブパーツもAmazonで見る</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Amazonアソシエイト規約表記（1行コンパクト） */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-light text-[#A0A0A0]">
          <span>
            Amazonのアソシエイトとして、RIGs（リグス）は適格販売により収入を得ています。
          </span>
          <span>※最新価格・在庫は各Amazonページにてご確認ください</span>
        </div>
      </div>
    </div>
  );
};
