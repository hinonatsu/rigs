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
      `【fun-fishing | RIGS オフショアキャスティング構成仕様書】`,
      `■ REEL: ${build.reel ? `${build.reel.brand} ${build.reel.modelName}` : '未選択'}`,
      `■ ROD: ${build.rod ? `${build.rod.brand} ${build.rod.modelName}` : '未選択'}`,
      `■ PE LINE: ${build.peLine ? `${build.peLine.brand} ${build.peLine.modelName}` : '未選択'}${
        evaluation.spoolFillRatioPercent ? ` (スプール充填率 ${evaluation.spoolFillRatioPercent}%)` : ''
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
      `#fun_fishing #RIGS #オフショアキャスティング #ヒラマサ #クロマグロ`,
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-carbon-900 border border-carbon-600 w-full max-w-3xl overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="px-5 py-3.5 bg-carbon-950 border-b border-carbon-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveModalTab('spec_sheet')}
              className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
                activeModalTab === 'spec_sheet'
                  ? 'bg-electric text-carbon-950 border-electric font-bold'
                  : 'bg-carbon-900 text-slate-300 border-carbon-700'
              }`}
            >
              1. 実戦セッティング仕様書・一括決済
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('ai_json')}
              className={`font-mono text-xs px-3 py-1.5 border flex items-center gap-1.5 transition-colors ${
                activeModalTab === 'ai_json'
                  ? 'bg-electric text-carbon-950 border-electric font-bold'
                  : 'bg-carbon-900 text-slate-300 border-carbon-700'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>2. AIスペック抽出JSON投入テスト</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activeModalTab === 'spec_sheet' ? (
          <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
            {/* Compatibility Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-carbon-700">
              <div>
                <div className="flex items-center gap-2">
                  {evaluation.criticalIssues.length === 0 ? (
                    <ShieldCheck className="w-5 h-5 text-electric" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  )}
                  <h2 className="font-display text-2xl font-bold text-white tracking-wide">
                    RIGS TACKLE SPECIFICATION SHEET
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  スプール糸巻き量・ロッド耐荷重・フック装着時ルアー総重量の物理検証レポート
                </p>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">COMPATIBILITY</div>
                <div
                  className={`text-2xl font-bold ${
                    evaluation.criticalIssues.length === 0 ? 'text-electric' : 'text-red-400'
                  }`}
                >
                  {evaluation.overallScore}% MATCH
                </div>
              </div>
            </div>

            {/* Key Rigging Telemetry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3 bg-carbon-950 border border-carbon-700">
                <div className="text-[10px] text-slate-400 uppercase">
                  SPOOL FILL RATIO (糸巻き充填率)
                </div>
                <div className="text-lg font-bold text-white mt-0.5 tabular-nums">
                  {evaluation.spoolFillRatioPercent !== null
                    ? `${evaluation.spoolFillRatioPercent}% (下巻き不要)`
                    : '未算出'}
                </div>
              </div>
              <div className="p-3 bg-carbon-950 border border-carbon-700">
                <div className="text-[10px] text-slate-400 uppercase">
                  TOTAL LURE WT (本体＋フック・リング)
                </div>
                <div className="text-lg font-bold text-electric mt-0.5 tabular-nums">
                  {evaluation.totalLureWeightG !== null
                    ? `${evaluation.totalLureWeightG}g`
                    : '未算出'}
                </div>
              </div>
              <div className="p-3 bg-carbon-950 border border-carbon-700">
                <div className="text-[10px] text-slate-400 uppercase">
                  INITIAL DRAG SET (船上初期ドラグ目安)
                </div>
                <div className="text-lg font-bold text-amber-300 mt-0.5 tabular-nums">
                  {evaluation.recommendedInitialDragKg
                    ? `${evaluation.recommendedInitialDragKg.min} – ${evaluation.recommendedInitialDragKg.max} kg`
                    : '未算出'}
                </div>
              </div>
            </div>

            {/* Bill of Materials Table */}
            <div className="border border-carbon-700 divide-y divide-carbon-800">
              {itemsList.map(({ slot, item }) => (
                <div
                  key={slot}
                  className="p-3 bg-carbon-950/50 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-electric">{slot}</div>
                    <div className="text-sm font-bold text-white truncate">
                      {item!.brand} — {item!.modelName}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">SKU: {item!.sku}</div>
                  </div>
                  <div className="font-mono text-sm font-semibold text-slate-100 tabular-nums shrink-0">
                    ¥{item!.priceJpy.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* SNS / UGC Share Copy Block */}
            <div className="p-3.5 bg-carbon-950 border border-carbon-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-slate-300">
                  セッティング記録 / SNS共有用テキスト (ワンクリックコピー)
                </span>
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="px-2.5 py-1 bg-carbon-800 hover:bg-carbon-700 border border-carbon-600 text-xs font-mono text-electric flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'コピー完了' : '構成テキストをコピー'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap bg-carbon-900 p-2.5 border border-carbon-800">
                {generateShareText()}
              </pre>
            </div>

            {/* Total & Checkout CTA */}
            <div className="pt-3 border-t border-carbon-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400 font-mono">
                  TOTAL PACKAGE PRICE (全{itemsList.length}点・税込)
                </div>
                <div className="font-mono text-3xl font-bold text-white tabular-nums">
                  ¥{evaluation.totalPriceJpy.toLocaleString()}
                </div>
              </div>

              {orderSubmitted ? (
                <div className="px-5 py-3 bg-electric/15 border border-electric text-electric font-mono text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>
                    一括カート登録完了（PEライン下巻きなし・ノット結束指定書付きで手配可能）
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setOrderSubmitted(true)}
                  disabled={evaluation.criticalIssues.length > 0}
                  className="px-6 py-3.5 bg-electric hover:bg-electric-dim text-carbon-950 font-display text-lg font-bold tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>この完全適合セットを一括決済へ進める</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* AI JSON Ingestion Console */
          <div className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-electric shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  AI自律運営：メーカー公表スペックJSON 投入コンソール
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  LLMがメーカーのスペック表から抽出した単一JSON（またはSupabaseの{' '}
                  <code className="text-electric">upsert_gear_from_ai_json(payload)</code>{' '}
                  RPC互換フォーマット）をそのまま流し込み、互換性判定エンジンで即座にテストできます。
                </p>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={13}
              className="w-full font-mono text-xs bg-carbon-950 border border-carbon-700 p-3 text-slate-100 focus:border-electric focus:outline-none"
            />

            {jsonStatus && (
              <div
                className={`p-3 border text-xs font-mono ${
                  jsonStatus.ok
                    ? 'bg-electric/10 border-electric text-electric'
                    : 'bg-red-950/50 border-red-500 text-red-300'
                }`}
              >
                {jsonStatus.msg}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleParseAndInjectJson}
                className="px-5 py-2.5 bg-electric hover:bg-electric-dim text-carbon-950 font-mono text-xs font-bold uppercase tracking-wider"
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
