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
let failedSteps = false;

export function migrateDatabase(options: { retry?: boolean } = {}): Promise<MigrationReport> {
  if (options.retry && failedSteps) migrationPromise = null;
  if (!migrationPromise) {
    failedSteps = false;
    migrationPromise = runMigration()
      .then((report) => {
        failedSteps = report.issues.length > 0;
        return report;
      })
      .catch((error) => {
        migrationPromise = null;
        throw error;
      });
  }

  return migrationPromise;
}

const DROP_COLUMN_MIN_VERSION = { major: 3, minor: 35 };

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
  const { FIBER_PROFILES } = await import('@/data/fabrics/fiber-profiles');

  const fingerprint = hashString(
    JSON.stringify([
      SCAN_PROFILE_LOGIC_VERSION,
      FIBER_PROFILES,
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

      let next: ReturnType<typeof refreshStoredScan>;
      try {
        next = refreshStoredScan(JSON.parse(row.resultJson));
      } catch {
        continue;
      }
      const nextJson = JSON.stringify(next);

      if (nextJson === row.resultJson) {
        continue;
      }

      await db.runAsync('UPDATE tblScan SET resultJson = ? WHERE scan_ID = ?', [nextJson, row.scan_ID]);
    }
  });

  await AsyncStorage.setItem(SCAN_PROFILE_FINGERPRINT_KEY, fingerprint);
}

type Database = Awaited<ReturnType<typeof getDatabase>>;

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

async function dropUnusedScanStorage(db: Database) {
  await db.execAsync('DROP INDEX IF EXISTS idx_composition_scan');
  await db.execAsync('DROP TABLE IF EXISTS tblScanComposition');

  if ((await tableColumns(db, 'tblScan')).includes('syncStatus')) {
    await assertDropColumnSupported(db);
    await db.execAsync('ALTER TABLE tblScan DROP COLUMN syncStatus');
  }
}

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
