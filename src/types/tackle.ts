export type GearCategory = 'reel' | 'rod' | 'line' | 'lure';
export type LineSubType = 'pe_main' | 'leader_sub';
export type LureSubType = 'plug_main' | 'hook_ring_sub';
export type HookClassCode = 'CLASS_3_0' | 'CLASS_4_0' | 'CLASS_5_0';

export interface BaseProduct {
  id: string;
  sku: string;
  category: GearCategory;
  brand: string;
  modelName: string;
  priceJpy: number;
  inStock: boolean;
  expertNote: string;
}

export interface ReelProduct extends BaseProduct {
  category: 'reel';
  specs: {
    sizeClass: 14000 | 18000 | 20000;
    weightG: number;
    gearRatio: number;
    retrieveCm: number;
    practicalDragKg: number;
    maxDragKg: number;
    /** PE号数(文字列: "6", "8", "10", "12") -> 糸巻き量(m) */
    peCapacityMap: Record<string, number>;
  };
}

export interface RodProduct extends BaseProduct {
  category: 'rod';
  specs: {
    lengthFtIn: string;
    lengthCm: number;
    weightG: number;
    lureMinG: number;
    lureMaxG: number;
    lureSweetMinG: number;
    lureSweetMaxG: number;
    minPe: number;
    maxPe: number;
    maxDragKg: number;
    compatibleReelSizes: number[];
  };
}

export interface LineProduct extends BaseProduct {
  category: 'line';
  specs: {
    subType: LineSubType;
    peNumber: number | null;
    lengthM: number;
    strengthLb: number;
    defaultSubLeaderSku: string | null;
    compatiblePeMin: number | null;
    compatiblePeMax: number | null;
  };
}

export interface LureProduct extends BaseProduct {
  category: 'lure';
  specs: {
    subType: LureSubType;
    lengthMm: number | null;
    weightG: number;
    hookCode: HookClassCode;
    defaultSubHookSku: string | null;
    minPe: number;
  };
}

export type AnyGearProduct = ReelProduct | RodProduct | LineProduct | LureProduct;

export interface TackleBuildState {
  reel: ReelProduct | null;
  rod: RodProduct | null;
  peLine: LineProduct | null;
  shockLeader: LineProduct | null;
  plug: LureProduct | null;
  hookSet: LureProduct | null;
}

export type CompatibilityStatus = 'perfect' | 'compatible' | 'warning' | 'incompatible';

export interface ItemEvaluationResult {
  status: CompatibilityStatus;
  score: number; // 0 to 100
  isSelectable: boolean;
  headlineMetric: string; // e.g. "スプール充填率 100% (300m/300m)" or "実戦総重量 81.5g (最適域 60–95g)"
  reasons: string[]; // Positive match grounds or specific physical failure reasons
  subMetrics?: {
    spoolFillRatioPercent?: number;
    totalLureWeightG?: number;
    rodSweetSpotPositionPercent?: number;
  };
}

export interface BuildOverallEvaluation {
  isFullyCompatible: boolean;
  overallScore: number;
  completedSlotsCount: number;
  totalPriceJpy: number;
  totalRigWeightG: number | null; // Reel + Rod + Lure + Hook
  recommendedInitialDragKg: { min: number; max: number } | null;
  spoolFillRatioPercent: number | null;
  totalLureWeightG: number | null;
  checks: {
    id: string;
    label: string;
    passed: boolean | null; // null if required slots not selected yet
    detail: string;
  }[];
  criticalIssues: string[];
}

export interface TargetPreset {
  id: string;
  title: string;
  fieldTag: string;
  targetWeightClass: string;
  description: string;
  skus: {
    reel: string;
    rod: string;
    peLine: string;
    shockLeader: string;
    plug: string;
    hookSet: string;
  };
}
