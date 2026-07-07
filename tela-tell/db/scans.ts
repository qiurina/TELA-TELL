import type { RecentScanPreview, ScanResult } from '@/data/scans/mock-data';

/**
 * Prototype stubs — wire to SQLite in a later pass.
 * Scan flow, History, and Results continue to use mock data.
 */

export async function saveScan(_result: ScanResult, _options?: { userId?: string | null }): Promise<void> {
  // TODO: persist ScanResult to tblScan + tblScanComposition
}

export async function getAllScans(_options?: { userId?: string | null }): Promise<RecentScanPreview[]> {
  // TODO: read scan list for History / Home
  return [];
}

export async function getScanById(_scanId: string): Promise<ScanResult | undefined> {
  // TODO: read full scan from resultJson
  return undefined;
}
