import type { FiberProfile } from '@/data/fabrics/fiber-profiles';

export type InsightTone = 'good' | 'caution' | 'warn';

// Skin/health verdicts used to live here as a fourth, independent, uncited judgment layer.
// Replaced by the single consolidated model in @/data/fabrics/comfort-profile.ts — see
// docs/profile-screen-audit.md. This file now only covers sustainability-derived labels and
// shared tone/color utilities.

export type EnvironmentalSummary = {
  renewable: string;
  biodegradable: string;
  recyclable: string;
  carbonImpact: string;
  microplasticShedding: string;
};

export function getEnvironmentalSummary(profile: FiberProfile): EnvironmentalSummary {
  const lowerFiberType = profile.fiberType.toLowerCase();
  const renewable = lowerFiberType.includes('plant')
    ? 'Yes'
    : lowerFiberType.includes('animal')
      ? 'Yes'
      : lowerFiberType.includes('semi-synthetic')
        ? 'Partly'
        : 'No';

  // Thresholds (7/4) match buildSustainabilityFactors() in build-scan-profile.ts — the same
  // breakdown number used to read "Partly biodegradable" here but a positive "biodegrades
  // relatively well" on the Results screen for Rayon (7.5) before this was unified. See
  // docs/fiber-percentage-methodology.md.
  const biodegradable =
    profile.breakdown.biodegradability >= 7
      ? 'Yes'
      : profile.breakdown.biodegradability <= 4
        ? 'No'
        : 'Partly';

  const recyclable =
    profile.breakdown.recyclability >= 7
      ? 'High'
      : profile.breakdown.recyclability <= 4
        ? 'Low'
        : 'Moderate';

  const carbonImpact =
    profile.breakdown.lowCarbon >= 7
      ? 'Low'
      : profile.breakdown.lowCarbon <= 4
        ? 'High'
        : 'Moderate';

  // Matches FIBER_RISK_LEVELS in synthetic-health-risk.ts (Napper & Thompson 2016 shedding-rate ranking) — see docs/fabric-score-sources.md
  const microplasticShedding = lowerFiberType.includes('synthetic')
    ? profile.fabric === 'Polyester' || profile.fabric === 'Acrylic'
      ? 'High'
      : 'Moderate'
    : 'Low';

  return {
    renewable,
    biodegradable,
    recyclable,
    carbonImpact,
    microplasticShedding,
  };
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
