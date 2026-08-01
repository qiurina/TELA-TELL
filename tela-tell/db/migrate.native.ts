import { getDatabase } from '@/db/client';
import { SCHEMA_SQL } from '@/db/schema';

let migrationPromise: Promise<void> | null = null;

/**
 * Creates local SQLite tables on first launch (iOS/Android).
 * Prototype scope: schema only — scan/history still use mock data.
 */
export function migrateDatabase(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigration();
  }

  return migrationPromise;
}

async function runMigration(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(SCHEMA_SQL);
  await ensureScanColumn(db, 'isFavorite', 'INTEGER NOT NULL DEFAULT 0');
  await ensureScanColumn(db, 'deletedAt', 'TEXT');
  await ensureProfileColumn(db, 'colorSeason', 'TEXT');

  // Purge soft-deleted scans older than 30 days on launch.
  try {
    const { purgeExpiredDeletedScans } = await import('@/db/scans');
    await purgeExpiredDeletedScans(30);
  } catch {
    // Ignore purge failures during migration bootstrap.
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
