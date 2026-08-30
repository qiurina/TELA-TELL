import { getSignificantFibers, type CompositionInput } from '@/data/scans/analysis';
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
  'Advisory only. Risk level is based on fiber type and published research on synthetic microplastics. The synthetic percentage is the model\'s visual confidence estimate, not a lab-verified fiber measurement. The scan does not detect microplastic particles, chemical additives, dyes, or finishes, and is not medical advice.';

const LEVEL_SUMMARIES: Record<HealthRiskLevel, string> = {
  high:
    'This mix can shed microplastic fibers in wear and wash. Chemical additives may transfer with long skin contact.',
  moderate:
    'This mix may shed microplastic fibers when worn or washed. Finishes can transfer with long skin contact.',
  low:
    'Synthetic share looks lower here. Wash habits and how long it sits on skin still matter.',
};

const FIBER_RISK_LEVELS: Partial<Record<SupportedFabric, HealthRiskLevel>> = {
  Polyester: 'high',
  Acrylic: 'high',
  Nylon: 'moderate',
  Spandex: 'moderate',
};

const PRACTICAL_TIPS: string[] = [
  'Wash in cold water on a gentle cycle when you can.',
  'Run fuller loads — a lower water-to-fabric ratio means less fiber release per wash.',
  'Skip high heat in the dryer when possible.',
  'For next buys, prefer natural-dominant or recycled tags when the fit still works for you.',
];


const CONDITION_TIPS: Partial<Record<GarmentCondition, string>> = {
  Worn: "This piece already shows wear — repeated washing and use loosen more fibers over a garment's life, so gentle care matters more from here on.",
  Damaged: 'Frayed or torn edges expose cut fiber ends, which shed more readily than intact fabric. Consider mending torn seams or retiring heavily damaged synthetic pieces.',
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

  for (const item of getSignificantFibers(compositions)) {
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
