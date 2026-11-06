import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Camera,
  Crosshair,
  Eye,
  Flame,
  Gauge,
  MapPin,
  Maximize2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import {
  ALL_PARTS,
  RIG_PRESETS,
  TargetFishGalleryItem,
  TargetFishProfile,
  TargetId,
} from '../data/rigCatalog';

interface TargetSelectHomeViewProps {
  currentTargetId: TargetId;
  onSelectTargetAndGoGarage: (targetId: TargetId) => void;
  onSelectTargetAndGoCheckout: (targetId: TargetId) => void;
}

// サイト上部やモーダルで一覧できる全6種の海洋リアルフォト図鑑データ
const OCEAN_WILDLIFE_SHOWCASE: {
  id: string;
  targetId: TargetId;
  name: string;
  subLabel: string;
  weightText: string;
  image: string;
  description: string;
}[] = [
  {
    id: 'showcase-hiramasa',
    targetId: 'pe6',
    name: '近海ヒラマサ',
    subLabel: '黄金のストライプ・表層バイト',
    weightText: '10〜20kg級',
    image: './images/fish/target-pe6-hiramasa.jpg',
    description:
      '太陽光を浴びてコバルトブルーの表層を割るヒラマサ。ヒット直後に時速45kmで海底の荒根へ突っ込むため、初動3秒を止める14000番XG＆PE6号が基準となります。',
  },
  {
    id: 'showcase-kihada',
    targetId: 'pe6',
    name: 'キハダマグロ',
    subLabel: '鮮烈な黄金の第二背鰭',
    weightText: '20〜40kg級',
    image: './images/fish/sub-kihada.jpg',
    description:
      '相模湾・三重沖・玄界灘で熱い戦いを繰り広げるキハダマグロ。誘い出しやナブラ撃ちで水面を炸裂させ、強烈な横走りと持久戦でアングラーを試します。',
  },
  {
    id: 'showcase-bluefin',
    targetId: 'pe8',
    name: '大型クロマグロ',
    subLabel: '深淵から突き上げる黒き弾丸',
    weightText: '40〜80kg級',
    image: './images/fish/target-pe8-bluefin.jpg',
    description:
      '泡の渦（キャビテーション）を纏いながら急浮上する大型クロマグロ。18000番リール＆PE8号300m、そして針込112g超のプラグを振り抜くパワーロッドが必須です。',
  },
  {
    id: 'showcase-monster',
    targetId: 'pe10',
    name: '100kg超モンスターマグロ',
    subLabel: '海面大爆発・極限の最終決戦',
    weightText: '80〜150kg超',
    image: './images/fish/target-pe10-monster.jpg',
    description:
      '竜飛崎・松前・離島海域で荒波を割って跳躍する100kg超の怪物。15kg超のドラグ負荷と摩擦熱に耐え抜く20000番リール＆耐熱PE10号だけが許される世界です。',
  },
  {
    id: 'showcase-gt',
    targetId: 'pe10',
    name: 'ロウニンアジ (GT)',
    subLabel: 'シャローリーフの銀鱗鎧武者',
    weightText: '30〜60kg超',
    image: './images/fish/sub-gt.jpg',
    description:
      'サンゴ礁のドロップオフや白波が砕けるリーフエッジを支配するGT（ジャイアントトレバリー）。太軸フックをものともしない圧倒的な顎の力と引きを誇ります。',
  },
  {
    id: 'showcase-nabura',
    targetId: 'pe8',
    name: '沸騰ナブラ＆シイラパターン',
    subLabel: '捕食スイッチを入れるベイト群',
    weightText: '160〜240mm超',
    image: './images/fish/bait-nabura.jpg',
    description:
      'マイワシ・トビウオ・サンマのベイトボールと、逃げ惑うシイラ。その日魚が偏食しているベイトサイズにルアーの全長・波動を合わせることが最大の攻略鍵です。',
  },
];

