import { AmazonLinkTarget } from '../config/amazonAssociate';

// ============================================================================
// 型定義・データモデル
// ============================================================================

export type PartCategory = 'reel' | 'rod' | 'line' | 'lure';

export interface ReelPart {
  id: string;
  category: 'reel';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  sizeClass: 14000 | 18000 | 20000;
  dragMaxKg: number;
  peCapacityNum: number;
  peCapacityMeter: number;
  weightG: number;
  gearRatio: string;
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export interface RodPart {
  id: string;
  category: 'rod';
  brand: string;
  name: string;
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
  weightG: number;
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export interface LinePart {
  id: string;
  category: 'line';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  peNumber: number;
  lengthM: number;
  strengthLb: number;
  pairedLeaderSpec: string;
  description: string;
  specs: { label: string; value: string }[];
  amazon: AmazonLinkTarget;
}

export interface LurePart {
  id: string;
  category: 'lure';
  brand: string;
  name: string;
  subCode: string;
  price: number;
  image: string;
  bodyWeightG: number;
  hookRingWeightG: number;
  totalWeightG: number;
  minPe: number;
  lengthMm: number;
  hookSpec: string;
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

export interface RigPreset {
  id: 'pe6' | 'pe8' | 'pe10';
  badge: string;
  title: string;
  targetFish: string;
  field: string;
  summary: string;
  rigIds: {
    reel: string;
    rod: string;
    line: string;
    lure: string;
  };
}

export const STEP_META: Record<
  PartCategory,
  { stepNum: string; label: string; fullTitle: string; shortDesc: string }
> = {
  reel: {
    stepNum: '01',
    label: 'リール',
    fullTitle: 'スピニングリールを選択',
    shortDesc: '14000番〜20000番・スプール糸巻量基準',
  },
  rod: {
    stepNum: '02',
    label: 'ロッド',
    fullTitle: 'オフショアキャスティングロッドを選択',
    shortDesc: 'リール番手・適合PE・ルアー負荷連動',
  },
  line: {
    stepNum: '03',
    label: 'ライン',
    fullTitle: 'メインライン＆自動適合リーダーを選択',
    shortDesc: 'スプール充填率100%・下巻き不要',
  },
  lure: {
    stepNum: '04',
    label: 'ルアー',
    fullTitle: 'オフショアプラグ＆太軸フックを選択',
    shortDesc: 'フック・リング込み実戦総重量判定',
  },
};

export const CATEGORY_ORDER: PartCategory[] = ['reel', 'rod', 'line', 'lure'];

// ============================================================================
// 厳選マスターカタログデータ
// ============================================================================

export const REEL_CATALOG: ReelPart[] = [
  {
    id: 'reel-stella-14000xg',
    category: 'reel',
    brand: 'シマノ',
    name: '19 ステラ 14000番 エクストラハイギア',
    subCode: '14000番スプール // ハイスピードモデル',
    price: 119300,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=19+%E3%82%B9%E3%83%86%E3%83%A9+14000%E7%95%AA',
    sizeClass: 14000,
    dragMaxKg: 25,
    peCapacityNum: 6,
    peCapacityMeter: 300,
    weightG: 675,
    gearRatio: '6.2 (134cm)',
    description:
      'PE6号-300m基準のヒラマサ・近海マグロキャスティングの業界標準フラッグシップ。1回転134cmの高速巻上げでダイビングペンシルのラインスラックを瞬時に回収。',
    specs: [
      { label: '最大ドラグ力', value: '25kg' },
      { label: '推奨糸巻量', value: '6号-300m' },
      { label: '最大巻上長', value: '134cm / 1回転' },
      { label: '自重', value: '675g' },
    ],
    amazon: {
      searchQuery: 'シマノ 19 ステラ SW 14000XG',
    },
  },
  {
    id: 'reel-saltiga-14000xh',
    category: 'reel',
    brand: 'ダイワ',
    name: '20 ソルティガ 14000番 エクストラハイギア',
    subCode: 'モノコックボディ // 14000番ハイスピード',
    price: 119900,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=20+%E3%82%BD%E3%83%AB%E3%83%86%E3%82%A3%E3%82%AC+14000%E7%95%AA',
    sizeClass: 14000,
    dragMaxKg: 25,
    peCapacityNum: 6,
    peCapacityMeter: 300,
    weightG: 665,
    gearRatio: '6.2 (134cm)',
    description:
      '高剛性モノコックボディと大口径G1ジュラルミンタフデジギアを搭載。PE6号-300mをジャスト格納し、初動の滑らかなATDドラグで高負荷ファイト時の身切れ・ラインブレイクを防ぐ。',
    specs: [
      { label: '最大ドラグ力', value: '25kg' },
      { label: '推奨糸巻量', value: '6号-300m' },
      { label: '最大巻上長', value: '134cm / 1回転' },
      { label: '自重', value: '665g' },
    ],
    amazon: {
      searchQuery: 'ダイワ 20 ソルティガ 14000-XH',
    },
  },
  {
    id: 'reel-stella-18000hg',
    category: 'reel',
    brand: 'シマノ',
    name: '20 ステラ 18000番 パワーハイギア',
    subCode: '大型マグロ・オオマサ対応 // 18000番ハイギア',
    price: 130900,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=20+%E3%82%B9%E3%83%86%E3%83%A9+18000%E7%95%AA',
    sizeClass: 18000,
    dragMaxKg: 28,
    peCapacityNum: 8,
    peCapacityMeter: 300,
    weightG: 875,
    gearRatio: '5.7 (129cm)',
    description:
      'PE8号-300mを完全格納する大型クロマグロ・20kg超オオマサ用の中核番手。Xタフドラグにより28kgの最大ドラグ力と圧倒的な巻き上げトルクを両立。',
    specs: [
      { label: '最大ドラグ力', value: '28kg' },
      { label: '推奨糸巻量', value: '8号-300m' },
      { label: '最大巻上長', value: '129cm / 1回転' },
      { label: '自重', value: '875g' },
    ],
    amazon: {
      searchQuery: 'シマノ 20 ステラ SW 18000HG',
    },
  },
  {
    id: 'reel-saltiga-20000h',
    category: 'reel',
    brand: 'ダイワ',
    name: '20 ソルティガ 20000番 ハイギア',
    subCode: '100kg超クロマグロ遠征仕様 // 20000番',
    price: 141900,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=20+%E3%82%BD%E3%83%AB%E3%83%86%E3%82%A3%E3%82%AC+20000%E7%95%AA',
    sizeClass: 20000,
    dragMaxKg: 30,
    peCapacityNum: 10,
    peCapacityMeter: 300,
    weightG: 890,
    gearRatio: '5.8 (143cm)',
    description:
      'PE10号-300m格納、最大ドラグ30kgを誇るモンスタークロマグロ専用機。ラジエーションドラグノブによる高い放熱性能で100kg超の長時間ファーストランに耐え抜く。',
    specs: [
      { label: '最大ドラグ力', value: '30kg' },
      { label: '推奨糸巻量', value: '10号-300m' },
      { label: '最大巻上長', value: '143cm / 1回転' },
      { label: '自重', value: '890g' },
    ],
    amazon: {
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
    subCode: 'テクニカルキャスト仕様 // 適合ライン 3〜6号',
    price: 78100,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%82%A2%E3%82%AF%E3%82%A4%E3%83%A9+82-3%2F6',
    compatibleReelSizes: [14000],
    minPe: 3,
    maxPe: 6,
    lureMinG: 40,
    lureMaxG: 110,
    dragMaxKg: 11,
    lengthFt: '8フィート2インチ',
    weightG: 346,
    description:
      '3番クラスの繊細なティップと6番クラスの強靭なバットを融合したマルチレングスロッド。14000番リール＋PE6号で小型〜中型プラグをピンポイントへ撃ち込む近海ヒラマサ・キハダゲームに最適。',
    specs: [
      { label: '適合ライン', value: '3〜6号' },
      { label: '適合ルアー重量', value: '40〜110g' },
      { label: '最大ドラグ負荷', value: '11kg (45°)' },
      { label: '推奨リール番手', value: '14000番' },
    ],
    amazon: {
      searchQuery: 'リップルフィッシャー アクイラ MLT 82-3/6',
    },
  },
  {
    id: 'rod-explosion-865hf',
    category: 'rod',
    brand: 'エムシーワークス',
    name: 'エクスプロージョン 865（フルコンタクト）',
    subCode: 'フルコンタクト仕様 // 適合ライン 5〜8号',
    price: 69300,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%97%E3%83%AD%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3+865',
    compatibleReelSizes: [14000, 18000],
    minPe: 5,
    maxPe: 8,
    lureMinG: 60,
    lureMaxG: 130,
    dragMaxKg: 15,
    lengthFt: '8フィート6インチ',
    weightG: 375,
    description:
      '8フィート6インチのロングレングスによる圧倒的な飛距離と、PE5〜8号・14000〜18000番リールを幅広くカバーする懐の深さを備えた王道ヒラマサ・マグロ兼用ロッド。',
    specs: [
      { label: '適合ライン', value: '5〜8号' },
      { label: '適合ルアー重量', value: '60〜130g' },
      { label: '最大ドラグ負荷', value: '15kg (45°)' },
      { label: '推奨リール番手', value: '14000番 / 18000番' },
    ],
    amazon: {
      searchQuery: 'MCワークス エクスプロージョン 865HF',
    },
  },
  {
    id: 'rod-ultimo-83m',
    category: 'rod',
    brand: 'リップルフィッシャー',
    name: 'ウルティモ 83 ナノ（大型ヒラマサモデル）',
    subCode: '大型ヒラマサ特化 // 適合ライン 6〜8号',
    price: 83600,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%82%A6%E3%83%AB%E3%83%86%E3%82%A3%E3%83%A2+83+%E3%83%8A%E3%83%8E',
    compatibleReelSizes: [14000, 18000],
    minPe: 6,
    maxPe: 8,
    lureMinG: 70,
    lureMaxG: 150,
    dragMaxKg: 16,
    lengthFt: '8フィート3インチ',
    weightG: 388,
    description:
      'ナノアロイ技術採用ブランクスにより、200mm超の大型ダイビングペンシル（針込110〜145g）を軽快に振り抜き、浅根の20kg超オオマサを主導権を渡さず浮かせ切るハイパワーモデル。',
    specs: [
      { label: '適合ライン', value: '6〜8号' },
      { label: '適合ルアー重量', value: '70〜150g' },
      { label: '最大ドラグ負荷', value: '16kg (45°)' },
      { label: '推奨リール番手', value: '14000番 / 18000番' },
    ],
    amazon: {
      searchQuery: 'リップルフィッシャー ウルティモ 83M Nano',
    },
  },
  {
    id: 'rod-bigtuna-83',
    category: 'rod',
    brand: 'リップルフィッシャー',
    name: 'ビッグツナ 83 ジャパンスペシャル',
    subCode: 'クロマグロ・スタンドアップ // 適合ライン 8〜12号',
    price: 86900,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%83%93%E3%83%83%E3%82%B0%E3%83%84%E3%83%8A+83',
    compatibleReelSizes: [18000, 20000],
    minPe: 8,
    maxPe: 12,
    lureMinG: 70,
    lureMaxG: 180,
    dragMaxKg: 18,
    lengthFt: '8フィート3インチ',
    weightG: 440,
    description:
      'PE8〜12号・18000〜20000番リールに対応し、240mmクラスの大型プラグ遠投と、真下に突っ込む大型クロマグロをアングラーの体重を乗せてリフトするスタンドアップ専用設計。',
    specs: [
      { label: '適合ライン', value: '8〜12号' },
      { label: '適合ルアー重量', value: '70〜180g' },
      { label: '最大ドラグ負荷', value: '18kg (45°)' },
      { label: '推奨リール番手', value: '18000番 / 20000番' },
    ],
    amazon: {
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
    subCode: '自動セット: オーシャンレコード 130ポンド リーダー推奨',
    price: 16830,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%83%90%E3%83%AA%E3%83%90%E3%82%B9+6%E5%8F%B7+300m',
    peNumber: 6,
    lengthM: 300,
    strengthLb: 90,
    pairedLeaderSpec: 'オーシャンレコード 130ポンド（推奨ペア）',
    description:
      '14000番スプールに下巻き不要で100%ジャスト格納できるPE6号-300m。直線強力90lbを誇り、130lbショックリーダーとの組み合わせで抜群の飛距離と耐久性を発揮。',
    specs: [
      { label: '号数・長さ', value: '6号-300m' },
      { label: '最大直線強力', value: '90ポンド (40.8kg)' },
      { label: '適合リーダー', value: '130ポンド 自動ペア' },
      { label: 'スプール適合', value: '14000番 (充填100%)' },
    ],
    amazon: {
      searchQuery: 'バリバス アバニ キャスティングPE SMP 6号 300m',
      subItemLabel: '適合ショックリーダー：バリバス オーシャンレコード 130lb',
      subItemQuery: 'バリバス オーシャンレコード ショックリーダー 130lb',
    },
  },
  {
    id: 'line-ygk-oddport-pe8',
    category: 'line',
    brand: 'エックスブレイド',
    name: 'オッズポート 8本組ライン 8号 (300m)',
    subCode: '自動セット: オーシャンレコード 170ポンド リーダー推奨',
    price: 18920,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%82%AA%E3%83%83%E3%82%BA%E3%83%9D%E3%83%BC%E3%83%88+8%E5%8F%B7+300m',
    peNumber: 8,
    lengthM: 300,
    strengthLb: 120,
    pairedLeaderSpec: 'オーシャンレコード 170ポンド（推奨ペア）',
    description:
      '18000番スプールに100%ジャスト格納されるPE8号-300m。中芯入りWX組工法により高負荷ドラグでも偏平せず、170lbリーダーとの結束で大型クロマグロ・オオマサに対応する。',
    specs: [
      { label: '号数・長さ', value: '8号-300m' },
      { label: '最大直線強力', value: '120ポンド (54.4kg)' },
      { label: '適合リーダー', value: '170ポンド 自動ペア' },
      { label: 'スプール適合', value: '18000番 (充填100%)' },
    ],
    amazon: {
      searchQuery: 'エックスブレイド オッズポート WXP1 8 8号 300m',
      subItemLabel: '適合ショックリーダー：バリバス オーシャンレコード 170lb',
      subItemQuery: 'バリバス オーシャンレコード ショックリーダー 170lb',
    },
  },
  {
    id: 'line-varivas-six-pe10',
    category: 'line',
    brand: 'バリバス',
    name: 'アバニ マグロ耐熱ライン 10号 (300m)',
    subCode: '自動セット: オーシャンレコード 220ポンド リーダー推奨',
    price: 20460,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%83%90%E3%83%AA%E3%83%90%E3%82%B9+10%E5%8F%B7+300m',
    peNumber: 10,
    lengthM: 300,
    strengthLb: 140,
    pairedLeaderSpec: 'オーシャンレコード 220ポンド（推奨ペア）',
    description:
      '20000番スプールに100%格納されるPE10号-300m。特殊耐熱繊維Si-Xを編み込むことで、15kg超の超高負荷ドラグ連続滑走時の摩擦熱によるラインブレイクを徹底防止。',
    specs: [
      { label: '号数・長さ', value: '10号-300m' },
      { label: '最大直線強力', value: '140ポンド (63.5kg)' },
      { label: '適合リーダー', value: '220ポンド 自動ペア' },
      { label: 'スプール適合', value: '20000番 (充填100%)' },
    ],
    amazon: {
      searchQuery: 'バリバス アバニ キャスティングPE Si-X 10号 300m',
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
    subCode: '本体単体 85g ＋ 太軸フック・強化リング 11.5g',
    price: 13860,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3+200',
    bodyWeightG: 85,
    hookRingWeightG: 11.5,
    totalWeightG: 96.5,
    minPe: 5,
    lengthMm: 200,
    hookSpec: '太軸 3/0号 ＋ 強化リング 9番',
    description:
      '本体85gにST-66 #3/0前後＋強化リング（計11.5g）をセットした実戦総重量96.5g。適合ルアー上限110gクラスのテクニカルロッドでも振り抜きやすい黄金バランス。',
    specs: [
      { label: '実戦総重量', value: '96.5g (針・リング込)' },
      { label: '本体単体重量', value: '85.0g (全長200mm)' },
      { label: '適合フック', value: '3/0号規格 (+11.5g)' },
      { label: '推奨ライン', value: '5号以上' },
    ],
    amazon: {
      searchQuery: 'CB ONE ライアン 200',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #3/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 3/0',
    },
  },
  {
    id: 'lure-carpenter-gamma-90',
    category: 'lure',
    brand: 'カーペンター',
    name: 'ガンマ 90-特選モデル（太軸 3/0号 フック推奨）',
    subCode: '本体単体 75g ＋ 太軸フック・強化リング 11.5g',
    price: 15400,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%82%AC%E3%83%B3%E3%83%9E+90',
    bodyWeightG: 75,
    hookRingWeightG: 11.5,
    totalWeightG: 86.5,
    minPe: 5,
    lengthMm: 200,
    hookSpec: '太軸 3/0号 ＋ 強化リング 9番',
    description:
      '本体75g＋適合フック11.5gで実戦総重量86.5g。PE5〜6号タックルでの誘い出し・ナブラ撃ちにおいて全国的な実績を誇る名作ダイビングペンシル。',
    specs: [
      { label: '実戦総重量', value: '86.5g (針・リング込)' },
      { label: '本体単体重量', value: '75.0g (全長200mm)' },
      { label: '適合フック', value: '3/0号規格 (+11.5g)' },
      { label: '推奨ライン', value: '5号以上' },
    ],
    amazon: {
      searchQuery: 'カーペンター ガンマ 90',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #3/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 3/0',
    },
  },
  {
    id: 'lure-cbone-bazoo-200',
    category: 'lure',
    brand: 'シービーワン',
    name: 'バズー 200（太軸 4/0号 フック＆リング推奨）',
    subCode: '本体単体 96g ＋ 太軸フック・強化リング 16.0g',
    price: 14960,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%83%90%E3%82%BA%E3%83%BC+200',
    bodyWeightG: 96,
    hookRingWeightG: 16.0,
    totalWeightG: 112.0,
    minPe: 6,
    lengthMm: 200,
    hookSpec: '太軸 4/0号 ＋ 強化リング 10番',
    description:
      '本体は96gだが、浮力設計に適合する太軸#4/0フック＆リング（+16.0g）を装着すると実戦総重量112.0gに達するため、上限110gロッドでは重量超過となる点までRIGsが精密判定。',
    specs: [
      { label: '実戦総重量', value: '112.0g (針・リング込)' },
      { label: '本体単体重量', value: '96.0g (全長200mm)' },
      { label: '適合フック', value: '4/0号規格 (+16.0g)' },
      { label: '推奨ライン', value: '6号以上' },
    ],
    amazon: {
      searchQuery: 'CB ONE バズー 200',
      subItemLabel: '適合太軸フック：オーナー カルティバ ST-66 #4/0',
      subItemQuery: 'オーナー カルティバ スティンガートリプル ST-66 4/0',
    },
  },
  {
    id: 'lure-cbone-zorro-240',
    category: 'lure',
    brand: 'シービーワン',
    name: 'ゾロ 240 モンスター仕様（太軸 5/0号 フック推奨）',
    subCode: '本体単体 120g ＋ 太軸フック・強化リング 21.0g',
    price: 16720,
    image:
      'https://placehold.co/400x400/222222/00E5FF?text=%E3%82%BE%E3%83%AD+240',
    bodyWeightG: 120,
    hookRingWeightG: 21.0,
    totalWeightG: 141.0,
    minPe: 8,
    lengthMm: 240,
    hookSpec: '太軸 5/0号 ＋ 強化リング 11番',
    description:
      '本体120g＋太軸#5/0フック＆強化リング21.0gで実戦総重量141.0g。大型シイラ・サンマパターンで100kg超クロマグロや超大型ヒラマサを狙い撃つビッグプラグ。',
    specs: [
      { label: '実戦総重量', value: '141.0g (針・リング込)' },
      { label: '本体単体重量', value: '120.0g (全長240mm)' },
      { label: '適合フック', value: '5/0号規格 (+21.0g)' },
      { label: '推奨ライン', value: '8号以上' },
    ],
    amazon: {
      searchQuery: 'CB ONE ゾロ 240',
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

export const RIG_PRESETS: RigPreset[] = [
  {
    id: 'pe6',
    badge: 'STANDARD // PE6号・14000番クラス',
    title: '近海ヒラマサ・キハダ 6号標準セッティング',
    targetFish: 'ヒラマサ 10〜20kg / キハダマグロ 20〜45kg',
    field: '玄界灘・五島列島・外房・相模湾・三重沖',
    summary:
      '14000番XGリールにPE6号-300mを下巻き無しで100%格納。針込96.5gの200mmペンシルを1日中軽快に振り抜ける黄金バランスの基準構成。',
    rigIds: {
      reel: 'reel-stella-14000xg',
      rod: 'rod-aquila-82-36',
      line: 'line-varivas-smp-pe6',
      lure: 'lure-cbone-ryan-200',
    },
  },
  {
    id: 'pe8',
    badge: 'HEAVY // PE8号・18000番クラス',
    title: '大型クロマグロ・オオマサ 8号パワーセッティング',
    targetFish: 'クロマグロ 40〜80kg / オオマサ 20〜30kg超',
    field: '津軽海峡・丹後半島・壱岐対馬・男女群島',
    summary:
      '18000番HGリール＋PE8号-300m完全格納。針込112gのバズー200を上限150gのナノブランクスでフルキャストし、高負荷ドラグで根から引き剥がす実戦仕様。',
    rigIds: {
      reel: 'reel-stella-18000hg',
      rod: 'rod-ultimo-83m',
      line: 'line-ygk-oddport-pe8',
      lure: 'lure-cbone-bazoo-200',
    },
  },
  {
    id: 'pe10',
    badge: 'EXPEDITION // PE10号・20000番クラス',
    title: '100kg超モンスタークロマグロ 10号遠征セッティング',
    targetFish: 'クロマグロ 80〜150kg超 / 離島モンスターGT',
    field: '竜飛崎・北海道松前・トカラ列島・海外遠征',
    summary:
      '20000番リールに耐熱PE10号-300mをフル格納。針込141gの240mmモンスタープラグとスタンドアップ専用ロッドで100kg超と真っ向勝負する最高峰構成。',
    rigIds: {
      reel: 'reel-saltiga-20000h',
      rod: 'rod-bigtuna-83',
      line: 'line-varivas-six-pe10',
      lure: 'lure-cbone-zorro-240',
    },
  },
];

// ============================================================================
// 検索・物理互換性判定・逆引きエンジン
// ============================================================================

export function findPartById(id: string | null | undefined): AnyRigPart | null {
  if (!id) return null;
  return ALL_PARTS.find((p) => p.id === id) ?? null;
}

export function getPresetRigState(presetId: 'pe6' | 'pe8' | 'pe10'): RigState {
  const preset = RIG_PRESETS.find((p) => p.id === presetId) ?? RIG_PRESETS[0];
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

  // ルアー
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

/**
 * 個別スペック詳細ページの「逆引きシナジー」用：
 * 指定した1パーツだけを装着した仮状態で、他カテゴリの100%適合パーツ一覧を返す
 */
export function getCompatiblePartnersForPart(targetPart: AnyRigPart): {
  category: PartCategory;
  label: string;
  items: { part: AnyRigPart; reason: string }[];
}[] {
  const soloRig: RigState = {
    reel: targetPart.category === 'reel' ? targetPart : null,
    rod: targetPart.category === 'rod' ? targetPart : null,
    line: targetPart.category === 'line' ? targetPart : null,
    lure: targetPart.category === 'lure' ? targetPart : null,
  };

  return CATEGORY_ORDER.filter((cat) => cat !== targetPart.category).map((cat) => {
    const pool = ALL_PARTS.filter((p) => p.category === cat);
    const compatibleItems = pool
      .map((p) => {
        const res = checkPartCompatibility(p, soloRig);
        return { part: p, compatible: res.compatible, reason: res.reason };
      })
      .filter((entry) => entry.compatible)
      .map(({ part, reason }) => ({ part, reason }));

    return {
      category: cat,
      label: `${STEP_META[cat].stepNum} ${STEP_META[cat].label}`,
      items: compatibleItems,
    };
  });
}

/**
 * 次に選択すべき未選択ステップを返す（すべて選択済みなら null）
 */
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
