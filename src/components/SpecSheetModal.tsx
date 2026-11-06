import React, { useState } from 'react';
import {
  Check,
  Copy,
  Database,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  X,
} from 'lucide-react';
import {
  AnyGearProduct,
  BuildOverallEvaluation,
  TackleBuildState,
} from '../types/tackle';

interface SpecSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: TackleBuildState;
  evaluation: BuildOverallEvaluation;
  onInjectCustomProduct: (product: AnyGearProduct) => void;
}

const SAMPLE_AI_EXTRACTED_JSON = `{
  "sku": "LURE-CARPENTER-GAMMA-90-SUPERL",
  "category": "lure",
  "brand": "Carpenter",
  "modelName": "γ (ガンマ) 90-Super L (200mm)",
  "priceJpy": 13200,
  "inStock": true,
  "expertNote": "本体75g。適合フック(#3/0相当・11.5g)装着時の実戦総重量86.5g。ヒラマサ・マグロの誘い出しにおける最高峰ウッドプラグ。",
  "specs": {
    "subType": "plug_main",
    "lengthMm": 200,
    "weightG": 75.0,
    "hookCode": "CLASS_3_0",
    "defaultSubHookSku": "HOOK-ST66-30-SET",
    "minPe": 5.0
  }
}`;

export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  isOpen,
  onClose,
  build,
  evaluation,
  onInjectCustomProduct,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'spec_sheet' | 'ai_json'>('spec_sheet');
  const [copied, setCopied] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [jsonInput, setJsonInput] = useState(SAMPLE_AI_EXTRACTED_JSON);
  const [jsonStatus, setJsonStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const generateShareText = () => {
    const lines = [
      `【RIGs — オフショアキャスティング物理適合セッティング仕様書】`,
      `■ REEL: ${build.reel ? `${build.reel.brand} ${build.reel.modelName}` : '未選択'}`,
      `■ ROD: ${build.rod ? `${build.rod.brand} ${build.rod.modelName}` : '未選択'}`,
      `■ PE LINE: ${build.peLine ? `${build.peLine.brand} ${build.peLine.modelName}` : '未選択'}${
        evaluation.spoolFillRatioPercent
          ? ` (スプール充填率 ${evaluation.spoolFillRatioPercent}%)`
          : ''
      }`,
      `■ LEADER: ${
        build.shockLeader ? `${build.shockLeader.brand} ${build.shockLeader.modelName}` : '未選択'
      }`,
      `■ PLUG: ${build.plug ? `${build.plug.brand} ${build.plug.modelName}` : '未選択'}`,
      `■ HOOK & RING: ${
        build.hookSet ? `${build.hookSet.brand} ${build.hookSet.modelName}` : '未選択'
      }${evaluation.totalLureWeightG ? ` (針込総重量 ${evaluation.totalLureWeightG}g)` : ''}`,
      `■ 物理適合スコア: ${evaluation.overallScore}% / 推奨初期ドラグ: ${
        evaluation.recommendedInitialDragKg
          ? `${evaluation.recommendedInitialDragKg.min}〜${evaluation.recommendedInitialDragKg.max}kg`
          : '-'
      }`,
      `■ 合計金額: ¥${evaluation.totalPriceJpy.toLocaleString()} (税込)`,
      `#RIGs #TackleBuilder #オフショアキャスティング #ヒラマサ #クロマグロ`,
    ];
    return lines.join('\n');
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleParseAndInjectJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.sku || !parsed.category || !parsed.brand || !parsed.modelName || !parsed.specs) {
        setJsonStatus({
          ok: false,
          msg: '必須フィールド (sku, category, brand, modelName, specs) が不足しています。',
        });
        return;
      }
      const newProduct: AnyGearProduct = {
        id: `custom-${Date.now()}`,
        sku: String(parsed.sku),
        category: parsed.category,
        brand: String(parsed.brand),
        modelName: String(parsed.modelName),
        priceJpy: Number(parsed.priceJpy ?? 0),
        inStock: Boolean(parsed.inStock ?? true),
        expertNote: String(parsed.expertNote ?? ''),
        specs: parsed.specs,
      };
      onInjectCustomProduct(newProduct);
      setJsonStatus({
        ok: true,
        msg: `検証成功: 「${newProduct.brand} ${newProduct.modelName}」をカタログに追加し、互換性エンジンに即時反映しました。`,
      });
    } catch (e) {
      setJsonStatus({
        ok: false,
        msg: `JSON構文エラー: ${(e as Error).message}`,
      });
    }
  };

  const itemsList = [
    { slot: '01 REEL', item: build.reel },
    { slot: '02 ROD', item: build.rod },
    { slot: '03-A PE LINE', item: build.peLine },
    { slot: '03-B SHOCK LEADER', item: build.shockLeader },
    { slot: '04-A OFFSHORE PLUG', item: build.plug },
    { slot: '04-B HOOK & RING SET', item: build.hookSet },
  ].filter((entry) => entry.item !== null);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A1A1A]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-spec-title"
    >
      <div className="bento-glass-card rounded-3xl border border-white/15 w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#1A1A1A]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModalTab('spec_sheet')}
              className={`cyber-float-hover font-jp text-xs px-4 py-2 rounded-xl border ${
                activeModalTab === 'spec_sheet'
                  ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF] font-bold'
                  : 'bg-[#2D2D2D] text-slate-200 border-white/15'
              }`}
            >
              1. 実戦セッティング仕様書・一括決済
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('ai_json')}
              className={`cyber-float-hover font-jp text-xs px-4 py-2 rounded-xl border flex items-center gap-1.5 ${
                activeModalTab === 'ai_json'
                  ? 'bg-[#00E5FF] text-[#1A1A1A] border-[#00E5FF] font-bold'
                  : 'bg-[#2D2D2D] text-slate-200 border-white/15'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>2. AIスペック抽出JSON投入テスト</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cyber-float-hover text-slate-200 hover:text-white p-2 rounded-xl bg-[#2D2D2D] border border-white/10"
            aria-label="モーダルを閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeModalTab === 'spec_sheet' ? (
          <div className="p-6 sm:p-7 space-y-6 max-h-[82vh] overflow-y-auto">
            {/* Compatibility Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2.5">
                  {evaluation.criticalIssues.length === 0 ? (
                    <ShieldCheck className="w-6 h-6 text-[#00E5FF]" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  )}
                  <h2
                    id="modal-spec-title"
                    className="font-inter text-xl sm:text-2xl font-extrabold text-white tracking-tight"
                  >
                    RIGs TACKLE SPECIFICATION SHEET
                  </h2>
                </div>
                <p className="font-jp text-xs text-slate-200 mt-1">
                  スプール糸巻き量・ロッド耐荷重・フック装着時ルアー総重量の物理検証証明書
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="font-inter text-[11px] font-bold tracking-widest text-slate-300">
                  COMPATIBILITY SCORE
                </div>
                <div
                  className={`font-oswald text-3xl font-bold tracking-wide ${
                    evaluation.criticalIssues.length === 0 ? 'text-[#00E5FF]' : 'text-rose-400'
                  }`}
                >
                  {evaluation.overallScore}% MATCH
                </div>
              </div>
            </div>

            {/* Key Rigging Telemetry Bento Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#1A1A1A]/90 border border-white/10">
                <div className="font-inter text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  SPOOL FILL RATIO (糸巻き充填率)
                </div>
                <div className="font-oswald text-2xl font-bold text-white mt-1 tabular-nums">
                  {evaluation.spoolFillRatioPercent !== null
                    ? `${evaluation.spoolFillRatioPercent}% (下巻き不要)`
                    : '未算出'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#1A1A1A]/90 border border-white/10">
                <div className="font-inter text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  TOTAL LURE WT (本体＋針・リング)
                </div>
                <div className="font-oswald text-2xl font-bold text-[#00E5FF] mt-1 tabular-nums">
                  {evaluation.totalLureWeightG !== null
                    ? `${evaluation.totalLureWeightG}g`
                    : '未算出'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#1A1A1A]/90 border border-white/10">
                <div className="font-inter text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  INITIAL DRAG SET (推奨初期ドラグ)
                </div>
                <div className="font-oswald text-2xl font-bold text-[#00E5FF] mt-1 tabular-nums">
                  {evaluation.recommendedInitialDragKg
                    ? `${evaluation.recommendedInitialDragKg.min} – ${evaluation.recommendedInitialDragKg.max} kg`
                    : '未算出'}
                </div>
              </div>
            </div>

            {/* Bill of Materials Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/10">
              {itemsList.map(({ slot, item }) => (
                <div
                  key={slot}
                  className="p-4 bg-[#1A1A1A]/75 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-inter text-[11px] font-bold text-[#00E5FF] tracking-wider">
                      {slot}
                    </div>
                    <div className="font-inter text-sm sm:text-base font-bold text-white truncate mt-0.5">
                      {item!.brand} — {item!.modelName}
                    </div>
                    <div className="font-mono text-xs text-slate-300">SKU: {item!.sku}</div>
                  </div>
                  <div className="font-oswald text-lg font-bold text-white tabular-nums shrink-0">
                    ¥{item!.priceJpy.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* SNS / UGC Share Copy Block */}
            <div className="p-4 rounded-2xl bg-[#1A1A1A]/90 border border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="font-jp text-xs font-medium text-slate-200">
                  セッティング記録 / SNS共有用テキスト (ワンクリックコピー)
                </span>
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="cyber-float-hover px-3.5 py-1.5 rounded-xl bg-[#2D2D2D] border border-[#00E5FF]/50 text-xs font-jp font-bold text-[#00E5FF] flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'コピー完了' : '構成テキストをコピー'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-[#2D2D2D]/70 p-3.5 rounded-xl border border-white/10 leading-relaxed">
                {generateShareText()}
              </pre>
            </div>

            {/* Total & Checkout CTA */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-inter text-xs font-bold tracking-wider text-slate-300">
                  TOTAL PACKAGE PRICE (全{itemsList.length}点・税込)
                </div>
                <div className="font-oswald text-4xl font-bold text-white tabular-nums mt-0.5">
                  ¥{evaluation.totalPriceJpy.toLocaleString()}
                </div>
              </div>

              {orderSubmitted ? (
                <div className="px-5 py-3.5 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF] text-[#00E5FF] font-jp text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>
                    一括カート登録完了（PEライン下巻きなし・ノット結束指定書付きで手配可能）
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setOrderSubmitted(true)}
                  disabled={evaluation.criticalIssues.length > 0}
                  className="cyber-float-hover px-7 py-4 rounded-2xl bg-[#00E5FF] text-[#1A1A1A] font-jp text-base font-bold tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_28px_rgba(0,229,255,0.45)] disabled:opacity-40"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>この完全適合セットを一括決済へ進める</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* AI JSON Ingestion Console */
          <div className="p-6 sm:p-7 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-[#00E5FF] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-jp text-lg sm:text-xl font-bold text-white">
                  AI自律運営：メーカー公表スペックJSON 投入コンソール
                </h3>
                <p className="font-jp text-xs text-slate-200 mt-1 leading-relaxed">
                  LLMがメーカーのスペック表から抽出した単一JSON（またはSupabaseの{' '}
                  <code className="text-[#00E5FF] font-mono">upsert_gear_from_ai_json(payload)</code>{' '}
                  RPC互換フォーマット）をそのまま流し込み、互換性判定エンジンで即座にテストできます。
                </p>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={13}
              aria-label="AI抽出スペックJSON入力エリア"
              className="w-full font-mono text-xs bg-[#1A1A1A] border border-white/20 rounded-2xl p-4 text-white focus:border-[#00E5FF] focus:outline-none"
            />

            {jsonStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-jp font-medium ${
                  jsonStatus.ok
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF]'
                    : 'bg-rose-950/60 border-rose-400 text-rose-200'
                }`}
              >
                {jsonStatus.msg}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleParseAndInjectJson}
                className="cyber-float-hover px-6 py-3 rounded-xl bg-[#00E5FF] text-[#1A1A1A] font-jp text-xs sm:text-sm font-bold tracking-wider"
              >
                JSONをカタログへ即時投入して互換性エンジンに反映
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
