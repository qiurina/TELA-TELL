/** @jest-environment node */
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));

let getDatabase: typeof import('./client.native').getDatabase;
let openDatabase: jest.Mock;

beforeEach(() => {
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  openDatabase = require('expo-sqlite').openDatabaseAsync;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ({ getDatabase } = require('./client.native'));
});

it('allows a failed database open to be retried without restarting the app', async () => {
  const database = { name: 'existing database' };
  openDatabase.mockRejectedValueOnce(new Error('disk unavailable')).mockResolvedValueOnce(database);
  await expect(getDatabase()).rejects.toThrow('disk unavailable');
  await expect(getDatabase()).resolves.toBe(database);
  expect(openDatabase).toHaveBeenCalledTimes(2);
  expect(openDatabase).toHaveBeenLastCalledWith('tela-tell.db');
});

it('shares an in-progress open and reuses the successful connection', async () => {
  const database = { name: 'existing database' };
  openDatabase.mockResolvedValueOnce(database);
  const first = getDatabase();
  expect(getDatabase()).toBe(first);
  await first;
  await expect(getDatabase()).resolves.toBe(database);
  expect(openDatabase).toHaveBeenCalledTimes(1);
});
