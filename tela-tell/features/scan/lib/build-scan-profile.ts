import type {
  CareInstruction,
  FabricComposition,
  FabricProfile,
  GarmentPurposeItem,
  ScanRecommendations,
  ScanResult,
  SuitabilityLevel,
} from '@/data/scans/mock-data';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import { getFiberProfile, type FiberProfile } from '@/data/fabrics/fiber-profiles';
import { OCCASION_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';

export const SCAN_PROFILE_LOGIC_VERSION = 7;

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
): Pick<ScanResult, 'profile' | 'recommendations'> {
  const fiber = getFiberProfile(primaryFiber);

  const recommendations: ScanRecommendations = {
    garmentPurposes: buildGarmentPurposes(fiber),
  };

  return {
    profile: buildProfile(fiber),
    recommendations,
  };
}
