import { getDatabase } from '@/db/client';
import { SCHEMA_SQL } from '@/db/schema';

let migrationPromise: Promise<void> | null = null;

export function migrateDatabase(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = runMigration().catch((error) => {
      migrationPromise = null;
      throw error;
    });
  }

  return migrationPromise;
}

async function runMigration(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(SCHEMA_SQL);
  await ensureScanColumn(db, 'isFavorite', 'INTEGER NOT NULL DEFAULT 0');
  await ensureScanColumn(db, 'deletedAt', 'TEXT');
  await ensureScanColumn(db, 'createdAt', 'TEXT');
  await ensureProfileColumn(db, 'colorSeason', 'TEXT');
  await db.execAsync(
    'CREATE INDEX IF NOT EXISTS idx_scan_createdAt ON tblScan(createdAt DESC)',
  );
  await backfillScanCreatedAt(db);

  try {
    const { purgeExpiredDeletedScans } = await import('@/db/scans');
    await purgeExpiredDeletedScans(30);
  } catch {
  }
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
