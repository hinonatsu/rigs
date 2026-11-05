import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ALL_40_PRODUCTS,
  MASTER_LINES,
  MASTER_LURES,
  MASTER_REELS,
  MASTER_RODS,
} from '../data/masterCatalog';
import {
  AnyGearProduct,
  HookClassCode,
  LineProduct,
  LureProduct,
  ReelProduct,
  RodProduct,
} from '../types/tackle';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface CatalogBundle {
  reels: ReelProduct[];
  rods: RodProduct[];
  lines: LineProduct[];
  lures: LureProduct[];
  dataSource: 'supabase' | 'local_hybrid';
}

/**
 * Supabase接続時はDBから全40アイテム（＋追加アイテム）を取得し、
 * 未設定またはエラー時はローカルマスターデータにシームレスにフォールバックする
 */
export async function fetchGearCatalog(): Promise<CatalogBundle> {
  if (!supabase) {
    return {
      reels: MASTER_REELS,
      rods: MASTER_RODS,
      lines: MASTER_LINES,
      lures: MASTER_LURES,
      dataSource: 'local_hybrid',
    };
  }

  try {
    const [
      { data: products, error: prodErr },
      { data: reels, error: reelErr },
      { data: rods, error: rodErr },
      { data: lines, error: lineErr },
      { data: lures, error: lureErr },
    ] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: true }),
      supabase.from('spec_reels').select('*'),
      supabase.from('spec_rods').select('*'),
      supabase.from('spec_lines').select('*'),
      supabase.from('spec_lures').select('*'),
    ]);

    if (prodErr || reelErr || rodErr || lineErr || lureErr || !products || products.length === 0) {
      return {
        reels: MASTER_REELS,
        rods: MASTER_RODS,
        lines: MASTER_LINES,
        lures: MASTER_LURES,
        dataSource: 'local_hybrid',
      };
    }

    const reelMap = new Map((reels ?? []).map((r) => [r.product_id, r]));
    const rodMap = new Map((rods ?? []).map((r) => [r.product_id, r]));
    const lineMap = new Map((lines ?? []).map((l) => [l.product_id, l]));
    const lureMap = new Map((lures ?? []).map((l) => [l.product_id, l]));

    const mappedReels: ReelProduct[] = [];
    const mappedRods: RodProduct[] = [];
    const mappedLines: LineProduct[] = [];
    const mappedLures: LureProduct[] = [];

    for (const p of products) {
      const base = {
        id: p.id,
        sku: p.sku,
        brand: p.brand,
        modelName: p.model_name,
        priceJpy: Number(p.price_jpy),
        inStock: Boolean(p.in_stock),
        expertNote: p.expert_note ?? '',
      };

      if (p.category === 'reel' && reelMap.has(p.id)) {
        const s = reelMap.get(p.id)!;
        mappedReels.push({
          ...base,
          category: 'reel',
          specs: {
            sizeClass: Number(s.size_class) as 14000 | 18000 | 20000,
            weightG: Number(s.weight_g),
            gearRatio: Number(s.gear_ratio),
            retrieveCm: Number(s.retrieve_cm),
            practicalDragKg: Number(s.practical_drag_kg),
            maxDragKg: Number(s.max_drag_kg),
            peCapacityMap: (s.pe_capacity_map ?? {}) as Record<string, number>,
          },
        });
      } else if (p.category === 'rod' && rodMap.has(p.id)) {
        const s = rodMap.get(p.id)!;
        mappedRods.push({
          ...base,
          category: 'rod',
          specs: {
            lengthFtIn: s.length_ft_in,
            lengthCm: Number(s.length_cm),
            weightG: Number(s.weight_g),
            lureMinG: Number(s.lure_min_g),
            lureMaxG: Number(s.lure_max_g),
            lureSweetMinG: Number(s.lure_sweet_min_g),
            lureSweetMaxG: Number(s.lure_sweet_max_g),
            minPe: Number(s.min_pe),
            maxPe: Number(s.max_pe),
            maxDragKg: Number(s.max_drag_kg),
            compatibleReelSizes: (s.compatible_reel_sizes ?? []).map(Number),
          },
        });
      } else if (p.category === 'line' && lineMap.has(p.id)) {
        const s = lineMap.get(p.id)!;
        mappedLines.push({
          ...base,
          category: 'line',
          specs: {
            subType: s.sub_type,
            peNumber: s.pe_number !== null ? Number(s.pe_number) : null,
            lengthM: Number(s.length_m),
            strengthLb: Number(s.strength_lb),
            defaultSubLeaderSku: s.default_sub_leader_sku ?? null,
            compatiblePeMin: s.compatible_pe_min !== null ? Number(s.compatible_pe_min) : null,
            compatiblePeMax: s.compatible_pe_max !== null ? Number(s.compatible_pe_max) : null,
          },
        });
      } else if (p.category === 'lure' && lureMap.has(p.id)) {
        const s = lureMap.get(p.id)!;
        mappedLures.push({
          ...base,
          category: 'lure',
          specs: {
            subType: s.sub_type,
            lengthMm: s.length_mm !== null ? Number(s.length_mm) : null,
            weightG: Number(s.weight_g),
            hookCode: s.hook_code as HookClassCode,
            defaultSubHookSku: s.default_sub_hook_sku ?? null,
            minPe: Number(s.min_pe),
          },
        });
      }
    }

    return {
      reels: mappedReels.length > 0 ? mappedReels : MASTER_REELS,
      rods: mappedRods.length > 0 ? mappedRods : MASTER_RODS,
      lines: mappedLines.length > 0 ? mappedLines : MASTER_LINES,
      lures: mappedLures.length > 0 ? mappedLures : MASTER_LURES,
      dataSource: 'supabase',
    };
  } catch {
    return {
      reels: MASTER_REELS,
      rods: MASTER_RODS,
      lines: MASTER_LINES,
      lures: MASTER_LURES,
      dataSource: 'local_hybrid',
    };
  }
}

export { ALL_40_PRODUCTS };
export type { AnyGearProduct };
