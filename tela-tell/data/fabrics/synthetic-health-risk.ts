/**
 * Rule-based synthetic fiber health risk lookup.
 * Levels are advisory, mapped per fiber type from published research
 * (e.g. 2024 University of Birmingham study in Environment International on
 * skin absorption of chemical additives from synthetic microplastics).
 * The app does NOT detect microplastic particles or chemical additives in the image.
 */

import { getSignificantFibers, type CompositionInput } from '@/data/scans/analysis';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';

export type HealthRiskLevel = 'low' | 'moderate' | 'high';

export type SyntheticHealthRisk = {
  level: HealthRiskLevel;
  label: string;
  /** Synthetic fibers found in the estimated composition, highest share first. */
  fibers: SupportedFabric[];
  factors: string[];
  disclaimer: string;
};

export const HEALTH_RISK_DISCLAIMER =
  'Advisory only. Risk level is based on fiber type and published research on synthetic microplastics — the scan does not detect microplastic particles, chemical additives, dyes, or finishes, and is not medical advice.';

/** Per-fiber advisory risk level. Fibers not listed carry no synthetic risk label. */
const FIBER_RISK_LEVELS: Partial<Record<SupportedFabric, HealthRiskLevel>> = {
  Polyester: 'high',
  Acrylic: 'high',
  Nylon: 'moderate',
  Spandex: 'moderate',
};

const FIBER_RISK_NOTES: Partial<Record<SupportedFabric, string>> = {
  Polyester:
    'Polyester is a petroleum-based fiber that sheds microplastics, especially in frequent-wash everyday wear.',
  Acrylic:
    'Acrylic knits shed microplastic fibers readily and sit directly on the skin in sweaters and layers.',
  Nylon:
    'Nylon is synthetic but often used in outer layers and bags with less all-day skin contact.',
  Spandex:
    'Spandex is usually a small blend component; overall exposure depends on the blend ratio.',
};

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

  // Fall back to the dominant label when compositions are missing.
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

  const factors = syntheticFibers
    .map((fiber) => FIBER_RISK_NOTES[fiber])
    .filter((note): note is string => Boolean(note));

  return {
    level,
    label: LEVEL_LABELS[level],
    fibers: syntheticFibers,
    factors,
    disclaimer: HEALTH_RISK_DISCLAIMER,
  };
}
