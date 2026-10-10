/**
 * @jest-environment node
 *
 * Regression test for the accounts-removal migration (removeLegacyAccounts /
 * adoptLegacyPreferences). Runs the REAL migration code against a real in-memory
 * SQLite database (better-sqlite3) seeded to look like a pre-2026-10-06 install, so
 * the assertions exercise the actual SQL and FK-cascade behavior, not a hand-simulated
 * mock of it.
 *
 * Regression covered: the legacy account's profile row was almost always already at
 * profile_ID = DEVICE_PROFILE_ID (this was a single-account app, profile_ID is
 * AUTOINCREMENT starting at 1). The migration's final cleanup DELETE used to run
 * unconditionally and would delete that exact row -- cascading away the user's
 * skinTone/sensitive-fiber/preferred-fiber/dressing-context data -- because the
 * "copy legacy data onto the device profile" branch only runs when the device
 * profile looked empty, which it doesn't when the legacy row *is* the device profile.
 */
import BetterSqlite3 from 'better-sqlite3';

import { migrationWarningFor, type MigrationReport } from '@/db/migration-report';

type BetterSqliteDb = InstanceType<typeof BetterSqlite3>;

/** What AsyncStorage returns for the stored scan-profile fingerprint, and what was written to it. */
let mockStoredFingerprint: string | null = null;
const mockSetItemCalls: [string, string][] = [];

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => mockStoredFingerprint),
    setItem: jest.fn(async (key: string, value: string) => {
      mockSetItemCalls.push([key, value]);
    }),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: null,
  deleteAsync: jest.fn().mockResolvedValue(undefined),
}));

type Adapter = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: unknown[]) => Promise<void>;
  getFirstAsync: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
  getAllAsync: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
  withTransactionAsync: (fn: () => Promise<void>) => Promise<void>;
};

/** When set, any SQL statement matching it throws, to simulate one migration step failing. */
let mockFailOn: RegExp | null = null;

/** When set, `SELECT sqlite_version()` reports this instead of the real SQLite version. */
let mockSqliteVersion: string | null = null;

function mockMaybeFail(sql: string) {
  if (mockFailOn?.test(sql)) {
    throw new Error(`simulated failure: ${sql.slice(0, 60)}`);
  }
}

