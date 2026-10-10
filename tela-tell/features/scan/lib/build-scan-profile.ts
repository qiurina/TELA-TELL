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
import { getEcoGuidance } from '@/data/fabrics/eco-alternatives';
import { OCCASION_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';

/**
 * Bump when the profile or recommendation logic here changes. The startup migration re-derives
 * stored scans only when this or the fiber data changes (see db/migrate.native.ts).
 * Version 6 removed the sustainability score: the migration clears it from stored scans.
 */
export const SCAN_PROFILE_LOGIC_VERSION = 6;

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
  const ecoGuidance = getEcoGuidance(dominantFabric, compositions);

  // Everything comes from the single most likely fiber. The top-3 percentages are the model's
  // confidence, not a measured blend, so they are not used as mixing weights.
  const recommendations: ScanRecommendations = {
    garmentPurposes: buildGarmentPurposes(fiber),
    // Only the name and text are stored; the claims and sources are read live from the guidance.
    ecoAlternatives: ecoGuidance.ecoAlternatives.map(({ name, similarity }) => ({ name, similarity })),
    reuse: ecoGuidance.reuse,
  };

  return {
    profile: buildProfile(fiber),
    recommendations,
  };
}
