import type { ScanResult } from '@/data/scans/mock-data';
import { resolveFabricAlias } from '@/data/fabrics/fabrics';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';

/**
 * Re-derives the two computed parts of a saved scan (profile, recommendations) from the current
 * fiber data, and drops the `sustainability` object older versions of the app saved. Every other field in the saved JSON (image, seller label, garment
 * condition, confidence, timestamps, anything added later) is carried over untouched, so a data
 * refresh never overwrites what the person scanned or entered.
 */
export function refreshStoredScan(
  stored: Partial<ScanResult> & { dominantFabric: string },
): Record<string, unknown> {
  const compositions = stored.compositions ?? [];
  const primary = (resolveFabricAlias(stored.dominantFabric) ?? stored.dominantFabric) as SupportedFabric;
  const { profile, recommendations } = buildScanProfile(primary, stored.dominantFabric, compositions);

  // A saved score must never reappear, so the old key is removed rather than carried over.
  const { sustainability: _removed, ...rest } = stored as Record<string, unknown>;
  return { ...rest, profile, recommendations };
}
