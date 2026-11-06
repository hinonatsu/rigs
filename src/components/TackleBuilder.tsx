import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  AmazonLinkTarget,
  buildAmazonAffiliateUrl,
  getAssociateTag,
  setAssociateTag,
} from '../config/amazonAssociate';

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

// ============================================================================
// 厳選マスターカタログデータ（すべて日本語表記 + Amazonアソシエイト検索クエリ連動）
// ============================================================================

const REEL_CATALOG: ReelPart[] = [
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

const ROD_CATALOG: RodPart[] = [
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

const LINE_CATALOG: LinePart[] = [
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

const LURE_CATALOG: LurePart[] = [
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

// ============================================================================
// 物理互換性判定エンジン（日本語メッセージ）
// ============================================================================

function checkPartCompatibility(
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

// ============================================================================
// メインコンポーネント: TackleBuilder（Amazonアソシエイト購入導線対応版）
// ============================================================================

export const TackleBuilder: React.FC = () => {
  // 初期状態：100%物理適合のヒラマサ・近海マグロ PE6号標準セッティング
  const [rig, setRig] = useState<RigState>({
    reel: REEL_CATALOG[0],
    rod: ROD_CATALOG[0],
    line: LINE_CATALOG[0],
    lure: LURE_CATALOG[0],
  });

  const [mobileRigExpanded, setMobileRigExpanded] = useState<boolean>(false);
  const [amazonModalOpen, setAmazonModalOpen] = useState<boolean>(false);
  const [associateTagInput, setAssociateTagInput] = useState<string>(() => getAssociateTag());
  const [activeAssociateTag, setActiveAssociateTag] = useState<string>(() => getAssociateTag());
  const [tagSavedMessage, setTagSavedMessage] = useState<boolean>(false);
  const [showTagEditor, setShowTagEditor] = useState<boolean>(false);

  const reelSectionRef = useRef<HTMLElement>(null);
  const rodSectionRef = useRef<HTMLElement>(null);
  const lineSectionRef = useRef<HTMLElement>(null);
  const lureSectionRef = useRef<HTMLElement>(null);

  // 合計参考金額のリアルタイム計算
  const totalValue = useMemo(() => {
    return (
      (rig.reel?.price ?? 0) +
      (rig.rod?.price ?? 0) +
      (rig.line?.price ?? 0) +
      (rig.lure?.price ?? 0)
    );
  }, [rig]);

  // 総重量のリアルタイム計算
  const totalWeightG = useMemo(() => {
    return (
      (rig.reel?.weightG ?? 0) +
      (rig.rod?.weightG ?? 0) +
      Math.round(rig.lure?.totalWeightG ?? 0)
    );
  }, [rig]);

  // 全体互換性のリアルタイム検証
  const isAllSelectedCompatible = useMemo(() => {
    const items = [rig.reel, rig.rod, rig.line, rig.lure].filter(
      (i): i is AnyRigPart => i !== null
    );
    return items.every((item) => checkPartCompatibility(item, rig).compatible);
  }, [rig]);

  const selectedParts = useMemo(() => {
    const entries: Array<{ step: string; item: AnyRigPart | null }> = [
      { step: '01 リール', item: rig.reel },
      { step: '02 ロッド', item: rig.rod },
      { step: '03 ライン', item: rig.line },
      { step: '04 ルアー', item: rig.lure },
    ];
    return entries.filter(
      (entry): entry is { step: string; item: AnyRigPart } => entry.item !== null
    );
  }, [rig]);

  const selectedCount = selectedParts.length;

  const handleSelectPart = (part: AnyRigPart) => {
    setRig((prev) => {
      const isSame = prev[part.category]?.id === part.id;
      return {
        ...prev,
        [part.category]: isSame ? null : part,
      };
    });
  };

  const handleResetRig = () => {
    setRig({
      reel: null,
      rod: null,
      line: null,
      lure: null,
    });
  };

  const handleApplyPreset = (presetType: 'pe6' | 'pe8' | 'pe10') => {
    if (presetType === 'pe6') {
      setRig({
        reel: REEL_CATALOG[0],
        rod: ROD_CATALOG[0],
        line: LINE_CATALOG[0],
        lure: LURE_CATALOG[0],
      });
    } else if (presetType === 'pe8') {
      setRig({
        reel: REEL_CATALOG[2],
        rod: ROD_CATALOG[2],
        line: LINE_CATALOG[1],
        lure: LURE_CATALOG[2],
      });
    } else {
      setRig({
        reel: REEL_CATALOG[3],
        rod: ROD_CATALOG[3],
        line: LINE_CATALOG[2],
        lure: LURE_CATALOG[3],
      });
    }
  };

  const handleSaveAssociateTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = associateTagInput.trim() || 'rigsoffshore-22';
    setAssociateTag(cleaned);
    setActiveAssociateTag(cleaned);
    setAssociateTagInput(cleaned);
    setTagSavedMessage(true);
    setTimeout(() => setTagSavedMessage(false), 2500);
  };

  const scrollToSection = (cat: PartCategory) => {
    const map = {
      reel: reelSectionRef,
      rod: rodSectionRef,
      line: lineSectionRef,
      lure: lureSectionRef,
    };
    map[cat].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderPartCard = (part: AnyRigPart) => {
    const isSelected = rig[part.category]?.id === part.id;
    const { compatible, reason } = checkPartCompatibility(part, rig);
    const amazonUrl = buildAmazonAffiliateUrl(part.amazon, activeAssociateTag);

    return (
      <article
        key={part.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectPart(part)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectPart(part);
          }
        }}
        className={`group relative rounded-2xl bg-[#222222] p-6 cursor-pointer select-none transition-all duration-300 ease-out hover:scale-105 flex flex-col justify-between ${
          isSelected
            ? 'border border-[#00E5FF] shadow-[0_0_22px_rgba(0,229,255,0.5)] opacity-100'
            : compatible
            ? 'border border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:border-[#00E5FF] hover:shadow-[0_0_24px_rgba(0,229,255,0.55)] opacity-100'
            : 'border border-white/5 opacity-30 hover:opacity-55 shadow-none'
        }`}
      >
        {/* カード上部ヘッダー */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-light tracking-[0.16em] text-[#A0A0A0]">
              {part.brand}
            </span>
            {isSelected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00E5FF] text-[#151515] text-[11px] font-semibold tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.6)]">
                <Check className="w-3 h-3 stroke-[2.5]" />
                選択中
              </span>
            ) : compatible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#00E5FF]/60 bg-[#00E5FF]/10 text-[#00E5FF] text-[11px] font-normal tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                適合
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full border border-white/15 text-[#A0A0A0] text-[11px] font-light tracking-wider">
                不適合
              </span>
            )}
          </div>

          {/* 製品画像ステージ */}
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#151515] border border-white/5 mb-5">
            <img
              src={part.image}
              alt={`${part.brand} ${part.name}`}
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/85 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                {part.subCode}
              </span>
            </div>
          </div>

          {/* モデル名・参考価格 */}
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h3 className="text-lg font-normal tracking-tight text-[#FFFFFF] leading-snug">
              {part.name}
            </h3>
            <div className="text-right shrink-0">
              <span className="block text-[10px] font-light tracking-wider text-[#A0A0A0]">
                参考価格
              </span>
              <span className="text-lg font-light tracking-wider text-[#FFFFFF] tabular-nums">
                ¥{part.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 無機質かつ美しい細字スペック一覧 */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-4 border-t border-white/10">
            {part.specs.map((spec) => (
              <div key={spec.label} className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                  {spec.label}:
                </span>
                <span className="text-xs font-light tracking-wide text-[#FFFFFF] tabular-nums">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 適合判定理由 ＆ Amazon直接確認リンクフッター */}
        <div className="mt-5 pt-3.5 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[11px] font-light tracking-wide truncate ${
                compatible ? 'text-[#00E5FF]' : 'text-[#A0A0A0]'
              }`}
            >
              {reason}
            </span>
            <span
              className={`text-[11px] font-normal tracking-wider shrink-0 ${
                isSelected
                  ? 'text-[#00E5FF]'
                  : compatible
                  ? 'text-[#FFFFFF] group-hover:text-[#00E5FF]'
                  : 'text-[#A0A0A0]'
              }`}
            >
              {isSelected ? '解除する' : '選択する →'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 px-3 rounded-xl bg-[#151515] hover:bg-[#FF9900]/15 border border-white/10 hover:border-[#FF9900]/60 text-[11px] font-normal tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Amazonで在庫・最新価格を見る</span>
              <ExternalLink className="w-3 h-3 text-[#FF9900]" />
            </a>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#151515] text-[#FFFFFF] font-jp antialiased selection:bg-[#00E5FF] selection:text-[#151515] pb-28 lg:pb-16">
      {/* ==================== ミニマルトップナビゲーションバー ==================== */}
      <header className="sticky top-0 z-40 bg-[#151515]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]" />
            <span className="text-lg font-medium tracking-[0.22em] text-[#FFFFFF]">
              リグス
            </span>
            <span className="hidden sm:inline-block text-xs font-light tracking-[0.16em] text-[#A0A0A0]">
              // タックル・コンフィギュレーター
            </span>
          </div>

          {/* 推奨プリセット切替ボタン & アソシエイトID設定 */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden xl:flex items-center gap-2">
              {(
                [
                  { id: 'pe6', label: '6号標準 ヒラマサ・近海マグロ' },
                  { id: 'pe8', label: '8号 大型クロマグロ' },
                  { id: 'pe10', label: '10号 超大型遠征' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="px-3.5 py-1.5 rounded-full bg-[#222222] border border-white/10 text-xs font-light tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] hover:border-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 ease-out hover:scale-105"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTagEditor(true);
                setAmazonModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-full bg-[#222222] border border-white/10 hover:border-[#FF9900]/70 text-[11px] font-light tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] transition-all flex items-center gap-1.5"
              title="AmazonアソシエイトID（トラッキングID）の設定・確認"
            >
              <Settings className="w-3.5 h-3.5 text-[#FF9900]" />
              <span className="hidden sm:inline">Amazon ID:</span>
              <span className="font-mono text-[#FFFFFF]">{activeAssociateTag}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== 2カラム・スプリットコンフィギュレーター ==================== */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-8 lg:pt-12">
        <div className="flex flex-col lg:flex-row items-start gap-10 xl:gap-16">
          {/* =================================================================
              左カラム（PC時 Sticky 固定）：「現在のセッティング」＆「Amazon購入導線」
             ================================================================= */}
          <aside
            aria-label="現在のセッティング"
            className="w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:sticky lg:top-24"
          >
            <div className="rounded-3xl bg-[#222222] border border-white/10 p-7 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex flex-col justify-between">
              {/* ヘッダー */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                        リアルタイム適合診断
                      </span>
                    </div>
                    <h1 className="text-2xl font-light tracking-[0.1em] text-[#FFFFFF] mt-1">
                      現在のセッティング
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetRig}
                    className="px-3.5 py-1.5 rounded-full bg-[#151515] border border-white/10 text-xs font-light tracking-wider text-[#A0A0A0] hover:text-[#FFFFFF] hover:border-[#00E5FF] transition-all duration-300 ease-out hover:scale-105 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3 text-[#00E5FF]" />
                    <span>リセット</span>
                  </button>
                </div>

                {/* 適合ステータスバッジ */}
                <div
                  className={`mt-6 p-4 rounded-2xl bg-[#151515] border flex items-center justify-between ${
                    isAllSelectedCompatible && selectedCount > 0
                      ? 'border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#00E5FF] shrink-0" />
                    <div>
                      <div className="text-xs font-normal tracking-wider text-[#FFFFFF]">
                        {selectedCount === 0
                          ? 'パーツを選択してください'
                          : isAllSelectedCompatible
                          ? '物理互換性 100% 適合'
                          : '互換性の不整合あり'}
                      </div>
                      <div className="text-[11px] font-light tracking-wide text-[#A0A0A0] mt-0.5">
                        タックル総重量: {totalWeightG}g ・ 選択数: {selectedCount}/4
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-light tracking-widest text-[#00E5FF]">
                    {selectedCount > 0 && isAllSelectedCompatible ? '適合確認済' : '判定中'}
                  </span>
                </div>

                {/* 4スロット一覧（各スロットから直接Amazonへ遷移可能） */}
                <div className="mt-6 space-y-3">
                  {(
                    [
                      {
                        key: 'reel',
                        step: '01',
                        label: 'リール',
                        item: rig.reel,
                        specSummary: rig.reel
                          ? `最大ドラグ: ${rig.reel.dragMaxKg}kg ・ 糸巻量: ${rig.reel.peCapacityNum}号-${rig.reel.peCapacityMeter}m`
                          : 'スピニングリールを選択',
                      },
                      {
                        key: 'rod',
                        step: '02',
                        label: 'ロッド',
                        item: rig.rod,
                        specSummary: rig.rod
                          ? `適合ライン: ${rig.rod.minPe}〜${rig.rod.maxPe}号 ・ ルアー: ${rig.rod.lureMinG}〜${rig.rod.lureMaxG}g`
                          : 'キャスティングロッドを選択',
                      },
                      {
                        key: 'line',
                        step: '03',
                        label: 'ライン',
                        item: rig.line,
                        specSummary: rig.line
                          ? `${rig.line.peNumber}号-${rig.line.lengthM}m ・ 直線強力 ${rig.line.strengthLb}ポンド`
                          : 'メインライン＆リーダーを選択',
                      },
                      {
                        key: 'lure',
                        step: '04',
                        label: 'ルアー',
                        item: rig.lure,
                        specSummary: rig.lure
                          ? `実戦総重量: ${rig.lure.totalWeightG}g（フック・リング込）`
                          : 'オフショアプラグを選択',
                      },
                    ] as const
                  ).map((slot) => (
                    <div
                      key={slot.key}
                      onClick={() => scrollToSection(slot.key)}
                      className={`group rounded-2xl p-4 bg-[#151515] border cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] ${
                        slot.item
                          ? 'border-[#00E5FF]/50 shadow-[0_0_15px_rgba(0,229,255,0.22)]'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {slot.item ? (
                            <img
                              src={slot.item.image}
                              alt={slot.item.name}
                              className="w-11 h-11 rounded-lg object-cover bg-[#222222] border border-[#00E5FF]/40 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-[#222222] border border-white/10 flex items-center justify-center text-xs font-light text-[#A0A0A0] shrink-0">
                              {slot.step}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-light tracking-wider text-[#00E5FF]">
                                {slot.step} {slot.label}
                              </span>
                              {slot.item && (
                                <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                                  // {slot.item.brand}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-normal text-[#FFFFFF] truncate mt-0.5">
                              {slot.item ? slot.item.name : '未選択'}
                            </div>
                            <div className="text-[11px] font-light text-[#A0A0A0] truncate mt-0.5">
                              {slot.specSummary}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          {slot.item ? (
                            <>
                              <span className="text-sm font-light tracking-wider text-[#FFFFFF] tabular-nums">
                                ¥{slot.item.price.toLocaleString()}
                              </span>
                              <a
                                href={buildAmazonAffiliateUrl(
                                  slot.item.amazon,
                                  activeAssociateTag
                                )}
                                target="_blank"
                                rel="noopener noreferrer sponsored"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF9900]/15 hover:bg-[#FF9900]/30 border border-[#FF9900]/50 text-[10px] font-medium text-[#FF9900] transition-colors"
                              >
                                <span>Amazon</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </>
                          ) : (
                            <span className="text-xs font-light tracking-wider text-[#A0A0A0]">
                              選択する
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 合計参考金額 ＆ Amazon一括購入リスト表示ボタン */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-6">
                  <div>
                    <span className="text-xs font-light tracking-[0.18em] text-[#A0A0A0] block">
                      合計参考金額
                    </span>
                    <span className="text-[11px] font-light text-[#A0A0A0]">
                      ※最新価格・在庫はAmazonページにてご確認ください
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-light tracking-tight text-[#FFFFFF] tabular-nums">
                    ¥{totalValue.toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    setShowTagEditor(false);
                    setAmazonModalOpen(true);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-[#00E5FF] text-[#151515] text-sm font-semibold tracking-[0.12em] shadow-[0_0_20px_rgba(0,229,255,0.5)] hover:shadow-[0_0_30px_rgba(0,229,255,0.75)] transition-all duration-300 ease-out hover:scale-105 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Amazonで選択パーツを購入する ({selectedCount}点)</span>
                </button>
              </div>
            </div>
          </aside>

          {/* =================================================================
              右カラム（縦スクロール）：パーツ選択セクション
             ================================================================= */}
          <main className="flex-1 min-w-0 space-y-16 lg:space-y-20">
            {/* ミニマルイントロバナー */}
            <div className="border-b border-white/10 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-light tracking-[0.22em] text-[#00E5FF]">
                  高精度・物理互換性判定システム × Amazon.co.jp 購入連携
                </p>
                <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-[#FFFFFF] mt-2">
                  理想のオフショアタックルを構築する
                </h2>
              </div>
              <p className="text-xs font-light text-[#A0A0A0] max-w-md leading-relaxed">
                各パーツを選択すると、現在のセッティングに適合するパーツだけが{' '}
                <span className="text-[#00E5FF]">エレクトリックブルーの発光エフェクト</span>{' '}
                でハイライトされ、すべての適合パーツをそのままAmazon.co.jpから購入できます。
              </p>
            </div>

            {/* -------------------- 01. スピニングリール -------------------- */}
            <section ref={reelSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                    ステップ 01 // 主軸リール
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    スピニングリールを選択
                  </h3>
                </div>
                <span className="text-xs font-light tracking-wider text-[#A0A0A0]">
                  14000番 〜 20000番クラス
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {REEL_CATALOG.map((reel) => renderPartCard(reel))}
              </div>
            </section>

            {/* -------------------- 02. キャスティングロッド -------------------- */}
            <section ref={rodSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                    ステップ 02 // ブランクス＆ガイド設計
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    オフショアキャスティングロッドを選択
                  </h3>
                </div>
                <span className="text-xs font-light tracking-wider text-[#A0A0A0]">
                  リール番手・ルアー負荷連動判定
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {ROD_CATALOG.map((rod) => renderPartCard(rod))}
              </div>
            </section>

            {/* -------------------- 03. メインライン＆ショックリーダー -------------------- */}
            <section ref={lineSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                    ステップ 03 // スプール糸巻量完全一致
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    メインライン＆自動適合リーダーを選択
                  </h3>
                </div>
                <span className="text-xs font-light tracking-wider text-[#A0A0A0]">
                  スプール充填率100%・下巻き不要
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {LINE_CATALOG.map((line) => renderPartCard(line))}
              </div>
            </section>

            {/* -------------------- 04. オフショアプラグ＆太軸フック -------------------- */}
            <section ref={lureSectionRef} className="scroll-mt-24 space-y-6">
              <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-light tracking-[0.2em] text-[#00E5FF]">
                    ステップ 04 // フック・リング込み実戦総重量判定
                  </span>
                  <h3 className="text-2xl font-light tracking-wide text-[#FFFFFF] mt-1">
                    オフショアプラグ＆太軸フックセットを選択
                  </h3>
                </div>
                <span className="text-xs font-light tracking-wider text-[#A0A0A0]">
                  本体重量＋強化リング＋太軸フック総重量
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {LURE_CATALOG.map((lure) => renderPartCard(lure))}
              </div>
            </section>
          </main>
        </div>

        {/* ==================== Amazonアソシエイト 規約必須表記フッター ==================== */}
        <footer className="mt-20 pt-8 pb-6 border-t border-white/10 text-xs font-light text-[#A0A0A0] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[#FFFFFF] font-normal tracking-wide">
                Amazon.co.jp アソシエイト・プログラム参加表記
              </p>
              <p className="leading-relaxed">
                Amazonのアソシエイトとして、RIGs（リグス）は適格販売により収入を得ています。
              </p>
              <p className="text-[11px] text-[#A0A0A0]/80 leading-relaxed">
                ※当サイトに掲載されている商品価格はメーカー希望小売価格または調査時点の参考価格です。Amazon.co.jpにおける最新の販売価格・在庫状況・配送条件につきましては、各商品の「Amazonで購入」リンク先の販売ページにて直接ご確認ください。
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowTagEditor(true);
                setAmazonModalOpen(true);
              }}
              className="self-start sm:self-center shrink-0 px-4 py-2 rounded-xl bg-[#222222] border border-white/10 hover:border-[#00E5FF] text-xs text-[#FFFFFF] transition-colors flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>アソシエイトID設定 ({activeAssociateTag})</span>
            </button>
          </div>
        </footer>
      </div>

      {/* ==================== Amazon購入リスト ＆ アソシエイト設定モーダル ==================== */}
      {amazonModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#151515]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="amazon-checkout-modal-title"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#222222] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-[11px] font-light tracking-[0.2em] text-[#FF9900]">
                  AMAZON.CO.JP OFFICIAL AFFILIATE CHECKOUT
                </span>
                <h2
                  id="amazon-checkout-modal-title"
                  className="text-xl sm:text-2xl font-normal tracking-wide text-[#FFFFFF] mt-1"
                >
                  選択中のタックルをAmazonで購入する
                </h2>
                <p className="text-xs font-light text-[#A0A0A0] mt-1">
                  各パーツの「Amazon商品ページを開く」ボタンを押すと、Amazon.co.jpの販売ページが新しいタブで開きます。そのままAmazonのカートへ追加してご購入ください。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAmazonModalOpen(false)}
                className="p-2 rounded-xl bg-[#151515] border border-white/10 text-[#A0A0A0] hover:text-[#FFFFFF]"
                aria-label="モーダルを閉じる"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 選択パーツ別 Amazon購入リンク一覧 */}
            <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
              {selectedParts.map(({ step, item }) => {
                const mainUrl = buildAmazonAffiliateUrl(item.amazon, activeAssociateTag);
                const subUrl = item.amazon.subItemQuery
                  ? buildAmazonAffiliateUrl(
                      { searchQuery: item.amazon.subItemQuery },
                      activeAssociateTag
                    )
                  : null;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#151515] border border-white/10 p-4 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium tracking-wider text-[#00E5FF]">
                            {step}
                          </span>
                          <span className="text-[11px] font-light text-[#A0A0A0]">
                            // {item.brand}
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-normal text-[#FFFFFF] mt-0.5">
                          {item.name}
                        </div>
                        <div className="text-xs font-light text-[#A0A0A0] mt-0.5 tabular-nums">
                          参考価格: ¥{item.price.toLocaleString()}
                        </div>
                      </div>

                      <a
                        href={mainUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="shrink-0 px-4 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#FF9900]/90 text-[#151515] text-xs font-bold tracking-wider transition-transform hover:scale-105 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,153,0,0.35)]"
                      >
                        <span>Amazon商品ページを開く</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* 適合リーダーや太軸フックなどのサブアイテム購入ボタン */}
                    {subUrl && item.amazon.subItemLabel && (
                      <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-light text-[#00E5FF]">
                          ＋ {item.amazon.subItemLabel}
                        </span>
                        <a
                          href={subUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#FF9900]/20 border border-[#FF9900]/50 text-[11px] font-medium text-[#FF9900] transition-colors inline-flex items-center justify-center gap-1.5"
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

            {/* アソシエイトID（トラッキングID）設定・確認パネル */}
            <div className="rounded-2xl bg-[#151515] border border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowTagEditor((prev) => !prev)}
                  className="text-xs font-normal text-[#00E5FF] hover:underline flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>
                    AmazonアソシエイトID（トラッキングID）設定: <strong>{activeAssociateTag}</strong>
                  </span>
                </button>
                <a
                  href="https://affiliate.amazon.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#A0A0A0] hover:text-[#FFFFFF] inline-flex items-center gap-1"
                >
                  <span>Amazonアソシエイト公式登録ページへ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {showTagEditor && (
                <form onSubmit={handleSaveAssociateTag} className="pt-2 space-y-2.5">
                  <p className="text-[11px] font-light text-[#A0A0A0] leading-relaxed">
                    Amazonアソシエイト登録後に発行される「トラッキングID（例:{' '}
                    <code className="text-[#FFFFFF]">yourname-22</code>
                    ）」を入力して保存すると、サイト内の全Amazon購入リンクに自動付与されます。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={associateTagInput}
                      onChange={(e) => setAssociateTagInput(e.target.value)}
                      placeholder="例: yourname-22"
                      aria-label="Amazonアソシエイト・トラッキングID"
                      className="flex-1 rounded-xl bg-[#222222] border border-white/20 px-3.5 py-2 text-xs font-mono text-[#FFFFFF] focus:border-[#00E5FF] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider hover:opacity-90"
                    >
                      IDを保存して全リンクに反映
                    </button>
                  </div>
                  {tagSavedMessage && (
                    <p className="text-[11px] text-[#00E5FF]">
                      ✓ トラッキングID「{activeAssociateTag}」を保存しました。すべてのAmazonリンクに適用されています。
                    </p>
                  )}
                </form>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-light text-[#A0A0A0]">
                Amazonのアソシエイトとして、RIGsは適格販売により収入を得ています。
              </span>
              <button
                type="button"
                onClick={() => setAmazonModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#151515] border border-white/15 text-xs text-[#FFFFFF] hover:border-white/40"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== モバイル（375px〜）画面下部固定バー ==================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#151515]/95 backdrop-blur-xl border-t border-white/15">
        {/* 展開可能なセッティング内訳ドロワー */}
        {mobileRigExpanded && (
          <div className="px-5 pt-4 pb-3 border-b border-white/10 bg-[#222222] space-y-2.5 max-h-[55vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-light tracking-wider text-[#00E5FF]">
                現在のセッティング内訳 ({selectedCount}/4)
              </span>
              <button
                type="button"
                onClick={() => setMobileRigExpanded(false)}
                className="p-1 text-[#A0A0A0] hover:text-[#FFFFFF]"
                aria-label="内訳を閉じる"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {(
              [
                { label: '01 リール', item: rig.reel },
                { label: '02 ロッド', item: rig.rod },
                { label: '03 ライン', item: rig.line },
                { label: '04 ルアー', item: rig.lure },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-none gap-2"
              >
                <span className="text-[#A0A0A0] font-light tracking-wider shrink-0">
                  {s.label}
                </span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[#FFFFFF] font-light truncate max-w-[160px]">
                    {s.item ? s.item.name : '未選択'}
                  </span>
                  {s.item && (
                    <a
                      href={buildAmazonAffiliateUrl(s.item.amazon, activeAssociateTag)}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="px-2 py-0.5 rounded bg-[#FF9900]/20 border border-[#FF9900]/50 text-[10px] text-[#FF9900] shrink-0"
                    >
                      Amazon ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 下部固定バー本体 */}
        <div className="px-5 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileRigExpanded((prev) => !prev)}
            className="text-left min-w-0 flex-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-[11px] font-light tracking-wider text-[#A0A0A0]">
                現在のセッティング ({selectedCount}/4)
              </span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-[#00E5FF] transition-transform duration-300 ${
                  mobileRigExpanded ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div className="text-xl font-light tracking-tight text-[#FFFFFF] tabular-nums mt-0.5">
              ¥{totalValue.toLocaleString()}
            </div>
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => {
              setShowTagEditor(false);
              setAmazonModalOpen(true);
            }}
            className="px-5 py-3.5 rounded-xl bg-[#00E5FF] text-[#151515] text-xs font-semibold tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 ease-out hover:scale-105 disabled:opacity-30 shrink-0 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Amazonで購入 ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TackleBuilder;
