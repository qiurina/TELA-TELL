/** @jest-environment node */
import * as FileSystem from 'expo-file-system/legacy';
import { setActiveScanImageUris } from '@/features/scan/lib/scan-image-storage';

import {
  clearTemporaryFiles,
  formatBytes,
  getFilesSize,
  getScanPhotoStorage,
  TEMP_FILE_MIN_AGE_MS,
} from './storage-usage';

const NOW = Date.parse('2026-10-12T12:00:00Z');
const OLD = (NOW - TEMP_FILE_MIN_AGE_MS - 1000) / 1000;
const FRESH = (NOW - 60 * 1000) / 1000;

type FakeEntry = { size: number; modified?: number } | 'dir';
let mockFiles: Record<string, FakeEntry> = {};

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  cacheDirectory: 'file:///cache/',
  readDirectoryAsync: jest.fn(async (dir: string) => {
    const names = Object.keys(mockFiles)
      .filter((path) => path.startsWith(dir) && path !== dir)
      .map((path) => path.slice(dir.length).split('/')[0]);
    if (names.length === 0 && mockFiles[dir] !== 'dir') {
      throw new Error('missing');
    }
    return [...new Set(names)];
  }),
  getInfoAsync: jest.fn(async (uri: string) => {
    const entry = mockFiles[uri] ?? mockFiles[`${uri}/`];
    if (!entry) return { exists: false };
    if (entry === 'dir') return { exists: true, isDirectory: true };
    return { exists: true, isDirectory: false, size: entry.size, modificationTime: entry.modified };
  }),
  deleteAsync: jest.fn(async () => undefined),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockFiles = {};
  setActiveScanImageUris([]);
});

describe('getScanPhotoStorage', () => {
  it('adds up the saved scan photos', async () => {
    mockFiles = {
      'file:///docs/scan-images/': 'dir',
      'file:///docs/scan-images/a.jpg': { size: 300_000, modified: OLD },
      'file:///docs/scan-images/b.jpg': { size: 200_000, modified: OLD },
    };
    expect(await getScanPhotoStorage()).toEqual({ bytes: 500_000, photos: 2 });
  });

  it('reports zero when no photo has been saved yet', async () => {
    expect(await getScanPhotoStorage()).toEqual({ bytes: 0, photos: 0 });
  });

  it('reports an unreadable photo directory as an error instead of zero usage', async () => {
    mockFiles = { 'file:///docs/scan-images/': 'dir' };
    (FileSystem.readDirectoryAsync as jest.Mock).mockRejectedValueOnce(new Error('unreadable'));
    await expect(getScanPhotoStorage()).rejects.toThrow('unreadable');
  });
});

