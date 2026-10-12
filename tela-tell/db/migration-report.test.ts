import {
  CLEAN_MIGRATION_REPORT,
  MIGRATION_WARNING_MESSAGE,
  MIGRATION_WARNING_TITLE,
  migrationHadIssues,
  migrationBlocksStartup,
} from '@/db/migration-report';

describe('migration report', () => {
  it.each(['ensureScanColumn:isFavorite', 'ensureScanColumn:deletedAt', 'ensureScanColumn:createdAt', 'ensureProfileColumn:colorSeason'])(
    'blocks startup when a required step did not finish: %s', (step) => {
      expect(migrationBlocksStartup({ issues: [{ step, status: 'failed', reason: 'x' }] })).toBe(true);
      expect(migrationBlocksStartup({ issues: [{ step, status: 'skipped', reason: 'x' }] })).toBe(true);
    },
  );

  it('allows clean startup and optional cleanup failures', () => {
    expect(migrationBlocksStartup(CLEAN_MIGRATION_REPORT)).toBe(false);
    expect(migrationBlocksStartup({ issues: [{ step: 'persistLegacyScanImages', status: 'failed', reason: 'x' }] })).toBe(false);
  });
  it('detects whether any step failed or was skipped', () => {
    expect(migrationHadIssues(CLEAN_MIGRATION_REPORT)).toBe(false);
    expect(
      migrationHadIssues({ issues: [{ step: 'idx_scan_createdAt', status: 'failed', reason: 'x' }] }),
    ).toBe(true);
    expect(
      migrationHadIssues({ issues: [{ step: 'backfillScanCreatedAt', status: 'skipped', reason: 'x' }] }),
    ).toBe(true);
  });

  it('the user-facing warning is short and has no technical detail', () => {
    const text = `${MIGRATION_WARNING_TITLE} ${MIGRATION_WARNING_MESSAGE}`;
    expect(text.length).toBeLessThan(200);
    expect(text).not.toMatch(/sql|migrat|schema|column|index|error|exception|tbl[A-Z]/i);
  });
});
