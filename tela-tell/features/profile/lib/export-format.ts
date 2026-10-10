import type { ScanResult } from '@/data/scans/mock-data';
import type { UserPreferences } from '@/features/profile/lib/user-preferences';

/**
 * The file written by Export My Data. `photos` maps a scan id to that scan's saved photo as a
 * base64 JPEG. It is optional: files exported before photos were included simply lack it, and
 * older versions of the app that read a newer file ignore it.
 */
export type ExportPayload = {
  exportedAt: string;
  scans: ScanResult[];
  favoriteScanIds: string[];
  preferences: UserPreferences;
  photos?: Record<string, string>;
};

export type ExportBody = Omit<ExportPayload, 'photos'>;

export class ImportInvalidFileError extends Error {
  constructor(message = "This doesn't look like a TELA-TELL export file.") {
    super(message);
    this.name = 'ImportInvalidFileError';
  }
}

/** Scan ids become file names when photos are restored, so only plain id characters are allowed. */
const SAFE_SCAN_ID = /^[A-Za-z0-9_-]{1,100}$/;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export function isSafeScanId(id: string): boolean {
  return SAFE_SCAN_ID.test(id);
}

/**
 * Writes the export as JSON in pieces, so photos can be read and written one at a time instead of
 * the whole (possibly very large) file being built in memory. The output is exactly one valid
 * JSON document. `readPhoto` returns a photo's base64 JPEG, or null if it is missing.
 */
export async function writeExportJson(
  body: ExportBody,
  photoScanIds: string[],
  readPhoto: (scanId: string) => Promise<string | null>,
  write: (chunk: string) => void | Promise<void>,
): Promise<{ photosWritten: number }> {
  const head = JSON.stringify(body);
  // Reopen the closing brace so a "photos" member can be added after the existing ones.
  await write(head === '{}' ? '{"photos":{' : `${head.slice(0, -1)},"photos":{`);

  let photosWritten = 0;
  for (const scanId of photoScanIds) {
    if (!isSafeScanId(scanId)) {
      continue;
    }
    const base64 = await readPhoto(scanId);
    if (!base64 || !BASE64.test(base64)) {
      continue;
    }
    // Base64 holds no characters that JSON would need to escape, so it is written as it is.
    await write(`${photosWritten > 0 ? ',' : ''}${JSON.stringify(scanId)}:"${base64}"`);
    photosWritten += 1;
  }

  await write('}}');
  return { photosWritten };
}

/** Keeps only photo entries that are safe to turn into files; silently drops the rest. */
function cleanPhotos(photos: unknown): Record<string, string> | undefined {
  if (!photos || typeof photos !== 'object' || Array.isArray(photos)) {
    return undefined;
  }
  const cleaned: Record<string, string> = {};
  for (const [id, value] of Object.entries(photos as Record<string, unknown>)) {
    if (isSafeScanId(id) && typeof value === 'string' && BASE64.test(value)) {
      cleaned[id] = value;
    }
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

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !Array.isArray((parsed as ExportPayload).scans)
  ) {
    throw new ImportInvalidFileError();
  }

  const payload = parsed as ExportPayload;
  const photos = cleanPhotos(payload.photos);
  const { photos: _raw, ...rest } = payload;
  return {
    ...rest,
    favoriteScanIds: Array.isArray(payload.favoriteScanIds) ? payload.favoriteScanIds : [],
    ...(photos ? { photos } : {}),
  };
}

/** UTF-8 bytes of a string, with a fallback for runtimes that have no TextEncoder. */
export function encodeUtf8(text: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text);
  }
  // Non-ASCII characters become %XX sequences, which are decoded back to bytes one by one.
  const escaped = /^[\x00-\x7f]*$/.test(text) ? text : unescape(encodeURIComponent(text));
  const bytes = new Uint8Array(escaped.length);
  for (let i = 0; i < escaped.length; i += 1) {
    bytes[i] = escaped.charCodeAt(i);
  }
  return bytes;
}
