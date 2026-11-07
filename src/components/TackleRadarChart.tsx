import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Maximize2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  AnyRigPart,
  buildRadarComparisonSummary,
  calculateOverallCombatStats,
  CombatStatBar,
  RigState,
  TargetFishProfile,
} from '../data/rigCatalog';
import {
  getFishFocalPosition,
  getPartStudioFilter,
  resolvePartStudioImage,
  ROD_OPEN_STAGE_MASK_STYLE,
} from './RigPartShowcase';

/**
 * SVG polygon / circle 座標を全ブラウザで60fpsアニメーション補間する軽量フック
 */
function useAnimatedScores(targetScores: number[], durationMs = 280): number[] {
  const [animated, setAnimated] = useState<number[]>(targetScores);
  const currentRef = useRef<number[]>(targetScores);
  const rafRef = useRef<number | null>(null);
  const targetKey = targetScores.join(',');

  useEffect(() => {
    const startValues = [...currentRef.current];
    const endValues = [...targetScores];

    if (startValues.length !== endValues.length) {
      currentRef.current = endValues;
      setAnimated(endValues);
      return;
    }

    const hasDiff = endValues.some((v, idx) => Math.abs(v - startValues[idx]) > 0.2);
    if (!hasDiff) {
      currentRef.current = endValues;
      setAnimated(endValues);
      return;
    }

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = startValues.map((s, i) => s + (endValues[i] - s) * eased);
      currentRef.current = next;
      setAnimated(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        currentRef.current = endValues;
        setAnimated(endValues);
      }
    };

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKey, durationMs]);

  return animated;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total = 5
): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: Number((cx + radius * Math.cos(angle)).toFixed(1)),
    y: Number((cy + radius * Math.sin(angle)).toFixed(1)),
  };
}

interface TacklePentagonRadarProps {
  stats: CombatStatBar[];
  isCompatible: boolean;
  isPreviewing?: boolean;
  variant?: 'desktop' | 'mobile';
}

