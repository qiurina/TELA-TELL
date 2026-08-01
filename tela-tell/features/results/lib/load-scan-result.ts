import { getScanById } from '@/db/scans';
import { getScanResult } from '@/data/scans/mock-data';
import type { ScanResult } from '@/data/scans/mock-data';

/**
 * Loads a scan: SQLite first, then mock templates (ids like "1", "2", "dual").
 */
export async function loadScanResult(scanId: string): Promise<ScanResult | undefined> {
  // Dual demo stays mock-only for now.
  if (scanId === 'dual') {
    return getScanResult('dual');
  }

  const fromDb = await getScanById(scanId);
  if (fromDb) {
    return fromDb;
  }

  return getScanResult(scanId);
}