export const TargetSelectHomeView: React.FC<TargetSelectHomeViewProps> = ({
  currentTargetId,
  onSelectTargetAndGoGarage,
  onSelectTargetAndGoCheckout,
}) => {
  // 各ターゲットカードで現在表示しているギャラリー画像のインデックス
  const [activePhotoIdxByTarget, setActivePhotoIdxByTarget] = useState<Record<TargetId, number>>({
    pe6: 0,
    pe8: 0,
    pe10: 0,
  });

  // ホバー中のターゲットID（背景アンビエント連動用）
  const [hoveredTargetId, setHoveredTargetId] = useState<TargetId | null>(null);

  // 魚体拡大ライトボックスモーダル状態
  const [lightboxData, setLightboxData] = useState<{
    target: TargetFishProfile;
    photo: TargetFishGalleryItem;
  } | null>(null);

  const activeAmbientTarget =
    RIG_PRESETS.find((t) => t.id === (hoveredTargetId ?? currentTargetId)) ?? RIG_PRESETS[0];

  const handleSelectPhoto = (
    e: React.MouseEvent,
    targetId: TargetId,
    photoIdx: number
  ) => {
    e.stopPropagation();
    setActivePhotoIdxByTarget((prev) => ({
      ...prev,
      [targetId]: photoIdx,
    }));
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col justify-between gap-3.5 py-1">
      {/* ==================== 背景アンビエント水中フォトレイヤー ==================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20 transition-opacity duration-700"
      >
        <img
          src={activeAmbientTarget.heroImage}
          alt=""
          className="w-full h-full object-cover scale-110 blur-2xl transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#151515] via-[#151515]/85 to-[#151515]" />
      </div>

      {/* ==================== 上部：タイトル ＆ 海洋魚種・ベイト実写図鑑ストリップ ==================== */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#00E5FF]">
            <Crosshair className="w-3.5 h-3.5 animate-pulse" />
            <span>STEP 01 // SELECT TARGET MONSTER & OCEAN FIELD</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal tracking-wide text-[#FFFFFF] flex flex-wrap items-baseline gap-2.5">
            <span>どのモンスターを釣りに行きますか？</span>
            <span className="text-xs sm:text-sm font-light text-[#00E5FF]">
              — 水面を割る巨魚を選択して100%物理適合タックルを装備 —
            </span>
          </h1>
        </div>

        {/* 右上：6種のリアル水中フォト・クイック図鑑ストリップ */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#00E5FF] shrink-0 px-2 py-1 rounded-lg bg-[#222222] border border-[#00E5FF]/30">
            <Camera className="w-3 h-3" />
            <span>OCEAN GALLERY</span>
          </div>
          {OCEAN_WILDLIFE_SHOWCASE.map((item) => {
            const parentTarget =
              RIG_PRESETS.find((t) => t.id === item.targetId) ?? RIG_PRESETS[0];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setLightboxData({
                    target: parentTarget,
                    photo: {
                      url: item.image,
                      label: `${item.name}（${item.weightText}）`,
                      tag: item.subLabel,
                      caption: item.description,
                    },
                  })
                }
                className="group/thumb relative shrink-0 flex items-center gap-2 pr-2.5 pl-1 py-1 rounded-xl bg-[#222222]/90 hover:bg-[#222222] border border-white/10 hover:border-[#00E5FF] transition-all"
                title={`${item.name}の水中写真を拡大表示`}
              >
                <div className="w-10 h-7 rounded-lg overflow-hidden relative border border-white/15 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-medium text-[#FFFFFF] group-hover/thumb:text-[#00E5FF] transition-colors leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[9px] text-[#A0A0A0] leading-tight">
                    {item.weightText}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== メイン：3つのターゲット魚種・大迫力ビジュアルカード ==================== */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {RIG_PRESETS.map((target: TargetFishProfile, idx: number) => {
          const isCurrent = currentTargetId === target.id;
          const activePhotoIdx = activePhotoIdxByTarget[target.id] ?? 0;
          const activePhoto = target.gallery[activePhotoIdx] ?? target.gallery[0];

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTargetAndGoGarage(target.id);
                }
              }}
              className={`group rounded-2xl bg-[#222222]/95 backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 flex flex-col justify-between ${
                isCurrent
                  ? 'border-2 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.35)]'
                  : 'border border-white/15 hover:border-[#00E5FF]/90 hover:shadow-[0_0_28px_rgba(0,229,255,0.28)]'
              }`}
            >
              <div>
                {/* =========================================================
                    1. 大迫力リアル水中・水面ヒーロービジュアルエリア
                   ========================================================= */}
                <div className="relative h-48 sm:h-56 lg:h-48 xl:h-56 w-full overflow-hidden bg-[#151515]">
                  {/* メイン魚種イメージ画像（ホバーでダイナミックズーム） */}
                  <img
                    src={activePhoto.url}
                    alt={target.fishName}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* 水面の輝き＆下部ダークグラデーションオーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222222] via-[#151515]/35 to-black/30" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.22),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 上部オーバーレイ：推奨基準バッジ ＆ LEVEL・拡大ボタン */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151515]/90 backdrop-blur-md border border-[#00E5FF] text-[#00E5FF] text-[11px] font-bold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                      <Waves className="w-3.5 h-3.5" />
                      {target.badge}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#151515]/85 backdrop-blur-md border border-white/20 text-[10px] font-mono font-semibold text-[#FFFFFF]">
                        LV.0{idx + 1} // {target.weightRange}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxData({ target, photo: activePhoto });
                        }}
                        className="p-1.5 rounded-full bg-[#151515]/85 hover:bg-[#00E5FF] text-[#FFFFFF] hover:text-[#151515] border border-white/20 hover:border-[#00E5FF] transition-colors"
                        title="魚の水中写真を拡大表示"
                        aria-label={`${target.fishName}の写真を拡大表示`}
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 画像下部オーバーレイ：キャッチコピー ＆ 魚種タイトル */}
                  <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-[#00E5FF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      <Sparkles className="w-3 h-3" />
                      <span>{target.catchCopy}</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#FFFFFF] group-hover:text-[#00E5FF] transition-colors leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                      {target.fishName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#FFFFFF]/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#00E5FF]" />
                        {target.field}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    2. マルチアングル水中写真スイッチャー（3枚サムネイル切替）
                   ========================================================= */}
                <div className="px-4 pt-2.5 pb-1 bg-[#1A1A1A] border-b border-white/10">
                  <div className="grid grid-cols-3 gap-2">
                    {target.gallery.map((photo, pIdx) => {
                      const isPhotoActive = activePhotoIdx === pIdx;
                      return (
                        <button
                          key={photo.label}
                          type="button"
                          onClick={(e) => handleSelectPhoto(e, target.id, pIdx)}
                          onMouseEnter={() =>
                            setActivePhotoIdxByTarget((prev) => ({
                              ...prev,
                              [target.id]: pIdx,
                            }))
                          }
                          className={`group/ sub relative rounded-lg overflow-hidden border text-left transition-all flex items-center gap-1.5 p-1 ${
                            isPhotoActive
                              ? 'bg-[#222222] border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                              : 'bg-[#151515]/80 border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-9 h-7 rounded object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[8px] font-mono text-[#00E5FF] truncate leading-tight">
                              {photo.tag}
                            </div>
                            <div className="text-[10px] font-medium text-[#FFFFFF] truncate leading-tight">
                              {photo.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#A0A0A0] mt-1.5 line-clamp-1 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-[#00E5FF] shrink-0" />
                    <span>{activePhoto.caption}</span>
                  </p>
                </div>

                {/* =========================================================
                    3. 魚の戦闘力パラメータ ＆ 捕食ベイト・推奨タックル
                   ========================================================= */}
                <div className="p-4 space-y-3">
                  {/* 魚の戦闘力パラメータ（ゲームステータス風 3セル） */}
                  <div className="grid grid-cols-3 gap-2">
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

                  {/* 魚の習性 ＆ 捕食ベイト実写サムネイル付きボックス */}
                  <div className="rounded-xl bg-[#151515] border-l-2 border-l-[#00E5FF] border border-white/5 p-2.5 flex items-center gap-2.5">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const baitPhoto = target.gallery[2] ?? target.gallery[0];
                        setLightboxData({ target, photo: baitPhoto });
                      }}
                      className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#00E5FF]/40 group/bait"
                      title="捕食ベイト・ナブラの水中写真を拡大"
                    >
                      <img
                        src={(target.gallery[2] ?? target.gallery[0]).url}
                        alt="捕食ベイト"
                        className="w-full h-full object-cover group-hover/bait:scale-110 transition-transform"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-center text-[#00E5FF] font-mono py-0.5">
                        BAIT
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-[10px] font-semibold text-[#00E5FF] tracking-wider flex items-center gap-1">
                        <Gauge className="w-3 h-3 shrink-0" />
                        <span className="truncate">FISH HABIT & BAIT // 習性と捕食ベイト</span>
                      </div>
                      <p className="text-[11px] font-light text-[#FFFFFF]/90 leading-snug line-clamp-2">
                        {target.fishHabit}
                      </p>
                      <p className="text-[10px] font-medium text-[#00E5FF] truncate">
                        ★ 捕食ベイト: {target.baitSizeMm}
                      </p>
                    </div>
                  </div>

                  {/* 自動セットされる推奨タックル一式 */}
                  <div className="rounded-xl bg-[#151515]/90 border border-white/10 p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] pb-1 border-b border-white/10">
                      <span className="text-[#00E5FF] font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        推奨ベース装備（100%物理適合）
                      </span>
                      <span className="text-[#FFFFFF] tabular-nums font-semibold">
                        合計 ¥{totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                      {[
                        { step: '01 REEL', name: pReel?.shortName },
                        { step: '02 ROD', name: pRod?.shortName },
                        { step: '03 LINE', name: pLine?.shortName },
                        { step: '04 LURE', name: pLure?.shortName },
                      ].map((slot) => (
                        <div
                          key={slot.step}
                          className="flex items-center justify-between text-[10px] gap-1 min-w-0"
                        >
                          <span className="text-[#00E5FF] font-mono text-[9px] shrink-0">
                            {slot.step}
                          </span>
                          <span className="text-[#FFFFFF] font-light truncate">
                            {slot.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================
                  4. アクションボタン
                 ========================================================= */}
              <div className="px-4 pb-4 pt-1 space-y-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTargetAndGoGarage(target.id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_24px_rgba(0,229,255,0.75)] transition-all flex items-center justify-center gap-1.5"
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
                  className="w-full py-1.5 px-3 rounded-lg bg-[#151515] hover:bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 text-[11px] font-light text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3 h-3 text-[#00E5FF]" />
                  <span>変更せず推奨4点セットのまま購入へ進む</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ==================== フルスクリーン水中写真ライトボックス（魚体拡大モーダル） ==================== */}
      {lightboxData && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl bg-[#1A1A1A] border-2 border-[#00E5FF] shadow-[0_0_50px_rgba(0,229,255,0.35)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-black">
              <img
                src={lightboxData.photo.url}
                alt={lightboxData.photo.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/40" />

              <button
                type="button"
                onClick={() => setLightboxData(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#151515]/85 hover:bg-[#00E5FF] text-[#FFFFFF] hover:text-[#151515] border border-white/20 transition-colors"
                aria-label="閉じる"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] text-[10px] font-mono font-bold tracking-wider">
                    {lightboxData.photo.tag} // {lightboxData.target.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] drop-shadow-md">
                    {lightboxData.photo.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FFFFFF]/90 max-w-2xl leading-relaxed">
                    {lightboxData.photo.caption}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const targetId = lightboxData.target.id;
                    setLightboxData(null);
                    onSelectTargetAndGoGarage(targetId);
                  }}
                  className="shrink-0 px-5 py-3 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <span>この魚の推奨タックルを見る</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* モーダル下部の他アングル写真サムネイル一覧 */}
            <div className="p-4 bg-[#151515] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-mono text-[#A0A0A0] mr-1">
                  ALL OCEAN PHOTOS:
                </span>
                {OCEAN_WILDLIFE_SHOWCASE.map((item) => {
                  const isSelected = lightboxData.photo.url === item.image;
                  const parentTarget =
                    RIG_PRESETS.find((t) => t.id === item.targetId) ?? RIG_PRESETS[0];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setLightboxData({
                          target: parentTarget,
                          photo: {
                            url: item.image,
                            label: `${item.name}（${item.weightText}）`,
                            tag: item.subLabel,
                            caption: item.description,
                          },
                        })
                      }
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#222222] border-[#00E5FF] text-[#00E5FF]'
                          : 'bg-[#222222]/50 border-white/10 text-[#FFFFFF] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-7 rounded object-cover"
                      />
                      <span className="text-xs font-medium whitespace-nowrap">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
