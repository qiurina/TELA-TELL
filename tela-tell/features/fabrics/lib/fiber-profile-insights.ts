import type { FiberProfile } from '@/data/fabrics/fiber-profiles';
import { FIBER_SHEDDING_INFO } from '@/data/fabrics/shedding-why';

export type InsightTone = 'good' | 'caution' | 'warn';

// Skin/health verdicts used to live here as a fourth, independent, uncited judgment layer.
// Replaced by the single consolidated model in @/data/fabrics/comfort-profile.ts — see
// docs/profile-screen-audit.md. This file now only covers the shedding label and shared
// tone/color utilities. The Renewable / Biodegradable / Recyclable / Carbon impact labels that used
// to be derived from the retired sustainability sub-scores were removed (see
// docs/sustainability-score-archive.md); sourced research findings are in data/fabrics/fiber-research.ts.

export type EnvironmentalSummary = {
  microplasticShedding: string;
};

export function getEnvironmentalSummary(profile: FiberProfile): EnvironmentalSummary {
  // High / Moderate for the four synthetic fibers (the same levels as FIBER_RISK_LEVELS in
  // synthetic-health-risk.ts, which a test checks); "Not rated" for every other fiber, because the
  // shedding references do not support a level for them. This used to read "Low" for every natural
  // fiber, which the cotton and wool laundering studies contradict, and "Moderate" for Rayon only
  // because its fiber type contains the word "synthetic".
  const microplasticShedding = FIBER_SHEDDING_INFO[profile.fabric].value;

  return { microplasticShedding };
}

export function getSheddingColor(value: string): string | undefined {
  if (value === 'Low') {
    return '#15803D';
  }
  if (value === 'Moderate') {
    return '#B45309';
  }
  if (value === 'High') {
    return '#B91C1C';
  }
  return undefined;
}

export function getToneColor(tone: InsightTone): string {
  if (tone === 'good') {
    return '#15803D';
  }
  if (tone === 'caution') {
    return '#B45309';
  }
  return '#B91C1C';
}
