/**
 * Web prototype: SQLite is mobile-only. Scan/history use mock data on web.
 */
export function getDatabase(): Promise<never> {
  return Promise.reject(new Error('SQLite is not available on web in this prototype.'));
}

export function isDatabaseAvailable(): boolean {
  return false;
}
