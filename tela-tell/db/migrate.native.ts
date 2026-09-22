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

/**
 * Runs one migration step in isolation so a failure in it can't take down every step
 * after it — in particular, savePreferences() depends on the unique index step below
 * having run (its ON CONFLICT(user_id) target requires that index to already exist),
 * so an earlier unrelated step throwing must not prevent it from ever being created.
 */
async function runStep(name: string, step: () => Promise<void>): Promise<void> {
  try {
    await step();
  } catch (error) {
    console.warn(`[TELA-TELL] Migration step "${name}" failed, continuing:`, error);
  }
}

async function runMigration(): Promise<void> {
  const db = await getDatabase();
  await runStep('ensureUsernameColumn', () => ensureUsernameColumn(db));
  // Core schema creation is the one step allowed to abort the whole migration:
  // nothing below can meaningfully run without the base tables existing.
  await db.execAsync(SCHEMA_SQL);
  await runStep('ensureScanColumn:isFavorite', () =>
    ensureScanColumn(db, 'isFavorite', 'INTEGER NOT NULL DEFAULT 0'),
  );
  await runStep('ensureScanColumn:deletedAt', () => ensureScanColumn(db, 'deletedAt', 'TEXT'));
  await runStep('ensureScanColumn:createdAt', () => ensureScanColumn(db, 'createdAt', 'TEXT'));
  await runStep('ensureProfileColumn:colorSeason', () =>
    ensureProfileColumn(db, 'colorSeason', 'TEXT'),
  );
  await runStep('ensureUserColumn:avatarUri', () => ensureUserColumn(db, 'avatarUri', 'TEXT'));
  await runStep('idx_scan_createdAt', () =>
    db.execAsync('CREATE INDEX IF NOT EXISTS idx_scan_createdAt ON tblScan(createdAt DESC)'),
  );
  await runStep('deviceProfile unique index', async () => {
    await dedupeDeviceProfiles(db);
    await db.execAsync(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_deviceProfile_user_id ON tblDeviceProfile(user_id)',
    );
  });
  await runStep('backfillScanCreatedAt', () => backfillScanCreatedAt(db));
  await runStep('resyncScanSustainability', () => resyncScanSustainability(db));
  await runStep('purgeExpiredDeletedScans', async () => {
    const { purgeExpiredDeletedScans } = await import('@/db/scans');
    await purgeExpiredDeletedScans(30);
  });
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

/**
 * Collapses any tblDeviceProfile rows that ended up duplicated per user_id (possible
 * before the unique index below existed, from a read-then-insert race in savePreferences)
 * into one, keeping the most recently updated row and moving child rows onto it so a
 * later CREATE UNIQUE INDEX doesn't fail on pre-existing duplicates.
 */
async function dedupeDeviceProfiles(db: Awaited<ReturnType<typeof getDatabase>>) {
  const duplicated = await db.getAllAsync<{ user_id: string }>(
    `SELECT user_id FROM tblDeviceProfile
     WHERE user_id IS NOT NULL
     GROUP BY user_id
     HAVING COUNT(*) > 1`,
  );

  for (const { user_id } of duplicated) {
    const rows = await db.getAllAsync<{ profile_ID: number }>(
      'SELECT profile_ID FROM tblDeviceProfile WHERE user_id = ? ORDER BY updatedAt DESC, profile_ID DESC',
      [user_id],
    );
    const [keep, ...extras] = rows;
    if (!keep) {
      continue;
    }

    for (const extra of extras) {
      await db.runAsync(
        'UPDATE OR IGNORE tblSensitiveFiber SET profile_ID = ? WHERE profile_ID = ?',
        [keep.profile_ID, extra.profile_ID],
      );
      await db.runAsync(
        'UPDATE OR IGNORE tblPreferredFiber SET profile_ID = ? WHERE profile_ID = ?',
        [keep.profile_ID, extra.profile_ID],
      );
      await db.runAsync(
        'UPDATE OR IGNORE tblDressingContext SET profile_ID = ? WHERE profile_ID = ?',
        [keep.profile_ID, extra.profile_ID],
      );
      // Any child rows still pointing at extra.profile_ID lost the OR IGNORE race
      // against an equivalent row keep.profile_ID already has — cascade-deleting
      // the duplicate profile here is what actually drops those redundant rows.
      await db.runAsync('DELETE FROM tblDeviceProfile WHERE profile_ID = ?', [extra.profile_ID]);
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
