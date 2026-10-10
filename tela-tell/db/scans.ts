import type { ImageSourcePropType } from 'react-native';

import { getDatabase, isDatabaseAvailable } from '@/db/client';
import {
  DEFAULT_GARMENT_CONDITION,
  type GarmentCondition,
} from '@/data/scans/garment-condition';
import type { RecentScanPreview, ScanResult } from '@/data/scans/mock-data';
import { assessScanReliability } from '@/data/scans/scan-confidence';
import { isCaptureType } from '@/features/results/lib/scan-details';
import { normalizeTesterFields } from '@/features/results/lib/tester-fields';
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
  mislabelDetected: number;
  compositionsJson: string | null;
  resultSellerLabel: string | null;
  resultCaptureType: string | null;
  isFavorite?: number | null;
  deletedAt?: string | null;
};

export const SCAN_PAGE_SIZE = 10;

const ACTIVE_SCAN_FILTER = `(deletedAt IS NULL OR deletedAt = '')`;
const DELETED_SCAN_FILTER = `(deletedAt IS NOT NULL AND deletedAt != '')`;
const SCAN_LIST_ORDER = `ORDER BY createdAt DESC, scannedAtDate DESC, scan_ID DESC`;
const DELETED_SCAN_LIST_ORDER = `ORDER BY deletedAt DESC, scan_ID DESC`;
// List rows only need the compositions and seller label out of resultJson, so SQLite extracts
// just those instead of shipping the whole result blob to JS. json_valid guards against one
// malformed row making json_extract throw and failing the entire list query.
const SCAN_LIST_COLUMNS = `scan_ID, dominantFabric, confidence, scannedAt, scannedAtDate, createdAt,
                sellerLabel, imageUri,
                mislabelDetected, isFavorite, deletedAt,
                CASE WHEN json_valid(resultJson) THEN json_extract(resultJson, '$.compositions') END AS compositionsJson,
                CASE WHEN json_valid(resultJson) THEN json_extract(resultJson, '$.sellerLabel') END AS resultSellerLabel,
                CASE WHEN json_valid(resultJson) THEN json_extract(resultJson, '$.capture.captureType') END AS resultCaptureType`;

export type ScanListQuery = {
  /** 1-based; clamped into the valid range. */
  page?: number;
  pageSize?: number;
  /** Matches the dominant fabric, seller label, or any fiber in the composition. */
  search?: string;
  /** Half-open range on createdAt as ISO strings: from <= createdAt < to. */
  dateRange?: { from: string; to: string } | null;
};

export type ScanPage = {
  items: RecentScanPreview[];
  total: number;
  /** The page actually returned (after clamping). */
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ScanStats = {
  total: number;
  mislabeled: number;
};

function daysRemainingUntilPurge(deletedAt: string, retentionDays: number): number {
  const deletedMs = Date.parse(deletedAt);
  if (Number.isNaN(deletedMs)) {
    return retentionDays;
  }
  const expiresAt = deletedMs + retentionDays * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}
/**
 * The three sustainability columns in tblScan are legacy: the app no longer scores sustainability,
 * but the columns are NOT NULL and are kept (dropping them needs a table rebuild). New and
 * migrated rows hold these neutral placeholders, which nothing reads.
 */
export const LEGACY_SUSTAINABILITY_PLACEHOLDER = {
  rating: 'unrated',
  label: 'Not rated',
  score: 0,
} as const;

/**
 * A scan without the `sustainability` object older versions saved. Applied when saving (so an
 * imported old backup cannot write a score back), when reading, and when exporting.
 */
function withoutLegacySustainability<T extends object>(scan: T): T {
  if (!('sustainability' in scan)) {
    return scan;
  }
  const { sustainability: _removed, ...rest } = scan as T & { sustainability?: unknown };
  return rest as T;
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
        LEGACY_SUSTAINABILITY_PLACEHOLDER.rating,
        LEGACY_SUSTAINABILITY_PLACEHOLDER.label,
        LEGACY_SUSTAINABILITY_PLACEHOLDER.score,
        result.mislabeling.detected ? 1 : 0,
        result.mislabeling.title ?? null,
        result.mislabeling.message ?? null,
        JSON.stringify(withoutLegacySustainability(result)),
      ],
    );
  });
}
export type ScanExportEntry = {
  /** The scan without its photo path, which is a device-specific location. */
  scan: ScanResult;
  isFavorite: boolean;
  /** Where this device keeps the scan's photo, used to read it into the export; null if none. */
  imageUri: string | null;
};

export async function getAllScansForExport(): Promise<ScanExportEntry[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    resultJson: string | null;
    isFavorite: number | null;
    imageUri: string | null;
  }>(
    `SELECT resultJson, isFavorite, imageUri FROM tblScan
     WHERE ${ACTIVE_SCAN_FILTER}
     ${SCAN_LIST_ORDER}`,
  );

  const results: ScanExportEntry[] = [];
  for (const row of rows) {
    if (!row.resultJson) {
      continue;
    }
    try {
      const parsed = withoutLegacySustainability(JSON.parse(row.resultJson) as ScanResult);
      const { imageUri: jsonImageUri, ...withoutImage } = parsed;
      results.push({
        scan: withoutImage,
        isFavorite: row.isFavorite === 1,
        imageUri: row.imageUri ?? jsonImageUri ?? null,
      });
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
    const parsed = withoutLegacySustainability(JSON.parse(row.resultJson) as ScanResult);
    return {
      ...parsed,
      imageUri: row.imageUri ?? parsed.imageUri ?? null,
    };
  } catch {
    return undefined;
  }
}
function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Builds the WHERE clause (always starting from `baseFilter`) plus its bound params. */
function buildScanListFilter(
  baseFilter: string,
  query: ScanListQuery,
): { where: string; params: string[] } {
  const clauses = [baseFilter];
  const params: string[] = [];

  const search = query.search?.trim();
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    clauses.push(
      `(dominantFabric LIKE ? ESCAPE '\\'
        OR sellerLabel LIKE ? ESCAPE '\\'
        OR CASE WHEN json_valid(resultJson) THEN EXISTS (
          SELECT 1 FROM json_each(resultJson, '$.compositions')
          WHERE json_extract(value, '$.material') LIKE ? ESCAPE '\\'
        ) ELSE 0 END)`,
    );
    params.push(pattern, pattern, pattern);
  }

  if (query.dateRange) {
    clauses.push('createdAt >= ? AND createdAt < ?');
    params.push(query.dateRange.from, query.dateRange.to);
  }

  return { where: clauses.join(' AND '), params };
}

