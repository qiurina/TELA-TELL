/**
 * Advisory Health & Safety scores for Eco Tips.
 * Separate from synthetic Health Risk (microplastic / chemical alert).
 * Scores are rule-based from estimated composition + scan traits — not lab results.
 */

import { getSignificantFibers, type CompositionInput } from '@/data/scans/analysis';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import type { SustainabilityRating } from '@/data/scans/mock-data';

export type HealthSafetyTone = 'good' | 'caution' | 'warn';

export type SheddingLevel = 'Low' | 'Medium' | 'High';

export type HealthSafetyMetricId =
  | 'skinHealth'
  | 'microplasticShedding'
  | 'sustainabilityImpact'
  | 'environmentalImpact';

export type HealthSafetyMetric = {
  id: HealthSafetyMetricId;
  title: string;
  note: string;
  /** 0–10 for the progress bar (for shedding: intensity, not “safety”). */
  score: number;
  tone: HealthSafetyTone;
  /** Right-side value — e.g. "8.4" or shedding "High". */
  valueLabel: string;
  /** Suffix under/after value — "/10" or empty for level labels. */
  valueSuffix: string;
  sheddingLevel?: SheddingLevel;
};

export type HealthSafetyInput = {
  sustainabilityScore?: number;
  sustainabilityRating?: SustainabilityRating;
};

function clampScore(value: number): number {
  return Math.round(Math.min(10, Math.max(1, value)) * 10) / 10;
}

function toneForScore(score: number): HealthSafetyTone {
  if (score >= 7.5) {
    return 'good';
  }
  if (score >= 6) {
    return 'caution';
  }
  return 'warn';
}

function shareOf(
  compositions: CompositionInput[],
  predicate: (fiber: SupportedFabric) => boolean,
): number {
  let total = 0;
  for (const item of compositions) {
    const fiber = resolveFabricAlias(item.material);
    if (fiber && predicate(fiber)) {
      total += item.percentage;
    }
  }
  return total;
}

function fiberListLabel(fibers: SupportedFabric[]): string {
  if (fibers.length === 0) {
    return 'this fabric';
  }
  if (fibers.length === 1) {
    return fibers[0].toLowerCase();
  }
  return `${fibers.slice(0, 2).join(' / ').toLowerCase()}`;
}

/** Acrylic & polyester shed more readily than nylon / spandex blends. */
function sheddingLevelFromComposition(
  syntheticShare: number,
  highShedShare: number,
): SheddingLevel {
  if (syntheticShare < 15) {
    return 'Low';
  }
  if (syntheticShare >= 50 || highShedShare >= 35) {
    return 'High';
  }
  return 'Medium';
}

function sheddingTone(level: SheddingLevel): HealthSafetyTone {
  if (level === 'Low') {
    return 'good';
  }
  if (level === 'Medium') {
    return 'caution';
  }
  return 'warn';
}

/** Bar fill for shedding intensity (High fills more). */
function sheddingBarScore(level: SheddingLevel): number {
  if (level === 'Low') {
    return 2.5;
  }
  if (level === 'Medium') {
    return 5.5;
  }
  return 9.0;
}

function sustainabilityToScore(
  score: number | undefined,
  rating: SustainabilityRating | undefined,
): number {
  if (typeof score === 'number' && Number.isFinite(score)) {
    return clampScore(score);
  }
  if (rating === 'green') {
    return 8.5;
  }
  if (rating === 'yellow') {
    return 6.5;
  }
  if (rating === 'red') {
    return 4.0;
  }
  return 7.0;
}

/**
 * Builds four Health & Safety metric cards from scan composition + eco traits.
 */
