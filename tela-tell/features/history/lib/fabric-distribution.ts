/** Aggregates scan history into a fabric type distribution (rule-based count, no ML). */

import {
  getFabricCategory,
  resolveFabricAlias,
  type FabricCategory,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import type { ScanResult } from '@/data/scans/mock-data';

export type FabricDistributionEntry = {
  fabric: SupportedFabric;
  category: FabricCategory | undefined;
  count: number;
  /** Share of counted scans, rounded to a whole percent. */
  percent: number;
};

/**
 * Counts each scan once by its dominant fiber, sorted by most scanned.
 * Scans whose dominant label cannot be resolved to a supported fiber are skipped.
 */
export function getFabricDistribution(scans: ScanResult[]): FabricDistributionEntry[] {
  const counts = new Map<SupportedFabric, number>();

  for (const scan of scans) {
    const fiber =
      resolveFabricAlias(scan.dominantFabric) ??
      (scan.compositions[0] ? resolveFabricAlias(scan.compositions[0].material) : null);
    if (fiber) {
      counts.set(fiber, (counts.get(fiber) ?? 0) + 1);
    }
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  if (total === 0) {
    return [];
  }

  return [...counts.entries()]
    .map(([fabric, count]) => ({
      fabric,
      category: getFabricCategory(fabric),
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.fabric.localeCompare(b.fabric));
}
