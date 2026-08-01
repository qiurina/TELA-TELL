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

/** Fallback thumbnail when a scan has no saved photo. */
const SCAN_THUMBNAIL = require('@/assets/images/testfabric.jpg') as ImageSourcePropType;

export type SaveScanOptions = {
  userId?: string | null;
  garmentCondition?: GarmentCondition;
  imageUri?: string | null;
};

type ScanRow = {
  scan_ID: string;
  dominantFabric: string;
  confidence: number;
  scannedAt: string;
  scannedAtDate: string;
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
const SCAN_PREVIEW_COLUMNS = `scan_ID, dominantFabric, confidence, scannedAt, scannedAtDate,
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

/**
 * Saves one scan to tblScan + tblScanComposition.
 * Uses INSERT OR REPLACE so re-saving the same scan_ID updates it.
 */
export async function saveScan(
  result: ScanResult,
  options?: SaveScanOptions,
): Promise<void> {
  if (!isDatabaseAvailable()) {
    return;
  }

  const db = await getDatabase();
  const userId = options?.userId ?? null;
  const garmentCondition = options?.garmentCondition ?? DEFAULT_GARMENT_CONDITION;
  const imageUri = options?.imageUri ?? null;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO tblScan (
        scan_ID, user_id, dominantFabric, confidence,
        scannedAt, scannedAtDate, sellerLabel, garmentCondition, imageUri,
        sustainabilityRating, sustainabilityLabel, sustainabilityScore,
        mislabelDetected, mislabelTitle, mislabelMessage,
        resultJson, syncStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local')`,
      [
        result.id,
        userId,
        result.dominantFabric,
        result.confidence,
        result.scannedAt,
        result.scannedAtDate,
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

    await db.runAsync('DELETE FROM tblScanComposition WHERE scan_ID = ?', [result.id]);

    for (let index = 0; index < result.compositions.length; index += 1) {
      const item = result.compositions[index];
      await db.runAsync(
        `INSERT INTO tblScanComposition (scan_ID, material, percentage, sortOrder)
         VALUES (?, ?, ?, ?)`,
        [result.id, item.material, item.percentage, index],
      );
    }
  });
}

/** Loads one full scan (used by Results / profile / recommendations screens). */
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

/** Loads the scan list for History / Home, newest first (excludes trash). */
export async function getAllScans(
  options?: { userId?: string | null },
): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();
  const userId = options?.userId ?? null;

  const rows = userId
    ? await db.getAllAsync<ScanRow>(
        `SELECT ${SCAN_PREVIEW_COLUMNS}
         FROM tblScan
         WHERE user_id = ? AND ${ACTIVE_SCAN_FILTER}
         ORDER BY scannedAt DESC`,
        [userId],
      )
    : await db.getAllAsync<ScanRow>(
        `SELECT ${SCAN_PREVIEW_COLUMNS}
         FROM tblScan
         WHERE ${ACTIVE_SCAN_FILTER}
         ORDER BY scannedAt DESC`,
      );

  return rows.map((row) => rowToPreview(row));
}

/** Favorite scans still in the active library. */
export async function getFavoriteScans(
  options?: { userId?: string | null },
): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();
  const userId = options?.userId ?? null;

  const rows = userId
    ? await db.getAllAsync<ScanRow>(
        `SELECT ${SCAN_PREVIEW_COLUMNS}
         FROM tblScan
         WHERE user_id = ? AND isFavorite = 1 AND ${ACTIVE_SCAN_FILTER}
         ORDER BY scannedAt DESC`,
        [userId],
      )
    : await db.getAllAsync<ScanRow>(
        `SELECT ${SCAN_PREVIEW_COLUMNS}
         FROM tblScan
         WHERE isFavorite = 1 AND ${ACTIVE_SCAN_FILTER}
         ORDER BY scannedAt DESC`,
      );

  return rows.map((row) => rowToPreview(row));
}

