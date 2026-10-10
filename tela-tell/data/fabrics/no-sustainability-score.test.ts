import fs from 'fs';
import path from 'path';

/**
 * Guards the retirement of the sustainability score: no score, rating, pill label or score field
 * may come back into the app's code. The only allowed mentions are the legacy database columns and
 * the code that neutralises them or strips the old key from saved scans.
 */
const ROOT = path.resolve(__dirname, '../..');
const SCANNED_DIRS = ['app', 'components', 'constants', 'data', 'db', 'features'];
const ALLOWED = new Set([
  'db/schema.ts', // the legacy NOT NULL columns, kept so no table rebuild is needed
  'db/scans.ts', // writes the neutral placeholders and strips an old score on save, read and export
  'db/migrate.native.ts', // clears old scores from stored scans
  'features/scan/lib/refresh-stored-scan.ts', // removes the old key from a saved scan's JSON
  'data/fabrics/source-registry.ts', // titles of papers and reports that use the word
]);

const FORBIDDEN =
  /Higher score|Middle score|Lower score|Sustainability estimate|sustainabilityScore|sustainabilityRating|sustainabilityLabel|SUSTAINABILITY_|SustainabilityRating|SustainabilityBreakdown|isSustainable|HIGHER SCORE/;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : walk(full);
    }
    return /\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('the sustainability score stays retired', () => {
  const files = SCANNED_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)));

  it('finds the app source files to scan', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('has no score, rating, pill label or score field in any app source file', () => {
    const offenders = files
      .map((file) => path.relative(ROOT, file).split(path.sep).join('/'))
      .filter((relative) => !ALLOWED.has(relative))
      .filter((relative) => FORBIDDEN.test(fs.readFileSync(path.join(ROOT, relative), 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('only mentions the legacy columns in the database layer', () => {
    for (const relative of ['db/schema.ts', 'db/scans.ts', 'db/migrate.native.ts']) {
      const text = fs.readFileSync(path.join(ROOT, relative), 'utf8');
      expect(text).toMatch(/legacy|Old sustainability|old sustainability/i);
    }
  });

  it('keeps the removed Results card and score stack out of the tree', () => {
    expect(fs.existsSync(path.join(ROOT, 'features/results/components/status-badges.tsx'))).toBe(false);
  });
});
