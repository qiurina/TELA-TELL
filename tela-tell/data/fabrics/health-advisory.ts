import type { StatusTone } from '@/constants/status-colors';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getPredictedSyntheticFibers } from '@/data/fabrics/synthetic-health-risk';
import { CLEAR_SHARE_MIN_PERCENT, type CompositionInput } from '@/data/scans/scan-confidence';

export const HEALTH_ADVISORY_LABEL = 'HEALTH RISK ADVISORY';

export const SHEDDING_ESTIMATE_TITLE = 'Estimated fiber shedding';

export const FIBER_SHEDDING_TITLE = 'Fiber shedding';

export const WHY_IT_MATTERS_TITLE = 'Why it matters';

export type WhyItMattersLine = {
  key: 'where' | 'people' | 'known' | 'limit';
  label: string;
  text: string;
  sourceIds: string[];
};

export function getWhyItMatters(fiber: string): WhyItMattersLine[] {
  const name = fiber.toLowerCase();
  const isBlendFiber = name === 'spandex';
  const wearOrWash = isBlendFiber ? 'clothes with spandex, the tiny plastic fibers they shed' : `${name}, the tiny plastic fibers it sheds`;
  const shedFrom = isBlendFiber ? 'clothes with spandex' : `${name} clothes`;
  return [
    {
      key: 'where',
      label: 'Where it goes',
      text: `When you wear or wash ${wearOrWash} can go into the air and out with the wash water.`,
      sourceIds: ['bfr-2019-microplastics-faq', 'eea-2022-textiles'],
    },
    {
      key: 'people',
      label: 'How they reach people',
      text: `Fibers shed from ${shedFrom} can get into the air. Microplastics mainly enter the body by being breathed in or swallowed.`,
      sourceIds: ['eea-2022-textiles', 'bfr-2025-microplastics'],
    },
    {
      key: 'known',
      label: 'What’s known',
      text: 'Health effects are still uncertain (WHO, 2022), but reducing exposure is recommended.',
      sourceIds: ['who-2022-microplastics'],
    },
    {
      key: 'limit',
      label: 'What this scan can’t tell',
      text: 'It can’t tell how much this garment sheds or estimate your own exposure.',
      sourceIds: [],
    },
  ];
}

export const NOT_MEDICAL_NOTE =
  'This is general advice, not a medical assessment. Health effects of microplastics are still being studied (World Health Organization, 2022).';

export type FiberStatusAdvisory = {
  fiber: SupportedFabric;
  pillLabel: string;
  tone: StatusTone;
  text: string;
  otherSynthetics: SupportedFabric[];
};

const NOT_CONFIRMED = 'this scan cannot identify';

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
