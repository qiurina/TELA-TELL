import type { ScanResult } from '@/data/scans/mock-data';
import type { UserPreferences } from '@/features/profile/lib/user-preferences';
import {
  ImportInvalidFileError,
  isSafeScanId,
  validateBackupPreferences,
  validateBackupScan,
  validTimestamp,
} from './backup-validation';

export { ImportInvalidFileError, isSafeScanId };

export type ExportPayload = {
  exportedAt?: string;
  scans: ScanResult[];
  favoriteScanIds: string[];
  preferences?: UserPreferences;
  photos?: Record<string, string>;
};

export type ExportBody = Omit<ExportPayload, 'photos'> & { exportedAt: string; preferences: UserPreferences };

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

function isBase64(value: unknown): value is string {
  return typeof value === 'string' && value.length % 4 === 0 && BASE64.test(value);
}

export async function writeExportJson(
  body: ExportBody,
  photoScanIds: string[],
  readPhoto: (scanId: string) => Promise<string | null>,
  write: (chunk: string) => void | Promise<void>,
): Promise<{ photosWritten: number }> {
  const head = JSON.stringify(body);
  await write(head === '{}' ? '{"photos":{' : `${head.slice(0, -1)},"photos":{`);

  let photosWritten = 0;
  for (const scanId of photoScanIds) {
    if (!isSafeScanId(scanId)) {
      continue;
    }
    const base64 = await readPhoto(scanId);
    if (!isBase64(base64)) {
      continue;
    }
    await write(`${photosWritten > 0 ? ',' : ''}${JSON.stringify(scanId)}:"${base64}"`);
    photosWritten += 1;
  }

  await write('}}');
  return { photosWritten };
}

function cleanPhotos(photos: unknown): Record<string, string> | undefined {
  if (photos === undefined) return undefined;
  if (!photos || typeof photos !== 'object' || Array.isArray(photos)) {
    throw new ImportInvalidFileError('Invalid backup photos. No scans were imported.');
  }
  const cleaned: Record<string, string> = Object.create(null);
  for (const [id, value] of Object.entries(photos as Record<string, unknown>)) {
    if (!isSafeScanId(id) || !isBase64(value)) {
      throw new ImportInvalidFileError('Invalid backup photo. No scans were imported.');
    }
    cleaned[id] = value;
  }
  return cleaned;
}

export function parseExportPayload(text: string): ExportPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ImportInvalidFileError();
  }
  return validateExportPayload(parsed);
}

export function validateExportPayload(parsed: unknown): ExportPayload {
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as ExportPayload).scans)
  ) {
    throw new ImportInvalidFileError();
  }

  const payload = parsed as ExportPayload;
  if (payload.exportedAt !== undefined && !validTimestamp(payload.exportedAt)) {
    throw new ImportInvalidFileError('Invalid backup export date. No scans were imported.');
  }
  const scans = payload.scans.map(validateBackupScan);
  const scanIds = new Set(scans.map((scan) => scan.id));
  if (scanIds.size !== scans.length) {
    throw new ImportInvalidFileError('Duplicate scan ids in backup. No scans were imported.');
  }
  if (payload.favoriteScanIds !== undefined && (!Array.isArray(payload.favoriteScanIds)
    || payload.favoriteScanIds.some((id) => typeof id !== 'string' || !scanIds.has(id)))) {
    throw new ImportInvalidFileError('Invalid backup favorites. No scans were imported.');
  }
  const photos = cleanPhotos(payload.photos);
  if (photos && Object.keys(photos).some((id) => !scanIds.has(id))) {
    throw new ImportInvalidFileError('A backup photo has no matching scan. No scans were imported.');
  }
  return {
    exportedAt: payload.exportedAt,
    scans,
    favoriteScanIds: [...new Set(payload.favoriteScanIds ?? [])],
    ...(payload.preferences !== undefined ? { preferences: validateBackupPreferences(payload.preferences) } : {}),
    ...(photos ? { photos } : {}),
  };
}

export function encodeUtf8(text: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text);
  }
  const escaped = /^[\x00-\x7f]*$/.test(text) ? text : unescape(encodeURIComponent(text));
  const bytes = new Uint8Array(escaped.length);
  for (let i = 0; i < escaped.length; i += 1) {
    bytes[i] = escaped.charCodeAt(i);
  }
  return bytes;
}
