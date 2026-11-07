import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  ShieldCheck,
  Sparkles,
  X,
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

const TARGET_CLASS_META: Record<
  TargetId,
  {
    categoryLabel: string;
    classTitle: string;
    speciesSubtitle: string;
    tagline: string;
  }
> = {
  pe6: {
    categoryLabel: 'オフショア キャスティング // PE6号・14000番基準',
    classTitle: 'PE6号クラス',
    speciesSubtitle: '近海ヒラマサ (10〜20kg) ＆ キハダマグロ',
    tagline: '1日300投の誘い出しと初動3秒の根ズレ制圧を両立する近海スタンダード',
  },
  pe8: {
    categoryLabel: 'ヘビー キャスティング // PE8号・18000番基準',
    classTitle: 'PE8号クラス',
    speciesSubtitle: '大型クロマグロ (40〜80kg) ＆ オオマサ',
    tagline: '高負荷ドラグ15kg超で深場へのファーストランをねじ伏せるパワー構成',
  },
  pe10: {
    categoryLabel: 'モンスター エクスペディション // PE10号・20000番基準',
    classTitle: 'PE10号クラス',
    speciesSubtitle: '100kg超クロマグロ ＆ 離島遠征GT',
    tagline: '最大ドラグ30kg・耐熱Si-Xラインで100kg超の巨魚と真っ向勝負する決戦仕様',
  },
};

