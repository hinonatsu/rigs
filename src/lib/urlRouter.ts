import {
  findPartById,
  getPresetRigState,
  LinePart,
  LurePart,
  PartCategory,
  ReelPart,
  RigState,
  RodPart,
  TargetId,
} from '../data/rigCatalog';

export type PageView = 'home' | 'garage' | 'checkout';

export interface RouteState {
  view: PageView;
  targetId: TargetId;
  activeStep: PartCategory;
}

const VALID_TARGETS: TargetId[] = ['pe6', 'pe8', 'pe10'];
const VALID_STEPS: PartCategory[] = ['reel', 'rod', 'line', 'lure'];

/**
 * 現在の window.location.search から画面状態・ターゲット魚種・4スロット装備を復元する
 */
export function parseUrlState(): {
  route: RouteState;
  rig: RigState;
} {
  if (typeof window === 'undefined') {
    return {
      route: {
        view: 'garage',
        targetId: 'pe6',
        activeStep: 'reel',
      },
      rig: getPresetRigState('pe6'),
    };
  }

  const params = new URLSearchParams(window.location.search);
  const rawView = params.get('view');
  const rawTarget = params.get('target') as TargetId | null;
  const rawStep = params.get('step') as PartCategory | null;

  const targetId: TargetId = VALID_TARGETS.includes(rawTarget as TargetId)
    ? (rawTarget as TargetId)
    : 'pe6';

  const activeStep: PartCategory = VALID_STEPS.includes(rawStep as PartCategory)
    ? (rawStep as PartCategory)
    : 'reel';

  const reelId = params.get('reel');
  const rodId = params.get('rod');
  const lineId = params.get('line');
  const lureId = params.get('lure');
  const hasUrlRigParams = Boolean(reelId || rodId || lineId || lureId);

  const presetFallback = getPresetRigState(targetId);

  const rig: RigState = hasUrlRigParams
    ? {
        reel: (findPartById(reelId) as ReelPart) ?? presetFallback.reel,
        rod: (findPartById(rodId) as RodPart) ?? presetFallback.rod,
        line: (findPartById(lineId) as LinePart) ?? presetFallback.line,
        lure: (findPartById(lureId) as LurePart) ?? presetFallback.lure,
      }
    : presetFallback;

  let view: PageView = 'garage';
  if (rawView === 'garage' || rawView === 'builder') {
    view = 'garage';
  } else if (rawView === 'checkout' || rawView === 'spec') {
    view = 'checkout';
  } else if (rawView === 'home') {
    view = 'home';
  } else if (hasUrlRigParams) {
    view = 'checkout';
  }

  return {
    route: {
      view,
      targetId,
      activeStep,
    },
    rig,
  };
}

/**
 * RouteState と RigState から URL クエリ文字列を生成する
 */
export function buildUrlString(route: RouteState, rig: RigState): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  params.set('view', route.view);
  params.set('target', route.targetId);

  if (route.view === 'garage') {
    params.set('step', route.activeStep);
  }

  if (rig.reel) params.set('reel', rig.reel.id);
  if (rig.rod) params.set('rod', rig.rod.id);
  if (rig.line) params.set('line', rig.line.id);
  if (rig.lure) params.set('lure', rig.lure.id);

  url.search = params.toString();
  return url.toString();
}

/**
 * SNS共有・ブックマーク用の最終装備URLを生成する
 */
export function buildShareableSpecUrl(rig: RigState, targetId: TargetId = 'pe6'): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  const params = new URLSearchParams();
  params.set('view', 'checkout');
  params.set('target', targetId);
  if (rig.reel) params.set('reel', rig.reel.id);
  if (rig.rod) params.set('rod', rig.rod.id);
  if (rig.line) params.set('line', rig.line.id);
  if (rig.lure) params.set('lure', rig.lure.id);
  url.search = params.toString();
  return url.toString();
}