async function queryScanPage(
  baseFilter: string,
  order: string,
  query: ScanListQuery,
  retentionDays?: number,
): Promise<ScanPage> {
  const pageSize = Math.max(1, Math.floor(query.pageSize ?? SCAN_PAGE_SIZE));
  if (!isDatabaseAvailable()) {
    return { items: [], total: 0, page: 1, pageSize, totalPages: 1 };
  }

  const db = await getDatabase();
  const { where, params } = buildScanListFilter(baseFilter, query);

  const countRow = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM tblScan WHERE ${where}`,
    params,
  );
  const total = countRow?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(query.page ?? 1)), totalPages);

  const rows = await db.getAllAsync<ScanRow>(
    `SELECT ${SCAN_LIST_COLUMNS}
     FROM tblScan
     WHERE ${where}
     ${order}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  );

  return {
    items: rows.map((row) => rowToPreview(row, retentionDays)),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/** One page of active (not deleted) scans, newest first. */
export function getScansPage(query: ScanListQuery = {}): Promise<ScanPage> {
  return queryScanPage(ACTIVE_SCAN_FILTER, SCAN_LIST_ORDER, query);
}

/** One page of favorited, active scans, newest first. */
export function getFavoriteScansPage(query: ScanListQuery = {}): Promise<ScanPage> {
  return queryScanPage(`isFavorite = 1 AND ${ACTIVE_SCAN_FILTER}`, SCAN_LIST_ORDER, query);
}

/** One page of the trash, most recently deleted first. Expired scans are purged first. */
export async function getDeletedScansPage(
  query: ScanListQuery & { retentionDays?: number } = {},
): Promise<ScanPage> {
  const retentionDays = query.retentionDays ?? 30;
  if (isDatabaseAvailable()) {
    await purgeExpiredDeletedScans(retentionDays);
  }
  return queryScanPage(DELETED_SCAN_FILTER, DELETED_SCAN_LIST_ORDER, query, retentionDays);
}

/** Totals for the History header, counted in SQL so no scan rows are loaded. */
export async function getScanStats(): Promise<ScanStats> {
  if (!isDatabaseAvailable()) {
    return { total: 0, mislabeled: 0 };
  }

  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    total: number;
    mislabeled: number | null;
  }>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN mislabelDetected = 1 THEN 1 ELSE 0 END) AS mislabeled
     FROM tblScan
     WHERE ${ACTIVE_SCAN_FILTER}`,
  );

  return {
    total: row?.total ?? 0,
    mislabeled: row?.mislabeled ?? 0,
  };
}
export async function getRecentScans(limit = 5): Promise<RecentScanPreview[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(limit, 50));
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    `SELECT ${SCAN_LIST_COLUMNS}
     FROM tblScan
     WHERE ${ACTIVE_SCAN_FILTER}
     ${SCAN_LIST_ORDER}
     LIMIT ?`,
    [safeLimit],
  );

  return rows.map((row) => rowToPreview(row));
}

function rowToPreview(row: ScanRow, retentionDays = 30): RecentScanPreview {
  let compositionText = '';
  let liveMislabel = row.mislabelDetected === 1;
  let unsure = false;

  if (row.compositionsJson) {
    try {
      const compositions = JSON.parse(row.compositionsJson) as ScanResult['compositions'];
      compositionText = compositions
        .map((item) => `${item.material} ${item.percentage}%`)
        .join(' · ');
      unsure = !assessScanReliability(compositions).reliable;
      liveMislabel = buildMislabeling(
        row.dominantFabric,
        row.sellerLabel ?? row.resultSellerLabel ?? null,
        compositions ?? [],
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
    mislabeling: liveMislabel,
    unsure,
    captureType: isCaptureType(row.resultCaptureType) ? row.resultCaptureType : null,
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
/**
 * Saves a tester's notes (Research mode) with a scan. The notes live inside the scan's saved JSON
 * (no database column), so nothing else about the scan changes and the notes travel with Export
 * and Import. Saving empty notes removes them. Returns false when the scan does not exist.
 */
export async function updateScanTesterFields(
  scanId: string,
  fields: unknown,
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

  const { testerFields: _previous, ...rest } = parsed;
  const normalized = normalizeTesterFields(fields);
  const next: ScanResult = normalized ? { ...rest, testerFields: normalized } : rest;

  await db.runAsync(
    `UPDATE tblScan SET resultJson = ? WHERE scan_ID = ? AND ${ACTIVE_SCAN_FILTER}`,
    [JSON.stringify(next), scanId],
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
