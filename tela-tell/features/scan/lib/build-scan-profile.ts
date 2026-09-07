import type {
  CareInstruction,
  FabricComposition,
  FabricProfile,
  GarmentPurposeItem,
  ScanRecommendations,
  ScanResult,
  SuitabilityLevel,
  SustainabilityRating,
} from '@/data/scans/mock-data';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import {
  getFiberProfile,
  type FiberProfile,
  type SustainabilityBreakdown,
} from '@/data/fabrics/fiber-profiles';
import { getEcoGuidance } from '@/data/fabrics/eco-alternatives';
import { OCCASION_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';

function getOccasionLabel(id: string): string {
  return OCCASION_CONTEXT_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

function buildProfile(fiber: FiberProfile): FabricProfile {
  return {
    texture: fiber.texture,
    weave: fiber.weaveType,
    breathability: fiber.breathability,
    durability: fiber.durability,
    stretch: fiber.stretch,
    careInstructions: fiber.careInstructions.map((item: CareInstruction) => ({ ...item })),
    useCases: fiber.bestOccasion.slice(0, 4).map(getOccasionLabel),
  };
}

type WeightedFiber = { fiber: FiberProfile; weight: number };

/**
 * Mass-fraction weighting across every resolved fiber in the composition, matching the Higg
 * MSI's own documented approach to blended-fabric scoring (weighted average by blend
 * proportion) rather than scoring the whole garment off the dominant fiber alone. Falls back to
 * the primary fiber alone when nothing in `compositions` resolves. See
 * docs/fiber-percentage-methodology.md.
 */
function resolveWeightedFibers(
  primaryFiber: FiberProfile,
  compositions: FabricComposition[],
): WeightedFiber[] {
  const resolved: { fiber: FiberProfile; percentage: number }[] = [];

  for (const item of compositions) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric) {
      continue;
    }
    resolved.push({ fiber: getFiberProfile(fabric), percentage: item.percentage });
  }

  const total = resolved.reduce((sum, item) => sum + item.percentage, 0);
  if (total <= 0) {
    return [{ fiber: primaryFiber, weight: 1 }];
  }

  return resolved.map((item) => ({ fiber: item.fiber, weight: item.percentage / total }));
}

function weightedBreakdown(weighted: WeightedFiber[]): SustainabilityBreakdown {
  const weightedSum = (key: keyof SustainabilityBreakdown) =>
    weighted.reduce((sum, { fiber, weight }) => sum + fiber.breakdown[key] * weight, 0);

  return {
    biodegradability: weightedSum('biodegradability'),
    waterEfficiency: weightedSum('waterEfficiency'),
    recyclability: weightedSum('recyclability'),
    lowCarbon: weightedSum('lowCarbon'),
  };
}

function overallScore(breakdown: SustainabilityBreakdown): number {
  const raw =
    (breakdown.biodegradability +
      breakdown.waterEfficiency +
      breakdown.recyclability +
      breakdown.lowCarbon) /
    4;
  return Math.round(raw * 10) / 10;
}

function ratingForScore(score: number): SustainabilityRating {
  if (score >= 7.5) {
    return 'green';
  }
  if (score >= 5.5) {
    return 'yellow';
  }
  return 'red';
}

function labelForRating(rating: SustainabilityRating): string {
  if (rating === 'green') {
    return 'Sustainable';
  }
  if (rating === 'yellow') {
    return 'Moderate';
  }
  return 'Low';
}

function buildSustainabilityFactors(
  primaryFiber: FiberProfile,
  breakdown: SustainabilityBreakdown,
  isBlend: boolean,
): ScanResult['sustainability']['factors'] {
  const factors: ScanResult['sustainability']['factors'] = [];
  const subject = isBlend ? 'This blend' : primaryFiber.fabric;

  factors.push({
    text: `${primaryFiber.fabric} is the dominant fiber (${primaryFiber.fiberType.toLowerCase()})`,
    positive: primaryFiber.sustainabilityRating !== 'red',
  });

  if (breakdown.biodegradability >= 7) {
    factors.push({ text: `${subject} biodegrades relatively well`, positive: true });
  } else if (breakdown.biodegradability <= 4) {
    factors.push({ text: `${subject} does not biodegrade easily`, positive: false });
  }

  if (breakdown.recyclability <= 4) {
    factors.push({ text: `Limited recycling options for ${subject.toLowerCase()}`, positive: false });
  } else if (breakdown.recyclability >= 7) {
    factors.push({ text: `${subject} is commonly recyclable`, positive: true });
  }

  if (isBlend) {
    factors.push({
      text: 'Blended composition detected, which can complicate recycling',
      positive: false,
    });
  } else {
    factors.push({ text: 'Suitable for everyday reuse and donation', positive: true });
  }

  return factors;
}

function buildGarmentPurposes(fiber: FiberProfile): GarmentPurposeItem[] {
  const purposes: GarmentPurposeItem[] = fiber.bestOccasion.slice(0, 3).map((occasion, index) => ({
    purpose: getOccasionLabel(occasion),
    suitability: (index === 0 ? 'Excellent' : 'Good') as SuitabilityLevel,
    note: `${fiber.fabric}'s ${fiber.breathability.toLowerCase()} breathability and ${fiber.texture.toLowerCase()} texture suit this use case.`,
  }));

  const stretchIsLow = fiber.stretch.toLowerCase() === 'low';
  const coversGym = fiber.bestOccasion.includes('sports_gym');
  if (stretchIsLow && !coversGym) {
    purposes.push({
      purpose: 'Sports / Gym',
      suitability: 'Fair',
      note: `${fiber.fabric} has limited stretch, which may restrict movement during exercise.`,
    });
  } else if (fiber.bestOccasion[3]) {
    purposes.push({
      purpose: getOccasionLabel(fiber.bestOccasion[3]),
      suitability: 'Good',
      note: `Reasonable option for ${getOccasionLabel(fiber.bestOccasion[3]).toLowerCase()} depending on garment construction.`,
    });
  }

  return purposes;
}

export function buildScanProfile(
  primaryFiber: SupportedFabric,
  dominantFabric: string,
  compositions: FabricComposition[],
  isBlend: boolean,
): Pick<ScanResult, 'profile' | 'sustainability' | 'recommendations'> {
  const fiber = getFiberProfile(primaryFiber);
  const ecoGuidance = getEcoGuidance(dominantFabric, compositions);

  // Sustainability is weighted across the full detected composition (see
  // resolveWeightedFibers), not just the dominant fiber — profile/recommendations below stay
  // keyed to the dominant fiber, since care instructions and use-case guidance describe one
  // representative fiber rather than something meaningful to blend-average.
  const weighted = resolveWeightedFibers(fiber, compositions);
  const breakdown = weightedBreakdown(weighted);
  const score = overallScore(breakdown);
  const rating = ratingForScore(score);

  const recommendations: ScanRecommendations = {
    garmentPurposes: buildGarmentPurposes(fiber),
    ecoAlternatives: ecoGuidance.ecoAlternatives,
    reuse: ecoGuidance.reuse,
  };

  return {
    profile: buildProfile(fiber),
    sustainability: {
      rating,
      label: labelForRating(rating),
      score,
      factors: buildSustainabilityFactors(fiber, breakdown, isBlend),
    },
    recommendations,
  };
}
