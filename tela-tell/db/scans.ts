import type { ImageSourcePropType } from 'react-native';

import { getDatabase, isDatabaseAvailable } from '@/db/client';
import {
  DEFAULT_GARMENT_CONDITION,
  type GarmentCondition,
} from '@/data/scans/garment-condition';
import type {
  RecentScanPreview,
  ScanResult,
  SustainabilityRating,
} from '@/data/scans/mock-data';
import { buildMislabeling } from '@/features/scan/lib/create-scan-record';
import { deleteAllScanImages, deleteScanImages } from '@/features/scan/lib/scan-image-storage';
import {
  formatScanDisplayTime,
  formatScannedAtDate,
  resolveScanDate,
} from '@/features/scan/lib/scan-timestamp';

const SCAN_THUMBNAIL = require('@/assets/images/testfabric.jpg') as ImageSourcePropType;

export type SaveScanOptions = {
  garmentCondition?: GarmentCondition;
  imageUri?: string | null;
};

type ScanRow = {
  scan_ID: string;
  dominantFabric: string;
  confidence: number;
  scannedAt: string;
  scannedAtDate: string;
  createdAt?: string | null;
  sellerLabel: string | null;
  imageUri: string | null;
  sustainabilityRating: string;
  sustainabilityLabel: string;
  mislabelDetected: number;
  resultJson: string | null;
  isFavorite?: number | null;
  deletedAt?: string | null;
};

const ACTIVE_SCAN_FILTER = `(deletedAt IS NULL OR deletedAt = '')`;
const DELETED_SCAN_FILTER = `(deletedAt IS NOT NULL AND deletedAt != '')`;
const SCAN_LIST_ORDER = `ORDER BY createdAt DESC, scannedAtDate DESC, scan_ID DESC`;
const SCAN_PREVIEW_COLUMNS = `scan_ID, dominantFabric, confidence, scannedAt, scannedAtDate, createdAt,
                sellerLabel, imageUri, sustainabilityRating, sustainabilityLabel,
                mislabelDetected, resultJson, isFavorite, deletedAt`;

function daysRemainingUntilPurge(deletedAt: string, retentionDays: number): number {
  const deletedMs = Date.parse(deletedAt);
  if (Number.isNaN(deletedMs)) {
    return retentionDays;
  }
  const expiresAt = deletedMs + retentionDays * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}
export async function saveScan(
  result: ScanResult,
  options?: SaveScanOptions,
): Promise<void> {
  if (!isDatabaseAvailable()) {
    return;
  }

  const db = await getDatabase();
  const garmentCondition = options?.garmentCondition ?? DEFAULT_GARMENT_CONDITION;
  const imageUri = options?.imageUri ?? null;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO tblScan (
        scan_ID, dominantFabric, confidence,
        scannedAt, scannedAtDate, createdAt, sellerLabel, garmentCondition, imageUri,
        sustainabilityRating, sustainabilityLabel, sustainabilityScore,
        mislabelDetected, mislabelTitle, mislabelMessage,
        resultJson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        result.id,
        result.dominantFabric,
        result.confidence,
        result.scannedAt,
        result.scannedAtDate,
        new Date().toISOString(),
        result.sellerLabel ?? null,
        garmentCondition,
        imageUri,
        result.sustainability.rating,
        result.sustainability.label,
        result.sustainability.score,
        result.mislabeling.detected ? 1 : 0,
        result.mislabeling.title ?? null,
        result.mislabeling.message ?? null,
        JSON.stringify(result),
      ],
    );
  });
}
export type ScanExportEntry = {
  scan: ScanResult;
  isFavorite: boolean;
};

