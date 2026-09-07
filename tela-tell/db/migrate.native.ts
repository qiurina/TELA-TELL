import { getDatabase } from '@/db/client';
import { SCHEMA_SQL } from '@/db/schema';
import type { SupportedFabric } from '@/data/fabrics/fabrics';

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
  await ensureUsernameColumn(db);
  await db.execAsync(SCHEMA_SQL);
  await ensureScanColumn(db, 'isFavorite', 'INTEGER NOT NULL DEFAULT 0');
  await ensureScanColumn(db, 'deletedAt', 'TEXT');
  await ensureScanColumn(db, 'createdAt', 'TEXT');
  await ensureProfileColumn(db, 'colorSeason', 'TEXT');
  await ensureUserColumn(db, 'avatarUri', 'TEXT');
  await db.execAsync(
    'CREATE INDEX IF NOT EXISTS idx_scan_createdAt ON tblScan(createdAt DESC)',
  );
  await backfillScanCreatedAt(db);
  await resyncScanSustainability(db);

  try {
    const { purgeExpiredDeletedScans } = await import('@/db/scans');
    await purgeExpiredDeletedScans(30);
  } catch {
  }
}

/**
 * Re-derives sustainability (and profile/recommendations) for every stored scan from the
 * current fiber-profiles.ts data, since saveScan() snapshots these at scan time rather than
 * computing them live on read. Safe to run on every launch — recompute is pure/cheap, and a
 * fiber-profiles.ts update should retroactively fix history, not just new scans.
 */
async function resyncScanSustainability(db: Awaited<ReturnType<typeof getDatabase>>) {
  const { buildScanProfile } = await import('@/features/scan/lib/build-scan-profile');
  const { resolveFabricAlias } = await import('@/data/fabrics/fabrics');
  const { isBlendDetected } = await import('@/data/scans/scan-confidence');

  const rows = await db.getAllAsync<{ scan_ID: string; resultJson: string | null }>(
    'SELECT scan_ID, resultJson FROM tblScan',
  );

  for (const row of rows) {
    if (!row.resultJson) {
      continue;
    }

    try {
      const parsed = JSON.parse(row.resultJson);
      const compositions = parsed.compositions ?? [];
      const primary = (resolveFabricAlias(parsed.dominantFabric) ??
        parsed.dominantFabric) as SupportedFabric;
      const isBlend = isBlendDetected(compositions);

      const { profile, sustainability, recommendations } = buildScanProfile(
        primary,
        parsed.dominantFabric,
        compositions,
        isBlend,
      );

      const next = { ...parsed, profile, sustainability, recommendations };

      await db.runAsync(
        `UPDATE tblScan
         SET sustainabilityRating = ?, sustainabilityLabel = ?, sustainabilityScore = ?, resultJson = ?
         WHERE scan_ID = ?`,
        [
          sustainability.rating,
          sustainability.label,
          sustainability.score,
          JSON.stringify(next),
          row.scan_ID,
        ],
      );
    } catch {
      continue;
    }
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

async function ensureUserColumn(
  db: Awaited<ReturnType<typeof getDatabase>>,
  name: string,
  definition: string,
) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tblUser)');
  const exists = columns.some((column) => column.name === name);
  if (!exists) {
    await db.execAsync(`ALTER TABLE tblUser ADD COLUMN ${name} ${definition}`);
  }
}

async function ensureUsernameColumn(db: Awaited<ReturnType<typeof getDatabase>>) {
  const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tblUser)');
  if (columns.length === 0) {
    return;
  }

  const hasUsername = columns.some((column) => column.name === 'username');
  const hasEmail = columns.some((column) => column.name === 'email');
  if (!hasUsername && hasEmail) {
    await db.execAsync('ALTER TABLE tblUser RENAME COLUMN email TO username');
    await db.execAsync('DROP INDEX IF EXISTS idx_user_email');
  }
}
