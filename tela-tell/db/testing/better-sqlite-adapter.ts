/**
 * Test-only: exposes a better-sqlite3 database through the subset of the expo-sqlite async API
 * that the app's db/ modules use, so the real SQL can be exercised in Jest. Not imported by app code.
 */
import type BetterSqlite3 from 'better-sqlite3';

type BindValue = string | number | null;

export function createBetterSqliteAdapter(db: InstanceType<typeof BetterSqlite3>) {
  return {
    execAsync: async (sql: string) => {
      db.exec(sql);
    },
    runAsync: async (sql: string, params: unknown[] = []) => {
      const result = db.prepare(sql).run(...(params as BindValue[]));
      return { changes: result.changes, lastInsertRowId: Number(result.lastInsertRowid) };
    },
    getFirstAsync: async <T>(sql: string, params: unknown[] = []): Promise<T | null> => {
      const row = db.prepare(sql).get(...(params as BindValue[]));
      return (row as T | undefined) ?? null;
    },
    getAllAsync: async <T>(sql: string, params: unknown[] = []): Promise<T[]> =>
      db.prepare(sql).all(...(params as BindValue[])) as T[],
    withTransactionAsync: async (fn: () => Promise<void>) => {
      db.exec('BEGIN');
      try {
        await fn();
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}
