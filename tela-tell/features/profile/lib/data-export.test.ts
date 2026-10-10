/**
 * @jest-environment node
 *
 * Export My Data / Import My Data with photos, run against the real scan queries on an in-memory
 * SQLite database, with the phone's file system and share sheet replaced by small fakes.
 */
import BetterSqlite3 from 'better-sqlite3';

import type { ScanResult } from '@/data/scans/mock-data';
import { SCHEMA_SQL } from '@/db/schema';
import { getScanById, saveScan, updateScanTesterFields } from '@/db/scans';
import {
  exportUserData,
  importScans,
  parseExportPayload,
} from '@/features/profile/lib/data-export';
import { restoreScanImage } from '@/features/scan/lib/scan-image-storage';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';
import * as Sharing from 'expo-sharing';
import * as FakeFs from 'expo-file-system';

let mockDb: InstanceType<typeof BetterSqlite3>;

jest.mock('@/db/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBetterSqliteAdapter } = require('@/db/testing/better-sqlite-adapter');
  return {
    getDatabase: async () => createBetterSqliteAdapter(mockDb),
    isDatabaseAvailable: () => true,
  };
});

jest.mock('@/features/scan/lib/scan-image-storage', () => ({
  restoreScanImage: jest.fn(async (id: string) => `file:///docs/scan-images/${id}.jpg`),
  deleteAllScanImages: jest.fn(async () => undefined),
  deleteScanImages: jest.fn(async () => undefined),
}));

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

// A tiny in-memory file system: just the parts export reads and writes.
jest.mock('expo-file-system', () => {
  const store = new Map<string, Uint8Array>();
  class FakeFile {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = parts
        .map((part) => (typeof part === 'string' ? part : (part as { uri: string }).uri))
        .join('/');
    }
    get exists() {
      return store.has(this.uri);
    }
    create() {
      store.set(this.uri, new Uint8Array());
    }
    open() {
      return {
        writeBytes: (bytes: Uint8Array) => {
          const old = store.get(this.uri) ?? new Uint8Array();
          const next = new Uint8Array(old.length + bytes.length);
          next.set(old);
          next.set(bytes, old.length);
          store.set(this.uri, next);
        },
        close: () => undefined,
      };
    }
    async base64() {
      return Buffer.from(store.get(this.uri) ?? []).toString('utf8');
    }
    async text() {
      return Buffer.from(store.get(this.uri) ?? []).toString('utf8');
    }
  }
  return { File: FakeFile, Paths: { cache: { uri: 'file:///cache' } }, __store: store };
});

const fakeStore = (FakeFs as unknown as { __store: Map<string, Uint8Array> }).__store;

const COMPOSITIONS = [
  { material: 'Cotton', percentage: 88 },
  { material: 'Linen', percentage: 12 },
];

function buildResult(id: string): ScanResult {
  const { profile, recommendations } = buildScanProfile('Cotton', 'Cotton', COMPOSITIONS);
  return {
    id,
    dominantFabric: 'Cotton',
    compositions: COMPOSITIONS,
    confidence: 88,
    scannedAt: '12:00 PM',
    scannedAtDate: '2026-10-01',
    mislabeling: { detected: false, title: '', message: '' },
    profile,
    recommendations,
    capture: {
      captureType: 'live_camera',
      clipOnLens: true,
      modelVersion: 'test',
      burstCount: 3,
      inferenceMs: 10,
      totalMs: 100,
      sharpness: 500,
      sharpnessPerPhoto: [400, 500, 450],
      sharpnessCheck: 'passed',
    },
  };
}

/** A "photo" is just text here; the fake file system treats the file contents as the base64 value. */
function putPhoto(path: string, base64: string) {
  fakeStore.set(path, new Uint8Array(Buffer.from(base64, 'utf8')));
}

const exportedFileText = (): string => {
  const [name] = Array.from(fakeStore.keys()).filter((key) => key.includes('tela-tell-export-'));
  return Buffer.from(fakeStore.get(name) ?? []).toString('utf8');
};

beforeEach(() => {
  mockDb = new BetterSqlite3(':memory:');
  mockDb.exec(SCHEMA_SQL);
  fakeStore.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  mockDb.close();
});

