import type { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'tela-tell.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DB_NAME).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

export function isDatabaseAvailable(): boolean {
  return true;
}
