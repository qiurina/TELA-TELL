import {
  getSignificantFibers,
  isBlendDetected,
  type CompositionInput,
} from '@/data/scans/analysis';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';

export type ScanResultHeadline = {
  title: string;
  subtitle?: string;
  isBlend: boolean;
};

function resolveSignificant(
  compositions: CompositionInput[],
): { fabric: SupportedFabric; percentage: number }[] {
  const significant = getSignificantFibers(compositions);
  const resolved: { fabric: SupportedFabric; percentage: number }[] = [];

  for (const item of significant) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric) {
      continue;
    }
    if (resolved.some((entry) => entry.fabric === fabric)) {
      continue;
    }
    resolved.push({ fabric, percentage: item.percentage });
  }

  return resolved;
}

function blendTitle(fibers: SupportedFabric[]): string {
  if (fibers.length >= 2) {
    return `${fibers[0]}-${fibers[1]} blend`;
  }
  if (fibers.length === 1) {
    return `${fibers[0]} blend`;
  }
  return 'Fiber blend';
}

/**
 * Clean headline for Scan Results photo footer and summary.
 * Blends get a mix title + percentage line; singles get "Mostly X".
 */
export function getScanResultHeadline(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
): ScanResultHeadline {
  const items = compositions ?? [];
  const significant = resolveSignificant(items);
  const blend = isBlendDetected(items) && significant.length >= 2;

  if (blend) {
    return {
      title: blendTitle(significant.map((item) => item.fabric)),
      subtitle: significant.map((item) => `${item.fabric} ${item.percentage}%`).join(' · '),
      isBlend: true,
    };
  }

  const top = significant[0];
  const aliased = resolveFabricAlias(dominantFabric);
  const primaryName = aliased ?? top?.fabric ?? dominantFabric.replace(/\s*dominant\s*/i, '').trim();

  if (top) {
    return {
      title: `Mostly ${top.fabric}`,
      subtitle: `${top.fabric} ${top.percentage}%`,
      isBlend: false,
    };
  }

  return {
    title: primaryName || 'Detected fabric',
    isBlend: false,
  };
}
