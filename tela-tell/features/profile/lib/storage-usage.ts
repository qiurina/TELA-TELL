import * as FileSystem from 'expo-file-system/legacy';

import { isActiveScanImage } from '@/features/scan/lib/scan-image-storage';

const SCAN_IMAGE_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}scan-images/` : null;

const TEMP_CACHE_FOLDERS = ['ImagePicker', 'ImageManipulator', 'Camera', 'DocumentPicker'] as const;
const ROOT_TEMP_FILE_PATTERN = /^(?:tela-tell-export-\d+\.json|(?:nitro_image_|VisionCamera_)\d+\.jpg)$/;

export const TEMP_FILE_MIN_AGE_MS = 60 * 60 * 1000;

export type ScanPhotoStorage = { bytes: number; photos: number };

type FileEntry = { uri: string; bytes: number; modifiedMs: number };

async function listFiles(dir: string): Promise<FileEntry[]> {
  if (!(await FileSystem.getInfoAsync(dir)).exists) return [];
  const names = await FileSystem.readDirectoryAsync(dir);

  const entries: FileEntry[] = [];
  for (const name of names) {
    const uri = `${dir}${name}`;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) continue;
    if (info.isDirectory) {
      entries.push(...(await listFiles(`${uri}/`)));
    } else {
      entries.push({ uri, bytes: info.size ?? 0, modifiedMs: (info.modificationTime ?? 0) * 1000 });
    }
  }
  return entries;
}

export async function getScanPhotoStorage(): Promise<ScanPhotoStorage | null> {
  if (!SCAN_IMAGE_DIR) {
    return null;
  }
  const files = await listFiles(SCAN_IMAGE_DIR);
  return {
    bytes: files.reduce((sum, file) => sum + file.bytes, 0),
    photos: files.length,
  };
}

export async function getFilesSize(uris: string[]): Promise<number> {
  let total = 0;
  for (const uri of new Set(uris)) {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && !info.isDirectory) {
      total += info.size ?? 0;
    }
  }
  return total;
}

export async function clearTemporaryFiles(now = Date.now(), savedPhotoUris: readonly string[] = []): Promise<number> {
  const cache = FileSystem.cacheDirectory;
  if (!cache) {
    return 0;
  }
  const savedPhotos = new Set(savedPhotoUris);

  const candidates: FileEntry[] = [];
  for (const folder of TEMP_CACHE_FOLDERS) {
    candidates.push(...(await listFiles(`${cache}${folder}/`)));
  }
  if ((await FileSystem.getInfoAsync(cache)).exists) {
    for (const name of await FileSystem.readDirectoryAsync(cache)) {
      if (!ROOT_TEMP_FILE_PATTERN.test(name)) continue;
      const info = await FileSystem.getInfoAsync(`${cache}${name}`);
      if (info.exists && !info.isDirectory) {
        candidates.push({
          uri: `${cache}${name}`,
          bytes: info.size ?? 0,
          modifiedMs: (info.modificationTime ?? 0) * 1000,
        });
      }
    }
  }

  let freed = 0;
  let failed = false;
  for (const file of candidates) {
    if (savedPhotos.has(file.uri) || isActiveScanImage(file.uri) || !Number.isFinite(file.modifiedMs) || file.modifiedMs <= 0 ||
        now - file.modifiedMs < TEMP_FILE_MIN_AGE_MS) continue;
    try {
      const info = await FileSystem.getInfoAsync(file.uri);
      if (!info.exists || info.isDirectory || isActiveScanImage(file.uri)) continue;
      const modifiedMs = (info.modificationTime ?? 0) * 1000;
      if (!Number.isFinite(modifiedMs) || modifiedMs <= 0 || now - modifiedMs < TEMP_FILE_MIN_AGE_MS) continue;
      await FileSystem.deleteAsync(file.uri, { idempotent: true });
      freed += info.size ?? 0;
    } catch {
      failed = true;
    }
  }
  if (failed) throw new Error('Some temporary files could not be removed. Please try again.');
  return freed;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
