/**
 * @jest-environment node
 *
 * Runs the real paginated scan queries (db/scans.ts) against an in-memory SQLite database built
 * from the app's real schema, so LIMIT/OFFSET, search, date-range, favorites, trash and the
 * header stats are exercised as actual SQL.
 */
import BetterSqlite3 from 'better-sqlite3';

import type { SupportedFabric } from '@/data/fabrics/fabrics';
import type { ScanCaptureMeta, ScanResult } from '@/data/scans/mock-data';
import { SCHEMA_SQL } from '@/db/schema';
import {
  deleteScan,
  getAllScansForExport,
  getDeletedScansPage,
  getFavoriteScansPage,
  getRecentScans,
  getScanById,
  getScansPage,
  getScanStats,
  LEGACY_SUSTAINABILITY_PLACEHOLDER,
  restoreScans,
  saveScan,
  SCAN_PAGE_SIZE,
  setScanFavorite,
  updateScanSellerLabel,
  updateScanTesterFields,
} from '@/db/scans';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';
import { buildMislabeling } from '@/features/scan/lib/create-scan-record';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: null,
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

let mockDb: InstanceType<typeof BetterSqlite3>;

jest.mock('@/db/client', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createBetterSqliteAdapter } = require('@/db/testing/better-sqlite-adapter');
  return {
    getDatabase: async () => createBetterSqliteAdapter(mockDb),
    isDatabaseAvailable: () => true,
  };
});

type SeedScan = {
  id: string;
  fabric?: string;
  compositions?: { material: string; percentage: number }[];
  createdAt: string;
  sellerLabel?: string | null;
  isFavorite?: boolean;
  deletedAt?: string | null;
  rating?: string;
  mislabelDetected?: boolean;
  resultJson?: string | null;
};

const BASE_TIME = Date.UTC(2026, 9, 1, 12, 0, 0);
const minutesAfterBase = (minutes: number) => new Date(BASE_TIME + minutes * 60_000).toISOString();

function insertScan(scan: SeedScan) {
  const fabric = scan.fabric ?? 'Cotton';
  const compositions = scan.compositions ?? [{ material: fabric, percentage: 100 }];
  const resultJson =
    scan.resultJson === undefined
      ? JSON.stringify({ dominantFabric: fabric, compositions, sellerLabel: scan.sellerLabel })
      : scan.resultJson;

  mockDb
    .prepare(
      `INSERT INTO tblScan (
        scan_ID, dominantFabric, confidence, scannedAt, scannedAtDate, createdAt, sellerLabel,
        sustainabilityRating, sustainabilityLabel, sustainabilityScore, mislabelDetected,
        resultJson, isFavorite, deletedAt
      ) VALUES (?, ?, 90, '12:00 PM', '2026-10-01', ?, ?, ?, 'Label', 5, ?, ?, ?, ?)`,
    )
    .run(
      scan.id,
      fabric,
      scan.createdAt,
      scan.sellerLabel ?? null,
      scan.rating ?? 'green',
      scan.mislabelDetected ? 1 : 0,
      resultJson,
      scan.isFavorite ? 1 : 0,
      scan.deletedAt ?? null,
    );
}

const idOf = (index: number) => `scan_${String(index).padStart(2, '0')}`;

/** 25 active scans, scan_00 (oldest) .. scan_24 (newest). Odd ones are a Polyester/Spandex blend. */
function seedTwentyFiveScans() {
  for (let i = 0; i < 25; i += 1) {
    const isBlend = i % 2 === 1;
    insertScan({
      id: idOf(i),
      fabric: isBlend ? 'Polyester' : 'Cotton',
      compositions: isBlend
        ? [
            { material: 'Polyester', percentage: 80 },
            { material: 'Spandex', percentage: 20 },
          ]
        : [{ material: 'Cotton', percentage: 100 }],
      createdAt: minutesAfterBase(i),
    });
  }
}

const ids = (page: { items: { id: string }[] }) => page.items.map((item) => item.id);

