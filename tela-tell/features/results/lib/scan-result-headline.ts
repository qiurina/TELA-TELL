import { resolveFabricAlias } from '@/data/fabrics/fabrics';
import type { CompositionInput } from '@/data/scans/scan-confidence';

export type ScanResultHeadline = {
  title: string;
  subtitle?: string;
};

export function getUnsureHeadline(compositions: CompositionInput[] = []): ScanResultHeadline {
  const closest = [...(compositions ?? [])]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map((item) => `${item.material} ${item.percentage}%`);

  return {
    title: 'Unsure',
    subtitle: closest.length > 0 ? `Closest: ${closest.join(' · ')}` : undefined,
  };
}

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
