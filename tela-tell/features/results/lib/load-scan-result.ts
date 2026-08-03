import { getScanById } from '@/db/scans';
import { getScanResult } from '@/data/scans/mock-data';
import type { ScanResult } from '@/data/scans/mock-data';

export async function loadScanResult(scanId: string): Promise<ScanResult | undefined> {
  if (!scanId) {
    return undefined;
  }

  if (scanId === 'dual') {
    return getScanResult('dual');
  }

  return getScanById(scanId);
}
