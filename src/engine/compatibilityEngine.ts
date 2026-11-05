import {
  AnyGearProduct,
  BuildOverallEvaluation,
  ItemEvaluationResult,
  LineProduct,
  LureProduct,
  ReelProduct,
  RodProduct,
  TackleBuildState,
} from '../types/tackle';

/**
 * PE号数からリールのスプール最大糸巻き量(m)を取得するヘルパー
 */
export function getReelSpoolCapacityM(reel: ReelProduct, peNumber: number): number | null {
  const keyInt = String(Math.floor(peNumber));
  const keyExact = String(peNumber);
  if (reel.specs.peCapacityMap[keyExact] !== undefined) {
    return reel.specs.peCapacityMap[keyExact];
  }
  if (reel.specs.peCapacityMap[keyInt] !== undefined) {
    return reel.specs.peCapacityMap[keyInt];
  }
  return null;
}

/**
 * プラグ単体とフックセット（未選択時はプラグの推奨フックセット）から実戦総重量(g)を計算
 */
export function calculatePracticalLureWeightG(
  plug: LureProduct,
  currentHookSet: LureProduct | null,
  allLures: LureProduct[]
): { totalWeightG: number; hookUsed: LureProduct | null } {
  let hookToUse: LureProduct | null = null;

  if (currentHookSet && currentHookSet.specs.hookCode === plug.specs.hookCode) {
    hookToUse = currentHookSet;
  } else if (plug.specs.defaultSubHookSku) {
    hookToUse =
      allLures.find(
        (h) => h.specs.subType === 'hook_ring_sub' && h.sku === plug.specs.defaultSubHookSku
      ) ?? null;
  }

  const hookWeight = hookToUse ? hookToUse.specs.weightG : 0;
  return {
    totalWeightG: Number((plug.specs.weightG + hookWeight).toFixed(1)),
    hookUsed: hookToUse,
  };
}

/**
 * 現在のビルド状態に対して、各アイテムが適合するかを判定するコアエンジン
 */