describe('clearTemporaryFiles', () => {
  it('deletes old temporary files and old exports, but never scan photos or fresh files', async () => {
    mockFiles = {
      'file:///docs/scan-images/': 'dir',
      'file:///docs/scan-images/a.jpg': { size: 300_000, modified: OLD },
      'file:///cache/': 'dir',
      'file:///cache/ImagePicker/': 'dir',
      'file:///cache/ImagePicker/old.jpg': { size: 1_000, modified: OLD },
      'file:///cache/ImagePicker/just-taken.jpg': { size: 2_000, modified: FRESH },
      'file:///cache/ImageManipulator/': 'dir',
      'file:///cache/ImageManipulator/crop.jpg': { size: 4_000, modified: OLD },
      'file:///cache/tela-tell-export-1700000000000.json': { size: 8_000, modified: OLD },
      'file:///cache/something-else.json': { size: 16_000, modified: OLD },
    };

    const freed = await clearTemporaryFiles(NOW);

    const deleted = (FileSystem.deleteAsync as jest.Mock).mock.calls.map(([uri]) => uri).sort();
    expect(deleted).toEqual([
      'file:///cache/ImageManipulator/crop.jpg',
      'file:///cache/ImagePicker/old.jpg',
      'file:///cache/tela-tell-export-1700000000000.json',
    ]);
    expect(freed).toBe(13_000);
  });

  it('frees nothing when there are no temporary files', async () => {
    expect(await clearTemporaryFiles(NOW)).toBe(0);
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });

  it('clears native camera JPEGs in the cache root without touching an active capture or other files', async () => {
    const preview = 'file:///cache/nitro_image_123.jpg';
    mockFiles = {
      'file:///cache/': 'dir',
      [preview]: { size: 4_000, modified: OLD },
      'file:///cache/nitro_image_456.jpg': { size: 4_000, modified: OLD },
      'file:///cache/VisionCamera_789.jpg': { size: 5_000, modified: OLD },
      'file:///cache/unrelated.jpg': { size: 8_000, modified: OLD },
      'file:///cache/VisionCamera_789.mp4': { size: 16_000, modified: OLD },
    };
    setActiveScanImageUris([preview]);
    expect(await clearTemporaryFiles(NOW)).toBe(9_000);
    expect((FileSystem.deleteAsync as jest.Mock).mock.calls.map(([uri]) => uri)).toEqual([
      'file:///cache/nitro_image_456.jpg',
      'file:///cache/VisionCamera_789.jpg',
    ]);
  });

  it('keeps an old unsaved scan and files with unknown ages', async () => {
    const preview = 'file:///cache/ImageManipulator/preview.jpg';
    mockFiles = {
      'file:///cache/': 'dir',
      'file:///cache/ImageManipulator/': 'dir',
      [preview]: { size: 4_000, modified: OLD },
      'file:///cache/ImageManipulator/unknown.jpg': { size: 2_000 },
    };
    setActiveScanImageUris([preview]);
    expect(await clearTemporaryFiles(NOW)).toBe(0);
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();

    setActiveScanImageUris([]);
    expect(await clearTemporaryFiles(NOW)).toBe(4_000);
    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(1);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(preview, { idempotent: true });
  });

  it('reports deletion failures instead of claiming there was nothing to clear', async () => {
    mockFiles = {
      'file:///cache/': 'dir',
      'file:///cache/tela-tell-export-1700000000000.json': { size: 8_000, modified: OLD },
    };
    (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(new Error('permission denied'));
    await expect(clearTemporaryFiles(NOW)).rejects.toThrow('could not be removed');
  });

  it('keeps cache photos referenced by saved or trashed scans from older app versions', async () => {
    const saved = 'file:///cache/ImageManipulator/saved.jpg';
    const deleted = 'file:///cache/ImageManipulator/deleted.jpg';
    mockFiles = {
      'file:///cache/': 'dir',
      'file:///cache/ImageManipulator/': 'dir',
      [saved]: { size: 4_000, modified: OLD },
      [deleted]: { size: 5_000, modified: OLD },
      'file:///cache/ImageManipulator/unused.jpg': { size: 6_000, modified: OLD },
    };
    expect(await clearTemporaryFiles(NOW, [saved, deleted])).toBe(6_000);
    expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(1);
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///cache/ImageManipulator/unused.jpg', { idempotent: true });
  });

  it('reports an unreadable cache as an error', async () => {
    mockFiles = { 'file:///cache/': 'dir' };
    (FileSystem.readDirectoryAsync as jest.Mock).mockRejectedValueOnce(new Error('unreadable'));
    await expect(clearTemporaryFiles(NOW)).rejects.toThrow('unreadable');
  });

  it('keeps a file that was refreshed after the cache was listed', async () => {
    const uri = 'file:///cache/tela-tell-export-1700000000000.json';
    mockFiles = { 'file:///cache/': 'dir', [uri]: { size: 8_000, modified: OLD } };
    const getInfo = FileSystem.getInfoAsync as jest.Mock;
    const original = getInfo.getMockImplementation()!;
    let reads = 0;
    getInfo.mockImplementation(async (path: string) => {
      if (path === uri && ++reads === 2) mockFiles[uri] = { size: 8_000, modified: FRESH };
      return original(path);
    });
    try {
      expect(await clearTemporaryFiles(NOW)).toBe(0);
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    } finally { getInfo.mockImplementation(original); }
  });
});

describe('getFilesSize', () => {
  it('adds up the given files and counts missing ones as zero', async () => {
    mockFiles = {
      'file:///docs/scan-images/a.jpg': { size: 300_000, modified: OLD },
      'file:///docs/scan-images/b.jpg': { size: 200_000, modified: OLD },
    };
    expect(
      await getFilesSize([
        'file:///docs/scan-images/a.jpg',
        'file:///docs/scan-images/b.jpg',
        'file:///docs/scan-images/gone.jpg',
      ]),
    ).toBe(500_000);
  });

  it('counts a shared file only once', async () => {
    const uri = 'file:///docs/scan-images/a.jpg';
    mockFiles = { [uri]: { size: 300_000, modified: OLD } };
    expect(await getFilesSize([uri, uri])).toBe(300_000);
  });

  it('does not treat a failed file-size lookup as a missing photo', async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockRejectedValueOnce(new Error('unreadable'));
    await expect(getFilesSize(['file:///docs/scan-images/a.jpg'])).rejects.toThrow('unreadable');
  });
});

describe('formatBytes', () => {
  it('uses KB under a megabyte and one decimal above', () => {
    expect(formatBytes(0)).toBe('0 KB');
    expect(formatBytes(820 * 1024)).toBe('820 KB');
    expect(formatBytes(13.6 * 1024 * 1024)).toBe('13.6 MB');
    expect(formatBytes(1.2 * 1024 * 1024 * 1024)).toBe('1.2 GB');
  });
});
