import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getFiberProfile, type FiberProfile } from '@/data/fabrics/fiber-profiles';
import type { CompositionInput } from '@/data/scans/scan-confidence';

/**
 * Single research-backed comfort model, replacing three previously independent and
 * contradictory "skin irritation/allergy" implementations (health-safety-scores.ts,
 * synthetic-health-risk.ts, fiber-profile-insights.ts). Deliberately does not claim any fiber
 * causes/prevents allergies or is "safe for sensitive skin" — most real textile allergic
 * reactions trace to dyes and finishing chemicals, not the base fiber, and a photo scan can't
 * see either. See docs/profile-screen-audit.md for the full research trail.
 */

export type ComfortTone = 'good' | 'caution' | 'warn';

export type ComfortAxis = {
  label: string;
  tone: ComfortTone;
  note: string;
};

export type ComfortAxisKey =
  | 'breathability'
  | 'moistureManagement'
  | 'heatRetention'
  | 'mechanicalComfort';

export type ComfortProfile = Record<ComfortAxisKey, ComfortAxis>;

const BREATHABILITY_SCORE: Record<string, number> = {
  'Very high': 9,
  High: 7.5,
  Medium: 5,
  Low: 2.5,
};

function toneFromScore(score: number): ComfortTone {
  if (score >= 7) {
    return 'good';
  }
  if (score >= 4.5) {
    return 'caution';
  }
  return 'warn';
}

function breathabilityAxis(fiber: FiberProfile): ComfortAxis {
  const level = fiber.breathability;
  const score = BREATHABILITY_SCORE[level] ?? 5;
  const tone = toneFromScore(score);
  const note =
    tone === 'good'
      ? `${level} airflow keeps this cool in warm, humid weather.`
      : tone === 'caution'
        ? `${level} airflow — reasonable for most everyday wear.`
        : `${level} airflow can trap heat next to skin in hot, humid conditions.`;
  return { label: level, tone, note };
}

// Wool's moisture behavior is a distinct, well-documented mechanism (hygroscopic fiber core),
// not just "absorbs" like a plant fiber — handled as a special case below.
const ABSORBENT_MOISTURE = new Set(['Absorbs', 'Absorbs fast', 'Absorbs easily', 'Light absorb']);
const REPELLING_MOISTURE = new Set(['Repels']);

function moistureAxis(fiber: FiberProfile): ComfortAxis {
  if (fiber.fabric === 'Wool') {
    return {
      label: 'Absorbs, stays dry-feeling',
      tone: 'good',
      note:
        "Wool is hygroscopic — it can absorb roughly 30% of its own weight in moisture into the fiber's core while the surface stays comparatively dry to the touch.",
    };
  }

  if (ABSORBENT_MOISTURE.has(fiber.moisture)) {
    return {
      label: fiber.moisture,
      tone: 'good',
      note: 'Pulls moisture away from skin, which helps in heat — can feel damp until it fully dries.',
    };
  }

  if (REPELLING_MOISTURE.has(fiber.moisture)) {
    return {
      label: fiber.moisture,
      tone: 'warn',
      note:
        'Moisture stays on the surface rather than being absorbed. In hot, humid conditions with limited airflow, trapped sweat against skin is a known trigger for heat rash (miliaria).',
    };
  }

  return {
    label: fiber.moisture,
    tone: 'caution',
    note: 'Limited moisture absorption — more common in structured pieces than sweaty next-to-skin wear.',
  };
}

function heatRetentionAxis(fiber: FiberProfile): ComfortAxis {
  const heavy = fiber.weight.toLowerCase().includes('heavy');
  const structuralInsulator = fiber.fabric === 'Wool' || fiber.fabric === 'Acrylic';

  if (structuralInsulator) {
    return {
      label: 'High',
      tone: 'caution',
      note:
        'Traps air well for warmth in cool weather — the trade-off is more heat retention for everyday tropical wear.',
    };
  }

  if (fiber.breathability === 'Very high' || fiber.breathability === 'High') {
    return {
      label: heavy ? 'Moderate' : 'Low to moderate',
      tone: heavy ? 'caution' : 'good',
      note: heavy
        ? 'Breathable fiber, but the heavier weight still holds some warmth.'
        : 'Lets heat escape rather than trapping it — comfortable for warm climates.',
    };
  }

  return {
    label: heavy ? 'High' : 'Moderate to high',
    tone: 'caution',
    note: 'Lower airflow tends to trap heat against skin, more noticeable in hot weather.',
  };
}

