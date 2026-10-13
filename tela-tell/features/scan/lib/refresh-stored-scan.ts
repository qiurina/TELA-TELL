import type { ScanResult } from '@/data/scans/mock-data';
import { resolveFabricAlias } from '@/data/fabrics/fabrics';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';

export function refreshStoredScan(
  stored: Partial<ScanResult> & { dominantFabric: string },
): Record<string, unknown> {
  const compositions = stored.compositions ?? [];
  const primary = (resolveFabricAlias(stored.dominantFabric) ?? stored.dominantFabric) as SupportedFabric;
  const { profile, recommendations } = buildScanProfile(primary, stored.dominantFabric, compositions);

  const { sustainability: _removed, ...rest } = stored as Record<string, unknown>;
  return { ...rest, profile, recommendations };
}
