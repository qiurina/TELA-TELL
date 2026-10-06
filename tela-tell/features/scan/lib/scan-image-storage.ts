import * as FileSystem from 'expo-file-system/legacy';

/**
 * Scan photos live under the app's document directory. The camera and image manipulator write
 * into the cache directory, which Android may clear at any time; a scan saved with a cache path
 * would then lose its photo in History and on the results screen.
 */
const SCAN_IMAGE_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}scan-images/` : null;

/** True when the path is already inside the permanent scan-images folder. */
export function isPersistedScanImage(uri: string): boolean {
  return Boolean(SCAN_IMAGE_DIR && uri.startsWith(SCAN_IMAGE_DIR));
}

/** Whether a file still exists at this path (cache files may have been cleared by Android). */
export async function scanImageExists(uri: string): Promise<boolean> {
  try {
    return (await FileSystem.getInfoAsync(uri)).exists;
  } catch {
    return false;
  }
}

/** Copies a scan photo to permanent storage. Falls back to the original path if copying fails. */
export async function persistScanImage(uri: string, scanId: string): Promise<string> {
  if (!SCAN_IMAGE_DIR) {
    return uri;
  }

  try {
    await FileSystem.makeDirectoryAsync(SCAN_IMAGE_DIR, { intermediates: true });
    const destination = `${SCAN_IMAGE_DIR}${scanId}.jpg`;
    await FileSystem.copyAsync({ from: uri, to: destination });
    return destination;
  } catch (error) {
    console.warn('[TELA-TELL] Could not persist scan image:', error);
    return uri;
  }
}

/** Deletes stored scan photos. Only files inside the scan-images folder are ever touched. */
export async function deleteScanImages(uris: (string | null | undefined)[]): Promise<void> {
  if (!SCAN_IMAGE_DIR) {
    return;
  }

  for (const uri of uris) {
    if (uri && uri.startsWith(SCAN_IMAGE_DIR)) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // A leftover file is harmless; the scan record is already gone.
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
    // See deleteScanImages.
  }
}
