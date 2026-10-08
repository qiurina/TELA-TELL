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

type BetterSqliteDb = InstanceType<typeof BetterSqlite3>;

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
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

function mockWrapBetterSqliteDatabase(db: BetterSqliteDb): Adapter {
  return {
    execAsync: async (sql) => {
      db.exec(sql);
    },
    runAsync: async (sql, params = []) => {
      db.prepare(sql).run(...(params as (string | number | null)[]));
    },
    getFirstAsync: async (sql, params = []) => {
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

/** Seeds a pre-refactor schema: tblDeviceProfile still has user_id, and the single
 * legacy account's profile + preferences already live at profile_ID = 1 -- the
 * realistic upgrade scenario the bug depended on. */
function seedLegacySingleAccountDatabase(db: BetterSqliteDb) {
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

  db.prepare(
    `INSERT INTO tblDeviceProfile (profile_ID, user_id, skinTone, skinUndertone, colorSeason, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(DEVICE_PROFILE_ID, LEGACY_USER_ID, 'Warm', 'Warm Autumn', 'Autumn', '2026-09-01T00:00:00.000Z');

  db.prepare('INSERT INTO tblSensitiveFiber (profile_ID, fiberName) VALUES (?, ?)').run(
    DEVICE_PROFILE_ID,
    'Wool',
  );
  db.prepare('INSERT INTO tblPreferredFiber (profile_ID, fiberName) VALUES (?, ?)').run(
    DEVICE_PROFILE_ID,
    'Cotton',
  );
  db.prepare('INSERT INTO tblDressingContext (profile_ID, contextCode) VALUES (?, ?)').run(
    DEVICE_PROFILE_ID,
    'work',
  );
}

describe('migrateDatabase — accounts-removal migration', () => {
  beforeEach(() => {
    jest.resetModules();
    mockDb = new BetterSqlite3(':memory:');
    seedLegacySingleAccountDatabase(mockDb);
  });

  afterEach(() => {
    mockDb.close();
  });

  it('keeps profile_ID 1 and all of its saved preferences after migrating a pre-existing single-account database', async () => {
    // require (not import) so it re-resolves against the fresh module registry from
    // jest.resetModules() in beforeEach -- a static import would keep reusing the
    // first test run's cached migrationPromise/module state.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { migrateDatabase } = require('@/db/migrate.native');
    await migrateDatabase();

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
});
