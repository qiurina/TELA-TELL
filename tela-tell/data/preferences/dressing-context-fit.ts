import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import type { FabricComposition } from '@/data/scans/mock-data';
import {
  getDressingContextLabel,
  getOccasionWeatherGuide,
  type DressingContext,
  type FabricRecommendation,
} from '@/data/preferences/occasion-weather';

export type DressingContextFitStatus = 'great' | 'okay' | 'poor';

export type DressingContextFit = {
  context: DressingContext;
  label: string;
  status: DressingContextFitStatus;
  summary: string;
  alternatives: FabricRecommendation[];
};

const STATUS_RANK: Record<DressingContextFitStatus, number> = {
  poor: 0,
  okay: 1,
  great: 2,
};

function fabricMatchesNeedle(dominant: string, top: string, needle: string): boolean {
  const normalized = needle.trim().toLowerCase();
  return dominant.includes(normalized) || top.includes(normalized);
}

function matchesFabricList(
  dominant: string,
  top: string,
  items: FabricRecommendation[],
): boolean {
  return items.some((item) => fabricMatchesNeedle(dominant, top, item.fabric));
}

export function getDressingContextFits(
  contexts: DressingContext[],
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): DressingContextFit[] {
  const sorted = [...compositions].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0]?.material?.toLowerCase() ?? '';
  const dominant = dominantFabric.toLowerCase();
  const detected = resolveSupportedFabric(dominantFabric, compositions);
  const detectedLabel = detected ?? dominantFabric.replace(/\s*dominant\s*/i, '').trim();

  const fits = contexts.map((context) => {
    const guide = getOccasionWeatherGuide(context);
    const label = getDressingContextLabel(context);
    const matchesBest = matchesFabricList(dominant, top, guide.bestChoices);
    const matchesAvoid = matchesFabricList(dominant, top, guide.avoid);

    if (matchesBest) {
      return {
        context,
        label,
        status: 'great' as const,
        summary: `${detectedLabel} is a strong match for ${label.toLowerCase()}.`,
        alternatives: [],
      };
    }

    if (matchesAvoid) {
      const avoid = guide.avoid[0];
      return {
        context,
        label,
        status: 'poor' as const,
        summary: `${detectedLabel} may not be ideal for ${label.toLowerCase()} — ${avoid?.reason ?? 'consider another fiber'}.`,
        alternatives: guide.bestChoices.slice(0, 3),
      };
    }

    return {
      context,
      label,
      status: 'okay' as const,
      summary: `${detectedLabel} can work for ${label.toLowerCase()}, but other fabrics may feel better.`,
      alternatives: guide.bestChoices.slice(0, 3),
    };
  });

  return fits.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}
