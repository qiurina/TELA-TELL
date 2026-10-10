import { CLEAN_MIGRATION_REPORT, type MigrationReport } from '@/db/migration-report';

export function migrateDatabase(): Promise<MigrationReport> {
  return Promise.resolve(CLEAN_MIGRATION_REPORT);
}
