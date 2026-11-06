import {
  AnyRigPart,
  findPartById,
  getPresetRigState,
  LinePart,
  LurePart,
  PartCategory,
  ReelPart,
  RigState,
  RodPart,
} from '../data/rigCatalog';

export type PageView = 'home' | 'catalog' | 'detail' | 'builder' | 'spec';

export interface RouteState {
  view: PageView;
  builderStep: PartCategory;
  catalogCategory: PartCategory | 'all';
  detailItemId: string | null;
  detailReturnView: 'catalog' | 'builder' | 'home';
}

const VALID_VIEWS: PageView[] = ['home', 'catalog', 'detail', 'builder', 'spec'];
const VALID_CATEGORIES: PartCategory[] = ['reel', 'rod', 'line', 'lure'];

/**
 * 現在の window.location.search から画面遷移状態と4スロットのタックル編成を復元する
 */
export function parseUrlState(): {
  route: RouteState;
  rig: RigState;
  hasUrlRigParams: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      route: {
        view: 'home',
        builderStep: 'reel',
        catalogCategory: 'all',
        detailItemId: null,
        detailReturnView: 'catalog',
      },
      rig: getPresetRigState('pe6'),
      hasUrlRigParams: false,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const rawView = params.get('view') as PageView | null;
  const rawStep = params.get('step') as PartCategory | null;
  const rawCat = params.get('cat') as PartCategory | 'all' | null;
  const rawItem = params.get('item');
  const rawFrom = params.get('from') as 'catalog' | 'builder' | 'home' | null;

  const reelId = params.get('reel');
  const rodId = params.get('rod');
  const lineId = params.get('line');
  const lureId = params.get('lure');

  const hasUrlRigParams = Boolean(reelId || rodId || lineId || lureId);

  let rig: RigState;
  if (hasUrlRigParams) {
    rig = {
      reel: (findPartById(reelId) as ReelPart) ?? null,
      rod: (findPartById(rodId) as RodPart) ?? null,
      line: (findPartById(lineId) as LinePart) ?? null,
      lure: (findPartById(lureId) as LurePart) ?? null,
    };
  } else {
    rig = getPresetRigState('pe6');
  }

  let view: PageView = VALID_VIEWS.includes(rawView as PageView)
    ? (rawView as PageView)
    : hasUrlRigParams
    ? 'spec'
    : 'home';

  const detailPart: AnyRigPart | null = findPartById(rawItem);
  if (view === 'detail' && !detailPart) {
    view = 'catalog';
  }

  const builderStep: PartCategory = VALID_CATEGORIES.includes(rawStep as PartCategory)
    ? (rawStep as PartCategory)
    : 'reel';

  const catalogCategory: PartCategory | 'all' =
    rawCat === 'all' || VALID_CATEGORIES.includes(rawCat as PartCategory)
      ? (rawCat as PartCategory | 'all')
      : 'all';

  const detailReturnView: 'catalog' | 'builder' | 'home' =
    rawFrom === 'builder' || rawFrom === 'home' ? rawFrom : 'catalog';

  return {
    route: {
      view,
      builderStep,
      catalogCategory,
      detailItemId: detailPart ? detailPart.id : null,
      detailReturnView,
    },
    rig,
    hasUrlRigParams,
  };
}

/**
 * RouteState と RigState から URL クエリ文字列を組み立てる
 */
export function buildUrlString(route: RouteState, rig: RigState): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  params.set('view', route.view);

  if (route.view === 'builder') {
    params.set('step', route.builderStep);
  }
  if (route.view === 'catalog' && route.catalogCategory !== 'all') {
    params.set('cat', route.catalogCategory);
  }
  if (route.view === 'detail' && route.detailItemId) {
    params.set('item', route.detailItemId);
    params.set('from', route.detailReturnView);
  }

  if (rig.reel) params.set('reel', rig.reel.id);
  if (rig.rod) params.set('rod', rig.rod.id);
  if (rig.line) params.set('line', rig.line.id);
  if (rig.lure) params.set('lure', rig.lure.id);

  url.search = params.toString();
  return url.toString();
}

/**
 * SNS共有・ブックマーク用の完成仕様書URLを生成する
 */
export function buildShareableSpecUrl(rig: RigState): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();
  params.set('view', 'spec');
  if (rig.reel) params.set('reel', rig.reel.id);
  if (rig.rod) params.set('rod', rig.rod.id);
  if (rig.line) params.set('line', rig.line.id);
  if (rig.lure) params.set('lure', rig.lure.id);
  url.search = params.toString();
  return url.toString();
}
