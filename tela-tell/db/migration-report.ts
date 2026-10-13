export type MigrationIssue = {
  step: string;
  status: 'failed' | 'skipped';
  reason: string;
  code?: 'sqlite-too-old';
};

export type MigrationReport = {
  issues: MigrationIssue[];
};

export const CLEAN_MIGRATION_REPORT: MigrationReport = { issues: [] };

export const MIGRATION_WARNING_TITLE = 'Update incomplete';

export const MIGRATION_WARNING_MESSAGE =
  'Some saved data could not be updated. Most of the app should still work. Try closing and reopening TELA-TELL.';

export const SQLITE_TOO_OLD_WARNING_MESSAGE =
  "Some saved data could not be updated because this version of the app's database engine is too old. Your scans are safe. Please update TELA-TELL to the latest version.";

export type MigrationWarning = { title: string; message: string };

export const GENERIC_MIGRATION_WARNING: MigrationWarning = {
  title: MIGRATION_WARNING_TITLE,
  message: MIGRATION_WARNING_MESSAGE,
};

export function migrationWarningFor(report: MigrationReport): MigrationWarning {
  if (report.issues.some((issue) => issue.code === 'sqlite-too-old')) {
    return { title: MIGRATION_WARNING_TITLE, message: SQLITE_TOO_OLD_WARNING_MESSAGE };
  }
  return GENERIC_MIGRATION_WARNING;
}

export function migrationHadIssues(report: MigrationReport): boolean {
  return report.issues.length > 0;
}

export function migrationBlocksStartup(report: MigrationReport): boolean {
  const required = new Set([
    'ensureScanColumn:isFavorite',
    'ensureScanColumn:deletedAt',
    'ensureScanColumn:createdAt',
    'ensureProfileColumn:colorSeason',
  ]);
  return report.issues.some((issue) => required.has(issue.step));
}
