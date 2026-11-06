import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ChevronDown,
  Crosshair,
  Fish,
  Flame,
  MapPin,
  ShieldCheck,
  Waves,
  Zap,
} from 'lucide-react';
import {
  ALL_PARTS,
  RIG_PRESETS,
  TargetFishProfile,
  TargetId,
} from '../data/rigCatalog';

interface TargetSelectHomeViewProps {
  currentTargetId?: TargetId;
  onSelectTargetAndGoGarage: (targetId: TargetId) => void;
  onSelectTargetAndGoCheckout?: (targetId: TargetId) => void;
}

// 魚種名を「主役タイトル」と「補足クラス表記」に分離してジャンプ率を高めるヘルパー
const DISPLAY_TITLE_MAP: Record<
  TargetId,
  {
    mainSpecies: string;
    subSpecies: string;
  }
> = {
  pe6: {
    mainSpecies: '近海ヒラマサ ＆ キハダ',
    subSpecies: 'ヒラマサ 10〜20kg / キハダマグロ 20〜40kg',
  },
  pe8: {
    mainSpecies: '大型クロマグロ ＆ オオマサ',
    subSpecies: 'クロマグロ 40〜80kg / オオマサ 20〜30kg超',
  },
  pe10: {
    mainSpecies: '100kg超クロマグロ ＆ GT',
    subSpecies: 'モンスターマグロ 80〜150kg超 / 離島遠征GT',
  },
};

