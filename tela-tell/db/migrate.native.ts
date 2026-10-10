import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import { getDatabase } from '@/db/client';
import { DEVICE_PROFILE_ID } from '@/db/preferences';
import type { MigrationIssue, MigrationReport } from '@/db/migration-report';
import { SCHEMA_SQL } from '@/db/schema';
import {
  isPersistedScanImage,
  persistScanImage,
  scanImageExists,
} from '@/features/scan/lib/scan-image-storage';

let migrationPromise: Promise<MigrationReport> | null = null;

/**
 * Runs the migration once per app session and resolves with a report of any steps that failed or
 * were skipped. It only rejects when the base schema itself can't be created.
 *
 * There is no in-session retry: a failed step is simply attempted again the next time the app
 * starts. That is safe because every step is idempotent (columns and indexes are checked before
 * being added, drops use IF EXISTS, and the sustainability resync only records its fingerprint
 * after it succeeds). See the "safe to run twice" test.
 */
export function migrateDatabase(): Promise<MigrationReport> {
  if (!migrationPromise) {
    migrationPromise = runMigration().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
}

/**
 * `ALTER TABLE ... DROP COLUMN` needs SQLite 3.35 (March 2021). expo-sqlite ships its own SQLite,
 * so this only fails if the app is built with a much older one.
 */
const DROP_COLUMN_MIN_VERSION = { major: 3, minor: 35 };

/** `true`/`false`, or `null` when the version string can't be read (then the drop is just tried). */
export function isDropColumnSupported(version: string): boolean | null {
  const match = /^(\d+)\.(\d+)/.exec(version.trim());
  if (!match) {
    return null;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return (
    major > DROP_COLUMN_MIN_VERSION.major ||
    (major === DROP_COLUMN_MIN_VERSION.major && minor >= DROP_COLUMN_MIN_VERSION.minor)
  );
}

class SqliteTooOldError extends Error {
  readonly code = 'sqlite-too-old' as const;

  constructor(version: string) {
    super(
      `SQLite ${version} is older than ${DROP_COLUMN_MIN_VERSION.major}.${DROP_COLUMN_MIN_VERSION.minor}, which DROP COLUMN needs.`,
    );
    this.name = 'SqliteTooOldError';
  }
}

/**
 * Call before changing anything in a step that has to drop a column, so an unsupported SQLite
 * stops the step cleanly instead of failing half way through it.
 */
async function assertDropColumnSupported(db: Database): Promise<void> {
  const row = await db.getFirstAsync<{ version: string }>('SELECT sqlite_version() AS version');
  const version = row?.version ?? '';
  if (isDropColumnSupported(version) === false) {
    throw new SqliteTooOldError(version);
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const stackTop = error.stack?.split('\n').slice(1, 3).join(' ').trim();
    return `${error.name}: ${error.message}${stackTop ? ` | ${stackTop}` : ''}`.slice(0, 500);
  }
  return String(error).slice(0, 500);
}

/**
 * Runs migration steps in isolation so a failure in one can't take down independent steps after
 * it. A step that lists `requires` is skipped (and reported as skipped) when any of those steps
 * failed or was itself skipped, because running it against a half-migrated table would fail or
 * silently do the wrong thing.
 */
function createStepRunner() {
  const issues: MigrationIssue[] = [];
  const unavailable = new Set<string>();

  async function runStep(
    name: string,
    step: () => Promise<void>,
    requires: string[] = [],
  ): Promise<void> {
    const blockedBy = requires.filter((required) => unavailable.has(required));
    if (blockedBy.length > 0) {
      unavailable.add(name);
      issues.push({
        step: name,
        status: 'skipped',
        reason: `Needs ${blockedBy.join(', ')}, which did not complete.`,
      });
      console.warn(`[TELA-TELL] Migration step "${name}" skipped: needs ${blockedBy.join(', ')}.`);
      return;
    }

    try {
      await step();
    } catch (error) {
      unavailable.add(name);
      issues.push({
        step: name,
        status: 'failed',
        reason: describeError(error),
        ...(error instanceof SqliteTooOldError ? { code: error.code } : {}),
      });
      console.warn(`[TELA-TELL] Migration step "${name}" failed, continuing:`, error);
    }
  }

  return { runStep, issues };
}

async function runMigration(): Promise<MigrationReport> {
  const db = await getDatabase();
  // Core schema creation is the one step allowed to abort the whole migration:
  // nothing below can meaningfully run without the base tables existing.
  await db.execAsync(SCHEMA_SQL);

  const { runStep, issues } = createStepRunner();

  await runStep('ensureScanColumn:isFavorite', () =>
    ensureScanColumn(db, 'isFavorite', 'INTEGER NOT NULL DEFAULT 0'),
  );
  await runStep('ensureScanColumn:deletedAt', () => ensureScanColumn(db, 'deletedAt', 'TEXT'));
  await runStep('ensureScanColumn:createdAt', () => ensureScanColumn(db, 'createdAt', 'TEXT'));
  await runStep('ensureProfileColumn:colorSeason', () =>
    ensureProfileColumn(db, 'colorSeason', 'TEXT'),
  );
  await runStep(
    'idx_scan_createdAt',
    () => db.execAsync('CREATE INDEX IF NOT EXISTS idx_scan_createdAt ON tblScan(createdAt DESC)'),
    ['ensureScanColumn:createdAt'],
  );
  // Reads tblDeviceProfile.colorSeason when carrying a legacy account's preferences over.
  await runStep('removeLegacyAccounts', () => removeLegacyAccounts(db), [
    'ensureProfileColumn:colorSeason',
  ]);
  await runStep('dropUnusedScanStorage', () => dropUnusedScanStorage(db));
  await runStep('persistLegacyScanImages', () => persistLegacyScanImages(db));
  await runStep('backfillScanCreatedAt', () => backfillScanCreatedAt(db), [
    'ensureScanColumn:createdAt',
  ]);
  await runStep('resyncScanSustainability', () => resyncScanSustainability(db));
  await runStep(
    'purgeExpiredDeletedScans',
    async () => {
      const { purgeExpiredDeletedScans } = await import('@/db/scans');
      await purgeExpiredDeletedScans(30);
    },
    ['ensureScanColumn:deletedAt'],
  );

  return { issues };
}

/**
 * Re-derives the profile and recommendations for every stored scan from the current fiber and eco
 * data, since saveScan() snapshots these at scan time rather than computing them live on read.
 * It also clears the old sustainability scores (the legacy columns and the `sustainability` key in
 * the saved JSON), which the app no longer shows. A fiber-profiles.ts update should retroactively
 * fix history, not just new scans -- but rewriting every scan on every launch gets slower as history grows, so it
 * only runs when a fingerprint of that data (plus SCAN_PROFILE_LOGIC_VERSION) has changed since
 * the last run.
 */
const SCAN_PROFILE_FINGERPRINT_KEY = '@tela-tell/scan-profile-fingerprint';

function hashString(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

async function resyncScanSustainability(db: Database) {
  const { SCAN_PROFILE_LOGIC_VERSION } = await import('@/features/scan/lib/build-scan-profile');
  const { refreshStoredScan } = await import('@/features/scan/lib/refresh-stored-scan');
  const { SUPPORTED_FABRICS } = await import('@/data/fabrics/fabrics');
  const { FIBER_PROFILES } = await import('@/data/fabrics/fiber-profiles');
  const { getEcoGuidance } = await import('@/data/fabrics/eco-alternatives');

  const fingerprint = hashString(
    JSON.stringify([
      SCAN_PROFILE_LOGIC_VERSION,
      FIBER_PROFILES,
      SUPPORTED_FABRICS.map((fabric) => getEcoGuidance(fabric)),
    ]),
  );
  if ((await AsyncStorage.getItem(SCAN_PROFILE_FINGERPRINT_KEY)) === fingerprint) {
    return;
  }

  const { LEGACY_SUSTAINABILITY_PLACEHOLDER: placeholder } = await import('@/db/scans');

  const rows = await db.getAllAsync<{ scan_ID: string; resultJson: string | null }>(
    'SELECT scan_ID, resultJson FROM tblScan',
  );

  await db.withTransactionAsync(async () => {
    // Old sustainability scores are cleared on every row, including rows whose saved JSON can't
    // be read, so no stored score can reappear. Nothing else on the row is touched.
    await db.runAsync(
      `UPDATE tblScan
       SET sustainabilityRating = ?, sustainabilityLabel = ?, sustainabilityScore = ?
       WHERE sustainabilityRating != ? OR sustainabilityLabel != ? OR sustainabilityScore != ?`,
      [
        placeholder.rating,
        placeholder.label,
        placeholder.score,
        placeholder.rating,
        placeholder.label,
        placeholder.score,
      ],
    );

    for (const row of rows) {
      if (!row.resultJson) {
        continue;
      }

      // Only an unreadable row is skipped. A failed database write below is NOT caught: it rolls
      // the transaction back and fails the step, so it is reported and retried on the next
      // launch instead of being hidden while the fingerprint is saved as if all had succeeded.
      let next: ReturnType<typeof refreshStoredScan>;
      try {
        next = refreshStoredScan(JSON.parse(row.resultJson));
      } catch {
        continue;
      }
      const nextJson = JSON.stringify(next);

      // Already current: leave the row alone rather than rewriting it.
      if (nextJson === row.resultJson) {
        continue;
      }

      await db.runAsync('UPDATE tblScan SET resultJson = ? WHERE scan_ID = ?', [nextJson, row.scan_ID]);
    }
  });

  await AsyncStorage.setItem(SCAN_PROFILE_FINGERPRINT_KEY, fingerprint);
}

type Database = Awaited<ReturnType<typeof getDatabase>>;

/**
 * The app used to have local accounts (tblUser, a user_id on scans and preferences). It is now
 * a single-user, on-device app. For databases created by an older build this:
 *  - moves the most recently saved account's preferences onto the one device profile
 *    (only if the device profile is still empty), then drops the per-account profiles;
 *  - drops tblUser (and with it the stored password hashes) and the user_id columns;
 *  - clears the stored session and the old avatar files.
 * Scans keep all their data; they were only ever filtered by user_id, which is no longer read.
 */
async function removeLegacyAccounts(db: Database) {
  const profileColumns = await tableColumns(db, 'tblDeviceProfile');
  const scanColumns = await tableColumns(db, 'tblScan');

  if (profileColumns.includes('user_id') || scanColumns.includes('user_id')) {
    await assertDropColumnSupported(db);
  }

  if (profileColumns.includes('user_id')) {
    await adoptLegacyPreferences(db);
    await db.execAsync('DROP INDEX IF EXISTS idx_deviceProfile_user_id');
    await db.execAsync('ALTER TABLE tblDeviceProfile DROP COLUMN user_id');
  }

  if (scanColumns.includes('user_id')) {
    await db.execAsync('DROP INDEX IF EXISTS idx_scan_user');
    await db.execAsync('ALTER TABLE tblScan DROP COLUMN user_id');
  }

  await db.execAsync('DROP INDEX IF EXISTS idx_user_username');
  await db.execAsync('DROP INDEX IF EXISTS idx_user_email');
  await db.execAsync('DROP TABLE IF EXISTS tblUser');

  await AsyncStorage.multiRemove(['@tela-tell/auth-session', '@tela-tell/remembered-username']);
  if (FileSystem.documentDirectory) {
    await FileSystem.deleteAsync(`${FileSystem.documentDirectory}avatars/`, { idempotent: true });
  }
}

/**
 * tblScanComposition was written on every save but never read (the full result lives in
 * tblScan.resultJson), and tblScan.syncStatus was always 'local'. Both are dropped.
 */
async function dropUnusedScanStorage(db: Database) {
  await db.execAsync('DROP INDEX IF EXISTS idx_composition_scan');
  await db.execAsync('DROP TABLE IF EXISTS tblScanComposition');

  if ((await tableColumns(db, 'tblScan')).includes('syncStatus')) {
    await assertDropColumnSupported(db);
    await db.execAsync('ALTER TABLE tblScan DROP COLUMN syncStatus');
  }
}

/**
 * Scans saved before photos were kept in permanent storage point at the cache folder, which
 * Android can clear at any time. Copy the ones still there into scan-images/; for the ones already
 * gone, clear the path so History shows the placeholder instead of a broken image.
 */
async function persistLegacyScanImages(db: Database) {
  const rows = await db.getAllAsync<{ scan_ID: string; imageUri: string }>(
    `SELECT scan_ID, imageUri FROM tblScan WHERE imageUri IS NOT NULL AND imageUri != ''`,
  );

  for (const row of rows) {
    if (isPersistedScanImage(row.imageUri)) {
      continue;
    }

    const nextUri = (await scanImageExists(row.imageUri))
      ? await persistScanImage(row.imageUri, row.scan_ID)
      : null;
    if (nextUri !== row.imageUri) {
      await db.runAsync('UPDATE tblScan SET imageUri = ? WHERE scan_ID = ?', [nextUri, row.scan_ID]);
    }
  }
}

async function adoptLegacyPreferences(db: Database) {
  const device = await db.getFirstAsync<{
    skinTone: string | null;
    skinUndertone: string | null;
    colorSeason: string | null;
    childRows: number;
  }>(
    `SELECT skinTone, skinUndertone, colorSeason,
       (SELECT COUNT(*) FROM tblSensitiveFiber WHERE profile_ID = ?)
       + (SELECT COUNT(*) FROM tblPreferredFiber WHERE profile_ID = ?)
       + (SELECT COUNT(*) FROM tblDressingContext WHERE profile_ID = ?) AS childRows
     FROM tblDeviceProfile WHERE profile_ID = ?`,
    [DEVICE_PROFILE_ID, DEVICE_PROFILE_ID, DEVICE_PROFILE_ID, DEVICE_PROFILE_ID],
  );
  const deviceIsEmpty =
    !device || (!device.skinTone && !device.skinUndertone && !device.colorSeason && !device.childRows);

  const legacy = await db.getFirstAsync<{
    profile_ID: number;
    skinTone: string | null;
    skinUndertone: string | null;
    colorSeason: string | null;
  }>(
    `SELECT profile_ID, skinTone, skinUndertone, colorSeason FROM tblDeviceProfile
     WHERE user_id IS NOT NULL
     ORDER BY updatedAt DESC, profile_ID DESC
     LIMIT 1`,
  );

  await db.withTransactionAsync(async () => {
    if (legacy && deviceIsEmpty) {
      await db.runAsync(
        `UPDATE tblDeviceProfile
         SET skinTone = ?, skinUndertone = ?, colorSeason = ?, updatedAt = ?
         WHERE profile_ID = ?`,
        [
          legacy.skinTone,
          legacy.skinUndertone,
          legacy.colorSeason,
          new Date().toISOString(),
          DEVICE_PROFILE_ID,
        ],
      );
      for (const table of ['tblSensitiveFiber', 'tblPreferredFiber', 'tblDressingContext']) {
        await db.runAsync(`UPDATE OR IGNORE ${table} SET profile_ID = ? WHERE profile_ID = ?`, [
          DEVICE_PROFILE_ID,
          legacy.profile_ID,
        ]);
      }
    }
    // Cascades to any child rows that were not moved above. Excludes DEVICE_PROFILE_ID:
    // if the legacy account's profile row was already at profile_ID = DEVICE_PROFILE_ID
    // (the common case, since this was a single-account app), deviceIsEmpty above is
    // false and the copy branch never runs -- deleting unconditionally here would wipe
    // that row (and cascade-delete its preferences) instead of leaving it in place.
    await db.runAsync('DELETE FROM tblDeviceProfile WHERE user_id IS NOT NULL AND profile_ID != ?', [
      DEVICE_PROFILE_ID,
    ]);
  });
}

async function tableColumns(db: Database, table: string): Promise<string[]> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return columns.map((column) => column.name);
}

function createdAtFromScanId(scanId: string): string {
  const parts = scanId.split('_');
  if (parts[0] === 'scan' && parts[1]) {
    const ms = Number.parseInt(parts[1], 36);
    if (Number.isFinite(ms) && ms > 1_000_000_000_000) {
      return new Date(ms).toISOString();
    }
  }
  return new Date(0).toISOString();
}

async function backfillScanCreatedAt(db: Awaited<ReturnType<typeof getDatabase>>) {
  const rows = await db.getAllAsync<{ scan_ID: string }>(
    `SELECT scan_ID FROM tblScan WHERE createdAt IS NULL OR createdAt = ''`,
  );
  for (const row of rows) {
    await db.runAsync('UPDATE tblScan SET createdAt = ? WHERE scan_ID = ?', [
      createdAtFromScanId(row.scan_ID),
      row.scan_ID,
    ]);
  }
}

async function ensureScanColumn(
  db: Awaited<ReturnType<typeof getDatabase>>,
  name: string,
  definition: string,
) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tblScan)');
  const exists = columns.some((column) => column.name === name);
  if (!exists) {
    await db.execAsync(`ALTER TABLE tblScan ADD COLUMN ${name} ${definition}`);
  }
}

async function ensureProfileColumn(
  db: Awaited<ReturnType<typeof getDatabase>>,
  name: string,
  definition: string,
) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tblDeviceProfile)');
  const exists = columns.some((column) => column.name === name);
  if (!exists) {
    await db.execAsync(`ALTER TABLE tblDeviceProfile ADD COLUMN ${name} ${definition}`);
  }
}
