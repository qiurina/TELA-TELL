import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getAllScansForExport, getScanImportMetadata, saveScan } from '@/db/scans';
import { isDatabaseAvailable } from '@/db/client';
import type { ScanResult } from '@/data/scans/mock-data';
import {
  encodeUtf8,
  ImportInvalidFileError,
  parseExportPayload,
  validateExportPayload,
  writeExportJson,
  type ExportBody,
  type ExportPayload,
} from '@/features/profile/lib/export-format';
import { deleteScanImages, restoreScanImage } from '@/features/scan/lib/scan-image-storage';
import { resolveScanDate } from '@/features/scan/lib/scan-timestamp';
import { ImportScansError, type ImportReport } from './import-report';
import { getUserPreferencesSnapshot } from '@/features/profile/lib/user-preferences';

export { ImportInvalidFileError, parseExportPayload };
export type { ExportPayload };

export class ExportUnavailableError extends Error {
  constructor(message = 'Sharing is not available on this device.') {
    super(message);
    this.name = 'ExportUnavailableError';
  }
}

/** The scans, favorites and preferences for the export, plus where each scan's photo is stored. */
export async function buildExportPayload(): Promise<{
  body: ExportBody;
  photoPaths: Record<string, string>;
}> {
  const entries = await getAllScansForExport();
  const preferences = getUserPreferencesSnapshot();

  const photoPaths: Record<string, string> = {};
  for (const entry of entries) {
    if (entry.imageUri) {
      photoPaths[entry.scan.id] = entry.imageUri;
    }
  }

  return {
    body: {
      exportedAt: new Date().toISOString(),
      scans: entries.map((entry) => entry.scan),
      favoriteScanIds: entries.filter((entry) => entry.isFavorite).map((entry) => entry.scan.id),
      preferences,
    },
    photoPaths,
  };
}

/** A scan's saved photo as base64, or null if the file is gone (Android may clear caches). */
async function readPhotoBase64(path: string): Promise<string | null> {
  try {
    const file = new File(path);
    return file.exists ? await file.base64() : null;
  } catch {
    return null;
  }
}

/**
 * Writes the export, including each scan's saved photo, and opens the share sheet. The file is
 * written piece by piece so photos are read one at a time; it is larger than a data-only export
 * (roughly the combined size of the photos, plus a third for base64).
 */
export async function exportUserData(): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new ExportUnavailableError();
  }

  const { body, photoPaths } = await buildExportPayload();
  const file = new File(Paths.cache, `tela-tell-export-${Date.now()}.json`);
  file.create({ overwrite: true });

  const handle = file.open();
  try {
    await writeExportJson(
      body,
      Object.keys(photoPaths),
      (scanId) => readPhotoBase64(photoPaths[scanId]),
      (chunk) => handle.writeBytes(encodeUtf8(chunk)),
    );
  } finally {
    handle.close();
  }

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Export TELA-TELL data',
  });
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
 * Validate the entire batch before writing anything. Each scan and its favorite status are saved
 * together. A storage failure reports the completed count; retries safely replace the same ids.
 * Imported photos use new paths so a failed save cannot overwrite an existing scan's photo.
 */
export async function importScans(
  scans: ScanResult[],
  favoriteScanIds: string[],
  photos: Record<string, string> = {},
): Promise<ImportReport> {
  const validated = validateExportPayload({ scans, favoriteScanIds, photos });
  if (!isDatabaseAvailable()) throw new Error('Import is available in the mobile app.');
  const favoriteIds = new Set(validated.favoriteScanIds);
  const report: ImportReport = { imported: 0, total: validated.scans.length, missingPhotoIds: [] };
  for (const scan of validated.scans) {
    let restoredImage: string | null = null;
    let saved = false;
    try {
      const existing = await getScanImportMetadata(scan.id);
      const photo = validated.photos?.[scan.id];
      if (photo) {
        restoredImage = await restoreScanImage(scan.id, photo);
        if (!restoredImage) report.missingPhotoIds.push(scan.id);
      }
      const date = resolveScanDate(scan.createdAt ?? existing?.createdAt, scan.scannedAtDate, scan.scannedAt, scan.id);
      if (!date) throw new Error('Missing original scan date.');
      await saveScan({ ...scan, createdAt: date.toISOString() }, {
        garmentCondition: scan.garmentCondition,
        imageUri: restoredImage ?? existing?.imageUri ?? null,
        isFavorite: favoriteIds.has(scan.id),
      });
      saved = true;
      report.imported += 1;
      if (restoredImage && existing?.imageUri && restoredImage !== existing.imageUri) {
        await deleteScanImages([existing.imageUri]);
      }
    } catch (error) {
      if (restoredImage && !saved) await deleteScanImages([restoredImage]);
      console.error('[TELA-TELL] Backup import failed:', error);
      throw new ImportScansError(report);
    }
  }
  return report;
}
