import {
  getSignificantFibers,
  TRACE_DETECTION_MIN_PERCENT,
  type CompositionInput,
} from '@/data/scans/scan-confidence';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import type { InfoSection } from '@/data/fabrics/assessment-disclaimers';
import { SHEDDING_LIMITS_SECTIONS, buildSheddingReason } from '@/data/fabrics/shedding-why';

export type HealthRiskLevel = 'low' | 'moderate' | 'high';

export type SyntheticHealthRisk = {
  level: HealthRiskLevel;
  label: string;
  reason: string;
  note: string;
  fibers: SupportedFabric[];
  syntheticPercent: number;
  disclaimer: InfoSection[];
};

export const HEALTH_RISK_DISCLAIMER: InfoSection[] = [
  {
    heading: 'What it is',
    body: "The app's estimated shedding level, based on selected studies listed in About. Not an established ranking.",
  },
  {
    heading: "What it isn't",
    body: "Not a measurement of your garment. The app can't see or count microplastic particles, and real shedding depends on how it was made, its condition, and how it's washed. Not medical advice.",
  },
];

const HEALTH_NOTE = 'Not a medical assessment. Fiber sensitivities you add in your profile are checked separately.';

const LEVEL_NOTES: Record<HealthRiskLevel, string> = {
  high: HEALTH_NOTE,
  moderate: HEALTH_NOTE,
  low: 'Good wash habits still help with any fabric.',
};

// Basis: Napper & Thompson 2016, Vassilenko 2021, Rathinamoorthy 2023 (app estimate, not a ranking).
const FIBER_RISK_LEVELS: Partial<Record<SupportedFabric, HealthRiskLevel>> = {
  Polyester: 'high',
  Acrylic: 'high',
  Nylon: 'moderate',
  Spandex: 'moderate',
};

const LEVEL_LABELS: Record<HealthRiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
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
    return 'Not synthetic';
  }
  return LEVEL_LABELS[getFiberHealthRiskLevel(fabric)];
}

// The 2% floor is a model-confidence cutoff, not from a shedding study.
export function getPredictedSyntheticFibers(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
  minPercent: number = TRACE_DETECTION_MIN_PERCENT,
): SupportedFabric[] {
  const syntheticFibers: SupportedFabric[] = [];

  for (const item of getSignificantFibers(compositions, minPercent)) {
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

  return syntheticFibers;
}

export function getSyntheticHealthRisk(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
): SyntheticHealthRisk | null {
  const top = resolveFabricAlias(dominantFabric);
  if (!top || !isSyntheticFiber(top)) {
    return null;
  }

  const level = FIBER_RISK_LEVELS[top] ?? 'low';

  return {
    level,
    label: LEVEL_LABELS[level],
    reason: buildSheddingReason(top),
    note: LEVEL_NOTES[level],
    fibers: [top],
    syntheticPercent: sumSyntheticPercent(
      compositions,
      getPredictedSyntheticFibers(dominantFabric, compositions),
    ),
    disclaimer: SHEDDING_LIMITS_SECTIONS,
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