export function getHealthSafetyMetrics(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
  input: HealthSafetyInput = {},
): HealthSafetyMetric[] {
  const items =
    compositions.length > 0 ? compositions : [{ material: dominantFabric, percentage: 100 }];
  const significant = getSignificantFibers(items);

  const syntheticShare = shareOf(items, (fiber) => getFabricCategory(fiber) === 'Synthetic');
  const woolShare = shareOf(items, (fiber) => fiber === 'Wool');
  const acrylicShare = shareOf(items, (fiber) => fiber === 'Acrylic');
  const polyesterShare = shareOf(items, (fiber) => fiber === 'Polyester');
  const highShedShare = acrylicShare + polyesterShare;
  const irritantShare = woolShare + acrylicShare;

  const irritantFibers = significant
    .map((item) => resolveFabricAlias(item.material))
    .filter((fiber): fiber is SupportedFabric => Boolean(fiber))
    .filter(
      (fiber) =>
        fiber === 'Wool' || fiber === 'Acrylic' || getFabricCategory(fiber) === 'Synthetic',
    );
  const uniqueIrritants = [...new Set(irritantFibers)];

  // 1. Skin Health — comfort + sensitive skin.
  let skinHealth = 9.2 - irritantShare * 0.055 - syntheticShare * 0.02;
  skinHealth = clampScore(skinHealth);
  const skinNote =
    skinHealth >= 8
      ? 'Gentle on most skin. Good everyday comfort for sensitive wearers.'
      : skinHealth >= 6.5
        ? `May affect comfort for sensitive skin due to ${fiberListLabel(uniqueIrritants)}.`
        : `Higher irritation potential. Prefer a soft natural layer next to skin.`;

  // 2. Microplastic shedding — educational Low / Medium / High.
  const sheddingLevel = sheddingLevelFromComposition(syntheticShare, highShedShare);
  const sheddingNote =
    sheddingLevel === 'Low'
      ? 'Little synthetic content. Low release during wear and wash.'
      : sheddingLevel === 'Medium'
        ? 'Some synthetics. Moderate shedding; wash cold on full loads.'
        : 'High synthetic share. More shedding in wear and laundry.';

  // 3. Sustainability impact — from scan sustainability score/rating.
  const sustainability = sustainabilityToScore(
    input.sustainabilityScore,
    input.sustainabilityRating,
  );
  const sustainabilityNote =
    sustainability >= 8
      ? 'Stronger eco profile for reuse and lower-impact fiber choices.'
      : sustainability >= 6
        ? 'Mixed sustainability. Prefer longer wear and careful washing.'
        : 'Weaker sustainability profile. Prioritize reuse, repair, or natural swaps.';

  // 4. Environmental impact — footprint from synthetics + sustainability.
  let environmental = sustainability - syntheticShare * 0.03 - highShedShare * 0.015;
  environmental = clampScore(environmental);
  const environmentalNote =
    environmental >= 8
      ? 'Lower environmental burden relative to heavy synthetic blends.'
      : environmental >= 6
        ? 'Moderate footprint. Extend garment life to reduce waste.'
        : 'Higher environmental load from synthetics and wash shedding.';

  return [
    {
      id: 'skinHealth',
      title: 'Skin Health',
      note: skinNote,
      score: skinHealth,
      tone: toneForScore(skinHealth),
      valueLabel: skinHealth.toFixed(1),
      valueSuffix: ' /10',
    },
    {
      id: 'microplasticShedding',
      title: 'Microplastic Shedding',
      note: sheddingNote,
      score: sheddingBarScore(sheddingLevel),
      tone: sheddingTone(sheddingLevel),
      valueLabel: sheddingLevel,
      valueSuffix: '',
      sheddingLevel,
    },
    {
      id: 'sustainabilityImpact',
      title: 'Sustainability Impact',
      note: sustainabilityNote,
      score: sustainability,
      tone: toneForScore(sustainability),
      valueLabel: sustainability.toFixed(1),
      valueSuffix: ' /10',
    },
    {
      id: 'environmentalImpact',
      title: 'Environmental Impact',
      note: environmentalNote,
      score: environmental,
      tone: toneForScore(environmental),
      valueLabel: environmental.toFixed(1),
      valueSuffix: ' /10',
    },
  ];
}