export async function getAllScansForExport(): Promise<ScanExportEntry[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();

  const rows = await db.getAllAsync<{ resultJson: string | null; isFavorite: number | null }>(
    `SELECT resultJson, isFavorite FROM tblScan
     WHERE ${ACTIVE_SCAN_FILTER}
     ${SCAN_LIST_ORDER}`,
  );

  const results: ScanExportEntry[] = [];
  for (const row of rows) {
    if (!row.resultJson) {
      continue;
    }
    try {
      const parsed = JSON.parse(row.resultJson) as ScanResult;
      const { imageUri: _imageUri, ...withoutImage } = parsed;
      results.push({ scan: withoutImage, isFavorite: row.isFavorite === 1 });
    } catch {
      continue;
    }
  }

  return results;
}
export async function getScanById(scanId: string): Promise<ScanResult | undefined> {
  if (!isDatabaseAvailable()) {
    return undefined;
  }

  const db = await getDatabase();
  const row = await db.getFirstAsync<{ resultJson: string | null; imageUri: string | null }>(
    `SELECT resultJson, imageUri FROM tblScan
     WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}
     LIMIT 1`,
    [scanId],
  );

  if (!row?.resultJson) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(row.resultJson) as ScanResult;
    return {
      ...parsed,
      imageUri: row.imageUri ?? parsed.imageUri ?? null,
    };
  } catch {
    return undefined;
  }
}
export async function getAllScans(): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    `SELECT ${SCAN_PREVIEW_COLUMNS}
     FROM tblScan
     WHERE ${ACTIVE_SCAN_FILTER}
     ${SCAN_LIST_ORDER}`,
  );

  return rows.map((row) => rowToPreview(row));
}
export async function getRecentScans(limit = 5): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(limit, 50));
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    `SELECT ${SCAN_PREVIEW_COLUMNS}
     FROM tblScan
     WHERE ${ACTIVE_SCAN_FILTER}
     ${SCAN_LIST_ORDER}
     LIMIT ?`,
    [safeLimit],
  );

  return rows.map((row) => rowToPreview(row));
}
export async function getFavoriteScans(): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    `SELECT ${SCAN_PREVIEW_COLUMNS}
     FROM tblScan
     WHERE isFavorite = 1 AND ${ACTIVE_SCAN_FILTER}
     ${SCAN_LIST_ORDER}`,
  );

  return rows.map((row) => rowToPreview(row));
}
export async function getDeletedScans(
  options?: { retentionDays?: number },
): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const retentionDays = options?.retentionDays ?? 30;
  await purgeExpiredDeletedScans(retentionDays);

  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    `SELECT ${SCAN_PREVIEW_COLUMNS}
     FROM tblScan
     WHERE ${DELETED_SCAN_FILTER}
     ORDER BY deletedAt DESC`,
  );

  return rows.map((row) => rowToPreview(row, retentionDays));
}

