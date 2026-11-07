import { AmazonLinkTarget } from '../config/amazonAssociate';

// ============================================================================
// 型定義・データモデル
// ============================================================================

export type PartCategory = 'reel' | 'rod' | 'line' | 'lure';
export type TargetId = 'pe6' | 'pe8' | 'pe10';

export interface ReelPart {
  id: string;
  category: 'reel';
  brand: string;
  name: string;
  shortName: string;
  subCode: string;
  price: number;
  image: string;
  sizeClass: 14000 | 18000 | 20000;
  dragMaxKg: number;
  practicalDragKg: number;
  peCapacityNum: number;
  peCapacityMeter: number;
  weightG: number;
  retrieveCm: number;
  gearRatioNum: number;
  gearRatio: string;
  propertyTags: string[];
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export interface RodPart {
  id: string;
  category: 'rod';
  brand: string;
  name: string;
  shortName: string;
  subCode: string;
  price: number;
  image: string;
  compatibleReelSizes: number[];
  maxPe: number;
  minPe: number;
  lureMinG: number;
  lureMaxG: number;
  dragMaxKg: number;
  lengthFt: string;
  lengthInches: number;
  weightG: number;
  propertyTags: string[];
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export interface LinePart {
  id: string;
  category: 'line';
  brand: string;
  name: string;
  shortName: string;
  subCode: string;
  price: number;
  image: string;
  peNumber: number;
  lengthM: number;
  strengthLb: number;
  strengthKg: number;
  pairedLeaderSpec: string;
  pairedLeaderLb: number;
  propertyTags: string[];
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export interface LurePart {
  id: string;
  category: 'lure';
  brand: string;
  name: string;
  shortName: string;
  subCode: string;
  price: number;
  image: string;
  bodyWeightG: number;
  hookRingWeightG: number;
  totalWeightG: number;
  minPe: number;
  lengthMm: number;
  hookSpec: string;
  actionType: string;
  propertyTags: string[];
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export type AnyRigPart = ReelPart | RodPart | LinePart | LurePart;

export interface RigState {
  reel: ReelPart | null;
  rod: RodPart | null;
  line: LinePart | null;
  lure: LurePart | null;
}

export interface TargetFishGalleryItem {
  url: string;
  label: string;
  tag: string;
  caption: string;
}

export interface TargetFishProfile {
  id: TargetId;
  code: string;
  badge: string;
  fishName: string;
  weightRange: string;
  field: string;
  strikeSpeedKmh: number;
  initialRunLoadKg: number;
  dailyCastCount: number;
  baitSizeMm: string;
  fishHabit: string;
  tacticalKey: string;
  summary: string;
  heroImage: string;
  catchCopy: string;
  waterDepthText: string;
  gallery: TargetFishGalleryItem[];
  rigIds: {
    reel: string;
    rod: string;
    line: string;
    lure: string;
  };
}

export type RigPreset = TargetFishProfile;

export const STEP_META: Record<
  PartCategory,
  {
    stepNum: string;
    label: string;
    combatRole: string;
    fullTitle: string;
    shortDesc: string;
  }
> = {
  reel: {
    stepNum: '01',
    label: 'リール',
    combatRole: '魚の猛烈なファーストランを受け止め、主導権を奪う心臓部',
    fullTitle: 'スピニングリール（初期設定とのスペック比較）',
    shortDesc: '14000番〜20000番・ドラグ制動力＆巻上スピード比較',
  },
  rod: {
    stepNum: '02',
    label: 'ロッド',
    combatRole: 'ナブラへルアーを撃ち込み、海底の根から魚を引き剥がす刀',
    fullTitle: 'キャスティングロッド（初期設定とのスペック比較）',
    shortDesc: '飛距離・許容ルアー重量上限・最大ドラグ耐荷重の比較',
  },
  line: {
    stepNum: '03',
    label: 'ライン',
    combatRole: '暴れる巨魚とアングラーを繋ぐ唯一の命綱（スプール100%格納）',
    fullTitle: 'PEライン＆リーダー（初期設定とのスペック比較）',
    shortDesc: '直線強力(lb)・耐熱摩耗性・スプール充填率の比較',
  },
  lure: {
    stepNum: '04',
    label: 'ルアー',
    combatRole: '水面を割らせて捕食スイッチを入れる切り札（針込実戦重量）',
    fullTitle: 'オフショアプラグ＆太軸フック（初期設定とのスペック比較）',
    shortDesc: 'フック込実戦重量・アクション波動・ロッド負荷率の比較',
  },
};

export const CATEGORY_ORDER: PartCategory[] = ['reel', 'rod', 'line', 'lure'];

// ============================================================================
// 厳選マスターカタログデータ（ゲーム装備プロパティタグ＆定量数値付き）
// ============================================================================

export const REEL_CATALOG: ReelPart[] = [
  {
    id: 'reel-stella-14000xg',
    category: 'reel',
    brand: 'シマノ',
    name: '19 ステラ 14000番 エクストラハイギア',
    shortName: '19 ステラ SW 14000XG',
    subCode: '14000番 // 高剛性HAGANE・高速巻上 134cm',
    price: 119300,
    image: './images/gear/reel-stella-14000xg.jpg',
    sizeClass: 14000,
    dragMaxKg: 25,
    practicalDragKg: 18,
    peCapacityNum: 6,
    peCapacityMeter: 300,
    weightG: 675,
    retrieveCm: 134,
    gearRatioNum: 6.2,
    gearRatio: '6.2 (134cm)',
    propertyTags: [
      '高剛性HAGANEボディ',
      '高速回収 134cm/回転',
      'ヒートシンクドラグ放熱',
    ],
    description:
      'PE6号-300m基準のヒラマサ・近海マグロの王道基準機。金属的なダイレクト感と134cmの高速巻上げで、風波の中でもダイビングペンシルのラインスラックを瞬時に回収します。',
    specs: [
      { label: '最大ドラグ力', value: '25kg' },
      { label: '推奨糸巻量', value: '6号-300m' },
      { label: '最大巻上長', value: '134cm / 1回転' },
      { label: '自重', value: '675g' },
    ],
    amazon: {
      asin: 'B07MTZN49N',
      searchQuery: 'シマノ 19 ステラ SW 14000XG',
    },
  },
  {
    id: 'reel-saltiga-14000xh',
    category: 'reel',
    brand: 'ダイワ',
    name: '20 ソルティガ 14000番 エクストラハイギア',
    shortName: '20 ソルティガ 14000-XH',
    subCode: '14000番 // 軽量モノコック・滑らかATDドラグ',
    price: 119900,
    image: './images/gear/reel-saltiga-14000xh.jpg',
    sizeClass: 14000,
    dragMaxKg: 25,
    practicalDragKg: 18,
    peCapacityNum: 6,
    peCapacityMeter: 300,
    weightG: 665,
    retrieveCm: 134,
    gearRatioNum: 6.2,
    gearRatio: '6.2 (134cm)',
    propertyTags: [
      '軽量モノコック (-10g)',
      'ATD初動追従ドラグ',
      '大口径タフデジギア',
    ],
    description:
      'ステラより10g軽い665gのモノコックボディに大口径ギアを搭載。魚の急激な突っ込みに対して初動が滑らかに滑り出すATDドラグにより、船べりでの口切れ・身切れバラシを徹底抑制します。',
    specs: [
      { label: '最大ドラグ力', value: '25kg' },
      { label: '推奨糸巻量', value: '6号-300m' },
      { label: '最大巻上長', value: '134cm / 1回転' },
      { label: '自重', value: '665g' },
    ],
    amazon: {
      asin: 'B083QH4H51',
      searchQuery: 'ダイワ 20 ソルティガ 14000-XH',
    },
  },
  {
    id: 'reel-stella-18000hg',
    category: 'reel',
    brand: 'シマノ',
    name: '20 ステラ 18000番 パワーハイギア',
    shortName: '20 ステラ SW 18000HG',
    subCode: '18000番 // 大型マグロ＆オオマサ制圧トルク',
    price: 130900,
    image: './images/gear/reel-stella-18000hg.jpg',
    sizeClass: 18000,
    dragMaxKg: 28,
    practicalDragKg: 20,
    peCapacityNum: 8,
    peCapacityMeter: 300,
    weightG: 875,
    retrieveCm: 129,
    gearRatioNum: 5.7,
    gearRatio: '5.7 (129cm)',
    propertyTags: [
      'PE8号-300m完全格納',
      '最大ドラグ 28kg制圧',
      'パワーギア比 5.7トルク',
    ],
    description:
      'PE8号-300mをフル格納し、最大ドラグ28kgを叩き出す大型クロマグロ・20kg超オオマサの基準機。ギア比5.7のパワーセッティングで、深場へ突っ込む巨魚を強引に浮かせます。',
    specs: [
      { label: '最大ドラグ力', value: '28kg' },
      { label: '推奨糸巻量', value: '8号-300m' },
      { label: '最大巻上長', value: '129cm / 1回転' },
      { label: '自重', value: '875g' },
    ],
    amazon: {
      asin: 'B083ZTVY13',
      searchQuery: 'シマノ 20 ステラ SW 18000HG',
    },
  },
  {
    id: 'reel-saltiga-20000h',
    category: 'reel',
    brand: 'ダイワ',
    name: '20 ソルティガ 20000番 ハイギア',
    shortName: '20 ソルティガ 20000-H',
    subCode: '20000番 // 100kg超クロマグロ遠征・最大ドラグ30kg',
    price: 141900,
    image: './images/gear/reel-saltiga-20000h.jpg',
    sizeClass: 20000,
    dragMaxKg: 30,
    practicalDragKg: 22,
    peCapacityNum: 10,
    peCapacityMeter: 300,
    weightG: 890,
    retrieveCm: 143,
    gearRatioNum: 5.8,
    gearRatio: '5.8 (143cm)',
    propertyTags: [
      'PE10号-300mモンスター容量',
      '最大ドラグ 30kg＆放熱ノブ',
      '超高速回収 143cm/回転',
    ],
    description:
      'PE10号-300m格納・最大ドラグ30kgを誇る対100kg超クロマグロ決戦兵器。1回転143cmの巻上長により、こちらへ向かって泳ぐマグロのラインスラックも遅れず回収しフッキングへ持ち込みます。',
    specs: [
      { label: '最大ドラグ力', value: '30kg' },
      { label: '推奨糸巻量', value: '10号-300m' },
      { label: '最大巻上長', value: '143cm / 1回転' },
      { label: '自重', value: '890g' },
    ],
    amazon: {
      asin: 'B083QH5DDG',
      searchQuery: 'ダイワ 20 ソルティガ 20000-H',
    },
  },
];

export const ROD_CATALOG: RodPart[] = [
  {
    id: 'rod-aquila-82-36',
    category: 'rod',
    brand: 'リップルフィッシャー',
    name: 'アクイラ 82-3/6（テクニカルモデル）',
    shortName: 'アクイラ MLT 82-3/6',
    subCode: '8\'2" (346g) // 3番ティップ追従 × 6番バットパワー',
    price: 78100,
    image: './images/gear/rod-aquila-82-36.jpg',
    compatibleReelSizes: [14000],
    minPe: 3,
    maxPe: 6,
    lureMinG: 40,
    lureMaxG: 110,
    dragMaxKg: 11,
    lengthFt: '8フィート2インチ',
    lengthInches: 98,
    weightG: 346,
    propertyTags: [
      '超軽量 346g（疲労軽減）',
      '3番ティップ喰わせ追従',
      '小型〜中型プラグ高精度狙撃',
    ],
    description:
      '346gの圧倒的な軽さで1日300投してもスイングが鈍らないテクニカルロッド。3番クラスの繊細なティップが水面直下のプラグを弾かず泳がせ、ヒット後は6番バットで20kg級を受け止めます。',
    specs: [
      { label: '適合ライン', value: '3〜6号' },
      { label: '適合ルアー重量', value: '40〜110g' },
      { label: '最大ドラグ負荷', value: '11kg (45°)' },
      { label: '推奨リール番手', value: '14000番' },
    ],
    amazon: {
      asin: 'B07YKVBZYL',
      searchQuery: 'リップルフィッシャー アクイラ MLT 82-3/6',
    },
  },
  {
    id: 'rod-explosion-865hf',
    category: 'rod',
    brand: 'エムシーワークス',
    name: 'エクスプロージョン 865（フルコンタクト）',
    shortName: 'エクスプロージョン 865HF',
    subCode: '8\'6" (375g) // ロングキャスト遠投 × 許容130g',
    price: 69300,
    image: './images/gear/rod-explosion-865hf.jpg',
    compatibleReelSizes: [14000, 18000],
    minPe: 5,
    maxPe: 8,
    lureMinG: 60,
    lureMaxG: 130,
    dragMaxKg: 15,
    lengthFt: '8フィート6インチ',
    lengthInches: 102,
    weightG: 375,
    propertyTags: [
      '8\'6" ロングリーチ遠投',
      'ルアー上限 130g（大型プラグ対応）',
      '14000/18000番スイッチ対応',
    ],
    description:
      '8フィート6インチの長尺ブランクスにより遠いナブラへルアーを届ける遠投モデル。ルアー上限130g・最大ドラグ15kgを備え、PE6号からPE8号クラスまで1本でカバーします。',
    specs: [
      { label: '適合ライン', value: '5〜8号' },
      { label: '適合ルアー重量', value: '60〜130g' },
      { label: '最大ドラグ負荷', value: '15kg (45°)' },
      { label: '推奨リール番手', value: '14000番 / 18000番' },
    ],
    amazon: {
      asin: 'B0GFTF71L4',
      searchQuery: 'MCワークス エクスプロージョン 865HF',
    },
  },
  {
    id: 'rod-ultimo-83m',
    category: 'rod',
    brand: 'リップルフィッシャー',
    name: 'ウルティモ 83 ナノ（大型ヒラマサモデル）',
    shortName: 'ウルティモ 83M Nano',
    subCode: '8\'3" (388g) // ナノアロイ高反発リフト・許容150g',
    price: 83600,
    image: './images/gear/rod-ultimo-83m.jpg',
    compatibleReelSizes: [14000, 18000],
    minPe: 6,
    maxPe: 8,
    lureMinG: 70,
    lureMaxG: 150,
    dragMaxKg: 16,
    lengthFt: '8フィート3インチ',
    lengthInches: 99,
    weightG: 388,
    propertyTags: [
      '東レ・ナノアロイ高反発復元力',
      '最大ドラグ 16kg（根剥がし特化）',
      'ルアー上限 150g（バズー/ゾロ対応）',
    ],
    description:
      'ナノアロイ技術採用の高反発ブランクスにより、針込110〜145gの大型プラグを空気を切り裂くようにキャスト可能。ヒット直後に16kgドラグ耐荷重で巨魚の頭を強制的に上へ向けます。',
    specs: [
      { label: '適合ライン', value: '6〜8号' },
      { label: '適合ルアー重量', value: '70〜150g' },
      { label: '最大ドラグ負荷', value: '16kg (45°)' },
      { label: '推奨リール番手', value: '14000番 / 18000番' },
    ],
    amazon: {
      asin: 'B084T5T25P',
      searchQuery: 'リップルフィッシャー ウルティモ 83M Nano',
    },
  },
  {
    id: 'rod-bigtuna-83',
    category: 'rod',
    brand: 'リップルフィッシャー',
    name: 'ビッグツナ 83 ジャパンスペシャル',
    shortName: 'ビッグツナ 83 JAPAN SP',
    subCode: '8\'3" (440g) // 対100kg超クロマグロ垂直リフト設計',
    price: 86900,
    image: './images/gear/rod-bigtuna-83.jpg',
    compatibleReelSizes: [18000, 20000],
    minPe: 8,
    maxPe: 12,
    lureMinG: 70,
    lureMaxG: 180,
    dragMaxKg: 18,
    lengthFt: '8フィート3インチ',
    lengthInches: 99,
    weightG: 440,
    propertyTags: [
      '最大ドラグ 18kg（100kg超対応）',
      'スタンドアップ支点手元設計',
      'ルアー上限 180g（超大型ベイト対応）',
    ],
    description:
      '真下に潜行する100kg超クロマグロに対し、ロッドの支点がアングラーのグリップ側に寄る設計で、体幹を使って少ない消耗で巨魚をリフトアップできる日本海・津軽海峡の決定版。',
    specs: [
      { label: '適合ライン', value: '8〜12号' },
      { label: '適合ルアー重量', value: '70〜180g' },
      { label: '最大ドラグ負荷', value: '18kg (45°)' },
      { label: '推奨リール番手', value: '18000番 / 20000番' },
    ],
    amazon: {
      asin: 'B084T6647B',
      searchQuery: 'リップルフィッシャー ビッグツナ 83 ジャパンスペシャル',
    },
  },
];

export const LINE_CATALOG: LinePart[] = [
  {
    id: 'line-varivas-smp-pe6',
    category: 'line',
    brand: 'バリバス',
    name: 'アバニ キャスティングライン 6号 (300m)',
    shortName: 'バリバス SMP PE6号 (90lb)',
    subCode: 'PE6号-300m // 自動セット: 130lbショックリーダー',
    price: 16830,
    image: './images/gear/line-varivas-smp-pe6.jpg',
    peNumber: 6,
    lengthM: 300,
    strengthLb: 90,
    strengthKg: 40.8,
    pairedLeaderSpec: 'オーシャンレコード 130ポンド（推奨ペア）',
    pairedLeaderLb: 130,
    propertyTags: [
      '14000番スプール100%格納',
      '細径6号で向かい風でも飛距離UP',
      '130lbリーダー自動結束ペア',
    ],
    description:
      '14000番スプールに下巻き不要で300mジャスト格納。細径PE6号ならではの空気抵抗の少なさで飛距離を伸ばしつつ、90lb（40.8kg）の直線強力で20〜30kg級と対峙します。',
    specs: [
      { label: '号数・長さ', value: '6号-300m' },
      { label: '最大直線強力', value: '90ポンド (40.8kg)' },
      { label: '適合リーダー', value: '130ポンド 自動ペア' },
      { label: 'スプール適合', value: '14000番 (充填100%)' },
    ],
    amazon: {
      asin: 'B004Q7LVSS',
      searchQuery: 'バリバス アバニ キャスティングPE SMP 6号 300m',
      subItemAsin: 'B07C4TX2ZM',
      subItemLabel: '適合ショックリーダー：バリバス オーシャンレコード 130lb',
      subItemQuery: 'バリバス オーシャンレコード ショックリーダー 130lb',
    },
  },
  {
    id: 'line-ygk-oddport-pe8',
    category: 'line',
    brand: 'エックスブレイド',
    name: 'オッズポート 8本組ライン 8号 (300m)',
    shortName: 'オッズポート PE8号 (120lb)',
    subCode: 'PE8号-300m // 自動セット: 170lbショックリーダー',
    price: 18920,
    image: './images/gear/line-ygk-oddport-pe8.jpg',
    peNumber: 8,
    lengthM: 300,
    strengthLb: 120,
    strengthKg: 54.4,
    pairedLeaderSpec: 'オーシャンレコード 170ポンド（推奨ペア）',
    pairedLeaderLb: 170,
    propertyTags: [
      '18000番スプール100%格納',
      '高負荷でも潰れない中芯WX構造',
      '170lb極太リーダー自動ペア',
    ],
    description:
      '18000番スプールに300mジャスト格納。中芯入りWX組工法により15kg超ドラグ負荷でもラインが偏平せず、120lb（54.4kg）の圧倒的強度で大型クロマグロ・オオマサの瀬ズレを防ぎます。',
    specs: [
      { label: '号数・長さ', value: '8号-300m' },
      { label: '最大直線強力', value: '120ポンド (54.4kg)' },
      { label: '適合リーダー', value: '170ポンド 自動ペア' },
      { label: 'スプール適合', value: '18000番 (充填100%)' },
    ],
    amazon: {
      asin: 'B0CVR5JV9B',
      searchQuery: 'エックスブレイド オッズポート WXP1 8 8号 300m',
      subItemAsin: 'B07C4NCJTQ',
      subItemLabel: '適合ショックリーダー：バリバス オーシャンレコード 170lb',
      subItemQuery: 'バリバス オーシャンレコード ショックリーダー 170lb',
    },
  },
  {
    id: 'line-varivas-six-pe10',
    category: 'line',
    brand: 'バリバス',
    name: 'アバニ マグロ耐熱ライン 10号 (300m)',
    shortName: 'バリバス Si-X PE10号 (140lb)',
    subCode: 'PE10号-300m // 自動セット: 220lbショックリーダー',
    price: 20460,
    image: './images/gear/line-varivas-six-pe10.jpg',
    peNumber: 10,
    lengthM: 300,
    strengthLb: 140,
    strengthKg: 63.5,
    pairedLeaderSpec: 'オーシャンレコード 220ポンド（推奨ペア）',
    pairedLeaderLb: 220,
    propertyTags: [
      '20000番スプール100%格納',
      'Si-X特殊耐熱繊維（摩擦熱破断防止）',
      '220lbモンスターリーダー自動ペア',
    ],
    description:
      '20000番スプールに300m完全格納。100kg超クロマグロが時速60kmで200m疾走した際に発生するガイド・スプール摩擦熱に耐える特殊耐熱繊維Si-X採用の最高峰ライン。',
    specs: [
      { label: '号数・長さ', value: '10号-300m' },
      { label: '最大直線強力', value: '140ポンド (63.5kg)' },
      { label: '適合リーダー', value: '220ポンド 自動ペア' },
      { label: 'スプール適合', value: '20000番 (充填100%)' },
    ],
    amazon: {
      asin: 'B01CSEV0D6',
      searchQuery: 'バリバス アバニ キャスティングPE Si-X 10号 300m',
      subItemAsin: 'B07C4NZV1S',
      subItemLabel: '適合ショックリーダー：バリバス オーシャンレコード 220lb',
      subItemQuery: 'バリバス オーシャンレコード ショックリーダー 220lb',
    },
  },
];

export const LURE_CATALOG: LurePart[] = [
  {
    id: 'lure-cbone-ryan-200',
    category: 'lure',
    brand: 'シービーワン',
    name: 'ライアン 200（太軸 3/0号 フック＆リング推奨）',
    shortName: 'CB ONE ライアン 200 (針込96.5g)',
    subCode: '全長200mm // 本体85g ＋ 太軸#3/0金具 11.5g ＝ 96.5g',
    price: 13860,
    image: './images/gear/lure-cbone-ryan-200.jpg',
    bodyWeightG: 85,
    hookRingWeightG: 11.5,
    totalWeightG: 96.5,
    minPe: 5,
    lengthMm: 200,
    hookSpec: '太軸 3/0号 ＋ 強化リング 9番',
    actionType: '強波動ウォブリング＆泡噛みダイブ',
    propertyTags: [
      '実戦総重量 96.5g（上限110g竿に最適）',
      '荒天・高波でも飛び出さない安定ダイブ',
      '広範囲の魚を浮かせる強波動ロール',
    ],
    description:
      '本体85gにST-66 #3/0前後＋強化リング（11.5g）を装着した実戦重量96.5g。強い水押しとウォブリングで、深場のヒラマサやキハダを水面まで引きずり出すパイロットルアー。',
    specs: [
      { label: '実戦総重量', value: '96.5g (針・リング込)' },
      { label: '本体単体重量', value: '85.0g (全長200mm)' },
      { label: '適合フック', value: '3/0号規格 (+11.5g)' },
      { label: '推奨ライン', value: '5号以上' },
    ],
    amazon: {
      asin: 'B0HHFB94L4',
      searchQuery: 'CB ONE ライアン 200',
      subItemAsin: 'B018NKHGFA',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #3/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 3/0',
    },
  },
  {
    id: 'lure-carpenter-gamma-90',
    category: 'lure',
    brand: 'カーペンター',
    name: 'ガンマ 90-特選モデル（太軸 3/0号 フック推奨）',
    shortName: 'カーペンター ガンマ 90 (針込86.5g)',
    subCode: '全長200mm // 本体75g ＋ 太軸#3/0金具 11.5g ＝ 86.5g',
    price: 15400,
    image: './images/gear/lure-carpenter-gamma-90.jpg',
    bodyWeightG: 75,
    hookRingWeightG: 11.5,
    totalWeightG: 86.5,
    minPe: 5,
    lengthMm: 200,
    hookSpec: '太軸 3/0号 ＋ 強化リング 9番',
    actionType: '高速S字スライド＆ナチュラル喰わせ',
    propertyTags: [
      '実戦総重量 86.5g（-10g軽快スイング）',
      '見切らせないキレのあるS字ダート',
      'ベイトが小さい日・スレた魚に抜群',
    ],
    description:
      'ライアン200より実戦重量が10g軽い86.5g。ロッド負荷が軽く鋭い振り抜きが可能で、水面直下を逃惑うトビウオ・サンマを演出するスライドアクションがスレた大物に口を使わせます。',
    specs: [
      { label: '実戦総重量', value: '86.5g (針・リング込)' },
      { label: '本体単体重量', value: '75.0g (全長200mm)' },
      { label: '適合フック', value: '3/0号規格 (+11.5g)' },
      { label: '推奨ライン', value: '5号以上' },
    ],
    amazon: {
      asin: 'B0FPC57N19',
      searchQuery: 'カーペンター ガンマ 90',
      subItemAsin: 'B018NKHGFA',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #3/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 3/0',
    },
  },
  {
    id: 'lure-cbone-bazoo-200',
    category: 'lure',
    brand: 'シービーワン',
    name: 'バズー 200（太軸 4/0号 フック＆リング推奨）',
    shortName: 'CB ONE バズー 200 (針込112.0g)',
    subCode: '全長200mm // 本体96g ＋ 太軸#4/0金具 16.0g ＝ 112.0g',
    price: 14960,
    image: './images/gear/lure-cbone-bazoo-200.jpg',
    bodyWeightG: 96,
    hookRingWeightG: 16.0,
    totalWeightG: 112.0,
    minPe: 6,
    lengthMm: 200,
    hookSpec: '太軸 4/0号 ＋ 強化リング 10番',
    actionType: '爆発的スプラッシュ＆重低音ポップサウンド',
    propertyTags: [
      '実戦総重量 112.0g（※要130g上限以上の竿）',
      '太軸#4/0フック搭載で大型マグロ対応',
      '泡と重低音で深場のモンスターを強制浮上',
    ],
    description:
      '本体96g＋太軸#4/0フック（16g）で実戦総重量112.0g。上限110gロッドでは2g重量超過となるため130g以上のパワーロッドが必須。強烈な泡と音で40〜80kg級マグロ・オオマサを狂わせます。',
    specs: [
      { label: '実戦総重量', value: '112.0g (針・リング込)' },
      { label: '本体単体重量', value: '96.0g (全長200mm)' },
      { label: '適合フック', value: '4/0号規格 (+16.0g)' },
      { label: '推奨ライン', value: '6号以上' },
    ],
    amazon: {
      asin: 'B0HHF2W8MF',
      searchQuery: 'CB ONE バズー 200',
      subItemAsin: 'B018NKIJTM',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #4/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 4/0',
    },
  },
  {
    id: 'lure-cbone-zorro-240',
    category: 'lure',
    brand: 'シービーワン',
    name: 'ゾロ 240 モンスター仕様（太軸 5/0号 フック推奨）',
    shortName: 'CB ONE ゾロ 240 (針込141.0g)',
    subCode: '全長240mm // 本体120g ＋ 太軸#5/0金具 21.0g ＝ 141.0g',
    price: 16720,
    image: './images/gear/lure-cbone-zorro-240.jpg',
    bodyWeightG: 120,
    hookRingWeightG: 21.0,
    totalWeightG: 141.0,
    minPe: 8,
    lengthMm: 240,
    hookSpec: '太軸 5/0号 ＋ 強化リング 11番',
    actionType: '240mmビッグベイト波動＆対100kg超マグロ仕様',
    propertyTags: [
      '実戦総重量 141.0g（150g〜180g上限竿専用）',
      '極太#5/0フック＆#11リング完全武装',
      'シイラ・大サバ捕食時の100kg超マグロ特効',
    ],
    description:
      '全長240mm、実戦総重量141.0gのモンスタープラグ。シイラや大型サンマを偏食する80〜150kg超のクロマグロ・超大型ヒラマサが、小型ルアーを無視する状況で唯一反応する切り札です。',
    specs: [
      { label: '実戦総重量', value: '141.0g (針・リング込)' },
      { label: '本体単体重量', value: '120.0g (全長240mm)' },
      { label: '適合フック', value: '5/0号規格 (+21.0g)' },
      { label: '推奨ライン', value: '8号以上' },
    ],
    amazon: {
      asin: 'B0GQ2VRQN6',
      searchQuery: 'CB ONE ゾロ 240',
      subItemAsin: 'B093DBZRL2',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #5/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 5/0',
    },
  },
];

export const ALL_PARTS: AnyRigPart[] = [
  ...REEL_CATALOG,
  ...ROD_CATALOG,
  ...LINE_CATALOG,
  ...LURE_CATALOG,
];

// ============================================================================
// ターゲット魚種プロファイル（ホームで選択する3大ターゲット）
// ============================================================================

export const RIG_PRESETS: TargetFishProfile[] = [
  {
    id: 'pe6',
    code: 'TARGET 01 // NEARSHORE KINGFISH & YELLOWFIN',
    badge: 'PE6号・14000番基準',
    fishName: '近海ヒラマサ (10〜20kg) ＆ キハダマグロ (20〜40kg)',
    weightRange: '10〜40kgクラス',
    field: '玄界灘・五島列島・外房・相模湾・三重沖',
    strikeSpeedKmh: 45,
    initialRunLoadKg: 10,
    dailyCastCount: 300,
    baitSizeMm: '160〜200mm (トビウオ・マイワシ・サンマ)',
    fishHabit:
      'ヒット直後に時速45kmで海底の荒根へ突っ込む。1日300投の誘い出しで集中力を切らさず、初動3秒を止められるかが勝負。',
    tacticalKey: '1日中振り抜ける「総重量の軽さ」と「ドラグ10kg領域の初動追従性」',
    summary:
      '14000番XGリール＋PE6号300m完全格納。針込96.5gの200mmプラグを軽快に振り抜き、不意の20kg級ヒラマサも主導権を渡さず獲る黄金構成。',
    heroImage: './images/fish/target-pe6-hiramasa.jpg',
    catchCopy: '水面を割る黄金のストライプ。初動3秒の根ズレを制圧せよ。',
    waterDepthText: '水深 15〜60m // 表層ナブラ＆荒根カケアガリ',
    gallery: [
      {
        url: './images/fish/target-pe6-hiramasa.jpg',
        label: 'ヒラマサ＆キハダ 表層捕食',
        tag: 'MAIN TARGET',
        caption: 'トビウオを追い詰める大型ヒラマサとキハダマグロ。水しぶきが上がる瞬間の正確なキャストが勝負を分ける。',
      },
      {
        url: './images/fish/sub-kihada.jpg',
        label: 'キハダマグロ (20〜40kg)',
        tag: 'YELLOWFIN',
        caption: '黄金の第二背鰭をなびかせて回遊するキハダマグロ。ヒット後の疾走をATD/ヒートシンクドラグでいなす。',
      },
      {
        url: './images/fish/bait-nabura.jpg',
        label: '捕食ベイト・ナブラ沸騰',
        tag: 'BAIT BALL',
        caption: '水面下で渦巻くマイワシ・トビウオのベイトボールとシイラ。160〜200mmプラグが完全にシンクロする。',
      },
    ],
    rigIds: {
      reel: 'reel-stella-14000xg',
      rod: 'rod-aquila-82-36',
      line: 'line-varivas-smp-pe6',
      lure: 'lure-cbone-ryan-200',
    },
  },
  {
    id: 'pe8',
    code: 'TARGET 02 // HEAVY BLUEFIN TUNA & GIANT KINGFISH',
    badge: 'PE8号・18000番基準',
    fishName: '大型クロマグロ (40〜80kg) ＆ オオマサ (20〜30kg超)',
    weightRange: '40〜80kgクラス',
    field: '津軽海峡・丹後半島・壱岐対馬・男女群島',
    strikeSpeedKmh: 55,
    initialRunLoadKg: 14,
    dailyCastCount: 200,
    baitSizeMm: '200〜220mm (大型サンマ・シイラ・スルメイカ)',
    fishHabit:
      '100m以上の暴力的なファーストランと激しい首振りで針を伸ばし根へ走る。中途半端な6号タックルでは太刀打ちできない領域。',
    tacticalKey: '針込112g超の大型プラグを飛ばす「反発力」と「14kg負荷で根から剥がす剛性」',
    summary:
      '18000番HGリール＋PE8号300m完全格納。ナノアロイ採用のウルティモ83Mと針込112gのバズー200で大型魚を強引に浮かせ切るパワー構成。',
    heroImage: './images/fish/target-pe8-bluefin.jpg',
    catchCopy: '深淵から急浮上する黒き弾丸。時速55kmの暴力的なファーストラン。',
    waterDepthText: '水深 40〜150m // 急潮流の潮目＆ディープ誘い出し',
    gallery: [
      {
        url: './images/fish/target-pe8-bluefin.jpg',
        label: '大型クロマグロ 急浮上バイト',
        tag: 'BLUEFIN TUNA',
        caption: '泡の渦を纏いながら海面へ突き上げる40〜80kg級クロマグロ。バズー200の重低音スプラッシュで強制浮上させる。',
      },
      {
        url: './images/fish/target-pe6-hiramasa.jpg',
        label: '20〜30kg超 オオマサ',
        tag: 'GIANT KINGFISH',
        caption: '玄界灘・男女群島の荒根に潜む20kgオーバーの巨体オオマサ。ドラグ14kg領域のガチンコ勝負が求められる。',
      },
      {
        url: './images/fish/bait-nabura.jpg',
        label: '大型シイラ・サンマ捕食',
        tag: 'HEAVY BAIT',
        caption: '秋〜冬の大型魚が偏食するシイラや大型サンマ。太軸#4/0フックを搭載した200mm超プラグが必須。',
      },
    ],
    rigIds: {
      reel: 'reel-stella-18000hg',
      rod: 'rod-ultimo-83m',
      line: 'line-ygk-oddport-pe8',
      lure: 'lure-cbone-bazoo-200',
    },
  },
  {
    id: 'pe10',
    code: 'TARGET 03 // 100KG+ MONSTER BLUEFIN EXPEDITION',
    badge: 'PE10号・20000番基準',
    fishName: '100kg超モンスタークロマグロ ＆ 離島遠征GT',
    weightRange: '80〜150kg超クラス',
    field: '竜飛崎・北海道松前・トカラ列島・海外遠征',
    strikeSpeedKmh: 65,
    initialRunLoadKg: 17,
    dailyCastCount: 150,
    baitSizeMm: '240mm超 (大型シイラ・大サバ・ダツ)',
    fishHabit:
      '15kg超のドラグを鳴らし続けながら深場へ垂直潜行し、摩擦熱でラインを焼き切る。アングラーの体力とタックル限界が試される極限戦。',
    tacticalKey: '摩擦熱を防ぐ「耐熱PE10号＋放熱20000番」と「体重を乗せてリフトする支点設計」',
    summary:
      '20000番リール＋耐熱PE10号300mフル格納。針込141gの240mmモンスタープラグとスタンドアップ専用ロッドで100kg超を獲る決戦構成。',
    heroImage: './images/fish/target-pe10-monster.jpg',
    catchCopy: '海面が大爆発する極限の海域。100kg超の怪物と真っ向勝負。',
    waterDepthText: '水深 10〜200m+ // 激流海峡＆シャローリーフエッジ',
    gallery: [
      {
        url: './images/fish/target-pe10-monster.jpg',
        label: '100kg超モンスター＆GT 水面炸裂',
        tag: 'MONSTER BOIL',
        caption: '荒波を割って跳躍する100kg超のモンスタークロマグロとGT。20000番リールとPE10号だけが許される極限の戦場。',
      },
      {
        url: './images/fish/sub-gt.jpg',
        label: '離島遠征 ロウニンアジ (GT)',
        tag: 'GIANT TREVALLY',
        caption: 'トカラ列島や南西諸島のシャローリーフを支配する鎧武者GT（ロウニンアジ）。一瞬の隙も許されない超パワーファイト。',
      },
      {
        url: './images/fish/target-pe8-bluefin.jpg',
        label: '垂直潜行する100kg超クロマグロ',
        tag: 'ABYSS DIVE',
        caption: 'ヒット後にドラグ17kgを引き出しながら深海へ疾走する巨体。耐熱SI-Xラインと放熱スプールが命綱となる。',
      },
    ],
    rigIds: {
      reel: 'reel-saltiga-20000h',
      rod: 'rod-bigtuna-83',
      line: 'line-varivas-six-pe10',
      lure: 'lure-cbone-zorro-240',
    },
  },
];

// ============================================================================
// 物理互換性判定・検索ヘルパー
// ============================================================================

export function findPartById(id: string | null | undefined): AnyRigPart | null {
  if (!id) return null;
  return ALL_PARTS.find((p) => p.id === id) ?? null;
}

export function getTargetProfile(targetId: TargetId): TargetFishProfile {
  return RIG_PRESETS.find((p) => p.id === targetId) ?? RIG_PRESETS[0];
}

export function getPresetRigState(presetId: TargetId): RigState {
  const preset = getTargetProfile(presetId);
  return {
    reel: (findPartById(preset.rigIds.reel) as ReelPart) ?? REEL_CATALOG[0],
    rod: (findPartById(preset.rigIds.rod) as RodPart) ?? ROD_CATALOG[0],
    line: (findPartById(preset.rigIds.line) as LinePart) ?? LINE_CATALOG[0],
    lure: (findPartById(preset.rigIds.lure) as LurePart) ?? LURE_CATALOG[0],
  };
}

export function checkPartCompatibility(
  part: AnyRigPart,
  rig: RigState
): { compatible: boolean; reason: string } {
  if (part.category === 'reel') {
    if (rig.rod && !rig.rod.compatibleReelSizes.includes(part.sizeClass)) {
      return {
        compatible: false,
        reason: `選択中ロッドの推奨番手（${rig.rod.compatibleReelSizes.join('番/')}番）と不一致`,
      };
    }
    if (rig.line && part.peCapacityNum !== rig.line.peNumber) {
      return {
        compatible: false,
        reason: `選択中ライン（${rig.line.peNumber}号-300m）の糸巻量とスプール容量が不一致`,
      };
    }
    return {
      compatible: true,
      reason: 'スプール糸巻量・リールシート完全適合',
    };
  }

  if (part.category === 'rod') {
    if (rig.reel && !part.compatibleReelSizes.includes(rig.reel.sizeClass)) {
      return {
        compatible: false,
        reason: `選択中リール（${rig.reel.sizeClass}番）のリールフット・ガイド角度に非対応`,
      };
    }
    if (rig.line && (rig.line.peNumber < part.minPe || rig.line.peNumber > part.maxPe)) {
      return {
        compatible: false,
        reason: `選択中ライン（${rig.line.peNumber}号）がロッド適合範囲（${part.minPe}〜${part.maxPe}号）外`,
      };
    }
    if (
      rig.lure &&
      (rig.lure.totalWeightG < part.lureMinG || rig.lure.totalWeightG > part.lureMaxG)
    ) {
      return {
        compatible: false,
        reason: `フック込ルアー重量（${rig.lure.totalWeightG}g）がロッド上限（${part.lureMaxG}g）を超過`,
      };
    }
    return {
      compatible: true,
      reason: 'ブランクス耐荷重・ガイドシステム完全適合',
    };
  }

  if (part.category === 'line') {
    if (rig.reel && rig.reel.peCapacityNum !== part.peNumber) {
      return {
        compatible: false,
        reason: `${rig.reel.sizeClass}番スプール（${rig.reel.peCapacityNum}号-300m設計）に対して容量過不足`,
      };
    }
    if (rig.rod && (part.peNumber < rig.rod.minPe || part.peNumber > rig.rod.maxPe)) {
      return {
        compatible: false,
        reason: `選択中ロッドの許容ライン号数（${rig.rod.minPe}〜${rig.rod.maxPe}号）の範囲外`,
      };
    }
    if (rig.lure && part.peNumber < rig.lure.minPe) {
      return {
        compatible: false,
        reason: `選択中プラグの推奨ライン下限（${rig.lure.minPe}号以上）に不足`,
      };
    }
    return {
      compatible: true,
      reason: 'スプール充填率100%（下巻き不要・ジャスト格納）',
    };
  }

  if (rig.rod && (part.totalWeightG < rig.rod.lureMinG || part.totalWeightG > rig.rod.lureMaxG)) {
    return {
      compatible: false,
      reason: `フック込実戦重量 ${part.totalWeightG}g がロッド許容範囲（${rig.rod.lureMinG}〜${rig.rod.lureMaxG}g）を超過`,
    };
  }
  if (rig.line && rig.line.peNumber < part.minPe) {
    return {
      compatible: false,
      reason: `高切れ防止のため ${part.minPe}号以上のラインが必要です`,
    };
  }
  return {
    compatible: true,
    reason: `スイートスポット完全適合（フック込総重量 ${part.totalWeightG}g）`,
  };
}

// ============================================================================
// ゲーム装備ステータス比較エンジン（数値Δゲージ ＆ 釣る魚への実戦変化解説）
// ============================================================================

export interface StatDeltaRow {
  label: string;
  baseValText: string;
  candValText: string;
  basePct: number;
  candPct: number;
  deltaBadge: string;
  tone: 'up' | 'down' | 'neutral';
}

export interface PartComparisonReport {
  isSameAsBase: boolean;
  statRows: StatDeltaRow[];
  priceDeltaText: string;
  priceDeltaTone: 'up' | 'down' | 'neutral';
  fishFightHeadline: string;
  fishFightNarrative: string;
  cascadeNotice: string | null;
}

function clampPct(val: number): number {
  return Math.max(8, Math.min(100, Math.round(val)));
}

/**
 * ターゲット魚種の「推奨ベースパーツ (basePart)」と「比較対象パーツ (candidatePart)」を比較し、
 * ゲーム風ステータスバー用の数値Δと「その魚とのファイトで何が変わるか」の文章を生成する
 */
export function comparePartAgainstRecommended(
  basePart: AnyRigPart,
  candidatePart: AnyRigPart,
  target: TargetFishProfile,
  currentRig: RigState
): PartComparisonReport {
  const isSame = basePart.id === candidatePart.id;
  const priceDiff = candidatePart.price - basePart.price;
  const priceDeltaText =
    priceDiff === 0
      ? '±¥0 (同価格)'
      : priceDiff > 0
      ? `+¥${priceDiff.toLocaleString()}`
      : `-¥${Math.abs(priceDiff).toLocaleString()} お得`;
  const priceDeltaTone: 'up' | 'down' | 'neutral' =
    priceDiff === 0 ? 'neutral' : priceDiff < 0 ? 'up' : 'down';

  const { compatible, reason } = checkPartCompatibility(candidatePart, currentRig);
  const cascadeNotice = compatible
    ? null
    : `※注意：${reason}（このパーツを使う場合は他スロットも対応番手へ変更が必要です）`;

  // -------------------- 01. リール比較 --------------------
  if (basePart.category === 'reel' && candidatePart.category === 'reel') {
    const wtDiff = candidatePart.weightG - basePart.weightG;
    const dragDiff = candidatePart.dragMaxKg - basePart.dragMaxKg;
    const retDiff = candidatePart.retrieveCm - basePart.retrieveCm;
    const dailyCastKgDiff = ((wtDiff * target.dailyCastCount) / 1000).toFixed(1);

    const statRows: StatDeltaRow[] = [
      {
        label: 'STOPPING DRAG (最大ドラグ制動力)',
        baseValText: `${basePart.dragMaxKg}kg`,
        candValText: `${candidatePart.dragMaxKg}kg`,
        basePct: clampPct((basePart.dragMaxKg / 32) * 100),
        candPct: clampPct((candidatePart.dragMaxKg / 32) * 100),
        deltaBadge:
          dragDiff === 0
            ? '±0kg 同等'
            : dragDiff > 0
            ? `▲ +${dragDiff}kg 制動力UP`
            : `▼ ${dragDiff}kg`,
        tone: dragDiff > 0 ? 'up' : dragDiff < 0 ? 'down' : 'neutral',
      },
      {
        label: 'AGILITY / LIGHTNESS (自重の軽快さ)',
        baseValText: `${basePart.weightG}g`,
        candValText: `${candidatePart.weightG}g`,
        // 軽いほどバーが高い表現ではなく実重量比＋軽量化をポジティブ表示
        basePct: clampPct((1 - (basePart.weightG - 500) / 550) * 100),
        candPct: clampPct((1 - (candidatePart.weightG - 500) / 550) * 100),
        deltaBadge:
          wtDiff === 0
            ? '±0g 同重量'
            : wtDiff < 0
            ? `▲ ${wtDiff}g 軽量化`
            : `▼ +${wtDiff}g 重量増`,
        tone: wtDiff < 0 ? 'up' : wtDiff > 0 ? 'down' : 'neutral',
      },
      {
        label: 'RETRIEVE SPEED (1回転の巻上スピード)',
        baseValText: `${basePart.retrieveCm}cm`,
        candValText: `${candidatePart.retrieveCm}cm`,
        basePct: clampPct((basePart.retrieveCm / 150) * 100),
        candPct: clampPct((candidatePart.retrieveCm / 150) * 100),
        deltaBadge:
          retDiff === 0
            ? '±0cm 同速'
            : retDiff > 0
            ? `▲ +${retDiff}cm 高速回収`
            : `▼ ${retDiff}cm トルク重視`,
        tone: retDiff > 0 ? 'up' : retDiff < 0 ? 'neutral' : 'neutral',
      },
      {
        label: 'SPOOL CAPACITY (300m適合PE号数)',
        baseValText: `PE${basePart.peCapacityNum}号-300m`,
        candValText: `PE${candidatePart.peCapacityNum}号-300m`,
        basePct: clampPct((basePart.peCapacityNum / 12) * 100),
        candPct: clampPct((candidatePart.peCapacityNum / 12) * 100),
        deltaBadge:
          basePart.peCapacityNum === candidatePart.peCapacityNum
            ? '同号数ジャスト'
            : `PE${basePart.peCapacityNum}号 ➔ PE${candidatePart.peCapacityNum}号`,
        tone:
          candidatePart.peCapacityNum > basePart.peCapacityNum
            ? 'up'
            : candidatePart.peCapacityNum < basePart.peCapacityNum
            ? 'down'
            : 'neutral',
      },
    ];

    if (isSame) {
      return {
        isSameAsBase: true,
        statRows,
        priceDeltaText,
        priceDeltaTone,
        fishFightHeadline: `【${target.fishName}】に対する初期設定リール（基準ステータス）`,
        fishFightNarrative: `${target.fishName}の初動負荷（約${target.initialRunLoadKg}kg）と1日${target.dailyCastCount}投のキャストにバランス良く対応する基準機です。${candidatePart.description}`,
        cascadeNotice,
      };
    }

    let narrative = '';
    let headline = '';
    if (wtDiff < 0 && candidatePart.sizeClass === basePart.sizeClass) {
      headline = `手元が ${Math.abs(wtDiff)}g 軽くなり、1日${target.dailyCastCount}投で累積 ${Math.abs(Number(dailyCastKgDiff))}kg 分の腕の負担を軽減！`;
      narrative = `${basePart.shortName}（${basePart.weightG}g）から ${candidatePart.shortName}（${candidatePart.weightG}g）へ変えることで、夕マズメの最後の1投まで振り抜き速度が落ちません。さらにダイワ特有の「ATDドラグ」は魚が船べりで急に突っ込んだ瞬間に滑らかに追従するため、${target.fishName}の口切れ・身切れバラシをより抑える粘り強いファイトに変わります。`;
    } else if (wtDiff > 0 && candidatePart.sizeClass === basePart.sizeClass) {
      headline = `自重は +${wtDiff}g 増えますが、金属ボディの剛性感と高速スラック処理のダイレクト感が向上！`;
      narrative = `${candidatePart.shortName}は自重が+${wtDiff}g増える一方、高剛性HAGANEボディとリジッドサポートドラグにより、高負荷ファイト時でもボディのたわみがゼロ。${target.fishName}が瀬際へ走る初動をガッチリ受け止め、巻きたい瞬間にミリ単位でゴリ巻きできる攻撃的な操作感に変わります。`;
    } else if (candidatePart.sizeClass > basePart.sizeClass) {
      headline = `番手が #${basePart.sizeClass} ➔ #${candidatePart.sizeClass} に上がり、最大ドラグ +${dragDiff}kg・PE${candidatePart.peCapacityNum}号300mの巨魚制圧仕様へ変化！`;
      narrative = `1日${target.dailyCastCount}投での累積重量は +${dailyCastKgDiff}kg 増えますが、最大ドラグが${basePart.dragMaxKg}kgから${candidatePart.dragMaxKg}kgへ強化され、太糸（PE${candidatePart.peCapacityNum}号）を300m巻けるようになります。${target.fishName}の中でも記録級のモンスターがヒットした際、ラインブレイクの恐怖なく真っ向勝負できるパワー重視の装備に変わります。`;
    } else {
      headline = `番手を #${basePart.sizeClass} ➔ #${candidatePart.sizeClass} へ小型化し、手元を ${Math.abs(wtDiff)}g 軽量化するライト＆フィネス変化`;
      narrative = `ドラグ上限は${Math.abs(dragDiff)}kg下がりますが、手元が一気に${Math.abs(wtDiff)}g軽くなり（1日${target.dailyCastCount}投で累積 ${Math.abs(Number(dailyCastKgDiff))}kg 軽減）、1日中シャープにルアーを動かし続けられます。`;
    }

    return {
      isSameAsBase: false,
      statRows,
      priceDeltaText,
      priceDeltaTone,
      fishFightHeadline: headline,
      fishFightNarrative: narrative,
      cascadeNotice,
    };
  }

  // -------------------- 02. ロッド比較 --------------------
  if (basePart.category === 'rod' && candidatePart.category === 'rod') {
    const lureMaxDiff = candidatePart.lureMaxG - basePart.lureMaxG;
    const dragDiff = candidatePart.dragMaxKg - basePart.dragMaxKg;
    const lenDiff = candidatePart.lengthInches - basePart.lengthInches;
    const wtDiff = candidatePart.weightG - basePart.weightG;

    const baseLoadRatio = Math.round((target.initialRunLoadKg / basePart.dragMaxKg) * 100);
    const candLoadRatio = Math.round((target.initialRunLoadKg / candidatePart.dragMaxKg) * 100);

    const statRows: StatDeltaRow[] = [
      {
        label: 'LURE MAX CAPACITY (許容ルアー重量上限)',
        baseValText: `MAX ${basePart.lureMaxG}g`,
        candValText: `MAX ${candidatePart.lureMaxG}g`,
        basePct: clampPct((basePart.lureMaxG / 190) * 100),
        candPct: clampPct((candidatePart.lureMaxG / 190) * 100),
        deltaBadge:
          lureMaxDiff === 0
            ? '±0g 同上限'
            : lureMaxDiff > 0
            ? `▲ +${lureMaxDiff}g 大型ルアー解禁`
            : `▼ ${lureMaxDiff}g 小型プラグ特化`,
        tone: lureMaxDiff > 0 ? 'up' : lureMaxDiff < 0 ? 'down' : 'neutral',
      },
      {
        label: 'ROD LIFT POWER (最大ドラグ耐荷重 45°)',
        baseValText: `${basePart.dragMaxKg}kg`,
        candValText: `${candidatePart.dragMaxKg}kg`,
        basePct: clampPct((basePart.dragMaxKg / 20) * 100),
        candPct: clampPct((candidatePart.dragMaxKg / 20) * 100),
        deltaBadge:
          dragDiff === 0
            ? '±0kg 同等'
            : dragDiff > 0
            ? `▲ +${dragDiff}kg 根剥がし力UP`
            : `▼ ${dragDiff}kg 柔軟追従`,
        tone: dragDiff > 0 ? 'up' : dragDiff < 0 ? 'down' : 'neutral',
      },
      {
        label: 'CASTING REACH (全長・遠投リーチ)',
        baseValText: basePart.lengthFt,
        candValText: candidatePart.lengthFt,
        basePct: clampPct(((basePart.lengthInches - 90) / 16) * 100),
        candPct: clampPct(((candidatePart.lengthInches - 90) / 16) * 100),
        deltaBadge:
          lenDiff === 0
            ? '±0 同レングス'
            : lenDiff > 0
            ? `▲ +${lenDiff}インチ 飛距離UP`
            : `▼ ${lenDiff}インチ 取り回し重視`,
        tone: lenDiff > 0 ? 'up' : lenDiff < 0 ? 'neutral' : 'neutral',
      },
      {
        label: 'SWING LIGHTNESS (ロッド自重・軽快さ)',
        baseValText: `${basePart.weightG}g`,
        candValText: `${candidatePart.weightG}g`,
        basePct: clampPct((1 - (basePart.weightG - 300) / 200) * 100),
        candPct: clampPct((1 - (candidatePart.weightG - 300) / 200) * 100),
        deltaBadge:
          wtDiff === 0
            ? '±0g 同重量'
            : wtDiff < 0
            ? `▲ ${wtDiff}g 軽量化`
            : `▼ +${wtDiff}g パワー肉厚化`,
        tone: wtDiff < 0 ? 'up' : wtDiff > 0 ? 'down' : 'neutral',
      },
    ];

    if (isSame) {
      return {
        isSameAsBase: true,
        statRows,
        priceDeltaText,
        priceDeltaTone,
        fishFightHeadline: `【${target.fishName}】に対する初期設定ロッド（基準ステータス）`,
        fishFightNarrative: `${target.baitSizeMm}のベイトパターンに合わせやすく、${target.fishName}の初動突っ込み（約${target.initialRunLoadKg}kg）に対してブランクス負荷率 ${baseLoadRatio}% で余裕を持って対処できる基準ロッドです。`,
        cascadeNotice,
      };
    }

    const headline =
      dragDiff > 0
        ? `魚の初動突っ込み(${target.initialRunLoadKg}kg)に対するロッド負荷率が ${baseLoadRatio}% ➔ ${candLoadRatio}% に余裕拡大！ルアー上限も +${lureMaxDiff}g 増加`
        : `ロッド自重が ${Math.abs(wtDiff)}g 軽くなり、ティップが柔軟になって小型ルアーの喰わせ性能が大幅向上！`;

    const narrative =
      dragDiff > 0
        ? `${basePart.shortName}に比べ、ロッド自重は+${wtDiff}g増えますが、最大ドラグ耐荷重が${basePart.dragMaxKg}kgから${candidatePart.dragMaxKg}kg（+${dragDiff}kg）へ大幅強化されます。これにより${target.fishName}がヒット直後に瀬や深場へ突っ込んだ際、ロッドの限界余力が大きく広がり強引に頭をこちらへ向けられます。また許容ルアー重量が${basePart.lureMaxG}g➔${candidatePart.lureMaxG}g（+${lureMaxDiff}g）に広がるため、針込112gの『バズー200』など大型プラグも重量超過せずフルキャスト可能になります。`
        : `${basePart.shortName}から${candidatePart.shortName}へ変更すると、最大パワー（上限${candidatePart.lureMaxG}g / ドラグ${candidatePart.dragMaxKg}kg）は抑えられる代わりに、自重が${Math.abs(wtDiff)}g軽くなりティップがしなやかになります。魚が小さいベイト（マイワシや小型トビウオ）しか食べず大きなルアーを見切る日に、80〜95gのプラグを水面に絡みつくようにナチュラルに泳がせてバイトを引き出せます。`;

    return {
      isSameAsBase: false,
      statRows,
      priceDeltaText,
      priceDeltaTone,
      fishFightHeadline: headline,
      fishFightNarrative: narrative,
      cascadeNotice,
    };
  }

  // -------------------- 03. ライン比較 --------------------
  if (basePart.category === 'line' && candidatePart.category === 'line') {
    const lbDiff = candidatePart.strengthLb - basePart.strengthLb;
    const kgDiff = Number((candidatePart.strengthKg - basePart.strengthKg).toFixed(1));
    const ldrDiff = candidatePart.pairedLeaderLb - basePart.pairedLeaderLb;

    const baseSafetyMultiple = (basePart.strengthKg / target.initialRunLoadKg).toFixed(1);
    const candSafetyMultiple = (candidatePart.strengthKg / target.initialRunLoadKg).toFixed(1);

    const statRows: StatDeltaRow[] = [
      {
        label: 'BREAKING STRENGTH (最大直線強力)',
        baseValText: `${basePart.strengthLb}lb (${basePart.strengthKg}kg)`,
        candValText: `${candidatePart.strengthLb}lb (${candidatePart.strengthKg}kg)`,
        basePct: clampPct((basePart.strengthLb / 150) * 100),
        candPct: clampPct((candidatePart.strengthLb / 150) * 100),
        deltaBadge:
          lbDiff === 0
            ? '±0lb 同強度'
            : lbDiff > 0
            ? `▲ +${lbDiff}lb (+${kgDiff}kg) 強度UP`
            : `▼ ${lbDiff}lb 細径・飛距離重視`,
        tone: lbDiff > 0 ? 'up' : lbDiff < 0 ? 'down' : 'neutral',
      },
      {
        label: 'SHOCK LEADER (自動ペアリングリーダー耐摩耗)',
        baseValText: `${basePart.pairedLeaderLb}lb`,
        candValText: `${candidatePart.pairedLeaderLb}lb`,
        basePct: clampPct((basePart.pairedLeaderLb / 240) * 100),
        candPct: clampPct((candidatePart.pairedLeaderLb / 240) * 100),
        deltaBadge:
          ldrDiff === 0
            ? '±0lb 同号数'
            : ldrDiff > 0
            ? `▲ +${ldrDiff}lb 根ズレ耐性UP`
            : `▼ ${ldrDiff}lb ルアー動き重視`,
        tone: ldrDiff > 0 ? 'up' : ldrDiff < 0 ? 'down' : 'neutral',
      },
      {
        label: 'WIND CUT / FLIGHT (細さによる風切り・飛距離)',
        baseValText: `PE ${basePart.peNumber}号`,
        candValText: `PE ${candidatePart.peNumber}号`,
        basePct: clampPct((1 - (basePart.peNumber - 4) / 8) * 100),
        candPct: clampPct((1 - (candidatePart.peNumber - 4) / 8) * 100),
        deltaBadge:
          candidatePart.peNumber === basePart.peNumber
            ? '同号数'
            : candidatePart.peNumber < basePart.peNumber
            ? `▲ ${basePart.peNumber - candidatePart.peNumber}号細径化で飛距離UP`
            : `▼ +${candidatePart.peNumber - basePart.peNumber}号太糸化`,
        tone:
          candidatePart.peNumber < basePart.peNumber
            ? 'up'
            : candidatePart.peNumber > basePart.peNumber
            ? 'down'
            : 'neutral',
      },
    ];

    if (isSame) {
      return {
        isSameAsBase: true,
        statRows,
        priceDeltaText,
        priceDeltaTone,
        fishFightHeadline: `【${target.fishName}】に対する初期設定ライン（安全率 ${baseSafetyMultiple}倍）`,
        fishFightNarrative: `魚の初動負荷（${target.initialRunLoadKg}kg）に対して ${baseSafetyMultiple}倍 の直線強力（${basePart.strengthKg}kg）を持ち、初期設定リールに下巻きなしで300mジャスト格納できる基準ラインです。`,
        cascadeNotice,
      };
    }

    const headline =
      lbDiff > 0
        ? `直線強力が +${lbDiff}lb（+${kgDiff}kg）増加！魚の初動負荷に対する安全率が ${baseSafetyMultiple}倍 ➔ ${candSafetyMultiple}倍 に向上`
        : `PE${basePart.peNumber}号 ➔ PE${candidatePart.peNumber}号へ細径化し、向かい風でのルアー飛距離と操作性が大幅に向上！`;

    const narrative =
      lbDiff > 0
        ? `${basePart.shortName}から${candidatePart.shortName}へ太くすることで、直線強力が${basePart.strengthKg}kgから${candidatePart.strengthKg}kgへ強化され、自動セットされるリーダーも${basePart.pairedLeaderLb}lb➔${candidatePart.pairedLeaderLb}lbにランクアップします。水深が浅く起伏の激しい岩礁帯で大型ヒラマサに根に擦られた際や、大型クロマグロとの長時間ファイトでの破断リスクが劇的に下がります（※スプール容量を合わせるため${candidatePart.peNumber === 8 ? '18000番' : '20000番'}リールとの組み合わせが必要）。`
        : `ラインをPE${candidatePart.peNumber}号へ細くすることで、ガイド抜けと水切り抵抗が劇的に軽くなり、遠くのナブラへあと10mルアーを届かせることができます。絶対強度は${Math.abs(kgDiff)}kg下がるため、根の荒いポイントよりもオープンウォーターでの誘い出し・ナブラ撃ちに特化したセッティングに変わります。`;

    return {
      isSameAsBase: false,
      statRows,
      priceDeltaText,
      priceDeltaTone,
      fishFightHeadline: headline,
      fishFightNarrative: narrative,
      cascadeNotice,
    };
  }

  // -------------------- 04. ルアー比較 --------------------
  if (basePart.category === 'lure' && candidatePart.category === 'lure') {
    const wtDiff = Number((candidatePart.totalWeightG - basePart.totalWeightG).toFixed(1));
    const lenDiff = candidatePart.lengthMm - basePart.lengthMm;
    const rodMax = currentRig.rod?.lureMaxG ?? 110;
    const baseRodRatio = Math.round((basePart.totalWeightG / rodMax) * 100);
    const candRodRatio = Math.round((candidatePart.totalWeightG / rodMax) * 100);

    const statRows: StatDeltaRow[] = [
      {
        label: 'TOTAL WEIGHT (針・リング込の実戦総重量)',
        baseValText: `${basePart.totalWeightG}g`,
        candValText: `${candidatePart.totalWeightG}g`,
        basePct: clampPct((basePart.totalWeightG / 160) * 100),
        candPct: clampPct((candidatePart.totalWeightG / 160) * 100),
        deltaBadge:
          wtDiff === 0
            ? '±0g 同重量'
            : wtDiff > 0
            ? `▲ +${wtDiff}g 重量・飛距離増`
            : `▲ ${wtDiff}g 軽快スイング`,
        tone: candRodRatio <= 100 ? 'up' : 'down',
      },
      {
        label: 'ROD LOAD RATIO (選択中ロッド上限に対する負荷率)',
        baseValText: `${baseRodRatio}% (上限${rodMax}g)`,
        candValText: `${candRodRatio}% (上限${rodMax}g)`,
        basePct: clampPct(baseRodRatio),
        candPct: clampPct(candRodRatio),
        deltaBadge:
          candRodRatio > 100
            ? `⚠️ 上限超過 (${candRodRatio}%)`
            : `${baseRodRatio}% ➔ ${candRodRatio}% (適正域)`,
        tone: candRodRatio > 100 ? 'down' : 'up',
      },
      {
        label: 'APPEAL & SILHOUETTE (全長・アピール波動)',
        baseValText: `${basePart.lengthMm}mm (${basePart.hookSpec.split(' ')[1]})`,
        candValText: `${candidatePart.lengthMm}mm (${candidatePart.hookSpec.split(' ')[1]})`,
        basePct: clampPct((basePart.lengthMm / 250) * 100),
        candPct: clampPct((candidatePart.lengthMm / 250) * 100),
        deltaBadge:
          lenDiff === 0
            ? '同サイズ 200mm'
            : lenDiff > 0
            ? `▲ +${lenDiff}mm 大型ベイト対応`
            : `▼ ${lenDiff}mm 一口サイズ化`,
        tone: lenDiff !== 0 ? 'up' : 'neutral',
      },
    ];

    if (isSame) {
      return {
        isSameAsBase: true,
        statRows,
        priceDeltaText,
        priceDeltaTone,
        fishFightHeadline: `【${target.fishName}】に対する初期設定ルアー（ロッド負荷率 ${baseRodRatio}%）`,
        fishFightNarrative: `本体${basePart.bodyWeightG}gに適合フック＆リング（+${basePart.hookRingWeightG}g）を合わせた実戦総重量 ${basePart.totalWeightG}g。現在のロッド上限（${rodMax}g）に対して ${baseRodRatio}% の理想的なスイートスポットで振り抜ける基準プラグです。`,
        cascadeNotice,
      };
    }

    let headline = '';
    let narrative = '';

    if (wtDiff < 0) {
      headline = `針込実戦重量が ${Math.abs(wtDiff)}g 軽くなり（ロッド負荷率 ${baseRodRatio}% ➔ ${candRodRatio}%）、見切らせない高速スライドアクションに変化！`;
      narrative = `${basePart.shortName}（${basePart.totalWeightG}g）から${candidatePart.shortName}（${candidatePart.totalWeightG}g）へ変えることで、振り抜き負荷が${Math.abs(candRodRatio - baseRodRatio)}%軽くなります。${basePart.actionType}で魚を寄せる基準ルアーに対し、こちらは「${candidatePart.actionType}」に特化しており、ベイトが小さい日や船が多くてスレた${target.fishName}がルアーを見切る状況で、最後の最後に口を使わせる喰わせの切り札になります。`;
    } else {
      headline = `針込実戦重量が +${wtDiff}g 増加（${basePart.totalWeightG}g ➔ ${candidatePart.totalWeightG}g）し、強波動＆太軸フックで大型魚を強制浮上させる仕様へ変化！`;
      narrative = `本体＋太軸フック（${candidatePart.hookSpec}）により実戦重量が${candidatePart.totalWeightG}gへアップします。${
        candRodRatio > 100
          ? `※現在のロッド上限（${rodMax}g）を ${ Number((candidatePart.totalWeightG - rodMax).toFixed(1)) }g 超過するため、02 ロッドを『エクスプロージョン865（上限130g）』または『ウルティモ83M（上限150g）』へ強化することで100%性能を発揮できます。`
          : `現在のロッド上限（${rodMax}g）に対して負荷率${candRodRatio}%でしっかりブランクスを曲げて反発遠投できます。`
      }「${candidatePart.actionType}」により、水深30〜50mの深場に沈んだ${target.fishName}やシイラパターン時の大型個体を水面まで引きずり出す爆発力が手に入ります。`;
    }

    return {
      isSameAsBase: false,
      statRows,
      priceDeltaText,
      priceDeltaTone,
      fishFightHeadline: headline,
      fishFightNarrative: narrative,
      cascadeNotice,
    };
  }

  return {
    isSameAsBase: true,
    statRows: [],
    priceDeltaText: '±¥0',
    priceDeltaTone: 'neutral',
    fishFightHeadline: '',
    fishFightNarrative: '',
    cascadeNotice: null,
  };
}

// ============================================================================
// 4スロット合算「対ターゲット総合戦闘力（5項目ゲームステータス）」算出エンジン
// ============================================================================

export interface CombatStatBar {
  id: string;
  label: string;
  subLabel: string;
  score: number; // 0 - 100
  baseScore: number; // 推奨ベース時のスコア (0 - 100)
  metricText: string;
}

export function calculateOverallCombatStats(
  rig: RigState,
  target: TargetFishProfile
): CombatStatBar[] {
  const baseRig = getPresetRigState(target.id);

  const calcScores = (r: RigState) => {
    const reelDrag = r.reel?.dragMaxKg ?? 25;
    const rodDrag = r.rod?.dragMaxKg ?? 11;
    const lineKg = r.line?.strengthKg ?? 40;
    const totalWt =
      (r.reel?.weightG ?? 675) +
      (r.rod?.weightG ?? 350) +
      Math.round(r.lure?.totalWeightG ?? 95);
    const rodLenIn = r.rod?.lengthInches ?? 98;
    const lureWt = r.lure?.totalWeightG ?? 96;
    const rodMax = r.rod?.lureMaxG ?? 110;

    // 1. STOPPING POWER (制動力・根剥がし)
    const stopping = clampPct(((rodDrag * 3.5 + reelDrag * 1.2 + lineKg * 0.5) / 115) * 100);

    // 2. CASTING RANGE (遠投飛距離)
    const lureOverPenalty = lureWt > rodMax ? -20 : 0;
    const casting = clampPct(
      ((rodLenIn - 92) * 3.5 + (lureWt / 145) * 45 + (12 - (r.line?.peNumber ?? 6)) * 3) +
        lureOverPenalty
    );

    // 3. STAMINA / AGILITY (1日投げ続ける軽快さ)
    const stamina = clampPct(100 - ((totalWt - 1050) / 550) * 45);

    // 4. BITE & HOLD (喰わせ・バラシ耐性)
    const isAtd = r.reel?.id.includes('saltiga') ? 8 : 0;
    const isFinesseLure = r.lure?.id.includes('gamma') ? 8 : 0;
    const isSoftTip = r.rod?.id.includes('aquila') ? 8 : 0;
    const biteHold = clampPct(74 + isAtd + isFinesseLure + isSoftTip);

    // 5. SAFETY MARGIN (大物急襲時の破断余裕度)
    const allCompat = [r.reel, r.rod, r.line, r.lure]
      .filter((x): x is AnyRigPart => x !== null)
      .every((item) => checkPartCompatibility(item, r).compatible);
    const safety = clampPct(
      (allCompat ? 82 : 45) + ((r.line?.pairedLeaderLb ?? 130) - 120) * 0.16
    );

    return { stopping, casting, stamina, biteHold, safety, rodDrag, totalWt, lineKg };
  };

  const cur = calcScores(rig);
  const base = calcScores(baseRig);

  return [
    {
      id: 'stopping',
      label: 'STOPPING POWER',
      subLabel: '瀬際で魚を止める制動力',
      score: cur.stopping,
      baseScore: base.stopping,
      metricText: `最大ドラグ負荷 ${rig.rod?.dragMaxKg ?? '-'}kg / リール ${rig.reel?.dragMaxKg ?? '-'}kg`,
    },
    {
      id: 'casting',
      label: 'CASTING RANGE',
      subLabel: 'ナブラへ届かせる飛距離',
      score: cur.casting,
      baseScore: base.casting,
      metricText: `${rig.rod?.lengthFt ?? '-'} × 針込${rig.lure?.totalWeightG ?? '-'}g`,
    },
    {
      id: 'stamina',
      label: 'STAMINA & AGILITY',
      subLabel: `1日${target.dailyCastCount}投の持久力・軽快さ`,
      score: cur.stamina,
      baseScore: base.stamina,
      metricText: `装備総重量 ${cur.totalWt}g`,
    },
    {
      id: 'bite',
      label: 'BITE & HOLD',
      subLabel: '見切らせない誘い＆バラシ耐性',
      score: cur.biteHold,
      baseScore: base.biteHold,
      metricText: `${rig.lure?.actionType.slice(0, 10) ?? '-'}`,
    },
    {
      id: 'safety',
      label: 'SAFETY MARGIN',
      subLabel: 'モンスター急襲時の破断余裕度',
      score: cur.safety,
      baseScore: base.safety,
      metricText: `直線 ${rig.line?.strengthLb ?? '-'}lb + ${rig.line?.pairedLeaderLb ?? '-'}lbリーダー`,
    },
  ];
}

export function getNextUnselectedStep(
  rig: RigState,
  currentStep?: PartCategory
): PartCategory | null {
  const startIdx = currentStep ? CATEGORY_ORDER.indexOf(currentStep) : -1;
  for (let i = 1; i <= CATEGORY_ORDER.length; i++) {
    const candidate = CATEGORY_ORDER[(startIdx + i) % CATEGORY_ORDER.length];
    if (!rig[candidate]) {
      return candidate;
    }
  }
  return null;
}
