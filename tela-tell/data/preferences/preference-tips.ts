import type { FabricComposition } from '@/data/scans/mock-data';
import { ALLERGY_DISCLAIMER, getAllergyAlert } from '@/data/fabrics/fabric-allergies';
import {
  getDressingContextLabel,
  getOccasionWeatherGuide,
} from '@/data/preferences/occasion-weather';
import type { UserPreferences } from '@/features/profile/lib/user-preferences';

export type PersonalizedTips = {
  allergyClearedTip: string | null;
  occasionWeatherTip: string | null;
  preferredFabricTip: string | null;
};

function topMaterial(compositions: FabricComposition[]): string {
  const sorted = [...compositions].sort((a, b) => b.percentage - a.percentage);
  return sorted[0]?.material?.toLowerCase() ?? '';
}

function buildAllergyClearedTip(
  sensitiveFabrics: UserPreferences['sensitiveFabrics'],
  dominantFabric: string,
  compositions: FabricComposition[],
): string | null {
  const alert = getAllergyAlert(sensitiveFabrics, dominantFabric, compositions);
  if (!alert || alert.conflictDetected) {
    return null;
  }

  return `${alert.message} ${ALLERGY_DISCLAIMER}`;
}

function buildDressingContextTip(
  dressingContexts: UserPreferences['dressingContexts'],
  dominantFabric: string,
  compositions: FabricComposition[],
): string | null {
  if (dressingContexts.length === 0) {
    return null;
  }

  const top = topMaterial(compositions);
  const dominant = dominantFabric.toLowerCase();

  for (const dressingContext of dressingContexts) {
    const guide = getOccasionWeatherGuide(dressingContext);

    const matchesBest = guide.bestChoices.some(
      (item) =>
        dominant.includes(item.fabric.toLowerCase()) || top.includes(item.fabric.toLowerCase()),
    );
    const matchesAvoid = guide.avoid.some(
      (item) =>
        dominant.includes(item.fabric.toLowerCase()) || top.includes(item.fabric.toLowerCase()),
    );

    if (matchesBest) {
      return `${getDressingContextLabel(dressingContext)}: this fabric fits your dressing plan — ${guide.bestChoices[0]?.reason ?? 'a strong match for this occasion.'}`;
    }

    if (matchesAvoid) {
      const avoid = guide.avoid[0];
      return `${getDressingContextLabel(dressingContext)}: this fabric may not be ideal — ${avoid?.fabric ?? 'consider'} ${avoid?.reason?.toLowerCase() ?? 'another option'}. Try ${guide.bestChoices[0]?.fabric ?? 'linen or cotton'}.`;
    }
  }

  const primary = dressingContexts[0];
  const guide = getOccasionWeatherGuide(primary);

  return `${getDressingContextLabel(primary)}: for your dressing plan, top picks are ${guide.bestChoices
    .slice(0, 2)
    .map((item) => item.fabric)
    .join(' and ')}.`;
}

function buildPreferredFabricTip(
  preferredFabrics: UserPreferences['preferredFabrics'],
  dominantFabric: string,
  compositions: FabricComposition[],
): string | null {
  if (preferredFabrics.length === 0) {
    return null;
  }

  const top = topMaterial(compositions);
  const dominant = dominantFabric.toLowerCase();
  const match = preferredFabrics.find(
    (fabric) => dominant.includes(fabric.toLowerCase()) || top.includes(fabric.toLowerCase()),
  );

  if (match) {
    return `Matches your preferred fabric type (${match}) — a good find if you shop for ${preferredFabrics.join(', ')}.`;
  }

  return `You usually prefer ${preferredFabrics.join(', ')} — this scan is a different fiber mix to compare.`;
}

export function getPersonalizedTips(
  preferences: UserPreferences,
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): PersonalizedTips {
  return {
    allergyClearedTip: buildAllergyClearedTip(
      preferences.sensitiveFabrics,
      dominantFabric,
      compositions,
    ),
    occasionWeatherTip: buildDressingContextTip(
      preferences.dressingContexts ?? [],
      dominantFabric,
      compositions,
    ),
    preferredFabricTip: buildPreferredFabricTip(
      preferences.preferredFabrics,
      dominantFabric,
      compositions,
    ),
  };
}
