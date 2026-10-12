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
  /** Why this scan got its level: the most likely fiber's reason. Shown on the card. */
  reason: string;
  /** Second, quieter line shown under `reason` on the Recommendations screen. */
  note: string;
  fibers: SupportedFabric[];
  /** Share of the scanned composition made up of synthetic fibers, 0-100. */
  syntheticPercent: number;
  /** The (i) sheet: what the estimate is not. */
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

// The shedding level makes no claim about skin reactions (see docs/profile-screen-audit.md for why
// an earlier claim about dyes was removed); fiber sensitivities are a separate check.
const HEALTH_NOTE = 'Not a medical assessment. Fiber sensitivities you add in your profile are checked separately.';

const LEVEL_NOTES: Record<HealthRiskLevel, string> = {
  high: HEALTH_NOTE,
  moderate: HEALTH_NOTE,
  low: 'Good wash habits still help with any fabric.',
};

// These levels are the app's own estimated shedding level for each predicted fiber, based on
// selected studies, not an established scientific ranking. Studies checked against their
// abstracts (see data/fabrics/shedding-basis.ts and docs/shedding-evidence-2026-10-10.md):
//  - Polyester and acrylic fabrics shed measurable fibres (Napper & Thompson 2016: over 700,000
//    fibres estimated for a 6 kg load of acrylic; a polyester-cotton blend shed fewer).
//  - Nylon sheds too, and less than fleece/jersey polyester in one comparison, though the
//    samples differed in construction as well as fibre (Vassilenko et al. 2021).
//  - A cotton/elastane knit released microfibres, more with more elastane (Rathinamoorthy 2023).
// What the studies do NOT establish: no study checked compares polyester, acrylic, nylon and
// spandex together; Napper & Thompson did not test nylon or spandex; De Falco et al. (2020)
// tested polyester garments only. An earlier version of this comment said Napper & Thompson and
// De Falco (2020) found polyester/acrylic shed more than nylon/spandex; their abstracts do not
// say that, so the claim was removed. The levels themselves are left unchanged: the evidence
// reviewed neither contradicts them nor confirms the High/Moderate ordering. Construction
// (knit or woven, yarn twist, wear) mattered as much as fibre in several studies, and this app
// does not model it.
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


/**
 * Every synthetic fiber the scan predicted at or above the noise floor, most likely first (falling
 * back to the top result). Used for the "Possible Synthetic Fiber" badge and the synthetic share.
 * It does NOT set the shedding level; see `getSyntheticHealthRisk`.
 *
 * The floor itself (TRACE_DETECTION_MIN_PERCENT) is a practical limit on the MODEL'S CONFIDENCE
 * percentages (a real detection or a model artifact). It is not based on any shedding study and
 * is not a physical fiber proportion, so no study here supports or sets its value. Studies of
 * physical fiber content are context only, and on blends they disagree:
 *  - Rathinamoorthy et al. (2023, Sci. Total Environ. 903:166553): cotton/elastane knits at
 *    2%, 5% and 8% elastane all released microfibers, more with more elastane (abstract only).
 *  - Zhang et al. (2025, Environ. Pollut. 383:126909): polyester release was significantly
 *    higher from cotton/polyester blends than from polyester fabric alone (abstract only; it
 *    does not report total fibre counts).
 *  - Napper & Thompson (2016, Mar. Pollut. Bull. 112:39-45): polyester-cotton shed significantly
 *    fewer fibres than polyester or acrylic.
 * Verification notes: docs/shedding-evidence-2026-10-10.md.
 */
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

/**
 * The shedding card for a scan. It follows the most likely fiber only: the level and the reason
 * are that fiber's, so the card always matches the "Likely ..." result above it. A lower-ranked
 * prediction never sets the level. The model's confidence percentages are not the garment's real
 * composition, so they are not combined or used as a cutoff. When the most likely fiber is not
 * synthetic there is no card (use `getPredictedSyntheticFibers` to still flag a possible
 * synthetic).
 */
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
