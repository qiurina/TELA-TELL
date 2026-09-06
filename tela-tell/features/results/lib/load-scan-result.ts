import { getScanById } from '@/db/scans';
import type { ScanResult } from '@/data/scans/mock-data';

export async function loadScanResult(scanId: string): Promise<ScanResult | undefined> {
  if (!scanId) {
    return undefined;
  }

  return getScanById(scanId);
}
