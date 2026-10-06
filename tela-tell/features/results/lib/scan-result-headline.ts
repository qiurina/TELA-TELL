import { resolveFabricAlias } from '@/data/fabrics/fabrics';
import type { CompositionInput } from '@/data/scans/scan-confidence';

export type ScanResultHeadline = {
  title: string;
  subtitle?: string;
};

/**
 * The classifier picks one most-likely fiber; its other top-3 entries are confidence scores, not
 * a measured blend. So the headline always names the single most likely fiber and its confidence,
 * and never claims a blend (the app cannot measure one).
 */
export function getScanResultHeadline(
  dominantFabric: string,
  compositions: CompositionInput[] = [],
): ScanResultHeadline {
  const items = compositions ?? [];
  const ranked = [...items].sort((a, b) => b.percentage - a.percentage);
  const fabric = resolveFabricAlias(dominantFabric) ?? resolveFabricAlias(ranked[0]?.material ?? '');

  if (!fabric) {
    return { title: dominantFabric.replace(/\s*dominant\s*/i, '').trim() || 'Detected fabric' };
  }

  const entry = items.find((item) => resolveFabricAlias(item.material) === fabric) ?? ranked[0];

  return {
    title: `Likely ${fabric}`,
    subtitle: entry ? `${entry.percentage}% confidence` : undefined,
  };
}