function mockWrapBetterSqliteDatabase(db: BetterSqliteDb): Adapter {
  return {
    execAsync: async (sql) => {
      mockMaybeFail(sql);
      db.exec(sql);
    },
    runAsync: async (sql, params = []) => {
      mockMaybeFail(sql);
      db.prepare(sql).run(...(params as (string | number | null)[]));
    },
    getFirstAsync: async (sql, params = []) => {
      if (mockSqliteVersion && /sqlite_version\(\)/.test(sql)) {
        return { version: mockSqliteVersion } as never;
      }
      const row = db.prepare(sql).get(...(params as (string | number | null)[]));
      return (row as never) ?? null;
    },
    getAllAsync: async (sql, params = []) => {
      return db.prepare(sql).all(...(params as (string | number | null)[])) as never;
    },
    // better-sqlite3 transactions must be synchronous, but every migration step here
    // only issues further db.prepare(...).run(...) calls synchronously under the hood
    // (our async wrappers just add a microtask), so running the async fn to completion
    // before committing is equivalent for this single-threaded in-memory test database.
    withTransactionAsync: async (fn) => {
      db.exec('BEGIN');
      try {
        await fn();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

let mockDb: BetterSqliteDb;

jest.mock('@/db/client', () => ({
  getDatabase: async () => mockWrapBetterSqliteDatabase(mockDb),
  isDatabaseAvailable: () => true,
}));

const LEGACY_USER_ID = 'legacy-user-123';
const DEVICE_PROFILE_ID = 1;

/** Creates the pre-refactor schema: tblDeviceProfile still has a user_id column. */
function createLegacySchema(db: BetterSqliteDb) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE tblDeviceProfile (
      profile_ID    INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       TEXT,
      skinTone      TEXT,
      skinUndertone TEXT,
      colorSeason   TEXT,
      updatedAt     TEXT NOT NULL
    );

    CREATE TABLE tblSensitiveFiber (
      sensitiveFiber_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_ID        INTEGER NOT NULL,
      fiberName         TEXT NOT NULL,
      FOREIGN KEY (profile_ID) REFERENCES tblDeviceProfile(profile_ID) ON DELETE CASCADE,
      UNIQUE (profile_ID, fiberName)
    );

    CREATE TABLE tblPreferredFiber (
      preferredFiber_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_ID        INTEGER NOT NULL,
      fiberName         TEXT NOT NULL,
      FOREIGN KEY (profile_ID) REFERENCES tblDeviceProfile(profile_ID) ON DELETE CASCADE,
      UNIQUE (profile_ID, fiberName)
    );

    CREATE TABLE tblDressingContext (
      dressingContext_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_ID         INTEGER NOT NULL,
      contextCode        TEXT NOT NULL,
      FOREIGN KEY (profile_ID) REFERENCES tblDeviceProfile(profile_ID) ON DELETE CASCADE,
      UNIQUE (profile_ID, contextCode)
    );
  `);
}

/** Inserts a legacy account's profile (user_id set) plus one of each preference at profileId. */
function insertLegacyAccountProfile(db: BetterSqliteDb, profileId: number) {
  db.prepare(
    `INSERT INTO tblDeviceProfile (profile_ID, user_id, skinTone, skinUndertone, colorSeason, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(profileId, LEGACY_USER_ID, 'Warm', 'Warm Autumn', 'Autumn', '2026-09-01T00:00:00.000Z');

  db.prepare('INSERT INTO tblSensitiveFiber (profile_ID, fiberName) VALUES (?, ?)').run(profileId, 'Wool');
  db.prepare('INSERT INTO tblPreferredFiber (profile_ID, fiberName) VALUES (?, ?)').run(profileId, 'Cotton');
  db.prepare('INSERT INTO tblDressingContext (profile_ID, contextCode) VALUES (?, ?)').run(profileId, 'work');
}

/** The realistic upgrade scenario the bug depended on: the single legacy account's
 * profile + preferences already live at profile_ID = 1. */
function seedLegacySingleAccountDatabase(db: BetterSqliteDb) {
  createLegacySchema(db);
  insertLegacyAccountProfile(db, DEVICE_PROFILE_ID);
}

/** require (not import) so it re-resolves against a fresh module registry -- a static
 * import would keep reusing the first run's cached migrationPromise/module state. Calling
 * this again after a previous run genuinely re-runs the whole migration on the same DB. */
async function runFreshMigration(): Promise<MigrationReport> {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { migrateDatabase } = require('@/db/migrate.native');
  return migrateDatabase();
}

function columnNames(table: string): string[] {
  return (mockDb.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
}

function tableExists(table: string): boolean {
  return Boolean(
    mockDb.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(table),
  );
}

describe('migrateDatabase — accounts-removal migration', () => {
  beforeEach(() => {
    mockDb = new BetterSqlite3(':memory:');
  });

  afterEach(() => {
    mockDb.close();
  });

  it('keeps profile_ID 1 and all of its saved preferences after migrating a pre-existing single-account database', async () => {
    seedLegacySingleAccountDatabase(mockDb);
    await runFreshMigration();

    const profile = mockDb
      .prepare('SELECT skinTone, skinUndertone, colorSeason FROM tblDeviceProfile WHERE profile_ID = ?')
      .get(DEVICE_PROFILE_ID) as
      | { skinTone: string; skinUndertone: string; colorSeason: string }
      | undefined;
    expect(profile).toEqual({ skinTone: 'Warm', skinUndertone: 'Warm Autumn', colorSeason: 'Autumn' });

    const sensitive = mockDb
      .prepare('SELECT fiberName FROM tblSensitiveFiber WHERE profile_ID = ?')
      .all(DEVICE_PROFILE_ID);
    expect(sensitive).toEqual([{ fiberName: 'Wool' }]);

    const preferred = mockDb
      .prepare('SELECT fiberName FROM tblPreferredFiber WHERE profile_ID = ?')
      .all(DEVICE_PROFILE_ID);
    expect(preferred).toEqual([{ fiberName: 'Cotton' }]);

    const context = mockDb
      .prepare('SELECT contextCode FROM tblDressingContext WHERE profile_ID = ?')
      .all(DEVICE_PROFILE_ID);
    expect(context).toEqual([{ contextCode: 'work' }]);

    // Exactly one profile row should remain -- no duplicate/orphaned profile left behind either.
    const allProfiles = mockDb.prepare('SELECT profile_ID FROM tblDeviceProfile').all();
    expect(allProfiles).toEqual([{ profile_ID: DEVICE_PROFILE_ID }]);
  });

  it('creates a clean, empty device profile on a fresh install with no legacy data', async () => {
    await runFreshMigration();

    const profiles = mockDb
      .prepare('SELECT profile_ID, skinTone, skinUndertone, colorSeason FROM tblDeviceProfile')
      .all();
    expect(profiles).toEqual([
      { profile_ID: DEVICE_PROFILE_ID, skinTone: null, skinUndertone: null, colorSeason: null },
    ]);

    for (const table of ['tblSensitiveFiber', 'tblPreferredFiber', 'tblDressingContext']) {
      expect(mockDb.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()).toEqual({ n: 0 });
    }
    expect(columnNames('tblDeviceProfile')).not.toContain('user_id');
    expect(tableExists('tblUser')).toBe(false);
  });

  it('moves a legacy profile at a different profile_ID onto profile_ID 1 and removes the old row', async () => {
    createLegacySchema(mockDb);
    insertLegacyAccountProfile(mockDb, 3);
    await runFreshMigration();

    const profiles = mockDb
      .prepare('SELECT profile_ID, skinTone, skinUndertone, colorSeason FROM tblDeviceProfile')
      .all();
    expect(profiles).toEqual([
      {
        profile_ID: DEVICE_PROFILE_ID,
        skinTone: 'Warm',
        skinUndertone: 'Warm Autumn',
        colorSeason: 'Autumn',
      },
    ]);

    expect(mockDb.prepare('SELECT profile_ID, fiberName FROM tblSensitiveFiber').all()).toEqual([
      { profile_ID: DEVICE_PROFILE_ID, fiberName: 'Wool' },
    ]);
    expect(mockDb.prepare('SELECT profile_ID, fiberName FROM tblPreferredFiber').all()).toEqual([
      { profile_ID: DEVICE_PROFILE_ID, fiberName: 'Cotton' },
    ]);
    expect(mockDb.prepare('SELECT profile_ID, contextCode FROM tblDressingContext').all()).toEqual([
      { profile_ID: DEVICE_PROFILE_ID, contextCode: 'work' },
    ]);
    expect(columnNames('tblDeviceProfile')).not.toContain('user_id');
  });

  it('is safe to run twice: the second run changes nothing', async () => {
    seedLegacySingleAccountDatabase(mockDb);

    const snapshot = () => ({
      profiles: mockDb.prepare('SELECT * FROM tblDeviceProfile ORDER BY profile_ID').all(),
      sensitive: mockDb.prepare('SELECT * FROM tblSensitiveFiber ORDER BY sensitiveFiber_ID').all(),
      preferred: mockDb.prepare('SELECT * FROM tblPreferredFiber ORDER BY preferredFiber_ID').all(),
      context: mockDb.prepare('SELECT * FROM tblDressingContext ORDER BY dressingContext_ID').all(),
    });

    await runFreshMigration();
    const afterFirstRun = snapshot();
    expect(afterFirstRun.profiles).toHaveLength(1);
    expect(afterFirstRun.sensitive).toHaveLength(1);

    await runFreshMigration();
    expect(snapshot()).toEqual(afterFirstRun);
  });
});

/** A tblScan from before createdAt / isFavorite / deletedAt existed, with one saved scan. */
function createOldScanTable(db: BetterSqliteDb) {
  db.exec(`
    CREATE TABLE tblScan (
      scan_ID              TEXT PRIMARY KEY NOT NULL,
      dominantFabric       TEXT NOT NULL,
      confidence           INTEGER NOT NULL,
      scannedAt            TEXT NOT NULL,
      scannedAtDate        TEXT NOT NULL,
      sellerLabel          TEXT,
      garmentCondition     TEXT NOT NULL DEFAULT 'New',
      imageUri             TEXT,
      sustainabilityRating TEXT NOT NULL,
      sustainabilityLabel  TEXT NOT NULL,
      sustainabilityScore  INTEGER NOT NULL,
      mislabelDetected     INTEGER NOT NULL DEFAULT 0,
      mislabelTitle        TEXT,
      mislabelMessage      TEXT,
      resultJson           TEXT
    );
  `);
  db.prepare(
    `INSERT INTO tblScan (scan_ID, dominantFabric, confidence, scannedAt, scannedAtDate,
       sustainabilityRating, sustainabilityLabel, sustainabilityScore)
     VALUES ('scan_old', 'Cotton', 80, '2026-01-01T00:00:00.000Z', '2026-01-01', 'green', 'Higher score', 8)`,
  ).run();
}

/**
 * Jest can't run the two steps that load code with a dynamic import() (resyncScanSustainability and
 * purgeExpiredDeletedScans): Node throws "dynamic import callback ... --experimental-vm-modules".
 * They always fail here for that environment-only reason, so assertions about reported issues
 * ignore exactly those failures and look at everything else. They are not exercised by this file.
 */
function realIssues(report: MigrationReport) {
  return report.issues.filter((issue) => !issue.reason.includes('dynamic import callback'));
}

function indexExists(name: string): boolean {
  return Boolean(
    mockDb.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name = ?").get(name),
  );
}

describe('migrateDatabase — failure reporting', () => {
  beforeEach(() => {
    mockDb = new BetterSqlite3(':memory:');
  });

  afterEach(() => {
    mockFailOn = null;
    mockSqliteVersion = null;
    mockDb.close();
  });

  it('reports no issues when every step succeeds', async () => {
    const report = await runFreshMigration();
    expect(realIssues(report)).toEqual([]);
  });

  it('records a failed step with its name and reason, and still runs the later independent steps', async () => {
    seedLegacySingleAccountDatabase(mockDb);
    mockFailOn = /CREATE INDEX IF NOT EXISTS idx_scan_createdAt/;

    const report = await runFreshMigration();

    expect(realIssues(report)).toHaveLength(1);
    expect(realIssues(report)[0]).toMatchObject({ step: 'idx_scan_createdAt', status: 'failed' });
    expect(realIssues(report)[0].reason).toContain('simulated failure');
    expect(indexExists('idx_scan_createdAt')).toBe(false);

    // removeLegacyAccounts comes after the failed step and does not depend on it: it still ran
    // and kept the user's preferences.
    expect(columnNames('tblDeviceProfile')).not.toContain('user_id');
    expect(tableExists('tblUser')).toBe(false);
    expect(mockDb.prepare('SELECT skinTone FROM tblDeviceProfile WHERE profile_ID = 1').get()).toEqual({
      skinTone: 'Warm',
    });
  });

  it('skips steps whose prerequisite failed, still runs unrelated ones, and a later launch completes them', async () => {
    createOldScanTable(mockDb);
    mockFailOn = /ALTER TABLE tblScan ADD COLUMN createdAt/;

    const report = await runFreshMigration();

    expect(realIssues(report).map((issue) => [issue.step, issue.status])).toEqual([
      ['ensureScanColumn:createdAt', 'failed'],
      ['idx_scan_createdAt', 'skipped'],
      ['backfillScanCreatedAt', 'skipped'],
    ]);
    const skipped = report.issues.find((issue) => issue.step === 'idx_scan_createdAt');
    expect(skipped?.reason).toContain('ensureScanColumn:createdAt');

    // The skipped steps really did not run...
    expect(columnNames('tblScan')).not.toContain('createdAt');
    expect(indexExists('idx_scan_createdAt')).toBe(false);
    // ...while independent steps (the other two columns) did.
    expect(columnNames('tblScan')).toEqual(expect.arrayContaining(['isFavorite', 'deletedAt']));
    expect(mockDb.prepare('SELECT COUNT(*) AS n FROM tblScan').get()).toEqual({ n: 1 });

    // Nothing is retried within the session; the next launch simply runs every step again.
    mockFailOn = null;
    const nextLaunch = await runFreshMigration();
    expect(realIssues(nextLaunch)).toEqual([]);
    expect(columnNames('tblScan')).toContain('createdAt');
    expect(indexExists('idx_scan_createdAt')).toBe(true);
    expect(mockDb.prepare("SELECT createdAt FROM tblScan WHERE scan_ID = 'scan_old'").get()).toEqual({
      createdAt: new Date(0).toISOString(),
    });
  });

  it('does not run the legacy-account cleanup if the column it reads could not be added', async () => {
    mockDb.exec(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE tblDeviceProfile (
        profile_ID    INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       TEXT,
        skinTone      TEXT,
        skinUndertone TEXT,
        updatedAt     TEXT NOT NULL
      );
      INSERT INTO tblDeviceProfile (profile_ID, user_id, skinTone, updatedAt)
      VALUES (1, 'legacy-user-123', 'Warm', '2026-09-01T00:00:00.000Z');
    `);
    mockFailOn = /ALTER TABLE tblDeviceProfile ADD COLUMN colorSeason/;

    const report = await runFreshMigration();

    expect(realIssues(report).map((issue) => [issue.step, issue.status])).toEqual([
      ['ensureProfileColumn:colorSeason', 'failed'],
      ['removeLegacyAccounts', 'skipped'],
    ]);
    // The destructive cleanup was held back, so the legacy row is untouched.
    expect(columnNames('tblDeviceProfile')).toContain('user_id');
    expect(mockDb.prepare('SELECT skinTone FROM tblDeviceProfile WHERE profile_ID = 1').get()).toEqual({
      skinTone: 'Warm',
    });
  });

  it('still rejects when the base schema cannot be created', async () => {
    mockFailOn = /CREATE TABLE IF NOT EXISTS tblDeviceProfile/;
    await expect(runFreshMigration()).rejects.toThrow('simulated failure');
  });
});

/**
 * resyncScanSustainability and purgeExpiredDeletedScans load their code with a dynamic import(),
 * which Node only allows inside Jest when it runs with --experimental-vm-modules (the `npm test`
 * script does this). Without the flag these tests are skipped, not failed.
 */
const dynamicImportSupported = `${process.env.NODE_OPTIONS ?? ''} ${process.execArgv.join(' ')}`.includes(
  '--experimental-vm-modules',
);
const describeWithDynamicImport = dynamicImportSupported ? describe : describe.skip;

const STALE_SCAN = {
  id: 'scan_stale',
  dominantFabric: 'Cotton',
  compositions: [{ material: 'Cotton', percentage: 62 }],
  confidence: 0.62,
  scannedAt: '2026-09-01T10:00:00.000Z',
  scannedAtDate: '2026-09-01',
  garmentCondition: 'Good',
  profile: { texture: 'old' },
  sustainability: { rating: 'green', label: 'Sustainable', score: 9.9, factors: [] },
  recommendations: { garmentPurposes: [], ecoAlternatives: [], reuse: {} },
};

function insertScanRow(
  id: string,
  options: { resultJson?: string | null; deletedAt?: string | null } = {},
) {
  mockDb
    .prepare(
      `INSERT INTO tblScan (scan_ID, dominantFabric, confidence, scannedAt, scannedAtDate, createdAt,
         sustainabilityRating, sustainabilityLabel, sustainabilityScore, resultJson, deletedAt)
       VALUES (?, 'Cotton', 62, '2026-09-01T10:00:00.000Z', '2026-09-01', '2026-09-01T10:00:00.000Z',
         'green', 'Sustainable', 9.9, ?, ?)`,
    )
    .run(
      id,
      options.resultJson === undefined
        ? JSON.stringify({ ...STALE_SCAN, id })
        : options.resultJson,
      options.deletedAt ?? null,
    );
}

function scanLabel(id: string): string {
  return (
    mockDb.prepare('SELECT sustainabilityLabel AS label FROM tblScan WHERE scan_ID = ?').get(id) as {
      label: string;
    }
  ).label;
}

function scanRow(id: string) {
  return mockDb
    .prepare(
      `SELECT dominantFabric, confidence, scannedAt, scannedAtDate, createdAt, sellerLabel,
              garmentCondition, imageUri, mislabelDetected, isFavorite, deletedAt, resultJson,
              sustainabilityRating AS rating, sustainabilityLabel AS label, sustainabilityScore AS score
       FROM tblScan WHERE scan_ID = ?`,
    )
    .get(id) as {
    dominantFabric: string;
    confidence: number;
    scannedAt: string;
    scannedAtDate: string;
    createdAt: string;
    sellerLabel: string | null;
    garmentCondition: string;
    imageUri: string | null;
    mislabelDetected: number;
    isFavorite: number;
    deletedAt: string | null;
    resultJson: string | null;
    rating: string;
    label: string;
    score: number;
  };
}

function scanExists(id: string): boolean {
  return Boolean(mockDb.prepare('SELECT 1 FROM tblScan WHERE scan_ID = ?').get(id));
}

const DAY_MS = 24 * 60 * 60 * 1000;

describeWithDynamicImport('migrateDatabase — steps that use dynamic import()', () => {
  beforeEach(() => {
    mockDb = new BetterSqlite3(':memory:');
    mockStoredFingerprint = null;
    mockSetItemCalls.length = 0;
  });

  afterEach(() => {
    mockFailOn = null;
    mockStoredFingerprint = null;
    mockDb.close();
  });

  it('both steps load and run: no issues are reported on a normal launch', async () => {
    const report = await runFreshMigration();
    expect(report.issues).toEqual([]);
    expect(mockSetItemCalls.map(([key]) => key)).toEqual(['@tela-tell/scan-profile-fingerprint']);
  });

  it('resyncScanSustainability clears old scores on every row, drops the stored score object, keeps everything else, and saves the fingerprint', async () => {
    await runFreshMigration(); // creates the tables
    mockSetItemCalls.length = 0;
    insertScanRow('scan_stale');
    insertScanRow('scan_corrupt', { resultJson: 'not json' });
    insertScanRow('scan_empty', { resultJson: null });
    const before = scanRow('scan_stale');

    const report = await runFreshMigration();

    expect(report.issues).toEqual([]);

    // The legacy columns hold the neutral placeholders on every row, readable or not.
    for (const id of ['scan_stale', 'scan_corrupt', 'scan_empty']) {
      const row = scanRow(id);
      expect([row.rating, row.label, row.score]).toEqual(['unrated', 'Not rated', 0]);
    }

    // The saved JSON no longer carries a score, and nothing else in it was lost.
    const stored = JSON.parse(scanRow('scan_stale').resultJson as string);
    expect('sustainability' in stored).toBe(false);
    expect(JSON.stringify(stored)).not.toMatch(/Sustainable|9\.9/);
    expect(stored.garmentCondition).toBe('Good'); // user/scan-time fields are carried over
    expect(stored.compositions).toEqual(STALE_SCAN.compositions);
    expect(stored.confidence).toBe(STALE_SCAN.confidence);

    // Every unrelated column is untouched.
    const after = scanRow('scan_stale');
    expect({ ...after, resultJson: null, rating: null, label: null, score: null }).toEqual({
      ...before,
      resultJson: null,
      rating: null,
      label: null,
      score: null,
    });

    // An unreadable or empty saved JSON is left exactly as it was.
    expect(scanRow('scan_corrupt').resultJson).toBe('not json');
    expect(scanRow('scan_empty').resultJson).toBeNull();
    expect(mockSetItemCalls).toHaveLength(1);
  });

  it('resyncScanSustainability is repeatable: a second run changes nothing', async () => {
    await runFreshMigration();
    insertScanRow('scan_stale');
    await runFreshMigration();
    const afterFirst = scanRow('scan_stale');

    // Forget the fingerprint so the step runs again on the already-migrated row.
    mockStoredFingerprint = null;
    mockSetItemCalls.length = 0;
    const report = await runFreshMigration();

    expect(report.issues).toEqual([]);
    expect(scanRow('scan_stale')).toEqual(afterFirst);
    expect(mockSetItemCalls).toHaveLength(1);
  });

  it('resyncScanSustainability does nothing when the stored fingerprint is current', async () => {
    await runFreshMigration();
    const fingerprint = mockSetItemCalls[0][1];
    mockSetItemCalls.length = 0;
    mockStoredFingerprint = fingerprint;
    insertScanRow('scan_stale');

    const report = await runFreshMigration();

    expect(report.issues).toEqual([]);
    // Production never hits this: the fingerprint changes with the fiber data and the logic version.
    expect(scanLabel('scan_stale')).toBe('Sustainable');
    expect(mockSetItemCalls).toHaveLength(0);
  });

  it('purgeExpiredDeletedScans removes only trash older than 30 days', async () => {
    await runFreshMigration();
    insertScanRow('scan_active');
    insertScanRow('scan_expired', { deletedAt: new Date(Date.now() - 60 * DAY_MS).toISOString() });
    insertScanRow('scan_recent', { deletedAt: new Date(Date.now() - 5 * DAY_MS).toISOString() });

    const report = await runFreshMigration();

    expect(report.issues).toEqual([]);
    expect(scanExists('scan_expired')).toBe(false);
    expect(scanExists('scan_recent')).toBe(true);
    expect(scanExists('scan_active')).toBe(true);
  });

  it('a failure inside the resync is reported, and the purge after it still runs', async () => {
    await runFreshMigration();
    mockSetItemCalls.length = 0;
    insertScanRow('scan_expired', { deletedAt: new Date(Date.now() - 60 * DAY_MS).toISOString() });
    mockFailOn = /UPDATE tblScan\s+SET sustainabilityRating/;
    insertScanRow('scan_stale');

    const report = await runFreshMigration();

    expect(report.issues.map((issue) => [issue.step, issue.status])).toEqual([
      ['resyncScanSustainability', 'failed'],
    ]);
    expect(scanExists('scan_expired')).toBe(false);
    // The resync failed before saving its fingerprint, so the next launch will try it again.
    expect(mockSetItemCalls).toHaveLength(0);
    // The whole step is one transaction: the failure rolled back, so no row is half-migrated.
    expect(scanLabel('scan_stale')).toBe('Sustainable');
    expect(JSON.parse(scanRow('scan_stale').resultJson as string).sustainability).toBeDefined();
  });
});

describe('migrateDatabase — SQLite version check for DROP COLUMN', () => {
  beforeEach(() => {
    mockDb = new BetterSqlite3(':memory:');
  });

  afterEach(() => {
    mockSqliteVersion = null;
    mockDb.close();
  });

  it('parses versions numerically, so 3.9 is older than 3.35', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isDropColumnSupported } = require('@/db/migrate.native');
    expect(isDropColumnSupported('3.34.1')).toBe(false);
    expect(isDropColumnSupported('3.9.2')).toBe(false);
    expect(isDropColumnSupported('3.35.0')).toBe(true);
    expect(isDropColumnSupported('3.50.3')).toBe(true);
    expect(isDropColumnSupported('4.0.0')).toBe(true);
    expect(isDropColumnSupported('')).toBeNull();
    expect(isDropColumnSupported('unknown')).toBeNull();
  });

  it('reports the real SQLite as supported: a legacy upgrade runs with no issues', async () => {
    seedLegacySingleAccountDatabase(mockDb);
    const report = await runFreshMigration();
    expect(realIssues(report)).toEqual([]);
    expect(columnNames('tblDeviceProfile')).not.toContain('user_id');
  });

  it('stops the legacy-account cleanup before changing anything when SQLite is below 3.35', async () => {
    seedLegacySingleAccountDatabase(mockDb);
    mockSqliteVersion = '3.34.1';

    const report = await runFreshMigration();

    const issues = realIssues(report);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      step: 'removeLegacyAccounts',
      status: 'failed',
      code: 'sqlite-too-old',
    });
    expect(issues[0].reason).toContain('3.34.1');
    expect(issues[0].reason).toContain('DROP COLUMN');

    // Nothing was half-done: the legacy column and the user's data are exactly as they were.
    expect(columnNames('tblDeviceProfile')).toContain('user_id');
    expect(
      mockDb.prepare('SELECT skinTone, colorSeason FROM tblDeviceProfile WHERE profile_ID = 1').get(),
    ).toEqual({ skinTone: 'Warm', colorSeason: 'Autumn' });
    expect(mockDb.prepare('SELECT COUNT(*) AS n FROM tblSensitiveFiber').get()).toEqual({ n: 1 });
  });

  it('also stops dropping the unused syncStatus column, and the next launch on a new SQLite finishes it', async () => {
    await runFreshMigration(); // creates tables
    mockDb.exec("ALTER TABLE tblScan ADD COLUMN syncStatus TEXT NOT NULL DEFAULT 'local'");
    mockSqliteVersion = '3.30.0';

    const report = await runFreshMigration();

    expect(realIssues(report).map((issue) => [issue.step, issue.code])).toEqual([
      ['dropUnusedScanStorage', 'sqlite-too-old'],
    ]);
    expect(columnNames('tblScan')).toContain('syncStatus');

    mockSqliteVersion = null;
    const nextLaunch = await runFreshMigration();
    expect(realIssues(nextLaunch)).toEqual([]);
    expect(columnNames('tblScan')).not.toContain('syncStatus');
  });

  it('does not warn on an old SQLite when there is nothing to drop', async () => {
    mockSqliteVersion = '3.30.0';
    const report = await runFreshMigration();
    expect(realIssues(report)).toEqual([]);
  });

  it('shows the update-the-app warning for an old SQLite, and the generic one for other failures', () => {
    const tooOld = migrationWarningFor({
      issues: [{ step: 'removeLegacyAccounts', status: 'failed', reason: 'x', code: 'sqlite-too-old' }],
    });
    expect(tooOld.message).toMatch(/update TELA-TELL/);
    expect(tooOld.message).toMatch(/scans are safe/);
    expect(tooOld.message).not.toMatch(/3\.35|sqlite|DROP COLUMN|error|exception/i);

    const other = migrationWarningFor({
      issues: [{ step: 'idx_scan_createdAt', status: 'failed', reason: 'x' }],
    });
    expect(other.message).toMatch(/closing and reopening/);
  });
});