beforeEach(() => {
  mockDb = new BetterSqlite3(':memory:');
  mockDb.exec(SCHEMA_SQL);
});

afterEach(() => {
  mockDb.close();
});

describe('getScansPage pagination', () => {
  it('returns 10 scans per page, newest first, with correct totals and no overlap', async () => {
    seedTwentyFiveScans();

    const page1 = await getScansPage({ page: 1 });
    const page2 = await getScansPage({ page: 2 });
    const page3 = await getScansPage({ page: 3 });

    expect(SCAN_PAGE_SIZE).toBe(10);
    expect([page1.total, page1.totalPages, page1.page]).toEqual([25, 3, 1]);
    expect(ids(page1)).toEqual([24, 23, 22, 21, 20, 19, 18, 17, 16, 15].map(idOf));
    expect(ids(page2)).toEqual([14, 13, 12, 11, 10, 9, 8, 7, 6, 5].map(idOf));
    expect(ids(page3)).toEqual([4, 3, 2, 1, 0].map(idOf));
    expect(new Set([...ids(page1), ...ids(page2), ...ids(page3)]).size).toBe(25);
  });

  it('clamps out-of-range pages into the valid range and reports the page it returned', async () => {
    seedTwentyFiveScans();

    const past = await getScansPage({ page: 99 });
    expect(past.page).toBe(3);
    expect(past.items).toHaveLength(5);

    const before = await getScansPage({ page: 0 });
    expect(before.page).toBe(1);
    expect(before.items).toHaveLength(10);
  });

  it('handles an empty table: no items, one page', async () => {
    const page = await getScansPage({ page: 1 });
    expect(page).toMatchObject({ items: [], total: 0, page: 1, totalPages: 1 });
  });

  it('builds the row summary from only the compositions column of resultJson', async () => {
    seedTwentyFiveScans();

    const [newest] = (await getScansPage({ page: 1 })).items;
    expect(newest.id).toBe(idOf(24));
    expect(newest.composition).toBe('Cotton 100%');

    const [secondNewest] = (await getScansPage({ page: 1, pageSize: 2 })).items.slice(1);
    expect(secondNewest.composition).toBe('Polyester 80% · Spandex 20%');
  });

  it('keeps listing when one row has malformed resultJson', async () => {
    seedTwentyFiveScans();
    insertScan({ id: 'scan_bad', createdAt: minutesAfterBase(100), resultJson: 'not json {' });

    const page = await getScansPage({ page: 1 });
    expect(page.total).toBe(26);
    expect(page.items[0]).toMatchObject({ id: 'scan_bad', composition: '' });
    expect(page.items).toHaveLength(10);

    const searched = await getScansPage({ search: 'Spandex' });
    expect(searched.total).toBe(12);
  });

  it('getRecentScans still returns the newest rows with their summary', async () => {
    seedTwentyFiveScans();
    const recent = await getRecentScans(3);
    expect(recent.map((scan) => scan.id)).toEqual([24, 23, 22].map(idOf));
    expect(recent[1].composition).toBe('Polyester 80% · Spandex 20%');
  });
});

