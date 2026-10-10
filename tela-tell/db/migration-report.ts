/**
 * What a database migration run reports back. Kept separate from migrate.native.ts so the web
 * stub and the root layout can use it without pulling in the native migration code.
 */
export type MigrationIssue = {
  step: string;
  /** `failed` ran and threw; `skipped` was not run because a step it needs had already failed. */
  status: 'failed' | 'skipped';
  /** Technical detail for debugging only. Never show this to the user. */
  reason: string;
  /** Set when the cause is known and needs different advice than "reopen the app". */
  code?: 'sqlite-too-old';
};

export type MigrationReport = {
  issues: MigrationIssue[];
};

export const CLEAN_MIGRATION_REPORT: MigrationReport = { issues: [] };

export const MIGRATION_WARNING_TITLE = 'Update incomplete';

export const MIGRATION_WARNING_MESSAGE =
  'Some saved data could not be updated. Most of the app should still work. Try closing and reopening TELA-TELL.';

/** Reopening the app cannot fix this one, so it gets its own advice. */
export const SQLITE_TOO_OLD_WARNING_MESSAGE =
  "Some saved data could not be updated because this version of the app's database engine is too old. Your scans are safe. Please update TELA-TELL to the latest version.";

export type MigrationWarning = { title: string; message: string };

export const GENERIC_MIGRATION_WARNING: MigrationWarning = {
  title: MIGRATION_WARNING_TITLE,
  message: MIGRATION_WARNING_MESSAGE,
};

/** The short, non-technical warning to show for a report with issues. */
export function migrationWarningFor(report: MigrationReport): MigrationWarning {
  if (report.issues.some((issue) => issue.code === 'sqlite-too-old')) {
    return { title: MIGRATION_WARNING_TITLE, message: SQLITE_TOO_OLD_WARNING_MESSAGE };
  }
  return GENERIC_MIGRATION_WARNING;
}

export function migrationHadIssues(report: MigrationReport): boolean {
  return report.issues.length > 0;
}
