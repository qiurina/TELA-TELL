import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getAllScansForExport, saveScan, setScanFavorite } from '@/db/scans';
import type { ScanResult } from '@/data/scans/mock-data';
import {
  getUserPreferencesSnapshot,
  type UserPreferences,
} from '@/features/profile/lib/user-preferences';

export type ExportPayload = {
  exportedAt: string;
  username: string;
  scans: ScanResult[];
  favoriteScanIds: string[];
  preferences: UserPreferences;
};

export class ExportUnavailableError extends Error {
  constructor(message = 'Sharing is not available on this device.') {
    super(message);
    this.name = 'ExportUnavailableError';
  }
}

export class ImportInvalidFileError extends Error {
  constructor(message = "This doesn't look like a TELA-TELL export file.") {
    super(message);
    this.name = 'ImportInvalidFileError';
  }
}

export async function buildExportPayload(options: {
  userId: string | null;
  username: string;
}): Promise<ExportPayload> {
  const entries = await getAllScansForExport({ userId: options.userId });
  const preferences = getUserPreferencesSnapshot();

  return {
    exportedAt: new Date().toISOString(),
    username: options.username,
    scans: entries.map((entry) => entry.scan),
    favoriteScanIds: entries.filter((entry) => entry.isFavorite).map((entry) => entry.scan.id),
    preferences,
  };
}

export async function exportUserData(options: {
  userId: string | null;
  username: string;
}): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new ExportUnavailableError();
  }

  const payload = await buildExportPayload(options);
  const file = new File(Paths.cache, `tela-tell-export-${Date.now()}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export TELA-TELL data',
  });
}

export function parseExportPayload(text: string): ExportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportInvalidFileError();
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as ExportPayload).scans)
  ) {
    throw new ImportInvalidFileError();
  }

  const payload = parsed as ExportPayload;
  return {
    ...payload,
    favoriteScanIds: Array.isArray(payload.favoriteScanIds) ? payload.favoriteScanIds : [],
  };
}

/**
 * Opens the document picker for any file type (not just ones reporting a JSON MIME type,
 * since some email/cloud providers don't report that reliably), then validates the actual
 * content via parseExportPayload. Returns null if the user cancels the picker.
 */
export async function pickAndParseExportFile(): Promise<ExportPayload | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset) {
    return null;
  }

  const text = await new File(asset.uri).text();
  return parseExportPayload(text);
}

/**
 * Imports scans via the existing insert-or-replace save path, which is safe to re-run on
 * the same file. saveScan's underlying INSERT OR REPLACE doesn't preserve isFavorite across
 * a conflict, so favorite status is restored as a separate explicit step after saving each scan.
 */
export async function importScans(
  scans: ScanResult[],
  favoriteScanIds: string[],
  userId: string | null,
): Promise<number> {
  const favoriteIds = new Set(favoriteScanIds);
  let imported = 0;
  for (const scan of scans) {
    await saveScan(scan, {
      userId,
      garmentCondition: scan.garmentCondition,
      imageUri: null,
    });
    if (favoriteIds.has(scan.id)) {
      await setScanFavorite(scan.id, true);
    }
    imported += 1;
  }
  return imported;
}
