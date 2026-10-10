import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getAllScansForExport, getScanById, saveScan, setScanFavorite } from '@/db/scans';
import type { ScanResult } from '@/data/scans/mock-data';
import {
  encodeUtf8,
  ImportInvalidFileError,
  isSafeScanId,
  parseExportPayload,
  writeExportJson,
  type ExportBody,
  type ExportPayload,
} from '@/features/profile/lib/export-format';
import { restoreScanImage } from '@/features/scan/lib/scan-image-storage';
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
 * Imports scans via the existing insert-or-replace save path, which is safe to re-run on
 * the same file. saveScan's underlying INSERT OR REPLACE doesn't preserve isFavorite across
 * a conflict, so favorite status is restored as a separate explicit step after saving each scan.
 *
 * Photos: a scan whose photo is in the file gets it written back to the device. A scan without one
 * (an older export, or a missing photo) keeps whatever photo this device already has for that id,
 * so re-importing an older file never wipes photos that are already here.
 */
export async function importScans(
  scans: ScanResult[],
  favoriteScanIds: string[],
  photos: Record<string, string> = {},
): Promise<number> {
  const favoriteIds = new Set(favoriteScanIds);
  let imported = 0;
  for (const scan of scans) {
    let imageUri: string | null = null;
    const photo = isSafeScanId(scan.id) ? photos[scan.id] : undefined;
    if (photo) {
      imageUri = await restoreScanImage(scan.id, photo);
    }
    if (!imageUri) {
      imageUri = (await getScanById(scan.id))?.imageUri ?? null;
    }

    await saveScan(scan, {
      garmentCondition: scan.garmentCondition,
      imageUri,
    });
    if (favoriteIds.has(scan.id)) {
      await setScanFavorite(scan.id, true);
    }
    imported += 1;
  }
  return imported;
}
