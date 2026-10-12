/** @jest-environment node */
import { getPreferences, savePreferences } from '@/db/preferences';
import { getInsightsSetupItems } from '@/features/recommendations/lib/personalized-insights';
import {
  clearUserPreferences,
  getUserPreferencesSummary,
  getUserPreferencesSnapshot,
  hasActiveUserPreferences,
  hydrateUserPreferences,
  importUserPreferences,
  persistUserPreferences,
  setUserPreferences,
  togglePreferredFabric,
  type UserPreferences,
} from './user-preferences';

jest.mock('@/db/preferences', () => ({ getPreferences: jest.fn(), savePreferences: jest.fn() }));

const current: UserPreferences = {
  skinTone: 'Medium', skinUndertone: 'Warm', colorSeason: null,
  sensitiveFabrics: ['Wool'], preferredFabrics: ['Cotton'], dressingContexts: ['sunny'],
};
const imported: UserPreferences = { ...current, skinTone: 'Light', preferredFabrics: ['Linen'] };

beforeEach(() => {
  jest.clearAllMocks();
  clearUserPreferences();
  setUserPreferences(current);
  (savePreferences as jest.Mock).mockResolvedValue(undefined);
});

it('keeps current preferences visible until imported preferences are saved', async () => {
  let finish!: () => void;
  (savePreferences as jest.Mock).mockImplementationOnce(() => new Promise<void>((resolve) => { finish = resolve; }));
  const saving = importUserPreferences(imported);
  await Promise.resolve();
  await Promise.resolve();
  expect(getUserPreferencesSnapshot()).toEqual(current);
  expect(savePreferences).toHaveBeenCalledWith(imported);
  finish();
  await saving;
  expect(getUserPreferencesSnapshot()).toEqual(imported);
});

it('keeps current preferences on failure and allows the replacement to be retried', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  (savePreferences as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  try {
    await expect(importUserPreferences(imported)).rejects.toThrow('disk full');
    expect(getUserPreferencesSnapshot()).toEqual(current);
    await importUserPreferences(imported);
    expect(getUserPreferencesSnapshot()).toEqual(imported);
  } finally { log.mockRestore(); }
});

it('waits for a pending regular save before replacing imported preferences', async () => {
  const writes: UserPreferences[] = [];
  (savePreferences as jest.Mock).mockImplementation(async (value: UserPreferences) => { writes.push(value); });
  const regular = persistUserPreferences();
  const replacement = importUserPreferences(imported);
  await Promise.all([regular, replacement]);
  expect(writes).toEqual([current, imported]);
  expect(getUserPreferencesSnapshot()).toEqual(imported);
  (getPreferences as jest.Mock).mockResolvedValue(imported);
  await hydrateUserPreferences();
  expect(getUserPreferencesSnapshot()).toEqual(imported);
});

const colorOnly: UserPreferences = {
  skinTone: 'Medium', skinUndertone: 'Neutral', colorSeason: 'Bright Spring',
  sensitiveFabrics: [], preferredFabrics: [], dressingContexts: [],
};

it('keeps legacy color preferences out of summaries, active status, and setup prompts', () => {
  setUserPreferences(colorOnly);
  expect(hasActiveUserPreferences()).toBe(false);
  expect(getUserPreferencesSummary()).toBeNull();
  expect(getInsightsSetupItems(colorOnly).map((item) => item.href)).toEqual([
    '/fabric-allergies', '/preferred-fabrics', '/weather', '/occasion',
  ]);

  setUserPreferences({ ...current, colorSeason: 'Bright Spring' });
  expect(hasActiveUserPreferences()).toBe(true);
  expect(getUserPreferencesSummary()).toBe('1 sensitivities · 1 preferred fiber types · 1 dressing contexts');
});

it('loads and preserves legacy color values when saving an available preference', async () => {
  (getPreferences as jest.Mock).mockResolvedValue(colorOnly);
  await hydrateUserPreferences();
  expect(getUserPreferencesSnapshot()).toEqual(colorOnly);
  togglePreferredFabric('Linen');
  await persistUserPreferences();
  expect(savePreferences).toHaveBeenCalledWith({ ...colorOnly, preferredFabrics: ['Linen'] });
});

it('preserves local legacy-only preferences when storage temporarily returns no data', async () => {
  clearUserPreferences();
  const empty = getUserPreferencesSnapshot();
  setUserPreferences(colorOnly);
  (getPreferences as jest.Mock).mockResolvedValue(empty);
  expect(await hydrateUserPreferences()).toEqual(colorOnly);
  expect(getUserPreferencesSnapshot()).toEqual(colorOnly);
});