export function evaluateCandidateItem(
  candidate: AnyGearProduct,
  build: TackleBuildState,
  allLures: LureProduct[]
): ItemEvaluationResult {
  const issues: string[] = [];
  const positives: string[] = [];
  let score = 100;
  let headlineMetric = '';
  const subMetrics: ItemEvaluationResult['subMetrics'] = {};

  // ==========================================================================
  // 1. REEL の評価
  // ==========================================================================
  if (candidate.category === 'reel') {
    const reel = candidate;
    const capEntries = Object.entries(reel.specs.peCapacityMap)
      .map(([pe, m]) => `PE${pe}号-${m}m`)
      .join(' / ');
    headlineMetric = `スプール規格: ${capEntries}`;

    // ロッドとの番手整合性
    if (build.rod) {
      if (!build.rod.specs.compatibleReelSizes.includes(reel.specs.sizeClass)) {
        issues.push(
          `番手不適合: 選択中ロッド(${build.rod.modelName})の推奨番手[${build.rod.specs.compatibleReelSizes.join('/')}]に対し${reel.specs.sizeClass}番はリールシート・ガイド径が不一致`
        );
        score -= 60;
      } else {
        positives.push(
          `ロッド推奨番手(${reel.specs.sizeClass}番)に完全一致 / 合計手元重量 ${reel.specs.weightG + build.rod.specs.weightG}g`
        );
      }
    }

    // PEラインとの糸巻き量整合性
    if (build.peLine && build.peLine.specs.peNumber !== null) {
      const peNum = build.peLine.specs.peNumber;
      const capM = getReelSpoolCapacityM(reel, peNum);
      if (capM === null) {
        issues.push(
          `スプール規格外: 選択中ライン(PE${peNum}号)はこのリールの推奨糸巻き量レンジ外です`
        );
        score -= 55;
      } else {
        const fillRatio = Math.round((build.peLine.specs.lengthM / capM) * 100);
        subMetrics.spoolFillRatioPercent = fillRatio;
        if (fillRatio > 100) {
          issues.push(
            `スプール容量超過: PE${peNum}号の最大格納量${capM}mに対し、選択中ライン(${build.peLine.specs.lengthM}m)は${build.peLine.specs.lengthM - capM}m余り巻ききれません`
          );
          score -= 55;
        } else if (fillRatio === 100) {
          positives.push(`選択中PE${peNum}号-${build.peLine.specs.lengthM}mが下巻き不要で100%格納`);
        }
      }
    }
  }

  // ==========================================================================
  // 2. ROD の評価
  // ==========================================================================
  else if (candidate.category === 'rod') {
    const rod = candidate;
    headlineMetric = `適合ルアー ${rod.specs.lureMinG}–${rod.specs.lureMaxG}g (最適 ${rod.specs.lureSweetMinG}–${rod.specs.lureSweetMaxG}g) | PE ${rod.specs.minPe}–${rod.specs.maxPe}号`;

    // リールとの番手整合性
    if (build.reel) {
      if (!rod.specs.compatibleReelSizes.includes(build.reel.specs.sizeClass)) {
        issues.push(
          `リール番手不一致: 選択中リール(${build.reel.specs.sizeClass}番)に対し、このロッドの推奨番手は[${rod.specs.compatibleReelSizes.join('/')}]番です`
        );
        score -= 60;
      } else {
        positives.push(
          `${build.reel.modelName} (${build.reel.specs.sizeClass}番) と重心・ガイド抜けが完全適合`
        );
      }
    }

    // PEラインとの号数整合性
    if (build.peLine && build.peLine.specs.peNumber !== null) {
      const peNum = build.peLine.specs.peNumber;
      if (peNum > rod.specs.maxPe) {
        issues.push(
          `ライン強度超過: ロッド上限(MAX PE${rod.specs.maxPe}号)に対し選択中ライン(PE${peNum}号)は高負荷時にブランクス破損リスクがあります`
        );
        score -= 60;
      } else if (peNum < rod.specs.minPe) {
        issues.push(
          `ライン号数不足: ロッド推奨下限(PE${rod.specs.minPe}号)に対してPE${peNum}号は細すぎ、キャスト時の高切れリスクがあります`
        );
        score -= 45;
      } else {
        positives.push(`PE${peNum}号がロッド設計強度(PE${rod.specs.minPe}〜${rod.specs.maxPe}号)に適合`);
      }
    }

    // ルアー総重量との整合性
    if (build.plug) {
      const { totalWeightG } = calculatePracticalLureWeightG(build.plug, build.hookSet, allLures);
      subMetrics.totalLureWeightG = totalWeightG;
      if (totalWeightG > rod.specs.lureMaxG) {
        const diff = Number((totalWeightG - rod.specs.lureMaxG).toFixed(1));
        issues.push(
          `ルアー重量超過: 選択中ルアーのフック込総重量(${totalWeightG}g)がロッド上限(${rod.specs.lureMaxG}g)を${diff}g超過しています`
        );
        score -= 55;
      } else if (totalWeightG < rod.specs.lureMinG) {
        issues.push(
          `ルアー重量不足: 総重量(${totalWeightG}g)がロッド下限(${rod.specs.lureMinG}g)未満のためティップが反発せず飛距離が落ちます`
        );
        score -= 40;
      } else if (
        totalWeightG >= rod.specs.lureSweetMinG &&
        totalWeightG <= rod.specs.lureSweetMaxG
      ) {
        positives.push(
          `選択中ルアー総重量(${totalWeightG}g)がスイートスポット(${rod.specs.lureSweetMinG}–${rod.specs.lureSweetMaxG}g)に完全一致`
        );
        score = Math.min(100, score + 5);
      } else {
        positives.push(
          `選択中ルアー総重量(${totalWeightG}g)が許容ウェイト域(${rod.specs.lureMinG}–${rod.specs.lureMaxG}g)内`
        );
        score -= 8;
      }
    }
  }

  // ==========================================================================
  // 3. LINE (PEメイン / リーダーサブ) の評価
  // ==========================================================================
  else if (candidate.category === 'line') {
    const line = candidate;

    if (line.specs.subType === 'pe_main' && line.specs.peNumber !== null) {
      const peNum = line.specs.peNumber;
      headlineMetric = `PE ${peNum}号 (${line.specs.lengthM}m) | 最大強力 ${line.specs.strengthLb}lb`;

      // リールとのスプール容量判定
      if (build.reel) {
        const capM = getReelSpoolCapacityM(build.reel, peNum);
        if (capM === null) {
          issues.push(
            `スプール規格外: ${build.reel.modelName} の推奨糸巻き量テーブルに PE${peNum}号 は含まれません`
          );
          score -= 55;
        } else {
          const fillRatio = Math.round((line.specs.lengthM / capM) * 100);
          subMetrics.spoolFillRatioPercent = fillRatio;
          headlineMetric = `スプール充填率 ${fillRatio}% (${line.specs.lengthM}m / 容量${capM}m)`;

          if (fillRatio > 100) {
            issues.push(
              `スプール容量超過: ${build.reel.modelName} のPE${peNum}号最大格納量は${capM}mです（${line.specs.lengthM}mは${line.specs.lengthM - capM}m余り格納不可）`
            );
            score -= 60;
          } else if (fillRatio < 85) {
            issues.push(
              `糸巻き量不足: スプール容量${capM}mに対し${line.specs.lengthM}mのため下巻きが必要です`
            );
            score -= 25;
          } else {
            positives.push(
              `${build.reel.modelName} に下巻き不要でジャスト格納 (${line.specs.lengthM}m/${capM}m = ${fillRatio}%)`
            );
          }
        }
      }

      // ロッドとのPE号数判定
      if (build.rod) {
        if (peNum > build.rod.specs.maxPe) {
          issues.push(
            `ロッド強度超過: ${build.rod.modelName} の上限(MAX PE${build.rod.specs.maxPe}号)を超過（高ドラグ時にロッド折損リスク）`
          );
          score -= 60;
        } else if (peNum < build.rod.specs.minPe) {
          issues.push(
            `ロッド推奨下限未満: ${build.rod.modelName} の推奨下限(PE${build.rod.specs.minPe}号)未満のためキャスト切れリスクあり`
          );
          score -= 40;
        } else {
          positives.push(
            `ロッド(${build.rod.modelName})の適合ライン規格(PE${build.rod.specs.minPe}–${build.rod.specs.maxPe}号)に完全適合`
          );
        }
      }

      // ルアーとの最小PE判定
      if (build.plug && peNum < build.plug.specs.minPe) {
        issues.push(
          `ライン号数不足: 大型プラグ(${build.plug.modelName})の推奨ライン下限(PE${build.plug.specs.minPe}号)未満`
        );
        score -= 35;
      }
    } else {
      // Shock Leader Sub-slot evaluation
      headlineMetric = `${line.specs.strengthLb}lb (${line.specs.lengthM}m巻) | 適合PE ${line.specs.compatiblePeMin}–${line.specs.compatiblePeMax}号`;
      if (build.peLine && build.peLine.specs.peNumber !== null) {
        const peNum = build.peLine.specs.peNumber;
        const minPe = line.specs.compatiblePeMin ?? 0;
        const maxPe = line.specs.compatiblePeMax ?? 99;
        if (peNum < minPe || peNum > maxPe) {
          issues.push(
            `結束強度アンバランス: 選択中PE${peNum}号(${build.peLine.specs.strengthLb}lb)に対し、リーダー${line.specs.strengthLb}lbは適正号数範囲(PE${minPe}–${maxPe}号)外です`
          );
          score -= 50;
        } else {
          positives.push(
            `選択中PE${peNum}号(${build.peLine.specs.strengthLb}lb)に対して理想的な結束強度比 (リーダー${line.specs.strengthLb}lb)`
          );
        }
      }
    }
  }

  // ==========================================================================
  // 4. LURE (プラグメイン / フック＆リングサブ) の評価
  // ==========================================================================
  else if (candidate.category === 'lure') {
    const lure = candidate;

    if (lure.specs.subType === 'plug_main') {
      const { totalWeightG, hookUsed } = calculatePracticalLureWeightG(
        lure,
        build.hookSet,
        allLures
      );
      subMetrics.totalLureWeightG = totalWeightG;
      const hookWeight = hookUsed ? hookUsed.specs.weightG : 0;
      headlineMetric = `実戦総重量 ${totalWeightG}g (本体${lure.specs.weightG}g + 適合針${hookWeight}g)`;

      if (build.rod) {
        const rod = build.rod;
        const range = rod.specs.lureMaxG - rod.specs.lureMinG;
        const pos = Math.max(
          0,
          Math.min(100, Math.round(((totalWeightG - rod.specs.lureMinG) / range) * 100))
        );
        subMetrics.rodSweetSpotPositionPercent = pos;

        if (totalWeightG > rod.specs.lureMaxG) {
          const overG = Number((totalWeightG - rod.specs.lureMaxG).toFixed(1));
          const bodyLooksOk = lure.specs.weightG <= rod.specs.lureMaxG;
          issues.push(
            bodyLooksOk
              ? `フック込重量超過: 本体重量(${lure.specs.weightG}g)は上限内ですが、適合フック装着時の実戦総重量(${totalWeightG}g)がロッド上限(${rod.specs.lureMaxG}g)を${overG}g超過します`
              : `ルアー重量超過: 実戦総重量(${totalWeightG}g)が${rod.modelName}の上限(${rod.specs.lureMaxG}g)を${overG}g超過（ブランクス破損リスク）`
          );
          score -= 60;
        } else if (totalWeightG < rod.specs.lureMinG) {
          const underG = Number((rod.specs.lureMinG - totalWeightG).toFixed(1));
          issues.push(
            `ルアー重量不足: 実戦総重量(${totalWeightG}g)がロッド推奨下限(${rod.specs.lureMinG}g)を${underG}g下回り、反発力を活かせません`
          );
          score -= 45;
        } else if (
          totalWeightG >= rod.specs.lureSweetMinG &&
          totalWeightG <= rod.specs.lureSweetMaxG
        ) {
          positives.push(
            `実戦総重量 ${totalWeightG}g が ${rod.modelName} の最適スイートスポット(${rod.specs.lureSweetMinG}–${rod.specs.lureSweetMaxG}g)ど真ん中に合致`
          );
          score = Math.min(100, score + 5);
        } else {
          const marginG = Number((rod.specs.lureMaxG - totalWeightG).toFixed(1));
          positives.push(
            `実戦総重量 ${totalWeightG}g はロッド許容範囲内（上限${rod.specs.lureMaxG}gまで残りマージン${marginG}g）`
          );
          score -= 8;
        }
      }

      if (build.peLine && build.peLine.specs.peNumber !== null) {
        if (build.peLine.specs.peNumber < lure.specs.minPe) {
          issues.push(
            `推奨PE号数不足: 大型プラグ＆太軸フックをフッキングさせるにはPE${lure.specs.minPe}号以上が推奨されます（現在PE${build.peLine.specs.peNumber}号）`
          );
          score -= 40;
        }
      }
    } else {
      // Hook & Ring Set Sub-slot evaluation
      headlineMetric = `前後セット総重量 ${lure.specs.weightG}g | 規格 ${lure.specs.hookCode.replace('CLASS_', '#').replace('_', '/')}`;
      if (build.plug) {
        if (lure.specs.hookCode !== build.plug.specs.hookCode) {
          issues.push(
            `浮力・姿勢崩壊リスク: ${build.plug.modelName} の設計フック規格(${build.plug.specs.hookCode})と異なるため、ルアーが沈む・泳がない原因になります`
          );
          score -= 60;
        } else {
          const combinedG = Number((build.plug.specs.weightG + lure.specs.weightG).toFixed(1));
          subMetrics.totalLureWeightG = combinedG;
          if (build.rod && combinedG > build.rod.specs.lureMaxG) {
            const overG = Number((combinedG - build.rod.specs.lureMaxG).toFixed(1));
            issues.push(
              `ロッド上限超過: このフック(${lure.specs.weightG}g)を装着すると総重量が${combinedG}gとなり、ロッド上限(${build.rod.specs.lureMaxG}g)を${overG}g超過します`
            );
            score -= 55;
          } else {
            positives.push(
              `${build.plug.modelName} の浮き姿勢・アクションを100%引き出す適合重量 (装着時総重量 ${combinedG}g)`
            );
          }
        }
      }
    }
  }

  const clampedScore = Math.max(0, Math.min(100, score));
  let status: ItemEvaluationResult['status'] = 'perfect';
  if (issues.length > 0) {
    status = clampedScore < 60 ? 'incompatible' : 'warning';
  } else if (clampedScore < 95) {
    status = 'compatible';
  }

  return {
    status,
    score: clampedScore,
    isSelectable: status !== 'incompatible',
    headlineMetric,
    reasons: issues.length > 0 ? issues : positives,
    subMetrics,
  };
}