function rowToPreview(row: ScanRow, retentionDays = 30): RecentScanPreview {
  let compositionText = '';
  let liveMislabel = row.mislabelDetected === 1;

  if (row.resultJson) {
    try {
      const parsed = JSON.parse(row.resultJson) as ScanResult;
      compositionText = parsed.compositions
        .map((item) => `${item.material} ${item.percentage}%`)
        .join(' · ');
      liveMislabel = buildMislabeling(
        parsed.dominantFabric,
        row.sellerLabel ?? parsed.sellerLabel ?? null,
        parsed.compositions ?? [],
      ).detected;
    } catch {
      compositionText = '';
    }
  }

  const deletedAt = row.deletedAt ?? null;
  const resolvedDate = resolveScanDate(
    row.createdAt,
    row.scannedAtDate,
    row.scannedAt,
    row.scan_ID,
  );

  return {
    id: row.scan_ID,
    primaryFabric: row.dominantFabric,
    composition: compositionText,
    scannedAt: resolvedDate ? formatScanDisplayTime(resolvedDate) : row.scannedAt,
    scannedAtDate: resolvedDate ? formatScannedAtDate(resolvedDate) : row.scannedAtDate,
    sustainability: row.sustainabilityRating as SustainabilityRating,
    sustainabilityLabel: row.sustainabilityLabel,
    mislabeling: liveMislabel,
    sellerLabel: row.sellerLabel ?? undefined,
    image: row.imageUri ? { uri: row.imageUri } : SCAN_THUMBNAIL,
    isFavorite: row.isFavorite === 1,
    deletedAt,
    daysRemaining: deletedAt ? daysRemainingUntilPurge(deletedAt, retentionDays) : undefined,
  };
}
export async function updateScanSellerLabel(
  scanId: string,
  sellerLabel: string | null,
): Promise<boolean> {
  if (!isDatabaseAvailable() || !scanId) {
    return false;
  }

  const db = await getDatabase();
  const row = await db.getFirstAsync<{ resultJson: string | null }>(
    `SELECT resultJson FROM tblScan
     WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}
     LIMIT 1`,
    [scanId],
  );

  if (!row?.resultJson) {
    return false;
  }

  let parsed: ScanResult;
  try {
    parsed = JSON.parse(row.resultJson) as ScanResult;
  } catch {
    return false;
  }

  const trimmed = sellerLabel?.trim() || null;
  const mislabeling = buildMislabeling(
    parsed.dominantFabric,
    trimmed,
    parsed.compositions ?? [],
  );
  const next: ScanResult = {
    ...parsed,
    sellerLabel: trimmed ?? undefined,
    mislabeling,
  };

  await db.runAsync(
    `UPDATE tblScan
     SET sellerLabel = ?,
         mislabelDetected = ?,
         mislabelTitle = ?,
         mislabelMessage = ?,
         resultJson = ?
     WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}`,
    [
      trimmed,
      mislabeling.detected ? 1 : 0,
      mislabeling.title || null,
      mislabeling.message || null,
      JSON.stringify(next),
      scanId,
    ],
  );

  return true;
}
export async function isScanFavorite(scanId: string): Promise<boolean> {
  if (!isDatabaseAvailable() || !scanId) {
    return false;
  }

  const db = await getDatabase();
  try {
    const row = await db.getFirstAsync<{ isFavorite: number }>(
      `SELECT isFavorite FROM tblScan
       WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}
       LIMIT 1`,
      [scanId],
    );
    return row?.isFavorite === 1;
  } catch {
    return false;
  }
}
export async function setScanFavorite(scanId: string, favorite: boolean): Promise<boolean> {
  if (!isDatabaseAvailable() || !scanId) {
    return favorite;
  }

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE tblScan SET isFavorite = ? WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}`,
    [favorite ? 1 : 0, scanId],
  );
  return favorite;
}
export async function deleteScan(scanId: string): Promise<boolean> {
  if (!isDatabaseAvailable() || !scanId) {
    return false;
  }

  const db = await getDatabase();
  const result = await db.runAsync(
    `UPDATE tblScan SET deletedAt = ? WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}`,
    [new Date().toISOString(), scanId],
  );
  return (result.changes ?? 0) > 0;
}
export async function restoreScans(scanIds: string[]): Promise<number> {
  if (!isDatabaseAvailable() || scanIds.length === 0) {
    return 0;
  }

  const db = await getDatabase();
  let restored = 0;
  await db.withTransactionAsync(async () => {
    for (const scanId of scanIds) {
      const result = await db.runAsync(
        `UPDATE tblScan SET deletedAt = NULL WHERE scan_ID = ? AND ${DELETED_SCAN_FILTER}`,
        [scanId],
      );
      restored += result.changes ?? 0;
    }
  });
  return restored;
}

async function hardDeleteScanIds(db: Awaited<ReturnType<typeof getDatabase>>, scanIds: string[]) {
  const imageUris: (string | null)[] = [];
  for (const scanId of scanIds) {
    const row = await db.getFirstAsync<{ imageUri: string | null }>(
      'SELECT imageUri FROM tblScan WHERE scan_ID = ?',
      [scanId],
    );
    imageUris.push(row?.imageUri ?? null);
    await db.runAsync('DELETE FROM tblScan WHERE scan_ID = ?', [scanId]);
  }
  return imageUris;
}
export async function permanentlyDeleteScans(scanIds: string[]): Promise<number> {
  if (!isDatabaseAvailable() || scanIds.length === 0) {
    return 0;
  }

  const db = await getDatabase();
  let imageUris: (string | null)[] = [];
  await db.withTransactionAsync(async () => {
    imageUris = await hardDeleteScanIds(db, scanIds);
  });
  // Photos go only after the rows are gone, so a failed transaction never orphans a scan record.
  await deleteScanImages(imageUris);
  return scanIds.length;
}
export async function permanentlyDeleteAllDeletedScans(): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0;
  }

  const db = await getDatabase();
  const rows = await db.getAllAsync<{ scan_ID: string }>(
    `SELECT scan_ID FROM tblScan WHERE ${DELETED_SCAN_FILTER}`,
  );

  const ids = rows.map((row) => row.scan_ID);
  if (ids.length === 0) {
    return 0;
  }

  await permanentlyDeleteScans(ids);
  return ids.length;
}
export async function purgeExpiredDeletedScans(retentionDays = 30): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0;
  }

  const db = await getDatabase();
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const rows = await db.getAllAsync<{ scan_ID: string }>(
    `SELECT scan_ID FROM tblScan
     WHERE ${DELETED_SCAN_FILTER} AND deletedAt < ?`,
    [cutoff],
  );

  const ids = rows.map((row) => row.scan_ID);
  if (ids.length === 0) {
    return 0;
  }

  await permanentlyDeleteScans(ids);
  return ids.length;
}
/** Permanently removes every scan, including favorites and the trash. */
export async function deleteAllScans(): Promise<void> {
  if (!isDatabaseAvailable()) {
    return;
  }

  const db = await getDatabase();
  await db.runAsync('DELETE FROM tblScan');
  await deleteAllScanImages();
}