describe('exportUserData with photos', () => {
  it('writes each scan\'s saved photo into the export and shares it', async () => {
    putPhoto('file:///docs/scan-images/scan_a.jpg', 'QUJDRA==');
    putPhoto('file:///docs/scan-images/scan_b.jpg', 'RUZHSA==');
    await saveScan(buildResult('scan_a'), { imageUri: 'file:///docs/scan-images/scan_a.jpg' });
    await saveScan(buildResult('scan_b'), { imageUri: 'file:///docs/scan-images/scan_b.jpg' });
    await saveScan(buildResult('scan_no_photo'), { imageUri: null });
    // A scan whose file Android has cleared: exported without a photo, not as an error.
    await saveScan(buildResult('scan_gone'), { imageUri: 'file:///cache/gone.jpg' });

    await exportUserData();

    const parsed = JSON.parse(exportedFileText());
    expect(Object.keys(parsed.photos).sort()).toEqual(['scan_a', 'scan_b']);
    expect(parsed.photos.scan_a).toBe('QUJDRA==');
    expect(parsed.scans).toHaveLength(4);
    // The device-specific photo path is still never written into the scan data.
    expect(JSON.stringify(parsed.scans)).not.toContain('file:///');
    // The capture details, including the three per-photo readings, are in the export.
    expect(parsed.scans[0].capture.sharpnessPerPhoto).toEqual([400, 500, 450]);
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      expect.stringContaining('tela-tell-export-'),
      expect.objectContaining({ mimeType: 'application/json' }),
    );
  });

  it('still exports when no scan has a photo', async () => {
    await saveScan(buildResult('scan_a'), { imageUri: null });
    await exportUserData();
    const parsed = JSON.parse(exportedFileText());
    expect(parsed.photos).toEqual({});
    expect(parsed.scans).toHaveLength(1);
  });
});

describe('importScans with photos', () => {
  it('restores the photos from an export so a fresh device gets its scans and pictures back', async () => {
    putPhoto('file:///docs/scan-images/scan_a.jpg', 'QUJDRA==');
    await saveScan(buildResult('scan_a'), { imageUri: 'file:///docs/scan-images/scan_a.jpg' });
    await exportUserData();
    const payload = parseExportPayload(exportedFileText());

    // A different device: empty database.
    mockDb.close();
    mockDb = new BetterSqlite3(':memory:');
    mockDb.exec(SCHEMA_SQL);

    const count = await importScans(payload.scans, payload.favoriteScanIds, payload.photos);

    expect(count).toBe(1);
    expect(restoreScanImage).toHaveBeenCalledWith('scan_a', 'QUJDRA==');
    const loaded = await getScanById('scan_a');
    expect(loaded?.imageUri).toBe('file:///docs/scan-images/scan_a.jpg');
    expect(loaded?.capture?.sharpnessPerPhoto).toEqual([400, 500, 450]);
  });

  it('carries tester fields and capture details through Export and Import', async () => {
    await saveScan(buildResult('scan_t'), { imageUri: null });
    await updateScanTesterFields('scan_t', {
      careLabelComposition: '60% Cotton, 40% Polyester',
      construction: 'woven',
      colour: 'white',
      garmentId: 'G-12',
    });
    await exportUserData();
    const payload = parseExportPayload(exportedFileText());
    expect(payload.scans[0].testerFields).toEqual({
      careLabelComposition: '60% Cotton, 40% Polyester',
      construction: 'woven',
      colour: 'white',
      garmentId: 'G-12',
    });

    // A different device: empty database.
    mockDb.close();
    mockDb = new BetterSqlite3(':memory:');
    mockDb.exec(SCHEMA_SQL);
    await importScans(payload.scans, payload.favoriteScanIds, payload.photos);

    const loaded = await getScanById('scan_t');
    expect(loaded?.testerFields?.garmentId).toBe('G-12');
    expect(loaded?.testerFields?.construction).toBe('woven');
    expect(loaded?.capture?.captureType).toBe('live_camera');
  });

  it('imports an older export (scans without tester fields or capture details) unchanged', async () => {
    const { capture: _capture, ...older } = buildResult('scan_old');
    await importScans([older as ScanResult], [], {});
    const loaded = await getScanById('scan_old');
    expect(loaded?.testerFields).toBeUndefined();
    expect(loaded?.capture).toBeUndefined();
  });

  it('keeps the photo a device already has when the file is an older export without photos', async () => {
    await saveScan(buildResult('scan_a'), { imageUri: 'file:///docs/scan-images/scan_a.jpg' });

    await importScans([buildResult('scan_a')], [], undefined);

    expect(restoreScanImage).not.toHaveBeenCalled();
    expect((await getScanById('scan_a'))?.imageUri).toBe('file:///docs/scan-images/scan_a.jpg');
  });

  it('imports a scan with no photo anywhere as before, with no image', async () => {
    await importScans([buildResult('scan_new')], [], {});
    expect((await getScanById('scan_new'))?.imageUri).toBeNull();
  });

  it('never writes a photo for an unsafe scan id', async () => {
    await importScans([buildResult('../evil')], [], { '../evil': 'QUJD' });
    expect(restoreScanImage).not.toHaveBeenCalled();
  });

  it('falls back to the existing photo (or none) when a photo cannot be written', async () => {
    (restoreScanImage as jest.Mock).mockResolvedValueOnce(null);
    await importScans([buildResult('scan_x')], [], { scan_x: 'QUJD' });
    expect((await getScanById('scan_x'))?.imageUri).toBeNull();
  });
});
