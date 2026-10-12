import type { StatusTone } from '@/constants/status-colors';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getPredictedSyntheticFibers } from '@/data/fabrics/synthetic-health-risk';
import { CLEAR_SHARE_MIN_PERCENT, type CompositionInput } from '@/data/scans/scan-confidence';
import type { EcoClaim } from '@/data/scans/mock-data';

/**
 * The "Health risk advisory" on Scan results and Eco tips (the app title's "Health Risk
 * Advisory"). It is rule-based educational guidance, not learned by the model, and it never
 * estimates a person's exposure or health risk:
 *  - the four synthetic fibers keep the app's estimated shedding level (synthetic-health-risk.ts,
 *    whose evidence does not establish a universal ranking) and add "Why it matters" from the
 *    WHO 2022 review;
 *  - every other fiber gets a status pill, never a level, because no study we use supports a
 *    shedding level for them (see shedding-why.ts). The text describes the predicted fiber and
 *    says the scan cannot confirm the item's blends, coatings or finishes.
 */

export const HEALTH_ADVISORY_LABEL = 'HEALTH RISK ADVISORY';

/** Card title for the four synthetic fibers: the level is the app's estimate. */
export const SHEDDING_ESTIMATE_TITLE = 'Estimated fiber shedding';

/** Card title for every other fiber: no level, only what the predicted fiber is. */
export const FIBER_SHEDDING_TITLE = 'Fiber shedding';

/**
 * Why shedding matters for health. WHO (2022), executive summary pp. viii-x: microplastics are
 * found in air, water and food; the data are "of only very limited use for assessing the risk";
 * "measures should be taken to mitigate exposure". The review covered studies to December 2021.
 */
export const WHY_IT_MATTERS: EcoClaim = {
  kind: 'fact',
  aspect: 'Why it matters',
  text: 'People can encounter tiny plastic particles through air, food and water. WHO’s 2022 review, covering studies through December 2021, found that the available evidence was too limited to assess human health risks reliably and recommended reducing exposure. This app cannot estimate your exposure or health risk.',
  sourceIds: ['who-2022-microplastics'],
};

/** Added to the (i) sheet so the advisory is never read as a medical result. */
export const NOT_MEDICAL_NOTE =
  'This is general advice, not a medical assessment. Health effects of microplastics are still being studied (World Health Organization, 2022).';

export type FiberStatusAdvisory = {
  fiber: SupportedFabric;
  pillLabel: string;
  tone: StatusTone;
  text: string;
  /**
   * Synthetic fibers among the other predictions with a clear share (the same 15% display
   * threshold as the photo badge's "Other prediction"; not a scientific blend threshold).
   */
  otherSynthetics: SupportedFabric[];
};

const NOT_CONFIRMED = 'this scan cannot identify';

/** One plain line per non-synthetic fiber, adapted from eco-guide.ts "Shedding / microplastics". */
const FIBER_STATUS: Partial<Record<SupportedFabric, { pillLabel: string; tone: StatusTone; text: string }>> = {
  Cotton: {
    pillLabel: 'Natural fiber',
    tone: 'good',
    text: `Cotton fibers are not plastic and can shed lint. This item may still include blends, coatings or finishes that ${NOT_CONFIRMED}.`,
  },
  Wool: {
    pillLabel: 'Natural fiber',
    tone: 'good',
    text: `Wool fibers are not plastic and can shed lint. This item may still include blends, coatings or finishes that ${NOT_CONFIRMED}.`,
  },
  Silk: {
    pillLabel: 'Natural fiber',
    tone: 'good',
    text: `Silk fibers are not plastic and can shed silk fibers. This item may still include blends, coatings or finishes that ${NOT_CONFIRMED}.`,
  },
  Linen: {
    pillLabel: 'Natural fiber',
    tone: 'good',
    text: `Linen fibers are not plastic and can shed lint. This item may still include blends, coatings or finishes that ${NOT_CONFIRMED}.`,
  },
  Abaca: {
    pillLabel: 'Natural fiber',
    tone: 'good',
    text: `Abaca fibers are not plastic and may fray. This item may still include blends, coatings or finishes that ${NOT_CONFIRMED}.`,
  },
  Rayon: {
    pillLabel: 'Cellulose-based fiber',
    tone: 'good',
    text: 'Rayon is a regenerated cellulose fiber. Its cellulose fibers are not plastic, but this scan cannot confirm the item’s blends, coatings or finishes.',
  },
  Leather: {
    pillLabel: 'Real or imitation?',
    tone: 'neutral',
    text: 'Genuine leather is animal hide, not plastic. Imitation leather (PU or PVC) is plastic. This scan cannot confirm whether the material is genuine or imitation; check the label or tag.',
  },
  Suede: {
    pillLabel: 'Real or imitation?',
    tone: 'neutral',
    text: 'Genuine suede is napped leather, not plastic. Synthetic microsuede is plastic. This scan cannot confirm whether the material is genuine or imitation; check the label or tag.',
  },
};

/** "Nylon also appears among the predictions…" — another prediction does not establish a blend. */
export function otherSyntheticNote(fibers: readonly SupportedFabric[]): string | null {
  if (fibers.length === 0) {
    return null;
  }
  const names = fibers.length === 1 ? fibers[0] : `${fibers.slice(0, -1).join(', ')} and ${fibers[fibers.length - 1]}`;
  return `${names} also ${fibers.length === 1 ? 'appears' : 'appear'} among the predictions. The scan cannot confirm a blend; check the label for actual fiber content.`;
}

export function isSyntheticFiber(fiber: SupportedFabric): boolean {
  return getFabricCategory(fiber) === 'Synthetic';
}

/**
 * The advisory for a non-synthetic top fiber, or null for a synthetic fiber (it has the rated
 * shedding card), an unknown fiber, or an Unsure scan (it names no reliable fiber).
 */
export function getFiberStatusAdvisory(
  dominantFabric: string,
  compositions: CompositionInput[],
  isUnsure: boolean,
): FiberStatusAdvisory | null {
  if (isUnsure) {
    return null;
  }
  const fiber = resolveFabricAlias(dominantFabric);
  if (!fiber || isSyntheticFiber(fiber)) {
    return null;
  }
  const status = FIBER_STATUS[fiber];
  if (!status) {
    return null;
  }
  return {
    fiber,
    ...status,
    otherSynthetics: getPredictedSyntheticFibers(dominantFabric, compositions, CLEAR_SHARE_MIN_PERCENT),
  };
}
