import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getSignificantFibers, type CompositionInput } from '@/data/scans/scan-confidence';
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

type ResolvedShare = {
  fabric: SupportedFabric;
  percentage: number;
  label: string;
};

function resolveSignificantShares(
  dominantFabric: string,
  compositions: CompositionInput[],
): ResolvedShare[] {
  const significant = getSignificantFibers(compositions);
  const resolved: ResolvedShare[] = [];

  for (const item of significant) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric) {
      continue;
    }
    if (resolved.some((entry) => entry.fabric === fabric)) {
      continue;
    }
    resolved.push({
      fabric,
      percentage: item.percentage,
      label: fabric,
    });
  }

  if (resolved.length === 0) {
    const fallback = resolveSupportedFabric(dominantFabric, compositions as FabricComposition[]);
    if (fallback) {
      resolved.push({ fabric: fallback, percentage: 100, label: fallback });
    }
  }

  return resolved;
}

function findMatchingRec(
  share: ResolvedShare,
  items: FabricRecommendation[],
): FabricRecommendation | undefined {
  const fabricLower = share.fabric.toLowerCase();
  return items.find((item) => {
    const needle = item.fabric.trim().toLowerCase();
    return fabricLower.includes(needle) || needle.includes(fabricLower);
  });
}

function garmentLabel(shares: ResolvedShare[], dominantFabric: string): string {
  if (shares.length >= 2) {
    return `${shares[0].fabric}-${shares[1].fabric} blend`;
  }
  if (shares.length === 1) {
    return shares[0].fabric;
  }
  return dominantFabric.replace(/\s*dominant\s*/i, '').trim() || 'This fabric';
}

export function getDressingContextFits(
  contexts: DressingContext[],
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): DressingContextFit[] {
  const shares = resolveSignificantShares(dominantFabric, compositions);
  const labelForGarment = garmentLabel(shares, dominantFabric);

  const fits = contexts.map((context) => {
    const guide = getOccasionWeatherGuide(context);
    const label = getDressingContextLabel(context);

    const bestHits = shares
      .map((share) => ({ share, rec: findMatchingRec(share, guide.bestChoices) }))
      .filter((item): item is { share: ResolvedShare; rec: FabricRecommendation } =>
        Boolean(item.rec),
      );
    const avoidHits = shares
      .map((share) => ({ share, rec: findMatchingRec(share, guide.avoid) }))
      .filter((item): item is { share: ResolvedShare; rec: FabricRecommendation } =>
        Boolean(item.rec),
      );

    const avoidShare = avoidHits.reduce((max, item) => Math.max(max, item.share.percentage), 0);
    const bestShare = bestHits.reduce((max, item) => Math.max(max, item.share.percentage), 0);

    if (bestHits.length > 0 && avoidHits.length === 0) {
      const top = bestHits[0];
      return {
        context,
        label,
        status: 'great' as const,
        summary:
          shares.length > 1
            ? `${top.share.fabric} (${top.share.percentage}%) suits ${label.toLowerCase()}.`
            : `${labelForGarment} is a strong match for ${label.toLowerCase()}.`,
        alternatives: [],
      };
    }

    if (avoidHits.length > 0 && bestHits.length === 0) {
      const top = avoidHits[0];
      return {
        context,
        label,
        status: 'poor' as const,
        summary: `${top.share.fabric} (${top.share.percentage}%) is less ideal for ${label.toLowerCase()}. ${top.rec.reason}.`,
        alternatives: guide.bestChoices.slice(0, 3),
      };
    }

    if (bestHits.length > 0 && avoidHits.length > 0) {
      const avoid = avoidHits[0];
      const best = bestHits[0];
      const status: DressingContextFitStatus = avoidShare >= 25 && avoidShare >= bestShare ? 'poor' : 'okay';
      return {
        context,
        label,
        status,
        summary: `This mix has ${best.share.fabric} and ${avoid.share.fabric}. It can work for some uses, but is trickier for ${label.toLowerCase()}.`,
        alternatives: guide.bestChoices.slice(0, 3),
      };
    }

    return {
      context,
      label,
      status: 'okay' as const,
      summary: `${labelForGarment} can work for ${label.toLowerCase()}; other fibers may feel better.`,
      alternatives: guide.bestChoices.slice(0, 3),
    };
  });

  return fits.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}
