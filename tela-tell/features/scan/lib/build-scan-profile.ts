import type {
  CareInstruction,
  FabricComposition,
  FabricProfile,
  GarmentPurposeItem,
  ScanRecommendations,
  ScanResult,
  SuitabilityLevel,
} from '@/data/scans/mock-data';
import { type SupportedFabric } from '@/data/fabrics/fabrics';
import { getFiberProfile, type FiberProfile } from '@/data/fabrics/fiber-profiles';
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

function buildSustainabilityFactors(
  fiber: FiberProfile,
  isBlend: boolean,
): ScanResult['sustainability']['factors'] {
  const factors: ScanResult['sustainability']['factors'] = [];

  factors.push({
    text: `${fiber.fabric} is the dominant fiber (${fiber.fiberType.toLowerCase()})`,
    positive: fiber.sustainabilityRating !== 'red',
  });

  if (fiber.breakdown.biodegradability >= 7) {
    factors.push({ text: `${fiber.fabric} biodegrades relatively well`, positive: true });
  } else if (fiber.breakdown.biodegradability <= 4) {
    factors.push({ text: `${fiber.fabric} does not biodegrade easily`, positive: false });
  }

  if (fiber.breakdown.recyclability <= 4) {
    factors.push({ text: `Limited recycling options for ${fiber.fabric}`, positive: false });
  } else if (fiber.breakdown.recyclability >= 7) {
    factors.push({ text: `${fiber.fabric} is commonly recyclable`, positive: true });
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

/**
 * Assembles a full profile/sustainability/recommendations block for the classified
 * primary fiber, replacing the old approach of cloning a random pre-written template.
 */
export function buildScanProfile(
  primaryFiber: SupportedFabric,
  dominantFabric: string,
  compositions: FabricComposition[],
  isBlend: boolean,
): Pick<ScanResult, 'profile' | 'sustainability' | 'recommendations'> {
  const fiber = getFiberProfile(primaryFiber);
  const ecoGuidance = getEcoGuidance(dominantFabric, compositions);

  const recommendations: ScanRecommendations = {
    garmentPurposes: buildGarmentPurposes(fiber),
    ecoAlternatives: ecoGuidance.ecoAlternatives,
    recycledAwareness: ecoGuidance.recycledAwareness,
    reuse: ecoGuidance.reuse,
  };

  return {
    profile: buildProfile(fiber),
    sustainability: {
      rating: fiber.sustainabilityRating,
      label: fiber.sustainabilityLabel,
      score: fiber.sustainabilityScore,
      factors: buildSustainabilityFactors(fiber, isBlend),
    },
    recommendations,
  };
}