export const TargetSelectHomeView: React.FC<TargetSelectHomeViewProps> = ({
  currentTargetId = 'pe6',
  onSelectTargetAndGoGarage,
  onSelectTargetAndGoCheckout,
}) => {
  // 上段フルワイド・ダークヒーローのアクティブスライド (0: PE6, 1: PE8, 2: PE10, 3: 全ラインナップ集合ステージ)
  const [heroSlide, setHeroSlide] = useState<number>(3);
  // 中段カードカルーセルのアクティブドット (0, 1, 2)
  const [activeCardIdx, setActiveCardIdx] = useState<number>(0);
  // 最下部「タックル比較・診断」モーダル開閉
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

  const cardTrackRef = useRef<HTMLDivElement | null>(null);

  const scrollToCard = (index: number) => {
    setActiveCardIdx(index);
    if (!cardTrackRef.current) return;
    const cards = cardTrackRef.current.querySelectorAll('[data-target-card]');
    const targetEl = cards[index] as HTMLElement | undefined;
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  };

  const handleCardTrackScroll = () => {
    if (!cardTrackRef.current) return;
    const { scrollLeft, clientWidth } = cardTrackRef.current;
    const approxIdx = Math.round(scrollLeft / (clientWidth * 0.48));
    const clamped = Math.max(0, Math.min(RIG_PRESETS.length - 1, approxIdx));
    if (clamped !== activeCardIdx) {
      setActiveCardIdx(clamped);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between bg-white text-[#171A20] select-none">
      {/* =====================================================================
          1. 上段：Tesla風 フルワイド・ダークステージ ヒーローカルーセル
             （暗闇のステージ照明＋赤いレーザーステージライン＋下部ドット ● ● ● ●）
         ===================================================================== */}
      <section
        aria-label="ターゲット別タックル・メインステージ"
        className="relative w-full h-[340px] sm:h-[440px] lg:h-[500px] bg-black text-white overflow-hidden shrink-0"
      >
        {/* スポットライト＆ステージスモーク風グラデーション演出 */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 58% 28%, rgba(56, 88, 168, 0.28) 0%, rgba(15, 20, 30, 0.65) 55%, rgba(0, 0, 0, 0.96) 100%)',
          }}
        />

        {/* スライド別ビジュアル */}
        {heroSlide === 3 ? (
          /* スライド3 (初期表示: 全ラインナップ集合ステージ) */
          <div className="relative z-20 w-full h-full max-w-[1600px] mx-auto px-4 sm:px-10 flex flex-col justify-between pt-8 pb-12">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-oswald tracking-[0.3em] uppercase text-white/80">
                RIGs OFFSHORE LINEUP // 100% VERIFIED SYNERGY
              </span>
              <span className="hidden sm:inline text-white/60">
                PE6号クラス ・ PE8号クラス ・ PE10号クラス
              </span>
            </div>

            {/* ステージ中央：3大ターゲット＆フラッグシップ機が並ぶ集合コンポジット */}
            <div className="relative my-auto flex items-end justify-center gap-2 sm:gap-6 lg:gap-10 pt-4 pb-4">
              {RIG_PRESETS.map((preset, idx) => {
                const meta = TARGET_CLASS_META[preset.id];
                const isCenter = idx === 1;
                return (
                  <div
                    key={preset.id}
                    onClick={() => onSelectTargetAndGoGarage(preset.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectTargetAndGoGarage(preset.id);
                      }
                    }}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border border-white/15 hover:border-white/50 shadow-2xl ${
                      isCenter
                        ? 'w-[42%] sm:w-[36%] lg:w-[34%] h-[190px] sm:h-[260px] lg:h-[300px] z-30 -translate-y-2'
                        : 'w-[28%] sm:w-[27%] lg:w-[26%] h-[155px] sm:h-[210px] lg:h-[245px] z-20 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.heroImage}
                      alt={meta.classTitle}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                      <div className="text-[10px] font-oswald tracking-widest text-white/75 uppercase truncate">
                        {preset.badge}
                      </div>
                      <div className="text-sm sm:text-xl lg:text-2xl font-bold text-white tracking-tight">
                        {meta.classTitle}
                      </div>
                      <div className="hidden sm:block text-[11px] text-white/75 truncate">
                        {meta.speciesSubtitle}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ステージ床面ライン照明演出 */}
              <div className="absolute -bottom-1 left-[8%] right-[8%] h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_24px_4px_rgba(239,68,68,0.85)] z-30" />
              <div className="absolute -bottom-3 left-[15%] right-[15%] h-[10px] bg-red-600/25 blur-md z-20" />
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">
                魚種クラスを選ぶだけで、物理適合100%のロッド・リール・ライン・ルアーが即座に組み上がる
              </p>
            </div>
          </div>
        ) : (
          /* スライド 0, 1, 2: 各クラスの個別フルワイド・シネマティックスライド */
          (() => {
            const preset = RIG_PRESETS[heroSlide] ?? RIG_PRESETS[0];
            const meta = TARGET_CLASS_META[preset.id];
            return (
              <div className="relative z-20 w-full h-full">
                <img
                  src={preset.heroImage}
                  alt={preset.fishName}
                  className="w-full h-full object-cover object-center opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 sm:px-12 flex flex-col justify-center items-start space-y-3">
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-oswald tracking-widest uppercase">
                    {meta.categoryLabel}
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                    {meta.classTitle}
                  </h1>
                  <p className="text-sm sm:text-base text-white/85 max-w-xl">
                    {meta.speciesSubtitle} — {meta.tagline}
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectTargetAndGoGarage(preset.id)}
                      className="px-7 py-2.5 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs sm:text-sm font-semibold transition-colors"
                    >
                      タックルを組む
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectTargetAndGoCheckout
                          ? onSelectTargetAndGoCheckout(preset.id)
                          : onSelectTargetAndGoGarage(preset.id)
                      }
                      className="px-7 py-2.5 rounded-md bg-white hover:bg-[#F4F4F4] text-[#171A20] text-xs sm:text-sm font-semibold transition-colors"
                    >
                      推奨構成を見る
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        )}

        {/* 下部中央：ページネーションドット (● ● ● ●) */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-2.5">
          {[0, 1, 2, 3].map((dotIdx) => {
            const isActive = heroSlide === dotIdx;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setHeroSlide(dotIdx)}
                aria-label={`ヒーロースライド ${dotIdx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.9)]'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          2. 中段：ターゲットクラス別 大判フォトカード並置セクション
         ===================================================================== */}
      <section
        aria-label="ターゲットクラス一覧"
        className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-10 pt-6 sm:pt-8 pb-6 flex-1 flex flex-col justify-between"
      >
        <div className="relative">
          {/* 横スクロール＆2大カード並置トラック */}
          <div
            ref={cardTrackRef}
            onScroll={handleCardTrackScroll}
            className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {RIG_PRESETS.map((target: TargetFishProfile) => {
              const meta = TARGET_CLASS_META[target.id];
              const isSelected = currentTargetId === target.id;

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
                  data-target-card
                  onClick={() => onSelectTargetAndGoGarage(target.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${meta.classTitle}（${meta.speciesSubtitle}）のタックルを組む`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTargetAndGoGarage(target.id);
                    }
                  }}
                  className={`group relative shrink-0 w-[90vw] sm:w-[75vw] md:w-[calc(50%-12px)] lg:w-[calc(47%-12px)] h-[440px] sm:h-[520px] lg:h-[560px] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer snap-start transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[#171A20]/20' : ''
                  }`}
                >
                  {/* 全面フォト背景 */}
                  <img
                    src={target.heroImage}
                    alt={meta.classTitle}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* 写真上の視認性を確保する上下グラデーション */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />

                  {/* 左上：カテゴリー小ラベル */}
                  <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wide drop-shadow">
                      {meta.categoryLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-[11px] font-oswald text-white/90 tracking-wider">
                      ¥{totalPrice.toLocaleString()} (推奨4点合計)
                    </span>
                  </div>

                  {/* 下部：クラス名 ＋ 横並び2ボタン */}
                  <div className="absolute bottom-6 left-6 right-6 z-10 space-y-4">
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm font-medium text-white/90 drop-shadow">
                        {meta.speciesSubtitle}（{pRod?.shortName} × {pReel?.shortName}）
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight drop-shadow-sm">
                        {meta.classTitle}
                      </h2>
                    </div>

                    {/* 青「タックルを組む」＋ 白「推奨構成を見る」横並び2列ボタン */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[520px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTargetAndGoGarage(target.id);
                        }}
                        className="w-full py-3 px-4 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white font-semibold text-xs sm:text-sm text-center transition-colors shadow-md"
                      >
                        タックルを組む
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectTargetAndGoCheckout) {
                            onSelectTargetAndGoCheckout(target.id);
                          } else {
                            onSelectTargetAndGoGarage(target.id);
                          }
                        }}
                        className="w-full py-3 px-4 rounded-md bg-white hover:bg-[#F4F4F4] text-[#171A20] font-semibold text-xs sm:text-sm text-center transition-colors shadow-md"
                      >
                        推奨構成を見る
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* PC用 左右送り補助ボタン（控えめなフローティング） */}
          <button
            type="button"
            onClick={() =>
              scrollToCard(
                (activeCardIdx - 1 + RIG_PRESETS.length) % RIG_PRESETS.length
              )
            }
            aria-label="前のクラスカードへ"
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#171A20] shadow-md items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToCard((activeCardIdx + 1) % RIG_PRESETS.length)}
            aria-label="次のクラスカードへ"
            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 z-20 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-[#171A20] shadow-md items-center justify-center transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* カード下部：3連カルーセルドット (● ○ ○) */}
        <div className="pt-4 pb-1 flex items-center justify-center gap-2.5">
          {RIG_PRESETS.map((preset, idx) => {
            const isCurrent = activeCardIdx === idx;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => scrollToCard(idx)}
                aria-label={`${TARGET_CLASS_META[preset.id].classTitle} を表示`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  isCurrent
                    ? 'bg-[#171A20] scale-110'
                    : 'bg-[#B5B6B8] hover:bg-[#757678]'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          3. 最下部スティッキーバー：タックル比較・診断ボタン
         ===================================================================== */}
      <div className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-md border-t border-black/10 py-3 px-4 flex items-center justify-center shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={() => setIsDiagnosticOpen(true)}
          className="w-full max-w-[260px] py-2.5 px-6 rounded-md bg-[#F4F4F4] hover:bg-[#E8E8EA] border border-black/10 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#171A20] transition-colors shadow-sm"
        >
          <span className="w-5 h-5 rounded-full bg-[#3E6AE1] text-white flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </span>
          <span>タックル比較・診断</span>
        </button>
      </div>

      {/* =====================================================================
          モーダル：全3クラス（PE6 / PE8 / PE10）一括比較・クイック診断
         ===================================================================== */}
      {isDiagnosticOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsDiagnosticOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-white text-[#171A20] p-6 sm:p-8 shadow-2xl space-y-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="text-xs font-oswald font-bold tracking-widest text-[#3E6AE1] uppercase">
                  TARGET CLASS COMPARISON &amp; DIAGNOSTIC
                </span>
                <h3 className="text-xl font-bold mt-0.5">
                  全3クラス 推奨タックル＆対象ターゲット比較
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDiagnosticOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4F4F4] hover:bg-[#E5E5E5] flex items-center justify-center"
                aria-label="閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RIG_PRESETS.map((preset) => {
                const meta = TARGET_CLASS_META[preset.id];
                const pReel = ALL_PARTS.find((p) => p.id === preset.rigIds.reel);
                const pRod = ALL_PARTS.find((p) => p.id === preset.rigIds.rod);
                const pLine = ALL_PARTS.find((p) => p.id === preset.rigIds.line);
                const pLure = ALL_PARTS.find((p) => p.id === preset.rigIds.lure);
                const price =
                  (pReel?.price ?? 0) +
                  (pRod?.price ?? 0) +
                  (pLine?.price ?? 0) +
                  (pLure?.price ?? 0);

                return (
                  <div
                    key={preset.id}
                    className="rounded-2xl bg-[#F4F4F4] p-5 flex flex-col justify-between space-y-4 border border-black/5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{meta.classTitle}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-[11px] font-oswald font-bold text-[#3E6AE1]">
                          {preset.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#171A20]">
                        {meta.speciesSubtitle}
                      </div>
                      <p className="text-xs text-[#5C5E62] leading-relaxed">
                        {meta.tagline}
                      </p>

                      <div className="rounded-xl bg-white p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#5C5E62]">リール</span>
                          <span className="font-semibold">{pReel?.shortName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5C5E62]">ロッド</span>
                          <span className="font-semibold">{pRod?.shortName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5C5E62]">ライン</span>
                          <span className="font-semibold">{pLine?.shortName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#5C5E62]">ルアー</span>
                          <span className="font-semibold">{pLure?.shortName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-black/10">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-[#5C5E62]">4点参考合計</span>
                        <span className="font-oswald text-xl font-bold">
                          ¥{price.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDiagnosticOpen(false);
                          onSelectTargetAndGoGarage(preset.id);
                        }}
                        className="w-full py-2.5 px-4 rounded-md bg-[#3E6AE1] hover:bg-[#3457B1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{meta.classTitle} でタックルを組む</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#5C5E62] pt-2">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3E6AE1]" />
                <span>全クラス 100% 物理適合検証済・Amazon公式ストア対応</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#3E6AE1]" />
                <span>ビルダー画面で1パーツずつ自由に変更可能</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