/** Soft-deleted scans still within the retention window. */
export async function getDeletedScans(
  options?: { userId?: string | null; retentionDays?: number },
): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const retentionDays = options?.retentionDays ?? 30;
  await purgeExpiredDeletedScans(retentionDays);

  const db = await getDatabase();
  const userId = options?.userId ?? null;

  const rows = userId
    ? await db.getAllAsync<ScanRow>(
        `SELECT ${SCAN_PREVIEW_COLUMNS}
         FROM tblScan
         WHERE user_id = ? AND ${DELETED_SCAN_FILTER}
         ORDER BY deletedAt DESC`,
        [userId],
      )
    : await db.getAllAsync<ScanRow>(
        `SELECT ${SCAN_PREVIEW_COLUMNS}
         FROM tblScan
         WHERE ${DELETED_SCAN_FILTER}
         ORDER BY deletedAt DESC`,
      );

  return rows.map((row) => rowToPreview(row, retentionDays));
}

/** Full scan objects — used for History stats and fabric distribution. */
export async function getAllScanResults(
  options?: { userId?: string | null },
): Promise<ScanResult[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();
  const userId = options?.userId ?? null;

  const rows = userId
    ? await db.getAllAsync<{ resultJson: string | null }>(
        `SELECT resultJson FROM tblScan
         WHERE user_id = ? AND ${ACTIVE_SCAN_FILTER}
         ORDER BY scannedAt DESC`,
        [userId],
      )
    : await db.getAllAsync<{ resultJson: string | null }>(
        `SELECT resultJson FROM tblScan
         WHERE ${ACTIVE_SCAN_FILTER}
         ORDER BY scannedAt DESC`,
      );

  const results: ScanResult[] = [];
  for (const row of rows) {
    if (!row.resultJson) {
      continue;
    }
    try {
      const parsed = JSON.parse(row.resultJson) as ScanResult;
      const mislabeling = buildMislabeling(
        parsed.dominantFabric,
        parsed.sellerLabel ?? null,
        parsed.compositions ?? [],
      );
      results.push({
        ...parsed,
        mislabeling,
      });
    } catch {
      // Skip unreadable rows instead of breaking the whole list.
    }
  }
  return results;
}

/** Turns a database row into the shape History/Home already render. */
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

  return {
    id: row.scan_ID,
    primaryFabric: row.dominantFabric.replace(' dominant', ' Blend'),
    composition: compositionText,
    scannedAt: row.scannedAt,
    scannedAtDate: row.scannedAtDate,
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

/**
 * Updates the seller-declared label on an existing scan and recomputes mislabeling.
 * Keeps both the sellerLabel column and resultJson in sync.
 */
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

/** Whether a scan is marked favorite in SQLite. */
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

/** Toggle or set favorite flag for a scan. Returns the new value. */
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

/** Soft-deletes a scan into Recently Deleted (kept for retentionDays). */
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

/** Restores one or more soft-deleted scans. */
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
  for (const scanId of scanIds) {
    await db.runAsync('DELETE FROM tblScanComposition WHERE scan_ID = ?', [scanId]);
    await db.runAsync('DELETE FROM tblScan WHERE scan_ID = ?', [scanId]);
  }
}

/** Permanently deletes soft-deleted (or any) scans. */
export async function permanentlyDeleteScans(scanIds: string[]): Promise<number> {
  if (!isDatabaseAvailable() || scanIds.length === 0) {
    return 0;
  }

  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await hardDeleteScanIds(db, scanIds);
  });
  return scanIds.length;
}

/** Permanently deletes every soft-deleted scan for the user (or all). */
export async function permanentlyDeleteAllDeletedScans(
  options?: { userId?: string | null },
): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0;
  }

  const db = await getDatabase();
  const userId = options?.userId ?? null;
  const rows = userId
    ? await db.getAllAsync<{ scan_ID: string }>(
        `SELECT scan_ID FROM tblScan WHERE user_id = ? AND ${DELETED_SCAN_FILTER}`,
        [userId],
      )
    : await db.getAllAsync<{ scan_ID: string }>(
        `SELECT scan_ID FROM tblScan WHERE ${DELETED_SCAN_FILTER}`,
      );

  const ids = rows.map((row) => row.scan_ID);
  if (ids.length === 0) {
    return 0;
  }

  await permanentlyDeleteScans(ids);
  return ids.length;
}

/** Removes soft-deleted scans older than retentionDays. */
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