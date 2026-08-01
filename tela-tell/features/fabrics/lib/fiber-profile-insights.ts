import type { FiberProfile } from '@/data/fabrics/fiber-profiles';

export type InsightTone = 'good' | 'caution' | 'warn';

export type HealthVerdicts = {
  skinFriendliness: { label: string; tone: InsightTone };
  heatRetention: { label: string; tone: 'good' | 'caution' };
  irritationPotential: { label: string; tone: InsightTone };
  tip: { text: string; tone: 'good' | 'caution' };
};

export type EnvironmentalSummary = {
  renewable: string;
  biodegradable: string;
  recyclable: string;
  carbonImpact: string;
  microplasticShedding: string;
};

export function getHealthVerdicts(profile: FiberProfile): HealthVerdicts {
  const fabric = profile.fabric;
  const lowerFiberType = profile.fiberType.toLowerCase();
  const lowerTexture = profile.texture.toLowerCase();
  const lowerBreathability = profile.breathability.toLowerCase();
  const lowerWeight = profile.weight.toLowerCase();

  const isSynthetic = lowerFiberType.includes('synthetic');
  const isSemiSynthetic = lowerFiberType.includes('semi-synthetic');
  const isAnimal = lowerFiberType.includes('animal');
  const isPlant = lowerFiberType.includes('plant');
  const texturedOrRough =
    lowerTexture.includes('stiff') ||
    lowerTexture.includes('slick') ||
    lowerTexture.includes('fluffy') ||
    lowerTexture.includes('grain') ||
    lowerTexture.includes('napped');

  const skinFriendliness =
    fabric === 'Cotton' || fabric === 'Linen' || fabric === 'Rayon' || fabric === 'Silk'
      ? { label: 'Generally suitable for sensitive skin', tone: 'good' as const }
      : fabric === 'Wool' || fabric === 'Leather' || fabric === 'Suede'
        ? { label: 'May feel rough on very sensitive skin', tone: 'caution' as const }
        : isSynthetic
          ? { label: 'Less ideal for sensitive skin', tone: 'warn' as const }
          : { label: 'Usually comfortable for most skin types', tone: 'good' as const };

  const irritationPotential =
    fabric === 'Acrylic' || fabric === 'Polyester' || fabric === 'Nylon' || fabric === 'Spandex'
      ? { label: 'Moderate to high', tone: 'warn' as const }
      : fabric === 'Wool' || texturedOrRough
        ? { label: 'Moderate', tone: 'caution' as const }
        : { label: 'Low', tone: 'good' as const };

  const heatRetentionLabel =
    fabric === 'Wool' || fabric === 'Acrylic' || lowerWeight.includes('heavy')
      ? 'High'
      : lowerBreathability.includes('very high') || lowerBreathability.includes('high')
        ? 'Low to moderate'
        : 'Moderate';

  const heatRetention = {
    label: heatRetentionLabel,
    tone: (heatRetentionLabel === 'High' ? 'caution' : 'good') as 'good' | 'caution',
  };

  const tip =
    profile.careInstructions.find((item) => !item.recommended)?.text.toLowerCase().includes('shrink')
      ? { text: 'May shrink if exposed to high heat', tone: 'caution' as const }
      : isPlant || isSemiSynthetic
        ? { text: 'Absorbs moisture well for day-to-day comfort', tone: 'good' as const }
        : isAnimal
          ? { text: 'Feels insulating and holds warmth well', tone: 'good' as const }
          : { text: 'Quick-drying, but may trap more heat on skin', tone: 'caution' as const };

  return {
    skinFriendliness,
    heatRetention,
    irritationPotential,
    tip,
  };
}

export function getEnvironmentalSummary(profile: FiberProfile): EnvironmentalSummary {
  const lowerFiberType = profile.fiberType.toLowerCase();
  const renewable = lowerFiberType.includes('plant')
    ? 'Yes'
    : lowerFiberType.includes('animal')
      ? 'Yes'
      : lowerFiberType.includes('semi-synthetic')
        ? 'Partly'
        : 'No';

  const biodegradable =
    profile.breakdown.biodegradability >= 8
      ? 'Yes'
      : profile.breakdown.biodegradability >= 5.5
        ? 'Partly'
        : 'No';

  const recyclable =
    profile.breakdown.recyclability >= 8
      ? 'High'
      : profile.breakdown.recyclability >= 6
        ? 'Moderate'
        : 'Low';

  const carbonImpact =
    profile.breakdown.lowCarbon >= 8
      ? 'Low'
      : profile.breakdown.lowCarbon >= 6
        ? 'Moderate'
        : 'High';

  const microplasticShedding = lowerFiberType.includes('synthetic')
    ? profile.fabric === 'Polyester' || profile.fabric === 'Acrylic' || profile.fabric === 'Spandex'
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