export const TacklePentagonRadar: React.FC<TacklePentagonRadarProps> = ({
  stats,
  isCompatible,
  isPreviewing = false,
  variant = 'desktop',
}) => {
  const targetScores = useMemo(() => stats.map((s) => s.score), [stats]);
  const animatedScores = useAnimatedScores(targetScores, 260);

  const isCompact = variant === 'mobile';
  const width = isCompact ? 204 : 300;
  const height = isCompact ? 136 : 224;
  const cx = width / 2;
  const cy = isCompact ? 71 : 116;
  const maxR = isCompact ? 40 : 70;

  // 各頂点のラベル中心位置（ポリゴンと重ならず外枠にも見切れない最適座標）
  const labelOffsets: { x: number; y: number }[] = isCompact
    ? [
        { x: cx, y: 14 }, // 上: 制動力
        { x: cx + 68, y: 55 }, // 右上: 遠投性
        { x: cx + 52, y: 121 }, // 右下: 軽快さ
        { x: cx - 52, y: 121 }, // 左下: 喰わせ
        { x: cx - 68, y: 55 }, // 左上: 安全余裕
      ]
    : [
        { x: cx, y: 21 }, // 上: 制動力
        { x: cx + 104, y: 88 }, // 右上: 遠投性
        { x: cx + 76, y: 202 }, // 右下: 軽快さ
        { x: cx - 76, y: 202 }, // 左下: 喰わせ
        { x: cx - 104, y: 88 }, // 左上: 安全余裕
      ];

  const gridLevels = [0.33, 0.66, 1.0];

  const basePointsStr = stats
    .map((s, idx) => {
      const p = polarToCartesian(cx, cy, (s.baseScore / 100) * maxR, idx);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  const currentCoords = animatedScores.map((scoreVal, idx) =>
    polarToCartesian(cx, cy, (scoreVal / 100) * maxR, idx)
  );
  const currentPointsStr = currentCoords.map((p) => `${p.x},${p.y}`).join(' ');

  const strokeColor = isCompatible ? '#3E6AE1' : '#D97706';
  const fillColor = isCompatible
    ? isPreviewing
      ? 'rgba(62, 106, 225, 0.15)'
      : 'rgba(62, 106, 225, 0.22)'
    : 'rgba(217, 119, 6, 0.22)';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="推奨構成と現在構成の5項目比較レーダーチャート"
      className="w-full h-auto select-none overflow-visible"
    >
      {/* 同心五角形グリッド */}
      {gridLevels.map((level) => {
        const pts = [0, 1, 2, 3, 4]
          .map((i) => {
            const p = polarToCartesian(cx, cy, maxR * level, i);
            return `${p.x},${p.y}`;
          })
          .join(' ');
        return (
          <polygon
            key={level}
            points={pts}
            fill={level === 1.0 ? 'rgba(255, 255, 255, 0.55)' : 'none'}
            stroke={level === 1.0 ? '#D0D3D9' : '#E2E4E8'}
            strokeWidth="1"
          />
        );
      })}

      {/* 5軸放射線 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = polarToCartesian(cx, cy, maxR, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#E2E4E8"
            strokeWidth="1"
          />
        );
      })}

      {/* 推奨ベース構成ポリゴン（グレー破線） */}
      <polygon
        points={basePointsStr}
        fill="rgba(142, 142, 147, 0.15)"
        stroke="#8E8E93"
        strokeWidth={isCompact ? '1.3' : '1.6'}
        strokeDasharray="4 3"
      />

      {/* 現在の選択構成ポリゴン */}
      <polygon
        points={currentPointsStr}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isCompact ? '2' : '2.4'}
        strokeDasharray={isPreviewing ? '5 2' : undefined}
        strokeLinejoin="round"
      />

      {/* 頂点ドット */}
      {currentCoords.map((p, i) => (
        <circle
          key={stats[i]?.id ?? i}
          cx={p.x}
          cy={p.y}
          r={isCompact ? 2.6 : 3.6}
          fill={strokeColor}
          stroke="#FFFFFF"
          strokeWidth="1.3"
        />
      ))}

      {/* 各軸ラベル＆推奨比デルタ */}
      {stats.map((s, idx) => {
        const diff = s.score - s.baseScore;
        const pos = labelOffsets[idx];
        const diffStr = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '';
        const valueColor =
          diff > 0 ? '#2563EB' : diff < 0 ? '#DC2626' : '#5C5E62';

        if (isCompact) {
          const shortName =
            s.shortJpLabel === '安全余裕' ? '安全' : s.shortJpLabel;
          return (
            <text
              key={s.id}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10.5"
              fontWeight="700"
              fill={diff === 0 ? '#393C41' : valueColor}
            >
              {shortName}
              {diffStr ? ` ${diffStr}` : ''}
            </text>
          );
        }

        return (
          <g key={s.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              y="-7"
              fontSize="11.5"
              fontWeight="700"
              fill="#171A20"
            >
              {s.shortJpLabel}
            </text>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              y="8"
              fontSize="11.5"
              fontWeight="700"
              fill={valueColor}
            >
              {s.score}
              {diffStr ? ` (${diffStr})` : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ============================================================================
// PC固定ステージ下段：推奨比較レーダー ＆ トレードオフ解説デッキ（案B）
// ============================================================================

interface DesktopStageRadarDeckProps {
  rig: RigState;
  previewPart?: AnyRigPart | null;
  target: TargetFishProfile;
  onResetToRecommended: () => void;
}

export const DesktopStageRadarDeck: React.FC<DesktopStageRadarDeckProps> = ({
  rig,
  previewPart = null,
  target,
  onResetToRecommended,
}) => {
  const isPreviewing = Boolean(
    previewPart && rig[previewPart.category]?.id !== previewPart.id
  );

  const effectiveRig = useMemo<RigState>(() => {
    if (!isPreviewing || !previewPart) return rig;
    return {
      ...rig,
      [previewPart.category]: previewPart,
    };
  }, [rig, previewPart, isPreviewing]);

  const stats = useMemo(
    () => calculateOverallCombatStats(effectiveRig, target),
    [effectiveRig, target]
  );

  const summary = useMemo(
    () => buildRadarComparisonSummary(effectiveRig, target, stats),
    [effectiveRig, target, stats]
  );

  const confirmedSummary = useMemo(() => {
    const confirmedStats = calculateOverallCombatStats(rig, target);
    return buildRadarComparisonSummary(rig, target, confirmedStats);
  }, [rig, target]);

  return (
    <div className="mx-3 sm:mx-6 mb-2.5 rounded-2xl bg-[#F4F4F4] border border-black/5 px-4 xl:px-5 py-2.5 select-none">
      <div className="grid grid-cols-12 gap-3 xl:gap-5 items-center">
        {/* 左 5 cols: 5角形オーバーレイ・レーダーチャート ＋ 凡例 */}
        <div className="col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[236px] xl:max-w-[260px]">
            <TacklePentagonRadar
              stats={stats}
              isCompatible={summary.isCompatible}
              isPreviewing={isPreviewing}
              variant="desktop"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#5C5E62] mt-0.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-0 border-t-2 border-dashed border-[#8E8E93] inline-block" />
              <span>推奨の組み合わせ</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#171A20]">
              <span
                className={`w-2.5 h-2.5 rounded-sm inline-block ${
                  summary.isCompatible ? 'bg-[#3E6AE1]' : 'bg-amber-600'
                }`}
              />
              <span>{isPreviewing ? 'ホバー比較中' : '現在の選択構成'}</span>
            </span>
          </div>
        </div>

        {/* 右 7 cols: 変化インサイト ＆ 5軸デルタ一覧 */}
        <div className="col-span-7 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-[#171A20] truncate">
                推奨構成とのバランス変化
              </span>
              {isPreviewing && previewPart ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#3E6AE1]/15 text-[#3E6AE1] truncate">
                  比較中: {previewPart.shortName}
                </span>
              ) : summary.customizedCount > 0 ? (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#5C5E62] border border-black/5 shrink-0">
                  {summary.customizedCount}箇所変更中
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-[#5C5E62] border border-black/5 shrink-0">
                  推奨基準 (±0)
                </span>
              )}
            </div>

            {confirmedSummary.isCustomized && (
              <button
                type="button"
                onClick={onResetToRecommended}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5C5E62] hover:text-[#171A20] underline underline-offset-2 shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>初期設定に戻す</span>
              </button>
            )}
          </div>

          {/* 1行変化インサイトボックス */}
          <div
            className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed border ${
              summary.isCompatible
                ? 'bg-white border-black/5 text-[#393C41]'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {!summary.isCompatible && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 inline mr-1.5 -mt-0.5" />
            )}
            <span>{summary.headline}</span>
          </div>

          {/* 5項目スコア＆推奨比デルタ横並びカード */}
          <div className="grid grid-cols-5 gap-1.5">
            {stats.map((s) => {
              const diff = s.score - s.baseScore;
              const diffText = diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`;
              const cardBorder =
                diff > 0
                  ? 'border-[#3E6AE1]/30 bg-white'
                  : diff < 0
                  ? 'border-rose-200 bg-white'
                  : 'border-black/5 bg-white/85';
              const badgeStyle =
                diff > 0
                  ? 'bg-blue-50 text-blue-700'
                  : diff < 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-[#F4F4F4] text-[#5C5E62]';

              return (
                <div
                  key={s.id}
                  className={`rounded-xl border px-2 py-2 text-center space-y-0.5 transition-colors ${cardBorder}`}
                >
                  <div className="text-[11px] font-semibold text-[#5C5E62] whitespace-nowrap">
                    {s.shortJpLabel}
                  </div>
                  <div className="font-oswald text-sm xl:text-base font-bold text-[#171A20] tabular-nums leading-tight">
                    {s.score}
                  </div>
                  <div>
                    <span
                      className={`inline-block font-oswald text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${badgeStyle}`}
                    >
                      {diffText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// スマホ・タブレット縦 (lg未満) 専用：上部Sticky固定「ミニ写真 ＋ ミニレーダー」スリムバー
// ============================================================================

interface MobileStickyStageRadarBarProps {
  rig: RigState;
  target: TargetFishProfile;
  activeSlide: number;
  onChangeSlide: (slideIndex: number) => void;
  onOpenFeatureModal: (featureIndex?: number) => void;
  onResetToRecommended: () => void;
}

export const MobileStickyStageRadarBar: React.FC<MobileStickyStageRadarBarProps> = ({
  rig,
  target,
  activeSlide,
  onChangeSlide,
  onOpenFeatureModal,
  onResetToRecommended,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const reel = rig.reel!;
  const rod = rig.rod!;
  const line = rig.line!;
  const lure = rig.lure!;

  const stats = useMemo(
    () => calculateOverallCombatStats(rig, target),
    [rig, target]
  );

  const summary = useMemo(
    () => buildRadarComparisonSummary(rig, target, stats),
    [rig, target, stats]
  );

  const changedDiffs = useMemo(
    () =>
      stats
        .map((s) => ({ id: s.id, label: s.shortJpLabel, diff: s.score - s.baseScore }))
        .filter((d) => d.diff !== 0)
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)),
    [stats]
  );

  const slideTabs = ['SET', 'REEL', 'ROD', 'RIG', 'FISH'] as const;

  return (
    <div className="lg:hidden sticky top-[56px] sm:top-[57px] z-30 w-full bg-white/95 backdrop-blur-md border-b border-black/10 shadow-sm px-3.5 sm:px-6 py-2.5 select-none">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* 上段：左 ミニ機材スタジオ写真 / 右 ミニ5軸レーダーチャート */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          {/* 左 6 cols: ミニスタジオ写真ステージ */}
          <div className="col-span-6 relative h-[116px] sm:h-[132px] rounded-xl border border-black/10 bg-white overflow-hidden flex items-center justify-center p-2">
            {/* 左上：現在のスライド種別（タップで次の写真スライドへ切替） */}
            <button
              type="button"
              onClick={() => onChangeSlide((activeSlide + 1) % 5)}
              title="タップして表示写真を切り替え"
              className="absolute top-1.5 left-1.5 z-20 px-2 py-0.5 rounded-md bg-[#F4F4F4]/95 border border-black/5 text-[10px] font-oswald font-bold tracking-wider text-[#171A20]"
            >
              {slideTabs[activeSlide]} ▸
            </button>

            {/* 右上：拡大・スペック詳細モーダルボタン */}
            <button
              type="button"
              onClick={() => onOpenFeatureModal(activeSlide === 1 ? 1 : activeSlide === 3 ? 2 : 0)}
              aria-label="写真を拡大して詳細を見る"
              className="absolute top-1.5 right-1.5 z-20 w-6 h-6 rounded-md bg-[#F4F4F4]/95 border border-black/5 flex items-center justify-center text-[#5C5E62] hover:text-[#171A20]"
            >
              <Maximize2 className="w-3 h-3" />
            </button>

            {/* スライド別ミニビジュアル */}
            {activeSlide === 0 && (
              <div className="w-full h-full flex items-center justify-center pt-3">
                <div
                  style={ROD_OPEN_STAGE_MASK_STYLE}
                  className="w-[58%] h-full flex items-center justify-center -mr-4 z-10"
                >
                  <img
                    src={resolvePartStudioImage(rod)}
                    alt={rod.shortName}
                    style={{ filter: getPartStudioFilter(rod) }}
                    className="w-full h-full object-contain mix-blend-multiply scale-105"
                  />
                </div>
                <div className="w-[50%] h-[92%] flex items-center justify-center z-20">
                  <img
                    src={resolvePartStudioImage(reel)}
                    alt={reel.shortName}
                    style={{ filter: getPartStudioFilter(reel) }}
                    className="w-full h-full object-contain mix-blend-multiply scale-105"
                  />
                </div>
              </div>
            )}

            {activeSlide === 1 && (
              <div className="w-full h-full flex items-center justify-center pt-3">
                <img
                  src={resolvePartStudioImage(reel)}
                  alt={reel.shortName}
                  style={{ filter: getPartStudioFilter(reel) }}
                  className="w-full h-full object-contain mix-blend-multiply scale-105"
                />
              </div>
            )}

            {activeSlide === 2 && (
              <div
                style={ROD_OPEN_STAGE_MASK_STYLE}
                className="w-full h-full flex items-center justify-center pt-3"
              >
                <img
                  src={resolvePartStudioImage(rod)}
                  alt={rod.shortName}
                  style={{ filter: getPartStudioFilter(rod) }}
                  className="w-full h-full object-contain mix-blend-multiply scale-105"
                />
              </div>
            )}

            {activeSlide === 3 && (
              <div className="w-full h-full flex items-center justify-center gap-2 pt-3 px-1">
                <img
                  src={resolvePartStudioImage(line)}
                  alt={line.shortName}
                  style={{ filter: getPartStudioFilter(line) }}
                  className="w-[42%] h-full object-contain mix-blend-multiply"
                />
                <img
                  src={resolvePartStudioImage(lure)}
                  alt={lure.shortName}
                  style={{ filter: getPartStudioFilter(lure) }}
                  className="w-[56%] h-full object-contain mix-blend-multiply"
                />
              </div>
            )}

            {activeSlide === 4 && (
              <div className="absolute inset-0">
                <img
                  src={target.heroImage}
                  alt={target.fishName}
                  style={{ objectPosition: getFishFocalPosition(target.id, 'card') }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-bold text-white truncate">
                  {target.fishName}
                </span>
              </div>
            )}
          </div>

          {/* 右 6 cols: ミニ5軸オーバーレイ・レーダーチャート */}
          <button
            type="button"
            onClick={() => setIsDetailOpen((prev) => !prev)}
            aria-label="5項目バランス詳細を開閉"
            className="col-span-6 h-[116px] sm:h-[132px] rounded-xl bg-[#F4F4F4] border border-black/5 px-1.5 py-1 flex items-center justify-center"
          >
            <div className="w-full max-w-[196px]">
              <TacklePentagonRadar
                stats={stats}
                isCompatible={summary.isCompatible}
                variant="mobile"
              />
            </div>
          </button>
        </div>

        {/* 下段：スリム差分ピル ＆ 展開トグル行 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                summary.isCompatible
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {summary.isCompatible ? (
                <>
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>適合</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>要確認</span>
                </>
              )}
            </span>

            {changedDiffs.length > 0 ? (
              <div className="flex items-center gap-1 overflow-hidden">
                {changedDiffs.slice(0, 2).map((d) => (
                  <span
                    key={d.id}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      d.diff > 0
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {d.label} {d.diff > 0 ? `+${d.diff}` : d.diff}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-[#5C5E62] truncate">
                推奨基準（道具を選ぶと差分を表示）
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsDetailOpen((prev) => !prev)}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#3E6AE1] shrink-0"
          >
            <span>{isDetailOpen ? '閉じる' : '詳細'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isDetailOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* 展開ドロワー：写真スライド切替 ＋ 推奨比インサイト ＋ 5軸フル数値 */}
        {isDetailOpen && (
          <div className="pt-2 border-t border-black/10 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {slideTabs.map((tab, idx) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onChangeSlide(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-oswald tracking-wider ${
                      activeSlide === idx
                        ? 'bg-[#171A20] text-white font-semibold'
                        : 'bg-[#F4F4F4] text-[#5C5E62]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {summary.isCustomized && (
                <button
                  type="button"
                  onClick={onResetToRecommended}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5C5E62] underline underline-offset-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>推奨に戻す</span>
                </button>
              )}
            </div>

            <p
              className={`rounded-xl px-3 py-2 text-xs leading-relaxed border ${
                summary.isCompatible
                  ? 'bg-[#F4F4F4] border-black/5 text-[#393C41]'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {summary.headline}
            </p>

            <div className="grid grid-cols-5 gap-1">
              {stats.map((s) => {
                const diff = s.score - s.baseScore;
                const diffTxt = diff > 0 ? `+${diff}` : diff === 0 ? '±0' : `${diff}`;
                return (
                  <div
                    key={s.id}
                    className="rounded-lg bg-[#F4F4F4] py-1.5 px-1 text-center"
                  >
                    <div className="text-[10px] font-semibold text-[#5C5E62] truncate">
                      {s.shortJpLabel}
                    </div>
                    <div className="font-oswald text-xs font-bold text-[#171A20] tabular-nums">
                      {s.score}
                    </div>
                    <div
                      className={`font-oswald text-[10px] font-bold tabular-nums ${
                        diff > 0
                          ? 'text-blue-700'
                          : diff < 0
                          ? 'text-rose-700'
                          : 'text-[#5C5E62]'
                      }`}
                    >
                      {diffTxt}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