/**
 * 現在の4スロット（＋2サブスロット）全体の物理整合性を一括診断する
 */
export function evaluateOverallBuild(build: TackleBuildState): BuildOverallEvaluation {
  const { reel, rod, peLine, shockLeader, plug, hookSet } = build;
  const criticalIssues: string[] = [];

  // 完了スロット数 (メイン4枠基準)
  const completedSlotsCount = [reel, rod, peLine, plug].filter(Boolean).length;

  // 合計金額
  const totalPriceJpy =
    (reel?.priceJpy ?? 0) +
    (rod?.priceJpy ?? 0) +
    (peLine?.priceJpy ?? 0) +
    (shockLeader?.priceJpy ?? 0) +
    (plug?.priceJpy ?? 0) +
    (hookSet?.priceJpy ?? 0);

  // ルアー実戦総重量
  const totalLureWeightG =
    plug !== null ? Number((plug.specs.weightG + (hookSet?.specs.weightG ?? 0)).toFixed(1)) : null;

  // タックル総重量 (リール + ロッド + ルアー総重量)
  const totalRigWeightG =
    reel && rod ? Math.round(reel.specs.weightG + rod.specs.weightG + (totalLureWeightG ?? 0)) : null;

  // スプール充填率
  let spoolFillRatioPercent: number | null = null;
  if (reel && peLine && peLine.specs.peNumber !== null) {
    const capM = getReelSpoolCapacityM(reel, peLine.specs.peNumber);
    if (capM) {
      spoolFillRatioPercent = Math.round((peLine.specs.lengthM / capM) * 100);
    }
  }

  // 推奨初期ドラグ値 (PE直線強力の 1/4 〜 1/3.2 かつ ロッド最大ドラグの80%以内)
  let recommendedInitialDragKg: { min: number; max: number } | null = null;
  if (rod && peLine) {
    const lineBreakKg = peLine.specs.strengthLb * 0.4536;
    const minDrag = Number(Math.min(lineBreakKg * 0.2, rod.specs.maxDragKg * 0.65).toFixed(1));
    const maxDrag = Number(Math.min(lineBreakKg * 0.27, rod.specs.maxDragKg * 0.85).toFixed(1));
    recommendedInitialDragKg = { min: minDrag, max: maxDrag };
  }

  // 6項目の物理整合性チェックリスト
  const checks: BuildOverallEvaluation['checks'] = [];

  // Check 1: リール × ロッド番手規格
  if (reel && rod) {
    const ok = rod.specs.compatibleReelSizes.includes(reel.specs.sizeClass);
    if (!ok) {
      criticalIssues.push(
        `リール(${reel.specs.sizeClass}番)とロッド推奨番手(${rod.specs.compatibleReelSizes.join('/')})が不適合`
      );
    }
    checks.push({
      id: 'reel-rod-size',
      label: 'リール番手 × ロッドガイド・シート規格',
      passed: ok,
      detail: ok
        ? `${reel.specs.sizeClass}番完全適合 / 手元総重量 ${reel.specs.weightG + rod.specs.weightG}g`
        : `${reel.specs.sizeClass}番はロッド推奨外`,
    });
  } else {
    checks.push({
      id: 'reel-rod-size',
      label: 'リール番手 × ロッドガイド・シート規格',
      passed: null,
      detail: 'リールとロッドを選択してください',
    });
  }

  // Check 2: リール × PEライン糸巻き量
  if (reel && peLine && peLine.specs.peNumber !== null) {
    const capM = getReelSpoolCapacityM(reel, peLine.specs.peNumber);
    const ok = capM !== null && peLine.specs.lengthM <= capM && peLine.specs.lengthM >= capM * 0.85;
    if (!ok) {
      criticalIssues.push(
        capM === null
          ? `PE${peLine.specs.peNumber}号は${reel.modelName}のスプール規格外`
          : `スプール容量${capM}mに対しライン${peLine.specs.lengthM}mが不適合`
      );
    }
    checks.push({
      id: 'reel-line-cap',
      label: 'スプール糸巻き量（下巻き不要ジャスト格納）',
      passed: ok,
      detail:
        capM !== null
          ? `PE${peLine.specs.peNumber}号-${peLine.specs.lengthM}m / 容量${capM}m (充填率 ${spoolFillRatioPercent}%)`
          : `PE${peLine.specs.peNumber}号はスプール規格外`,
    });
  } else {
    checks.push({
      id: 'reel-line-cap',
      label: 'スプール糸巻き量（下巻き不要ジャスト格納）',
      passed: null,
      detail: 'リールとPEラインを選択してください',
    });
  }

  // Check 3: ロッド × PEライン強度上限
  if (rod && peLine && peLine.specs.peNumber !== null) {
    const ok =
      peLine.specs.peNumber >= rod.specs.minPe && peLine.specs.peNumber <= rod.specs.maxPe;
    if (!ok) {
      criticalIssues.push(
        `PE${peLine.specs.peNumber}号がロッド適合域(PE${rod.specs.minPe}–${rod.specs.maxPe}号)を超過/不足`
      );
    }
    checks.push({
      id: 'rod-line-pe',
      label: 'ロッド耐荷重 × PEライン号数',
      passed: ok,
      detail: `PE${peLine.specs.peNumber}号 (ロッド許容: PE${rod.specs.minPe}–${rod.specs.maxPe}号 / 最大ドラグ${rod.specs.maxDragKg}kg)`,
    });
  } else {
    checks.push({
      id: 'rod-line-pe',
      label: 'ロッド耐荷重 × PEライン号数',
      passed: null,
      detail: 'ロッドとPEラインを選択してください',
    });
  }

  // Check 4: PEライン × ショックリーダー強度比
  if (peLine && shockLeader && peLine.specs.peNumber !== null) {
    const minPe = shockLeader.specs.compatiblePeMin ?? 0;
    const maxPe = shockLeader.specs.compatiblePeMax ?? 99;
    const ok = peLine.specs.peNumber >= minPe && peLine.specs.peNumber <= maxPe;
    if (!ok) {
      criticalIssues.push(
        `PE${peLine.specs.peNumber}号に対しリーダー${shockLeader.specs.strengthLb}lbがアンバランス`
      );
    }
    checks.push({
      id: 'pe-leader-balance',
      label: 'PE本線 × ショックリーダー結束強度比',
      passed: ok,
      detail: `PE${peLine.specs.peNumber}号(${peLine.specs.strengthLb}lb) + リーダー${shockLeader.specs.strengthLb}lb`,
    });
  } else {
    checks.push({
      id: 'pe-leader-balance',
      label: 'PE本線 × ショックリーダー結束強度比',
      passed: null,
      detail: 'ラインを選択すると適合リーダーが自動セットされます',
    });
  }

  // Check 5: ルアー浮力 × 太軸フック＆リング規格
  if (plug && hookSet) {
    const ok = plug.specs.hookCode === hookSet.specs.hookCode;
    if (!ok) {
      criticalIssues.push(`プラグ浮力規格(${plug.specs.hookCode})とフック規格(${hookSet.specs.hookCode})が不一致`);
    }
    checks.push({
      id: 'plug-hook-match',
      label: 'プラグ浮力設計 × 太軸フック＆リング重量',
      passed: ok,
      detail: `本体${plug.specs.weightG}g + 金具${hookSet.specs.weightG}g = 実戦総重量 ${totalLureWeightG}g`,
    });
  } else {
    checks.push({
      id: 'plug-hook-match',
      label: 'プラグ浮力設計 × 太軸フック＆リング重量',
      passed: null,
      detail: 'ルアーを選択すると適合フック＆リングが自動セットされます',
    });
  }

  // Check 6: ロッド × ルアー実戦総重量 (針・リング込)
  if (rod && plug && totalLureWeightG !== null) {
    const ok = totalLureWeightG >= rod.specs.lureMinG && totalLureWeightG <= rod.specs.lureMaxG;
    const isSweet =
      totalLureWeightG >= rod.specs.lureSweetMinG && totalLureWeightG <= rod.specs.lureSweetMaxG;
    if (!ok) {
      criticalIssues.push(
        `ルアー実戦総重量(${totalLureWeightG}g)がロッド許容域(${rod.specs.lureMinG}–${rod.specs.lureMaxG}g)外`
      );
    }
    checks.push({
      id: 'rod-lure-weight',
      label: 'ロッド推奨ウェイト × ルアー実戦総重量(針込)',
      passed: ok,
      detail: ok
        ? isSweet
          ? `総重量 ${totalLureWeightG}g（スイートスポット ${rod.specs.lureSweetMinG}–${rod.specs.lureSweetMaxG}g 内に完全一致）`
          : `総重量 ${totalLureWeightG}g（許容域 ${rod.specs.lureMinG}–${rod.specs.lureMaxG}g 内）`
        : `総重量 ${totalLureWeightG}g はロッド上限(${rod.specs.lureMaxG}g)/下限(${rod.specs.lureMinG}g)外`,
    });
  } else {
    checks.push({
      id: 'rod-lure-weight',
      label: 'ロッド推奨ウェイト × ルアー実戦総重量(針込)',
      passed: null,
      detail: 'ロッドとルアーを選択してください',
    });
  }

  const activeChecks = checks.filter((c) => c.passed !== null);
  const passedChecks = activeChecks.filter((c) => c.passed === true);
  const overallScore =
    activeChecks.length === 0
      ? 100
      : Math.round((passedChecks.length / activeChecks.length) * 100);

  return {
    isFullyCompatible: criticalIssues.length === 0 && activeChecks.length > 0,
    overallScore,
    completedSlotsCount,
    totalPriceJpy,
    totalRigWeightG,
    recommendedInitialDragKg,
    spoolFillRatioPercent,
    totalLureWeightG,
    checks,
    criticalIssues,
  };
}
