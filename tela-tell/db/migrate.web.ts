/**
 * Web prototype: skip SQLite init — expo-sqlite WASM is not bundled for web demo.
 */
export function migrateDatabase(): Promise<void> {
  return Promise.resolve();
}
