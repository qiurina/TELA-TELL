/**
 * Rule-based synthetic fiber health risk lookup.
 * Levels are advisory, mapped per fiber type from published research
 * The app does NOT detect microplastic particles or chemical additives in the image.
 */

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

/**
 * Per-fiber advisory risk level, based on published microfiber-shedding research:
 * - Polyester 'high': ~496,000 fibers shed per 6kg wash (Napper & Thompson, 2016,
 *   Marine Pollution Bulletin).
 * - Acrylic 'high': ~730,000 fibers shed per 6kg wash in the same study — the
 *   highest of the fibers tested, attributed to acrylic's lower fiber tenacity.
 * - Nylon 'moderate': sheds less than polyester/acrylic but still releases
 *   significant quantities (same study; multiple later studies confirm the ranking).
 * - Spandex/elastane 'moderate': confirmed real contributor to shed microfibers in
 *   blended fabrics (~3.67% of total shed fibers in household laundry per Kang et
 *   al., 2023, Science of the Total Environment) — not negligible, but no evidence
 *   supporting a 'high' classification either.
 *
 * Rayon is deliberately excluded: it's regenerated plant cellulose (semi-synthetic,
 * `getFabricCategory('Rayon') === 'Semi-synthetic'`), not a petroleum-based plastic
 * like the fibers below — it doesn't shed microplastics the same way, so grouping it
 * under synthetic/microplastic health risk would be scientifically inaccurate.
 */
const FIBER_RISK_LEVELS: Partial<Record<SupportedFabric, HealthRiskLevel>> = {
  Polyester: 'high',
  Acrylic: 'high',
  Nylon: 'moderate',
  Spandex: 'moderate',
};

/**
 * Cold water: cold-water washing reduces fiber shedding by roughly 30-40% versus
 * hot water (consistent across multiple wash-condition studies).
 * Fuller loads: a lower water-to-fabric ratio measurably reduces shedding — a UK
 * household-laundry study (De Falco et al., 2020, PLOS One) found ~50% less fiber
 * release in larger (3.5-6.0kg) loads versus smaller (1.0-3.5kg) loads.
 * High heat drying: tumble-drying heat causes fiber damage and increases airborne
 * microfiber release, comparable in scale to washing-machine shedding.
 */
const PRACTICAL_TIPS: string[] = [
  'Wash in cold water on a gentle cycle when you can.',
  'Run fuller loads — a lower water-to-fabric ratio means less fiber release per wash.',
  'Skip high heat in the dryer when possible.',
  'For next buys, prefer natural-dominant or recycled tags when the fit still works for you.',
];

/**
 * Condition-specific add-on tips, appended to PRACTICAL_TIPS. Kept to physically
 * defensible mechanisms rather than a fabricated shedding-rate statistic:
 * - Damaged: torn/frayed edges expose cut fiber ends directly, a straightforward
 *   physical reason for more loose-fiber shedding at that spot.
 * - Worn: general acknowledgement that repeated wash/wear cycles accumulate fiber
 *   fatigue over a garment's life, without asserting an unverified specific rate.
 */
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

/**
 * Sums the composition percentage attributed to synthetic fibers. Falls back to 100
 * when no per-fiber breakdown is available (dominant-only scans) since the detected
 * synthetic fiber is then the only known material.
 */
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
