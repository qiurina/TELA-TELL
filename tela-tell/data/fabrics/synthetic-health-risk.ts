/**
 * Rule-based synthetic fiber health risk lookup.
 * Levels are advisory, mapped per fiber type from published research
 * The app does NOT detect microplastic particles or chemical additives in the image.
 */

import { getSignificantFibers, type CompositionInput } from '@/data/scans/analysis';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';

export type HealthRiskLevel = 'low' | 'moderate' | 'high';

export type SyntheticHealthRisk = {
  level: HealthRiskLevel;
  label: string;
  summary: string;
  fibers: SupportedFabric[];
  tips: string[];
  disclaimer: string;
};

export const HEALTH_RISK_DISCLAIMER =
  'Advisory only. Risk level is based on fiber type and published research on synthetic microplastics. The scan does not detect microplastic particles, chemical additives, dyes, or finishes, and is not medical advice.';

const LEVEL_SUMMARIES: Record<HealthRiskLevel, string> = {
  high:
    'This mix can shed microplastic fibers in wear and wash. Chemical additives may transfer with long skin contact.',
  moderate:
    'This mix may shed microplastic fibers when worn or washed. Finishes can transfer with long skin contact.',
  low:
    'Synthetic share looks lower here. Wash habits and how long it sits on skin still matter.',
};

/** Per-fiber advisory risk level. Fibers not listed carry no synthetic risk label. */
const FIBER_RISK_LEVELS: Partial<Record<SupportedFabric, HealthRiskLevel>> = {
  Polyester: 'high',
  Acrylic: 'high',
  Nylon: 'moderate',
  Spandex: 'moderate',
};

const PRACTICAL_TIPS: string[] = [
  'Wash in cold water on a gentle cycle when you can.',
  'Run fuller loads so fabrics rub less and shed less.',
  'Skip high heat in the dryer when possible.',
  'For next buys, prefer natural-dominant or recycled tags when the fit still works for you.',
];

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

/**
 * Advisory risk level for a single fiber (used for the Fiber Guide list).
 * Non-synthetic fibers are treated as low / no synthetic risk.
 */
export function getFiberHealthRiskLevel(fabric: SupportedFabric): HealthRiskLevel {
  if (!isSyntheticFiber(fabric)) {
    return 'low';
  }
  return FIBER_RISK_LEVELS[fabric] ?? 'low';
}

/** Short chip label: "No risk" for non-synthetics, Low/Moderate/High for synthetics. */
export function getFiberHealthRiskLabel(fabric: SupportedFabric): string {
  if (!isSyntheticFiber(fabric)) {
    return 'No risk';
  }
  return LEVEL_LABELS[getFiberHealthRiskLevel(fabric)];
}

/**
 * Returns an advisory health risk when the estimated composition contains a
 * significant synthetic fiber (same ≥15% threshold used for blend detection).
 * Returns null for natural / plant / animal fiber scans so no card is shown.
 */
export function getSyntheticHealthRisk(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
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
    tips: PRACTICAL_TIPS,
    disclaimer: HEALTH_RISK_DISCLAIMER,
  };
}
