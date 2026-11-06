import React from 'react';
import {
  Activity,
  ArrowRight,
  Crosshair,
  Flame,
  Gauge,
  ShieldCheck,
  ShoppingBag,
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
  currentTargetId: TargetId;
  onSelectTargetAndGoGarage: (targetId: TargetId) => void;
  onSelectTargetAndGoCheckout: (targetId: TargetId) => void;
}

export const TargetSelectHomeView: React.FC<TargetSelectHomeViewProps> = ({
  currentTargetId,
  onSelectTargetAndGoGarage,
  onSelectTargetAndGoCheckout,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-4 py-1">
      {/* シンプルなタイトルヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-[#00E5FF]">
            <Crosshair className="w-3.5 h-3.5" />
            <span>STEP 01 // SELECT TARGET FISH & FIELD</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-light tracking-wide text-[#FFFFFF] mt-0.5">
            何を釣りに行きますか？
          </h1>
        </div>
        <p className="text-xs font-light text-[#A0A0A0]">
          ターゲット魚種を選択すると、100%物理適合の「推奨タックル」が装備され、次の画面で他パーツとのステータス差を比較できます
        </p>
      </div>

      {/* 3つのターゲット魚種カード（1画面に収まる3カラム） */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {RIG_PRESETS.map((target: TargetFishProfile, idx: number) => {
          const isCurrent = currentTargetId === target.id;
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTargetAndGoGarage(target.id);
                }
              }}
              className={`group rounded-2xl bg-[#222222] p-5 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.015] flex flex-col justify-between ${
                isCurrent
                  ? 'border-2 border-[#00E5FF] shadow-[0_0_24px_rgba(0,229,255,0.35)]'
                  : 'border border-white/10 hover:border-[#00E5FF]/80 hover:shadow-[0_0_20px_rgba(0,229,255,0.25)]'
              }`}
            >
              <div className="space-y-3.5">
                {/* 上部バッジ ＆ 魚種レベル */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#151515] border border-[#00E5FF]/50 text-[#00E5FF] text-[10px] font-semibold tracking-wider">
                    <Waves className="w-3 h-3" />
                    {target.badge}
                  </span>
                  <span className="text-[11px] font-mono text-[#A0A0A0]">
                    LEVEL 0{idx + 1} // {target.weightRange}
                  </span>
                </div>

                {/* 魚種タイトル ＆ 海域 */}
                <div>
                  <h2 className="text-lg sm:text-xl font-normal text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors leading-snug">
                    {target.fishName}
                  </h2>
                  <div className="text-[11px] font-light text-[#A0A0A0] mt-0.5">
                    主なフィールド: {target.field}
                  </div>
                </div>

                {/* 魚の戦闘力パラメータ（ゲームステータス風 3セル） */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-xl bg-[#151515] border border-white/10 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#A0A0A0]">
                      <Zap className="w-3 h-3 text-[#00E5FF]" />
                      <span>初動突っ込み</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#FFFFFF] tabular-nums mt-0.5">
                      時速 {target.strikeSpeedKmh}km
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#151515] border border-white/10 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#A0A0A0]">
                      <Flame className="w-3 h-3 text-[#FF9900]" />
                      <span>初動ドラグ負荷</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#00E5FF] tabular-nums mt-0.5">
                      約 {target.initialRunLoadKg}kg
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#151515] border border-white/10 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[10px] text-[#A0A0A0]">
                      <Activity className="w-3 h-3 text-[#00E5FF]" />
                      <span>1日のキャスト</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-[#FFFFFF] tabular-nums mt-0.5">
                      約 {target.dailyCastCount}投
                    </div>
                  </div>
                </div>

                {/* 魚の習性・攻略条件ボックス（釣る魚を想像させる解説） */}
                <div className="rounded-xl bg-[#151515] border-l-2 border-l-[#00E5FF] border border-white/5 p-3 space-y-1">
                  <div className="text-[10px] font-semibold text-[#00E5FF] tracking-wider flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    <span>FISH BEHAVIOR // この魚の習性と攻略の要</span>
                  </div>
                  <p className="text-[11px] font-light text-[#FFFFFF]/90 leading-relaxed">
                    {target.fishHabit}
                  </p>
                  <p className="text-[10px] font-light text-[#00E5FF]">
                    ★ 捕食ベイト: {target.baitSizeMm}
                  </p>
                </div>

                {/* 自動セットされる推奨タックル一式 */}
                <div className="rounded-xl bg-[#151515]/80 border border-white/10 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] pb-1 border-b border-white/10">
                    <span className="text-[#00E5FF] font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      推奨ベース装備（100%物理適合）
                    </span>
                    <span className="text-[#FFFFFF] tabular-nums font-medium">
                      合計 ¥{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  {[
                    { step: '01 REEL', name: pReel?.shortName },
                    { step: '02 ROD', name: pRod?.shortName },
                    { step: '03 LINE', name: pLine?.shortName },
                    { step: '04 LURE', name: pLure?.shortName },
                  ].map((slot) => (
                    <div
                      key={slot.step}
                      className="flex items-center justify-between text-[11px] gap-2"
                    >
                      <span className="text-[#A0A0A0] font-mono text-[10px] shrink-0">
                        {slot.step}
                      </span>
                      <span className="text-[#FFFFFF] font-light truncate">{slot.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTargetAndGoGarage(target.id);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_24px_rgba(0,229,255,0.7)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>この魚を釣る推奨タックルを見る・比較する</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTargetAndGoCheckout(target.id);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#151515] hover:bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 text-[11px] font-light text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3 h-3 text-[#00E5FF]" />
                  <span>変更せず推奨4点セットのまま購入へ進む</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
