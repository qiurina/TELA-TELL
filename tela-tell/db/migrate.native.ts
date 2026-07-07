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
}