export const TargetSelectHomeView: React.FC<TargetSelectHomeViewProps> = ({
  onSelectTargetAndGoGarage,
}) => {
  // ホバー中のターゲットID（背景アンビエント連動＆PC段階的開示用）
  const [hoveredTargetId, setHoveredTargetId] = useState<TargetId | null>(null);

  // モバイル用：詳細スペックのアコーディオン開閉状態
  const [expandedMobileTargetId, setExpandedMobileTargetId] = useState<TargetId | null>(null);

  const activeAmbientTarget =
    RIG_PRESETS.find((t) => t.id === hoveredTargetId) ?? RIG_PRESETS[0];

  const toggleMobileDetails = (e: React.MouseEvent, targetId: TargetId) => {
    e.stopPropagation();
    setExpandedMobileTargetId((prev) => (prev === targetId ? null : targetId));
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col justify-between gap-6 sm:gap-8 py-2 sm:py-4">
      {/* ==================== 背景アンビエント水中フォトレイヤー ==================== */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-700 ${
          hoveredTargetId ? 'opacity-25' : 'opacity-10'
        }`}
      >
        <img
          src={activeAmbientTarget.heroImage}
          alt=""
          className="w-full h-full object-cover scale-110 blur-2xl transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#151515] via-[#151515]/85 to-[#151515]" />
      </div>

      {/* ==================== 上部：STEP 01 タイトルヘッダー（ノイズを削ぎ落とし選択に集中） ==================== */}
      <div className="relative z-10 border-b border-white/10 pb-5 sm:pb-6 shrink-0">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-xs font-mono font-bold tracking-[0.18em] text-[#00E5FF]">
            <Crosshair className="w-3.5 h-3.5 animate-pulse" />
            <span>STEP 01 // SELECT TARGET MONSTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FFFFFF] leading-tight">
            どのモンスターを釣りに行きますか？
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
            狙うターゲットを選択してください。100%物理適合する推奨タックル4点セットが自動構成されます。
          </p>
        </div>
      </div>

      {/* ==================== メイン：3つのターゲット選択カード（段階的開示 ＆ 強アフォーダンスCTA） ==================== */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {RIG_PRESETS.map((target: TargetFishProfile, idx: number) => {
          const displayTitle = DISPLAY_TITLE_MAP[target.id];
          const isMobileExpanded = expandedMobileTargetId === target.id;

          const pReel = ALL_PARTS.find((p) => p.id === target.rigIds.reel);
          const pRod = ALL_PARTS.find((p) => p.id === target.rigIds.rod);
          const pLine = ALL_PARTS.find((p) => p.id === target.rigIds.line);
          const pLure = ALL_PARTS.find((p) => p.id === target.rigIds.lure);
          const totalPrice =
            (pReel?.price ?? 0) +
            (pRod?.price ?? 0) +
            (pLine?.price ?? 0) +
            (pLure?.price ?? 0);

          return (
            <article
              key={target.id}
              onClick={() => onSelectTargetAndGoGarage(target.id)}
              onMouseEnter={() => setHoveredTargetId(target.id)}
              onMouseLeave={() => setHoveredTargetId(null)}
              role="button"
              tabIndex={0}
              aria-label={`${displayTitle.mainSpecies}（${target.badge}）を選択してタックルを組む`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTargetAndGoGarage(target.id);
                }
              }}
              className="group relative rounded-2xl bg-[#222222]/95 backdrop-blur-md overflow-hidden cursor-pointer border border-white/15 hover:border-[#00E5FF] shadow-[0_12px_32px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_0_36px_rgba(0,229,255,0.38)] transition-all duration-300 ease-out hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* =========================================================
                  1. ヒーロービジュアル ＆ 常時表示コア情報（第1階層：LV・魚種名・海域のみ）
                 ========================================================= */}
              <div className="relative h-72 sm:h-80 lg:h-96 w-full overflow-hidden bg-[#151515]">
                {/* メイン魚種ビジュアル（ホバーでダイナミックズーム） */}
                <img
                  src={target.heroImage}
                  alt={target.fishName}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* コントラスト確保のためのグラデーションオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#151515]/55 to-black/40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.28),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 【常時表示①】上部：対象クラス（LV） ＆ 推奨基準バッジ */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#151515]/90 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-mono font-bold text-[#FFFFFF] tracking-wider shadow-md">
                    LV.0{idx + 1} // {target.weightRange}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#151515]/90 backdrop-blur-md border border-[#00E5FF] text-[#00E5FF] text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.35)]">
                    <Waves className="w-3.5 h-3.5 shrink-0" />
                    <span>{target.badge}</span>
                  </span>
                </div>

                {/* =========================================================
                    【段階的開示（Progressive Disclosure）】
                    PCホバー時のみフワッと浮かび上がるマニアック戦闘データ（第2階層）
                   ========================================================= */}
                <div
                  aria-hidden="true"
                  className="hidden lg:flex absolute inset-x-4 top-16 z-20 rounded-xl bg-[#151515]/92 backdrop-blur-md border border-[#00E5FF]/60 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.85)] opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex-col gap-3"
                >
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-mono font-bold text-[#00E5FF] tracking-wider">
                      COMBAT TELEMETRY // 実戦負荷データ
                    </span>
                    <span className="text-[#A0A0A0] font-mono">
                      {target.waterDepthText.split('//')[0]}
                    </span>
                  </div>

                  {/* 3大マニアック数値（時速・ドラグ負荷・キャスト数） */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#222222] p-2.5 border border-white/10">
                      <div className="text-xs text-[#A0A0A0] flex items-center justify-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>初動時速</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-[#FFFFFF] mt-1 tabular-nums">
                        {target.strikeSpeedKmh}km/h
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#222222] p-2.5 border border-[#00E5FF]/30">
                      <div className="text-xs text-[#A0A0A0] flex items-center justify-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[#FF9900]" />
                        <span>初動負荷</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-[#00E5FF] mt-1 tabular-nums">
                        約{target.initialRunLoadKg}kg
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#222222] p-2.5 border border-white/10">
                      <div className="text-xs text-[#A0A0A0] flex items-center justify-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />
                        <span>1日投数</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-[#FFFFFF] mt-1 tabular-nums">
                        約{target.dailyCastCount}投
                      </div>
                    </div>
                  </div>

                  {/* アイコン化した捕食ベイトサイズ */}
                  <div className="flex items-center gap-2 text-xs text-[#FFFFFF] bg-[#222222]/90 rounded-lg px-3 py-2 border border-white/10">
                    <Fish className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span className="text-[#A0A0A0] shrink-0">捕食ベイト:</span>
                    <span className="font-medium text-[#00E5FF] truncate">
                      {target.baitSizeMm}
                    </span>
                  </div>
                </div>

                {/* 【常時表示②・③】下部：高ジャンプ率の魚種名 ＆ 対象海域 */}
                <div className="absolute bottom-4 left-5 right-5 z-10 space-y-2">
                  <div className="text-xs font-medium text-[#00E5FF] tracking-wide drop-shadow">
                    {displayTitle.subSpecies}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    {displayTitle.mainSpecies}
                  </h2>

                  <div className="pt-1 flex items-center gap-2 text-xs sm:text-sm font-medium text-[#FFFFFF]/90 drop-shadow">
                    <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span className="truncate">{target.field}</span>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  2. カード下部：価格アンカー ＆ モバイル用折りたたみ ＆ 明確な単一CTAボタン
                 ========================================================= */}
              <div className="p-5 sm:p-6 bg-[#222222] space-y-4">
                {/* 推奨4点セット参考価格バー（1行でスッキリ表示） */}
                <div className="flex items-center justify-between text-xs sm:text-sm pb-3 border-b border-white/10">
                  <span className="text-[#A0A0A0] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span>推奨4点フルセット基準価格</span>
                  </span>
                  <span className="font-mono font-bold text-base text-[#FFFFFF] tabular-nums">
                    ¥{totalPrice.toLocaleString()}
                  </span>
                </div>

                {/* モバイル・タブレット（lg未満）専用：文字潰れを防ぐアコーディオン展開 */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={(e) => toggleMobileDetails(e, target.id)}
                    aria-expanded={isMobileExpanded}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#151515] border border-white/10 text-xs font-medium text-[#A0A0A0] hover:text-[#FFFFFF] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>実戦データ（時速・負荷・捕食ベイト）を見る</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#00E5FF] transition-transform duration-200 ${
                        isMobileExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMobileExpanded && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 p-3.5 rounded-xl bg-[#151515] border border-[#00E5FF]/40 space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-[#222222] p-2">
                          <div className="text-xs text-[#A0A0A0]">初動時速</div>
                          <div className="text-sm font-mono font-bold text-[#FFFFFF] mt-0.5">
                            {target.strikeSpeedKmh}km
                          </div>
                        </div>
                        <div className="rounded-lg bg-[#222222] p-2">
                          <div className="text-xs text-[#A0A0A0]">初動負荷</div>
                          <div className="text-sm font-mono font-bold text-[#00E5FF] mt-0.5">
                            約{target.initialRunLoadKg}kg
                          </div>
                        </div>
                        <div className="rounded-lg bg-[#222222] p-2">
                          <div className="text-xs text-[#A0A0A0]">1日投数</div>
                          <div className="text-sm font-mono font-bold text-[#FFFFFF] mt-0.5">
                            約{target.dailyCastCount}投
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#FFFFFF] bg-[#222222] rounded-lg px-3 py-2">
                        <Fish className="w-4 h-4 text-[#00E5FF] shrink-0" />
                        <span className="text-[#00E5FF] font-medium">
                          ベイト: {target.baitSizeMm}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 【改善点3】明確な単一プライマリCTAボタン（エレクトリックブルー発光＋矢印アニメーション） */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTargetAndGoGarage(target.id);
                  }}
                  className="w-full py-4 px-5 rounded-xl bg-[#00E5FF]/15 border-2 border-[#00E5FF] text-[#00E5FF] group-hover:bg-[#00E5FF] group-hover:text-[#151515] shadow-[0_0_20px_rgba(0,229,255,0.25)] group-hover:shadow-[0_0_30px_rgba(0,229,255,0.8)] transition-all duration-300 flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-mono text-xs font-extrabold tracking-[0.16em] uppercase leading-none">
                      SELECT TARGET
                    </span>
                    <span className="text-sm font-bold tracking-wide mt-1 leading-none">
                      このターゲットで組む
                    </span>
                  </div>
                  <span className="w-9 h-9 rounded-lg bg-[#00E5FF]/20 group-hover:bg-[#151515]/15 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1.5">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
