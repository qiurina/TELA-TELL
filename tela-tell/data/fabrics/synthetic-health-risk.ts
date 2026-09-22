import {
  getSignificantFibers,
  TRACE_DETECTION_MIN_PERCENT,
  type CompositionInput,
} from '@/data/scans/scan-confidence';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import type { GarmentCondition } from '@/data/scans/garment-condition';

export type HealthRiskLevel = 'low' | 'moderate' | 'high';

export type SyntheticHealthRisk = {
  level: HealthRiskLevel;
  label: string;
  summary: string;
  fibers: SupportedFabric[];
  /** Share of the scanned composition made up of synthetic fibers, 0-100. */
  syntheticPercent: number;
  tips: string[];
  disclaimer: string;
};

export const HEALTH_RISK_DISCLAIMER =
  'Advisory only. Risk level is based on fiber type and peer-reviewed microplastic research (see Sources in the About screen). This scan cannot detect microplastic particles, chemicals, dyes, or finishes, and it is not medical advice.';

// Deliberately doesn't claim the fiber itself causes skin reactions — most real textile
// contact-dermatitis cases trace to dyes and finishing chemicals, which this scan can't detect
// (see HEALTH_RISK_DISCLAIMER below and docs/profile-screen-audit.md).
const LEVEL_SUMMARIES: Record<HealthRiskLevel, string> = {
  high:
    'This fabric sheds more tiny plastic fibers than most other synthetic fabrics, both when washed and worn. If skin irritation happens, it is usually caused by dyes or finishing chemicals, not the fabric fibers themselves.',
  moderate:
    'This fabric can shed some tiny plastic fibers when washed and worn. If skin irritation happens, it is usually caused by dyes or finishing chemicals, not the fabric fibers themselves.',
  low:
    'This fabric has a lower amount of synthetic material, so shedding is less of a concern. Good wash habits still help with any fabric.',
};

// Ranking backed by measured microplastic-shedding rates, not editorial judgment:
// Napper & Thompson (2016, Marine Pollution Bulletin) and De Falco et al. (2020,
// Environmental Science & Technology) both found polyester/acrylic shed more fiber
// per wash than nylon/spandex. See docs/fabric-score-sources.md refs [12]-[15] for
// the full trail, including two 2025/2026 follow-up studies.
const FIBER_RISK_LEVELS: Partial<Record<SupportedFabric, HealthRiskLevel>> = {
  Polyester: 'high',
  Acrylic: 'high',
  Nylon: 'moderate',
  Spandex: 'moderate',
};

const PRACTICAL_TIPS: string[] = [
  'Wash in cold water on a gentle cycle when you can.',
  'Run fuller loads. A lower water-to-fabric ratio means less fiber release per wash.',
  'Skip high heat in the dryer when possible.',
  'For next buys, prefer natural-dominant or recycled tags when the fit still works for you.',
];


const CONDITION_TIPS: Partial<Record<GarmentCondition, string>> = {
  Worn: "This piece already shows wear. Washing and wearing it more will loosen even more fibers, so gentle care matters more from here on.",
  Damaged: 'Frayed or torn edges expose the fiber ends underneath, which shed more than fabric that is still intact. Consider fixing torn seams or replacing pieces that are badly damaged.',
};

function buildPracticalTips(condition?: GarmentCondition): string[] {
  const conditionTip = condition ? CONDITION_TIPS[condition] : undefined;
  return conditionTip ? [...PRACTICAL_TIPS, conditionTip] : PRACTICAL_TIPS;
}

const LEVEL_LABELS: Record<HealthRiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
};

const LEVEL_RANK: Record<HealthRiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
};

function isSyntheticFiber(fabric: SupportedFabric): boolean {
  return getFabricCategory(fabric) === 'Synthetic';
}

export function getFiberHealthRiskLevel(fabric: SupportedFabric): HealthRiskLevel {
  if (!isSyntheticFiber(fabric)) {
    return 'low';
  }
  return FIBER_RISK_LEVELS[fabric] ?? 'low';
}


export function getFiberHealthRiskLabel(fabric: SupportedFabric): string {
  if (!isSyntheticFiber(fabric)) {
    return 'No risk';
  }
  return LEVEL_LABELS[getFiberHealthRiskLevel(fabric)];
}


export function getSyntheticHealthRisk(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
  garmentCondition?: GarmentCondition,
): SyntheticHealthRisk | null {
  const syntheticFibers: SupportedFabric[] = [];

  // Low-share synthetics (and blends generally) can still shed materially — a 2023
  // ScienceDirect study on elastane-blend microfiber release and Zhang et al. (2025,
  // Environmental Pollution) both found this (see docs/fiber-percentage-methodology.md
  // §C). Use the noise floor here, not the blend-display heuristic, so a real detected
  // synthetic isn't silently dropped from the risk assessment.
  for (const item of getSignificantFibers(compositions, TRACE_DETECTION_MIN_PERCENT)) {
    const fiber = resolveFabricAlias(item.material);
    if (fiber && isSyntheticFiber(fiber) && !syntheticFibers.includes(fiber)) {
      syntheticFibers.push(fiber);
    }
  }

  if (syntheticFibers.length === 0) {
    const dominant = resolveFabricAlias(dominantFabric);
    if (dominant && isSyntheticFiber(dominant)) {
      syntheticFibers.push(dominant);
    }
  }

  if (syntheticFibers.length === 0) {
    return null;
  }

  let level: HealthRiskLevel = 'low';
  for (const fiber of syntheticFibers) {
    const fiberLevel = FIBER_RISK_LEVELS[fiber] ?? 'low';
    if (LEVEL_RANK[fiberLevel] > LEVEL_RANK[level]) {
      level = fiberLevel;
    }
  }

  return {
    level,
    label: LEVEL_LABELS[level],
    summary: LEVEL_SUMMARIES[level],
    fibers: syntheticFibers,
    syntheticPercent: sumSyntheticPercent(compositions, syntheticFibers),
    tips: buildPracticalTips(garmentCondition),
    disclaimer: HEALTH_RISK_DISCLAIMER,
  };
}


function sumSyntheticPercent(
  compositions: CompositionInput[],
  syntheticFibers: SupportedFabric[],
): number {
  if (compositions.length === 0) {
    return syntheticFibers.length > 0 ? 100 : 0;
  }

  let total = 0;
  for (const item of compositions) {
    const fiber = resolveFabricAlias(item.material);
    if (fiber && isSyntheticFiber(fiber)) {
      total += item.percentage;
    }
  }

  return Math.min(100, Math.round(total));
}
