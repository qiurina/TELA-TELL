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
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import {
  getFiberProfile,
  type FiberProfile,
  type SustainabilityBreakdown,
} from '@/data/fabrics/fiber-profiles';
import { getEcoGuidance } from '@/data/fabrics/eco-alternatives';
import { OCCASION_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';

/**
 * Bump when the scoring or recommendation logic here changes. The startup migration re-derives
 * stored scans only when this or the fiber data changes (see db/migrate.native.ts).
 */
export const SCAN_PROFILE_LOGIC_VERSION = 2;

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
): ScanResult['sustainability']['factors'] {
  const factors: ScanResult['sustainability']['factors'] = [];
  const subject = primaryFiber.fabric;

  factors.push({
    text: `${primaryFiber.fabric} is the most likely fiber (${primaryFiber.fiberType.toLowerCase()})`,
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

  factors.push({ text: 'Suitable for everyday reuse and donation', positive: true });

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
): Pick<ScanResult, 'profile' | 'sustainability' | 'recommendations'> {
  const fiber = getFiberProfile(primaryFiber);
  const ecoGuidance = getEcoGuidance(dominantFabric, compositions);

  // Everything is scored from the single most likely fiber. The top-3 percentages are the
  // model's confidence, not a measured blend, so they are not used as mixing weights (an earlier
  // version averaged scores across them, which presented model uncertainty as a composition).
  const breakdown = fiber.breakdown;
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
      factors: buildSustainabilityFactors(fiber, breakdown),
    },
    recommendations,
  };
}
