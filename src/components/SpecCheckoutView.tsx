import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Link2,
  RotateCcw,
  Settings,
  Share2,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { buildAmazonAffiliateUrl } from '../config/amazonAssociate';
import {
  AnyRigPart,
  CATEGORY_ORDER,
  checkPartCompatibility,
  PartCategory,
  RigPreset,
  RigState,
  STEP_META,
} from '../data/rigCatalog';
import { buildShareableSpecUrl } from '../lib/urlRouter';

interface SpecCheckoutViewProps {
  rig: RigState;
  selectedCount: number;
  totalValue: number;
  totalWeightG: number;
  isAllSelectedCompatible: boolean;
  activeAssociateTag: string;
  onSaveAssociateTag: (newTag: string) => void;
  onBackToBuilder: (step?: PartCategory) => void;
  onOpenDetail: (item: AnyRigPart) => void;
  onApplyPreset: (presetId: RigPreset['id']) => void;
}

export const SpecCheckoutView: React.FC<SpecCheckoutViewProps> = ({
  rig,
  selectedCount,
  totalValue,
  totalWeightG,
  isAllSelectedCompatible,
  activeAssociateTag,
  onSaveAssociateTag,
  onBackToBuilder,
  onOpenDetail,
  onApplyPreset,
}) => {
  const [urlCopied, setUrlCopied] = useState(false);
  const [textCopied, setTextCopied] = useState(false);
  const [showTagConfig, setShowTagConfig] = useState(false);
  const [tagInput, setTagInput] = useState(activeAssociateTag);
  const [tagSaved, setTagSaved] = useState(false);

  const shareUrl = buildShareableSpecUrl(rig);

  const recommendedDragText = rig.rod
    ? `${(rig.rod.dragMaxKg * 0.6).toFixed(1)} 〜 ${(rig.rod.dragMaxKg * 0.8).toFixed(1)} kg`
    : rig.reel
    ? `${(rig.reel.dragMaxKg * 0.35).toFixed(1)} 〜 ${(rig.reel.dragMaxKg * 0.5).toFixed(1)} kg`
    : '未算出';

  const spoolFillText =
    rig.reel && rig.line
      ? rig.reel.peCapacityNum === rig.line.peNumber
        ? '100%（下巻き不要・300m完全格納）'
        : 'スプール号数不一致'
      : 'リール＆ライン選択時に算出';

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2500);
  };

  const generateShareSummaryText = () => {
    const lines = [
      '【RIGs — オフショアキャスティング物理適合セッティング仕様書】',
      `■ 01 リール: ${rig.reel ? `${rig.reel.brand} ${rig.reel.name}` : '未選択'}`,
      `■ 02 ロッド: ${rig.rod ? `${rig.rod.brand} ${rig.rod.name}` : '未選択'}`,
      `■ 03 ライン: ${rig.line ? `${rig.line.brand} ${rig.line.name}` : '未選択'}`,
      `■ 04 ルアー: ${
        rig.lure
          ? `${rig.lure.brand} ${rig.lure.name} (針込実戦重量 ${rig.lure.totalWeightG}g)`
          : '未選択'
      }`,
      `■ 物理適合判定: ${
        selectedCount === 4 && isAllSelectedCompatible ? '100% 完全適合' : `${selectedCount}/4 選択中`
      } / 総重量: ${totalWeightG}g / 合計参考金額: ¥${totalValue.toLocaleString()}`,
      `▼ このセッティングを再現・Amazonで確認する`,
      shareUrl,
    ];
    return lines.join('\n');
  };

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(generateShareSummaryText());
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2500);
  };

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = tagInput.trim() || 'rigsoffshore-22';
    onSaveAssociateTag(cleaned);
    setTagInput(cleaned);
    setTagSaved(true);
    setTimeout(() => setTagSaved(false), 2500);
  };

  return (
    <div className="space-y-10">
      {/* 上部ナビバー */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onBackToBuilder()}
          className="px-4 py-2 rounded-full bg-[#222222] border border-white/15 hover:border-[#00E5FF] text-xs font-light tracking-wider text-[#FFFFFF] transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>タックルビルダーへ戻ってパーツを編集する</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-light text-[#A0A0A0]">プリセット切替:</span>
          {(
            [
              { id: 'pe6', label: 'PE6号 標準' },
              { id: 'pe8', label: 'PE8号 大型マグロ' },
              { id: 'pe10', label: 'PE10号 遠征' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p.id)}
              className="px-3 py-1 rounded-full bg-[#222222] border border-white/10 hover:border-[#00E5FF] text-[11px] font-light text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== 1. 仕様書ヘッダー ＆ URL共有パネル ==================== */}
      <section className="rounded-3xl bg-[#222222] border border-white/15 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.65)] space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#00E5FF]/50 text-[#00E5FF] text-xs font-light tracking-[0.16em]">
              {isAllSelectedCompatible && selectedCount === 4 ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% PHYSICAL MATCH VERIFIED // 完全適合証明書</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#FF9900]" />
                  <span>TACKLE SPECIFICATION SHEET // セッティング仕様書 ({selectedCount}/4)</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#FFFFFF]">
              完成セッティング仕様書 ＆ Amazon一括購入
            </h1>
            <p className="text-xs font-light text-[#A0A0A0] leading-relaxed">
              このページのURLには選択した4パーツのIDがすべて記録されています。URLをコピーしてブックマークやSNS共有すると、いつでもこの構成を再現できます。
            </p>
          </div>

          <div className="text-left lg:text-right shrink-0 bg-[#151515] p-5 rounded-2xl border border-white/10">
            <span className="text-xs font-light tracking-[0.18em] text-[#A0A0A0] block">
              合計参考金額 ({selectedCount}点)
            </span>
            <div className="text-3xl sm:text-4xl font-light text-[#FFFFFF] tabular-nums mt-1">
              ¥{totalValue.toLocaleString()}
            </div>
            <span className="text-[11px] font-light text-[#00E5FF] mt-1 block">
              タックル総重量: {totalWeightG}g
            </span>
          </div>
        </div>

        {/* 4大テレメトリーサマリー */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#151515] border border-white/10 p-4">
            <div className="text-[11px] font-light text-[#A0A0A0]">スプール糸巻充填率</div>
            <div className="text-sm sm:text-base font-normal text-[#00E5FF] mt-1">
              {spoolFillText}
            </div>
          </div>
          <div className="rounded-2xl bg-[#151515] border border-white/10 p-4">
            <div className="text-[11px] font-light text-[#A0A0A0]">
              ルアー実戦総重量（針・リング込）
            </div>
            <div className="text-sm sm:text-base font-normal text-[#FFFFFF] mt-1 tabular-nums">
              {rig.lure
                ? `${rig.lure.totalWeightG}g (本体${rig.lure.bodyWeightG}g + 金具${rig.lure.hookRingWeightG}g)`
                : 'ルアー未選択'}
            </div>
          </div>
          <div className="rounded-2xl bg-[#151515] border border-white/10 p-4">
            <div className="text-[11px] font-light text-[#A0A0A0]">推奨初期ドラグ設定値</div>
            <div className="text-sm sm:text-base font-normal text-[#00E5FF] mt-1 tabular-nums">
              {recommendedDragText}
            </div>
          </div>
          <div className="rounded-2xl bg-[#151515] border border-white/10 p-4">
            <div className="text-[11px] font-light text-[#A0A0A0]">適合ショックリーダー＆フック</div>
            <div className="text-xs font-normal text-[#FFFFFF] mt-1 leading-relaxed">
              {rig.line ? rig.line.pairedLeaderSpec : 'リーダー未定'} /{' '}
              {rig.lure ? rig.lure.hookSpec : 'フック未定'}
            </div>
          </div>
        </div>

        {/* URL共有 ＆ SNSコピーボックス */}
        <div className="rounded-2xl bg-[#151515] border border-[#00E5FF]/40 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-normal text-[#00E5FF]">
              <Link2 className="w-4 h-4" />
              <span>このセッティングの専用共有URL（開くとこの編成が100%再現されます）</span>
            </div>
            <button
              type="button"
              onClick={handleCopyShareText}
              className="text-xs font-light text-[#A0A0A0] hover:text-[#FFFFFF] flex items-center gap-1.5 self-start sm:self-auto"
            >
              {textCopied ? (
                <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              )}
              <span>{textCopied ? '仕様書テキストをコピーしました！' : 'SNS投稿用テキストも一緒にコピー'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              readOnly
              value={shareUrl}
              aria-label="セッティング共有用URL"
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 rounded-xl bg-[#222222] border border-white/15 px-4 py-3 text-xs font-mono text-[#FFFFFF] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyShareUrl}
              className="px-6 py-3 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              {urlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{urlCopied ? 'URLをコピーしました！' : '共有URLをコピー'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 2. スロット別 構成パーツ ＆ Amazon購入リンク一覧 ==================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-light tracking-[0.2em] text-[#FF9900]">
              AMAZON.CO.JP DIRECT PURCHASE LINKS
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-[#FFFFFF] mt-0.5">
              構成パーツ別のAmazon購入・差し替えリスト
            </h2>
          </div>
          <span className="text-xs font-light text-[#A0A0A0] hidden sm:inline">
            各パーツをAmazonの新しいタブで開いてカートへ追加できます
          </span>
        </div>

        <div className="space-y-4">
          {CATEGORY_ORDER.map((cat) => {
            const meta = STEP_META[cat];
            const item = rig[cat];

            if (!item) {
              return (
                <div
                  key={cat}
                  className="rounded-2xl bg-[#222222] border border-dashed border-white/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-medium text-[#00E5FF]">
                      {meta.stepNum} {meta.label}
                    </span>
                    <div className="text-base font-light text-[#A0A0A0] mt-1">
                      このスロットはまだ選択されていません
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBackToBuilder(cat)}
                    className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>ビルダーで{meta.label}を選択する</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            const { compatible, reason } = checkPartCompatibility(item, rig);
            const mainAmazonUrl = buildAmazonAffiliateUrl(item.amazon);
            const subAmazonUrl = item.amazon.subItemQuery
              ? buildAmazonAffiliateUrl({ searchQuery: item.amazon.subItemQuery })
              : null;

            return (
              <div
                key={cat}
                className={`rounded-2xl bg-[#222222] border p-5 sm:p-6 space-y-4 ${
                  compatible ? 'border-white/15' : 'border-rose-500/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      onClick={() => onOpenDetail(item)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-[#151515] border border-white/10 shrink-0 cursor-pointer hover:border-[#00E5FF]"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-[#00E5FF]">
                          {meta.stepNum} {meta.label}
                        </span>
                        <span className="text-xs font-light text-[#A0A0A0]">// {item.brand}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            compatible
                              ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                              : 'bg-rose-950 text-rose-200 border border-rose-400'
                          }`}
                        >
                          {compatible ? '物理適合' : '不整合あり'}
                        </span>
                      </div>
                      <h3
                        onClick={() => onOpenDetail(item)}
                        className="text-base sm:text-lg font-normal text-[#FFFFFF] hover:text-[#00E5FF] cursor-pointer"
                      >
                        {item.name}
                      </h3>
                      <div className="text-xs font-light text-[#00E5FF]">{reason}</div>
                      <div className="text-xs font-light text-[#A0A0A0] tabular-nums">
                        参考価格: ¥{item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* 右側：変更ボタン ＆ Amazon購入ボタン */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(item)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#151515] border border-white/10 hover:border-[#00E5FF] text-xs font-light text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors"
                    >
                      スペック詳細
                    </button>
                    <button
                      type="button"
                      onClick={() => onBackToBuilder(cat)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#151515] border border-white/15 hover:border-[#00E5FF] text-xs font-normal text-[#FFFFFF] transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>変更する</span>
                    </button>
                    <a
                      href={mainAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-5 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#FF9900]/90 text-[#151515] text-xs font-bold tracking-wider transition-transform hover:scale-105 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.3)]"
                    >
                      <span>Amazonで購入</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* サブアイテム（適合リーダー・太軸フック）のAmazon導線 */}
                {subAmazonUrl && item.amazon.subItemLabel && (
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-light text-[#00E5FF]">
                      ＋ 自動ペアリング推奨品：{item.amazon.subItemLabel}
                    </span>
                    <a
                      href={subAmazonUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-[#151515] hover:bg-[#FF9900]/20 border border-[#FF9900]/50 text-xs font-medium text-[#FF9900] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>適合サブパーツもAmazonで見る</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 3. AmazonアソシエイトID設定パネル ==================== */}
      <section className="rounded-2xl bg-[#222222] border border-white/10 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowTagConfig((prev) => !prev)}
            className="text-xs font-normal text-[#00E5FF] hover:underline flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>
              Amazonアソシエイト・トラッキングID設定: <strong>{activeAssociateTag}</strong>
            </span>
          </button>
          <a
            href="https://affiliate.amazon.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#A0A0A0] hover:text-[#FFFFFF] inline-flex items-center gap-1"
          >
            <span>Amazonアソシエイト公式ページへ</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {showTagConfig && (
          <form onSubmit={handleTagSubmit} className="pt-2 space-y-2.5">
            <p className="text-[11px] font-light text-[#A0A0A0]">
              ご自身のトラッキングID（例: <code>yourname-22</code>）を保存すると、サイト内の全Amazon購入リンクに自動付与されます。
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="例: yourname-22"
                aria-label="AmazonアソシエイトID"
                className="flex-1 rounded-xl bg-[#151515] border border-white/20 px-3.5 py-2 text-xs font-mono text-[#FFFFFF] focus:border-[#00E5FF] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider"
              >
                IDを保存
              </button>
            </div>
            {tagSaved && (
              <p className="text-[11px] text-[#00E5FF]">
                ✓ トラッキングID「{activeAssociateTag}」を保存しました。
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
};
