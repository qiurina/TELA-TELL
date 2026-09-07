import type { CompositionInput } from '@/data/scans/scan-confidence';
import { getFabricCategory, resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getFiberProfile } from '@/data/fabrics/fiber-profiles';
import { getWeightedComfort, type ComfortAxisKey } from '@/data/fabrics/comfort-profile';

export type HealthSafetyTone = 'good' | 'caution' | 'warn';

export type SheddingLevel = 'Low' | 'Medium' | 'High';

// Sustainability Impact and Environmental Impact metrics were removed — they duplicated the
// Sustainability score already shown on the Results screen and the Profile screen's Eco tab
// (same underlying score, recomputed and re-labeled a third time here).
export type HealthSafetyMetricId = 'skinHealth' | 'microplasticShedding';

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

// Notes for whichever comfort axis scores lowest across the weighted blend — see
// data/fabrics/comfort-profile.ts for the research behind each axis. Deliberately framed as
// comfort/discomfort, not irritation or allergy.
const AXIS_NOTE: Record<ComfortAxisKey, Record<'good' | 'caution' | 'warn', string>> = {
  breathability: {
    good: 'Good airflow for everyday comfort in warm weather.',
    caution: 'Moderate airflow — reasonable for most everyday wear.',
    warn: 'Lower airflow can trap heat against skin in hot, humid conditions.',
  },
  moistureManagement: {
    good: 'Handles moisture well for warm, humid weather.',
    caution: 'Limited moisture absorption in this mix.',
    warn: 'Traps moisture against skin — a known trigger for heat rash in hot, humid conditions.',
  },
  heatRetention: {
    good: 'Breathable enough to avoid trapping much heat.',
    caution: 'Some heat retention — more noticeable in everyday tropical wear.',
    warn: 'Retains more heat, which can feel uncomfortable in everyday tropical wear.',
  },
  mechanicalComfort: {
    good: 'Smooth feel with low friction against skin.',
    caution: 'Firmer or more structured texture against bare skin.',
    warn: "Coarser fiber can cause a mechanical 'prickle' feeling against skin — a physical effect of fiber thickness, not an allergy.",
  },
};

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

export function getHealthSafetyMetrics(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
): HealthSafetyMetric[] {
  const items =
    compositions.length > 0 ? compositions : [{ material: dominantFabric, percentage: 100 }];

  const syntheticShare = shareOf(items, (fiber) => getFabricCategory(fiber) === 'Synthetic');
  const acrylicShare = shareOf(items, (fiber) => fiber === 'Acrylic');
  const polyesterShare = shareOf(items, (fiber) => fiber === 'Polyester');
  const highShedShare = acrylicShare + polyesterShare;

  // Wearing Comfort — breathability, moisture management, heat retention, and mechanical feel,
  // weighted across the full detected composition. Replaces a previous "irritant fiber"
  // formula; see data/fabrics/comfort-profile.ts for the research behind each axis. This
  // deliberately does not claim any fiber causes/prevents allergies.
  const primaryFabric = resolveFabricAlias(dominantFabric) ?? (items[0]?.material as SupportedFabric);
  const primaryProfile = getFiberProfile(primaryFabric);
  const comfort = getWeightedComfort(primaryProfile, items);
  const skinHealth = clampScore(comfort.score);
  const skinNote = AXIS_NOTE[comfort.weakestAxis][comfort.weakestAxisTone];

  // 2. Microplastic shedding — educational Low / Medium / High.
  const sheddingLevel = sheddingLevelFromComposition(syntheticShare, highShedShare);
  const sheddingNote =
    sheddingLevel === 'Low'
      ? 'Little synthetic content. Low release during wear and wash.'
      : sheddingLevel === 'Medium'
        ? 'Some synthetics. Moderate shedding; wash cold on full loads.'
        : 'High synthetic share. More shedding in wear and laundry.';

  return [
    {
      id: 'skinHealth',
      title: 'Wearing Comfort',
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
  ];
}
