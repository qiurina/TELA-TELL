import * as FileSystem from 'expo-file-system/legacy';

const SCAN_IMAGE_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}scan-images/` : null;

let activeScanImageUris = new Set<string>();

export function setActiveScanImageUris(uris: string[]): void {
  activeScanImageUris = new Set(uris);
}

export function isActiveScanImage(uri: string): boolean {
  return activeScanImageUris.has(uri);
}

export function isPersistedScanImage(uri: string): boolean {
  return Boolean(SCAN_IMAGE_DIR && uri.startsWith(SCAN_IMAGE_DIR));
}

export async function scanImageExists(uri: string): Promise<boolean> {
  try {
    return (await FileSystem.getInfoAsync(uri)).exists;
  } catch {
    return false;
  }
}

export class ScanImageSaveError extends Error {
  constructor() {
    super('Could not save the photo on this device. Free some space, then try Analyze again.');
    this.name = 'ScanImageSaveError';
  }
}

export async function persistScanImage(uri: string, scanId: string): Promise<string> {
  if (!SCAN_IMAGE_DIR) {
    throw new ScanImageSaveError();
  }

  if (isPersistedScanImage(uri)) return uri;
  const destination = `${SCAN_IMAGE_DIR}${scanId}.jpg`;
  try {
    await FileSystem.makeDirectoryAsync(SCAN_IMAGE_DIR, { intermediates: true });
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch (error) {
    console.warn('[TELA-TELL] Could not persist scan image:', error);
    await deleteScanImages([destination]);
    throw new ScanImageSaveError();
  }
}

export async function restoreScanImage(scanId: string, base64: string): Promise<string | null> {
  if (!SCAN_IMAGE_DIR || !/^[A-Za-z0-9_-]{1,100}$/.test(scanId)) {
    return null;
  }

  const destination = `${SCAN_IMAGE_DIR}${scanId}-import-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  try {
    await FileSystem.makeDirectoryAsync(SCAN_IMAGE_DIR, { intermediates: true });
    await FileSystem.writeAsStringAsync(destination, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return destination;
  } catch (error) {
    console.warn('[TELA-TELL] Could not restore imported scan image:', error);
    await deleteScanImages([destination]);
    return null;
  }
}

export async function deleteScanImages(uris: (string | null | undefined)[]): Promise<void> {
  if (!SCAN_IMAGE_DIR) {
    return;
  }

  for (const uri of uris) {
    if (uri && uri.startsWith(SCAN_IMAGE_DIR)) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
      }
    }
  }
}

export async function deleteAllScanImages(): Promise<void> {
  if (!SCAN_IMAGE_DIR) {
    return;
  }

  try {
    await FileSystem.deleteAsync(SCAN_IMAGE_DIR, { idempotent: true });
  } catch {
  }
}
