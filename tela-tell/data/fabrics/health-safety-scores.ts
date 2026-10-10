import type { CompositionInput } from '@/data/scans/scan-confidence';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getFiberProfile } from '@/data/fabrics/fiber-profiles';
import { getWeightedComfort, type ComfortAxisKey } from '@/data/fabrics/comfort-profile';

export type HealthSafetyTone = 'good' | 'caution' | 'warn';

// Sustainability Impact, Environmental Impact and Microplastic Shedding metrics were removed from
// this list — they duplicated the Sustainability score on the Results screen / Profile Eco tab and
// the Synthetic & Microplastic section on the same Recommendations screen, which is the single
// place the shedding level is shown (getSyntheticHealthRisk in synthetic-health-risk.ts).
export type HealthSafetyMetricId = 'skinHealth';

export type HealthSafetyMetric = {
  id: HealthSafetyMetricId;
  title: string;
  note: string;
  /** 0–10 for the progress bar. */
  score: number;
  tone: HealthSafetyTone;
  /** Right-side value — e.g. "8.4". */
  valueLabel: string;
  /** Suffix after the value — e.g. " /10". */
  valueSuffix: string;
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

// Notes for whichever comfort axis scores lowest across the weighted blend — see
// data/fabrics/comfort-profile.ts for the research behind each axis. Deliberately framed as
// comfort/discomfort, not irritation or allergy.
const AXIS_NOTE: Record<ComfortAxisKey, Record<'good' | 'caution' | 'warn', string>> = {
  breathability: {
    good: 'Good airflow for everyday comfort in warm weather.',
    caution: 'Moderate airflow — reasonable for most everyday wear.',
    warn: 'Lower airflow can trap heat against skin in hot, humid conditions.',
  },
  // Heat-rash (miliaria) mechanism per DermNet NZ and the Merck Manual — see
  // data/fabrics/comfort-profile.ts and docs/profile-screen-audit.md for the full citation.
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
  // Mechanical "prickle" is a fiber-diameter effect, not an allergy — Naylor, Stanton &
  // Speijers (2014); see data/fabrics/comfort-profile.ts for the full citation.
  mechanicalComfort: {
    good: 'Smooth feel with low friction against skin.',
    caution: 'Firmer or more structured texture against bare skin.',
    warn: "Coarser fiber can cause a mechanical 'prickle' feeling against skin — a physical effect of fiber thickness, not an allergy.",
  },
};

export function getHealthSafetyMetrics(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
): HealthSafetyMetric[] {
  const items =
    compositions.length > 0 ? compositions : [{ material: dominantFabric, percentage: 100 }];

  // Wearing Comfort — breathability, moisture management, heat retention, and mechanical feel,
  // weighted across the full detected composition. Replaces a previous "irritant fiber"
  // formula; see data/fabrics/comfort-profile.ts for the research behind each axis. This
  // deliberately does not claim any fiber causes/prevents allergies.
  const primaryFabric = resolveFabricAlias(dominantFabric) ?? (items[0]?.material as SupportedFabric);
  const primaryProfile = getFiberProfile(primaryFabric);
  const comfort = getWeightedComfort(primaryProfile, items);
  const skinHealth = clampScore(comfort.score);
  const skinNote = AXIS_NOTE[comfort.weakestAxis][comfort.weakestAxisTone];

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
  ];
}