// Fiber-diameter-driven mechanical "prickle" is real and specific to coarse animal fibers —
// Naylor et al. (2014) and the wool-allergy-myth literature both frame this as a physical,
// non-immune mechanism, not an allergy. No equivalent peer-reviewed mechanical-irritation
// finding was found for synthetic fibers in this pass, so none is claimed here.
function mechanicalComfortAxis(fiber: FiberProfile): ComfortAxis {
  if (fiber.fabric === 'Wool') {
    return {
      label: 'Coarser fiber, may feel textured',
      tone: 'warn',
      note:
        "Coarser wool (commonly cited above ~30 microns in diameter) can mechanically trigger a 'prickle' sensation against skin — a physical, non-immune reaction, not an allergy. Finer merino-grade wool, well under that range, is not perceived as prickly by most wearers.",
    };
  }

  if (fiber.fabric === 'Leather' || fiber.fabric === 'Suede' || fiber.fabric === 'Abaca') {
    return {
      label: fiber.texture,
      tone: 'caution',
      note: `${fiber.texture} texture — firmer or more structured against bare skin, a physical feel rather than a skin-health concern.`,
    };
  }

  return {
    label: fiber.texture,
    tone: 'good',
    note: `${fiber.texture.toLowerCase()} texture, generally low friction against skin.`,
  };
}

export function getComfortProfile(fiber: FiberProfile): ComfortProfile {
  return {
    breathability: breathabilityAxis(fiber),
    moistureManagement: moistureAxis(fiber),
    heatRetention: heatRetentionAxis(fiber),
    mechanicalComfort: mechanicalComfortAxis(fiber),
  };
}

function axisScore(axis: ComfortAxis): number {
  if (axis.tone === 'good') {
    return 8.5;
  }
  if (axis.tone === 'caution') {
    return 6;
  }
  return 3;
}

export function getFiberComfortScore(fiber: FiberProfile): number {
  const profile = getComfortProfile(fiber);
  const axes = Object.values(profile);
  return axes.reduce((sum, axis) => sum + axisScore(axis), 0) / axes.length;
}

export function overallComfortTone(score: number): ComfortTone {
  return toneFromScore(score);
}

export function getComfortShortLabel(tone: ComfortTone): string {
  if (tone === 'good') {
    return 'Comfortable';
  }
  if (tone === 'caution') {
    return 'Mixed comfort';
  }
  return 'Traps heat';
}

type WeightedComfort = { profile: ComfortProfile; weight: number };

function resolveWeightedComfort(
  primaryFiber: FiberProfile,
  compositions: CompositionInput[],
): WeightedComfort[] {
  const resolved: { fiber: FiberProfile; percentage: number }[] = [];

  for (const item of compositions) {
    const fabric: SupportedFabric | null = resolveFabricAlias(item.material);
    if (!fabric) {
      continue;
    }
    resolved.push({ fiber: getFiberProfile(fabric), percentage: item.percentage });
  }

  const total = resolved.reduce((sum, item) => sum + item.percentage, 0);
  if (total <= 0) {
    return [{ profile: getComfortProfile(primaryFiber), weight: 1 }];
  }

  return resolved.map((item) => ({
    profile: getComfortProfile(item.fiber),
    weight: item.percentage / total,
  }));
}

export type WeightedComfortResult = {
  score: number;
  tone: ComfortTone;
  /** The axis that scored lowest across the weighted blend, for building a note. */
  weakestAxis: ComfortAxisKey;
  weakestAxisTone: ComfortTone;
};

const AXIS_KEYS: ComfortAxisKey[] = [
  'breathability',
  'moistureManagement',
  'heatRetention',
  'mechanicalComfort',
];

/**
 * Mass-fraction-weighted comfort score across a full detected composition — same weighting
 * pattern as the sustainability score in build-scan-profile.ts, applied here to the comfort
 * axes instead of ad hoc "irritant fiber" coefficients.
 */
export function getWeightedComfort(
  primaryFiber: FiberProfile,
  compositions: CompositionInput[],
): WeightedComfortResult {
  const weighted = resolveWeightedComfort(primaryFiber, compositions);

  const axisScores: Record<ComfortAxisKey, number> = {
    breathability: 0,
    moistureManagement: 0,
    heatRetention: 0,
    mechanicalComfort: 0,
  };

  for (const { profile, weight } of weighted) {
    for (const key of AXIS_KEYS) {
      axisScores[key] += axisScore(profile[key]) * weight;
    }
  }

  const score = AXIS_KEYS.reduce((sum, key) => sum + axisScores[key], 0) / AXIS_KEYS.length;
  const weakestAxis = AXIS_KEYS.reduce((worst, key) =>
    axisScores[key] < axisScores[worst] ? key : worst,
  );

  return {
    score,
    tone: toneFromScore(score),
    weakestAxis,
    weakestAxisTone: toneFromScore(axisScores[weakestAxis]),
  };
}