describe('getScansPage search and date range', () => {
  it('matches the dominant fabric, case-insensitively', async () => {
    seedTwentyFiveScans();
    const result = await getScansPage({ search: 'polyEster' });
    expect(result.total).toBe(12);
    expect(result.items.every((scan) => scan.primaryFabric === 'Polyester')).toBe(true);
  });

  it('matches a secondary fiber in a blend', async () => {
    seedTwentyFiveScans();
    const result = await getScansPage({ search: 'spandex' });
    expect(result.total).toBe(12);
  });

  it('matches the seller label', async () => {
    seedTwentyFiveScans();
    insertScan({ id: 'scan_label', createdAt: minutesAfterBase(200), sellerLabel: 'Divisoria 100% silk' });
    const result = await getScansPage({ search: 'divisoria' });
    expect(ids(result)).toEqual(['scan_label']);
  });

  it('treats % and _ in the search text literally, not as wildcards', async () => {
    seedTwentyFiveScans();
    insertScan({ id: 'scan_label', createdAt: minutesAfterBase(200), sellerLabel: '100% silk' });

    expect(ids(await getScansPage({ search: '100%' }))).toEqual(['scan_label']);
    expect((await getScansPage({ search: '%' })).total).toBe(1);
    expect((await getScansPage({ search: '_' })).total).toBe(0);
  });

  it('ignores a blank search', async () => {
    seedTwentyFiveScans();
    expect((await getScansPage({ search: '   ' })).total).toBe(25);
  });

  it('filters by a [from, to) createdAt range', async () => {
    seedTwentyFiveScans();
    const result = await getScansPage({
      dateRange: { from: minutesAfterBase(5), to: minutesAfterBase(15) },
    });
    expect(result.total).toBe(10);
    expect(ids(result)).toEqual([14, 13, 12, 11, 10, 9, 8, 7, 6, 5].map(idOf));
  });

  it('combines search and date range, and clamps the page to the smaller result', async () => {
    seedTwentyFiveScans();
    const result = await getScansPage({
      page: 3,
      search: 'spandex',
      dateRange: { from: minutesAfterBase(0), to: minutesAfterBase(10) },
    });
    // Odd scans 1,3,5,7,9 fall in range -> 5 results on a single page.
    expect(result.total).toBe(5);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});

describe('favorites, trash and stats', () => {
  it('pages only favorited, active scans and updates as favorites change', async () => {
    seedTwentyFiveScans();
    for (let i = 0; i < 12; i += 1) {
      await setScanFavorite(idOf(i), true);
    }

    const page1 = await getFavoriteScansPage({ page: 1 });
    const page2 = await getFavoriteScansPage({ page: 2 });
    expect([page1.total, page1.totalPages]).toEqual([12, 2]);
    expect(page1.items).toHaveLength(10);
    expect(page2.items).toHaveLength(2);
    expect(page1.items.every((scan) => scan.isFavorite)).toBe(true);

    await setScanFavorite(idOf(11), false);
    expect((await getFavoriteScansPage({ page: 2 })).page).toBe(2);
    expect((await getFavoriteScansPage({ page: 2 })).items).toHaveLength(1);
  });

  it('hides deleted scans from History, lists them in the trash, and restoring brings them back', async () => {
    seedTwentyFiveScans();
    await deleteScan(idOf(24));
    await deleteScan(idOf(23));

    expect((await getScansPage({})).total).toBe(23);
    expect(ids(await getScansPage({})).includes(idOf(24))).toBe(false);

    const trash = await getDeletedScansPage({});
    expect(trash.total).toBe(2);
    expect(trash.items.every((scan) => scan.daysRemaining !== undefined)).toBe(true);
    expect(trash.items.map((scan) => scan.id).sort()).toEqual([idOf(23), idOf(24)]);

    await restoreScans([idOf(24)]);
    expect((await getScansPage({})).total).toBe(24);
    expect((await getDeletedScansPage({})).total).toBe(1);
  });

  it('purges scans deleted longer ago than the retention window when loading the trash', async () => {
    insertScan({ id: 'scan_old', createdAt: minutesAfterBase(0), deletedAt: '2020-01-01T00:00:00.000Z' });
    insertScan({ id: 'scan_recent', createdAt: minutesAfterBase(1), deletedAt: new Date().toISOString() });

    const trash = await getDeletedScansPage({});
    expect(ids(trash)).toEqual(['scan_recent']);
    expect(mockDb.prepare('SELECT COUNT(*) AS n FROM tblScan WHERE scan_ID = ?').get('scan_old')).toEqual({
      n: 0,
    });
  });

  it('counts total and mislabeled scans in SQL, ignoring deleted ones, and no longer counts "sustainable" ones', async () => {
    // Rows seeded with old stored ratings stand in for scans saved before the score was retired.
    insertScan({ id: 'a', createdAt: minutesAfterBase(0), rating: 'green' });
    insertScan({ id: 'b', createdAt: minutesAfterBase(1), rating: 'yellow', mislabelDetected: true });
    insertScan({ id: 'c', createdAt: minutesAfterBase(2), rating: 'red', mislabelDetected: true });
    insertScan({ id: 'd', createdAt: minutesAfterBase(3), rating: 'green', deletedAt: new Date().toISOString() });

    expect(await getScanStats()).toEqual({ total: 3, mislabeled: 2 });
  });

  it('returns zeros for stats on an empty table', async () => {
    expect(await getScanStats()).toEqual({ total: 0, mislabeled: 0 });
  });

  it('History rows carry no sustainability fields, even for scans saved with an old rating', async () => {
    insertScan({ id: 'old', createdAt: minutesAfterBase(0), rating: 'green' });

    const { items } = await getScansPage({ page: 1 });
    expect(items).toHaveLength(1);
    expect(Object.keys(items[0]).filter((key) => /sustainab/i.test(key))).toEqual([]);
  });
});

describe('unsure scans and capture details', () => {
  const UNSURE_COMPOSITIONS = [
    { material: 'Cotton', percentage: 45 },
    { material: 'Rayon', percentage: 35 },
    { material: 'Linen', percentage: 20 },
  ];
  const SURE_COMPOSITIONS = [
    { material: 'Cotton', percentage: 88 },
    { material: 'Linen', percentage: 12 },
  ];

  const CAPTURE: ScanCaptureMeta = {
    captureType: 'system_camera',
    clipOnLens: true,
    modelVersion: 'test-model-1',
    burstCount: 1,
    inferenceMs: 41,
    totalMs: 380,
    sharpness: 812.4,
    sharpnessPerPhoto: [95.3, 812.4, null],
    sharpnessCheck: 'overridden',
    lighting: {
      perPhoto: [
        { meanLuma: 140.2, darkShare: 0, clippedShare: 0.12, unevenness: 0.3 },
        { meanLuma: 141, darkShare: 0, clippedShare: 0.11, unevenness: 0.31 },
        null,
      ],
      warnings: ['bright_areas'],
    },
  };

  function buildResult(
    id: string,
    compositions: { material: string; percentage: number }[],
    sellerLabel?: string,
  ): ScanResult {
    const dominant = compositions[0].material;
    const { profile, recommendations } = buildScanProfile(
      dominant as SupportedFabric,
      dominant,
      compositions,
    );
    return {
      id,
      dominantFabric: dominant,
      compositions,
      confidence: compositions[0].percentage,
      scannedAt: '12:00 PM',
      scannedAtDate: '2026-10-01',
      sellerLabel,
      mislabeling: buildMislabeling(dominant, sellerLabel ?? null, compositions),
      profile,
      recommendations,
      capture: CAPTURE,
    };
  }

  it('flags an unsure scan in the History summary and leaves a clear one unflagged', async () => {
    insertScan({ id: 'unsure', fabric: 'Cotton', compositions: UNSURE_COMPOSITIONS, createdAt: minutesAfterBase(1) });
    insertScan({ id: 'sure', fabric: 'Cotton', compositions: SURE_COMPOSITIONS, createdAt: minutesAfterBase(2) });

    const { items } = await getScansPage({ page: 1 });
    expect(items.find((item) => item.id === 'unsure')?.unsure).toBe(true);
    expect(items.find((item) => item.id === 'sure')?.unsure).toBe(false);
  });

  it('saves neutral placeholders in the legacy sustainability columns and no score in the saved JSON', async () => {
    await saveScan(buildResult('no-score', SURE_COMPOSITIONS));

    const row = mockDb
      .prepare(
        'SELECT sustainabilityRating AS rating, sustainabilityLabel AS label, sustainabilityScore AS score, resultJson FROM tblScan WHERE scan_ID = ?',
      )
      .get('no-score') as { rating: string; label: string; score: number; resultJson: string };
    expect(row.rating).toBe(LEGACY_SUSTAINABILITY_PLACEHOLDER.rating);
    expect(row.label).toBe(LEGACY_SUSTAINABILITY_PLACEHOLDER.label);
    expect(row.score).toBe(LEGACY_SUSTAINABILITY_PLACEHOLDER.score);
    expect(Object.keys(JSON.parse(row.resultJson))).not.toContain('sustainability');
  });

  it('an old backup that still carries a score cannot write it back when restored', async () => {
    const oldBackupScan = {
      ...buildResult('from-old-backup', SURE_COMPOSITIONS),
      sustainability: { rating: 'green', label: 'Higher score', score: 8.1, factors: [] },
    } as ScanResult;

    await saveScan(oldBackupScan);

    const row = mockDb
      .prepare('SELECT sustainabilityRating AS rating, resultJson FROM tblScan WHERE scan_ID = ?')
      .get('from-old-backup') as { rating: string; resultJson: string };
    expect(row.rating).toBe(LEGACY_SUSTAINABILITY_PLACEHOLDER.rating);
    expect(row.resultJson).not.toMatch(/sustainability|Higher score/);
    // The rest of the old scan is restored as it was.
    const restored = await getScanById('from-old-backup');
    expect(restored?.dominantFabric).toBe('Cotton');
    expect(restored?.capture).toEqual(CAPTURE);
  });

  it('a row that still holds an old score is read and exported without it', async () => {
    insertScan({
      id: 'old-row',
      createdAt: minutesAfterBase(0),
      rating: 'green',
      resultJson: JSON.stringify({
        id: 'old-row',
        dominantFabric: 'Cotton',
        compositions: SURE_COMPOSITIONS,
        sustainability: { rating: 'green', label: 'Higher score', score: 7.5, factors: [] },
      }),
    });

    const loaded = await getScanById('old-row');
    expect(loaded && 'sustainability' in loaded).toBe(false);
    const exported = await getAllScansForExport();
    expect(JSON.stringify(exported)).not.toMatch(/sustainability|Higher score/);
    expect(exported.map((entry) => entry.scan.id)).toEqual(['old-row']);
  });

  it('saves the capture details with the scan and reads them back unchanged', async () => {
    await saveScan(buildResult('with-capture', SURE_COMPOSITIONS));

    const loaded = await getScanById('with-capture');
    expect(loaded?.capture).toEqual(CAPTURE);
  });

  it('keeps the capture details in the exported data', async () => {
    await saveScan(buildResult('exported', SURE_COMPOSITIONS));

    const [entry] = await getAllScansForExport();
    expect(entry.scan.capture).toEqual(CAPTURE);
  });

  it('gives the export each scan\'s stored photo path separately, never inside the scan data', async () => {
    await saveScan(buildResult('with-photo', SURE_COMPOSITIONS), {
      imageUri: 'file:///docs/scan-images/with-photo.jpg',
    });
    await saveScan(buildResult('without-photo', SURE_COMPOSITIONS), { imageUri: null });

    const entries = await getAllScansForExport();
    const withPhoto = entries.find((entry) => entry.scan.id === 'with-photo');
    const withoutPhoto = entries.find((entry) => entry.scan.id === 'without-photo');
    expect(withPhoto?.imageUri).toBe('file:///docs/scan-images/with-photo.jpg');
    expect(withoutPhoto?.imageUri).toBeNull();
    expect(withPhoto?.scan.imageUri).toBeUndefined();
  });

  it('saves and exports all three per-photo sharpness readings in capture order', async () => {
    await saveScan(buildResult('three-photos', SURE_COMPOSITIONS));

    expect((await getScanById('three-photos'))?.capture?.sharpnessPerPhoto).toEqual([95.3, 812.4, null]);
    const exported = await getAllScansForExport();
    expect(exported.find((entry) => entry.scan.id === 'three-photos')?.scan.capture?.sharpnessPerPhoto).toEqual([
      95.3,
      812.4,
      null,
    ]);
    // The text a person shares from Export My Data carries them too.
    expect(JSON.parse(JSON.stringify(exported[0].scan)).capture.sharpnessPerPhoto).toEqual([95.3, 812.4, null]);
  });

  it('saves and exports the lighting readings and notices with the scan', async () => {
    await saveScan(buildResult('lit', SURE_COMPOSITIONS));
    expect((await getScanById('lit'))?.capture?.lighting).toEqual(CAPTURE.lighting);
    const exported = await getAllScansForExport();
    expect(exported.find((entry) => entry.scan.id === 'lit')?.scan.capture?.lighting?.warnings).toEqual(['bright_areas']);
  });

  it('still loads scans saved before the lighting check existed', async () => {
    const { lighting: _omitted, ...beforeLighting } = CAPTURE;
    await saveScan({ ...buildResult('pre-lighting', SURE_COMPOSITIONS), capture: beforeLighting });
    const loaded = await getScanById('pre-lighting');
    expect(loaded?.capture?.lighting).toBeUndefined();
    expect(loaded?.capture?.sharpnessPerPhoto).toEqual([95.3, 812.4, null]);
  });

  it('still loads and exports scans saved before per-photo readings existed', async () => {
    const { sharpnessPerPhoto: _omitted, ...legacyCapture } = CAPTURE;
    const legacyOnlyCapture: Omit<ScanCaptureMeta, 'sharpnessPerPhoto'> = legacyCapture;
    await saveScan({ ...buildResult('legacy-capture', SURE_COMPOSITIONS), capture: legacyOnlyCapture });
    await saveScan({ ...buildResult('no-capture', SURE_COMPOSITIONS), capture: undefined });

    const legacy = await getScanById('legacy-capture');
    expect(legacy?.capture).toEqual(legacyCapture);
    expect(legacy?.capture?.sharpnessPerPhoto).toBeUndefined();
    expect((await getScanById('no-capture'))?.capture).toBeUndefined();

    const exported = await getAllScansForExport();
    expect(exported).toHaveLength(2);
  });

  it('shows how each scan was captured in the History summary, and null for older scans', async () => {
    await saveScan(buildResult('new-scan', SURE_COMPOSITIONS));
    // An older scan: its saved JSON has no capture details at all.
    insertScan({ id: 'older-scan', fabric: 'Cotton', compositions: SURE_COMPOSITIONS, createdAt: minutesAfterBase(1) });
    // A damaged value is not mistaken for a capture type, even one every object inherits.
    insertScan({
      id: 'odd-scan',
      createdAt: minutesAfterBase(2),
      resultJson: JSON.stringify({ dominantFabric: 'Cotton', compositions: SURE_COMPOSITIONS, capture: { captureType: 'toString' } }),
    });

    const { items } = await getScansPage({ page: 1 });
    expect(items.find((item) => item.id === 'new-scan')?.captureType).toBe('system_camera');
    expect(items.find((item) => item.id === 'older-scan')?.captureType).toBeNull();
    expect(items.find((item) => item.id === 'odd-scan')?.captureType).toBeNull();
  });

  describe('tester fields (Research mode)', () => {
    it('saves the notes with the scan and reads them back from the database', async () => {
      await saveScan(buildResult('tester-1', SURE_COMPOSITIONS));

      const ok = await updateScanTesterFields('tester-1', {
        careLabelComposition: '95% Cotton, 5% Spandex',
        construction: 'knit',
        colour: 'navy',
        garmentId: 'G-07',
      });

      expect(ok).toBe(true);
      expect((await getScanById('tester-1'))?.testerFields).toEqual({
        careLabelComposition: '95% Cotton, 5% Spandex',
        construction: 'knit',
        colour: 'navy',
        garmentId: 'G-07',
      });
    });

    it('changes nothing else about the scan', async () => {
      await saveScan(buildResult('tester-2', SURE_COMPOSITIONS, '100% Cotton'));
      const before = await getScanById('tester-2');

      await updateScanTesterFields('tester-2', { garmentId: 'G-1' });
      const after = await getScanById('tester-2');

      const { testerFields, ...afterRest } = after!;
      expect(testerFields).toEqual({ garmentId: 'G-1' });
      expect(afterRest).toEqual(before);
      expect(after?.capture).toEqual(CAPTURE);
    });

    it('replaces earlier notes, and clearing every field removes the notes entirely', async () => {
      await saveScan(buildResult('tester-3', SURE_COMPOSITIONS));
      await updateScanTesterFields('tester-3', { colour: 'red', garmentId: 'G-2' });
      await updateScanTesterFields('tester-3', { colour: 'blue' });
      expect((await getScanById('tester-3'))?.testerFields).toEqual({ colour: 'blue' });

      await updateScanTesterFields('tester-3', { colour: '  ', garmentId: '' });
      const stored = mockDb.prepare('SELECT resultJson FROM tblScan WHERE scan_ID = ?').get('tester-3') as {
        resultJson: string;
      };
      expect(JSON.parse(stored.resultJson)).not.toHaveProperty('testerFields');
    });

    it('cleans what it saves', async () => {
      await saveScan(buildResult('tester-4', SURE_COMPOSITIONS));
      await updateScanTesterFields('tester-4', { colour: '  teal ', construction: 'braided', extra: 'x' });
      expect((await getScanById('tester-4'))?.testerFields).toEqual({ colour: 'teal' });
    });

    it('does not save for a scan that does not exist or is in the trash', async () => {
      expect(await updateScanTesterFields('nope', { colour: 'red' })).toBe(false);

      await saveScan(buildResult('tester-5', SURE_COMPOSITIONS));
      await deleteScan('tester-5');
      expect(await updateScanTesterFields('tester-5', { colour: 'red' })).toBe(false);
    });

    it('survives editing the stated label afterwards', async () => {
      await saveScan(buildResult('tester-6', SURE_COMPOSITIONS));
      await updateScanTesterFields('tester-6', { garmentId: 'G-6' });
      await updateScanSellerLabel('tester-6', '100% Linen');
      const scan = await getScanById('tester-6');
      expect(scan?.testerFields).toEqual({ garmentId: 'G-6' });
      expect(scan?.sellerLabel).toBe('100% Linen');
    });

    it('leaves older scans (no notes) loading and exporting exactly as before', async () => {
      insertScan({ id: 'older', fabric: 'Cotton', compositions: SURE_COMPOSITIONS, createdAt: minutesAfterBase(1) });
      expect((await getScanById('older'))?.testerFields).toBeUndefined();
      const [entry] = await getAllScansForExport();
      expect(entry.scan.testerFields).toBeUndefined();
    });
  });

  it('does not raise a mislabel alert for an unsure scan, but still does for a clear one', async () => {
    await saveScan(buildResult('unsure-label', UNSURE_COMPOSITIONS));
    await saveScan(buildResult('sure-label', SURE_COMPOSITIONS));

    // Silk is not among either scan's top 3, so a clear scan calls this a mismatch.
    await updateScanSellerLabel('unsure-label', '100% Silk');
    await updateScanSellerLabel('sure-label', '100% Silk');

    const unsure = await getScanById('unsure-label');
    const sure = await getScanById('sure-label');
    expect(unsure?.mislabeling.detected).toBe(false);
    expect(sure?.mislabeling.detected).toBe(true);
    expect(await getScanStats()).toMatchObject({ total: 2, mislabeled: 1 });

    const { items } = await getScansPage({ page: 1 });
    expect(items.find((item) => item.id === 'unsure-label')?.mislabeling).toBe(false);
    expect(items.find((item) => item.id === 'sure-label')?.mislabeling).toBe(true);
  });
});
