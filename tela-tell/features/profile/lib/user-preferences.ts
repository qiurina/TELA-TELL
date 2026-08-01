import type { DressingContext } from '@/data/preferences/occasion-weather';
import type { SupportedFabric } from '@/data/fabrics/fabrics';
import { getPreferences, savePreferences } from '@/db/preferences';

export type SkinTone =
  | 'Fair'
  | 'Light'
  | 'Light-Medium'
  | 'Medium'
  | 'Tan'
  | 'Deep Dark';

export type SkinUndertone = 'Cool' | 'Warm' | 'Neutral' | 'Olive';

/** The 12-season color system. Optional — users can set this instead of (or in addition to) tone + undertone. */
export type ColorSeason =
  | 'Light Spring'
  | 'True Spring'
  | 'Bright Spring'
  | 'Light Summer'
  | 'True Summer'
  | 'Soft Summer'
  | 'Soft Autumn'
  | 'True Autumn'
  | 'Deep Autumn'
  | 'Deep Winter'
  | 'True Winter'
  | 'Bright Winter';

export const COLOR_SEASON_GROUPS: { season: string; sub: ColorSeason[] }[] = [
  { season: 'Spring', sub: ['Light Spring', 'True Spring', 'Bright Spring'] },
  { season: 'Summer', sub: ['Light Summer', 'True Summer', 'Soft Summer'] },
  { season: 'Autumn', sub: ['Soft Autumn', 'True Autumn', 'Deep Autumn'] },
  { season: 'Winter', sub: ['Deep Winter', 'True Winter', 'Bright Winter'] },
];

export type UserPreferences = {
  skinTone: SkinTone | null;
  skinUndertone: SkinUndertone | null;
  colorSeason: ColorSeason | null;
  sensitiveFabrics: SupportedFabric[];
  preferredFabrics: SupportedFabric[];
  dressingContexts: DressingContext[];
};

const EMPTY_PREFERENCES: UserPreferences = {
  skinTone: null,
  skinUndertone: null,
  colorSeason: null,
  sensitiveFabrics: [],
  preferredFabrics: [],
  dressingContexts: [],
};

let preferences: UserPreferences = {
  ...EMPTY_PREFERENCES,
  sensitiveFabrics: [],
  preferredFabrics: [],
  dressingContexts: [],
};

type LegacyUserPreferences = Partial<UserPreferences> & {
  dressingContext?: DressingContext | null;
  colorSeason?: ColorSeason | null;
};

type PreferencesListener = () => void;
const listeners = new Set<PreferencesListener>();

function notifyPreferencesListeners(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribe to preference changes (for Profile / panels via useSyncExternalStore). */
export function subscribeUserPreferences(listener: PreferencesListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUserPreferencesSnapshot(): UserPreferences {
  return preferences;
}

function normalizePreferences(raw: LegacyUserPreferences): UserPreferences {
  const legacyContext = raw.dressingContext;
  const dressingContexts =
    raw.dressingContexts ?? (legacyContext ? [legacyContext] : []);

  return {
    skinTone: raw.skinTone ?? null,
    skinUndertone: raw.skinUndertone ?? null,
    colorSeason: raw.colorSeason ?? null,
    sensitiveFabrics: [...(raw.sensitiveFabrics ?? [])],
    preferredFabrics: [...(raw.preferredFabrics ?? [])].filter(
      (fabric) => !(raw.sensitiveFabrics ?? []).includes(fabric),
    ),
    dressingContexts: [...dressingContexts],
  };
}

export function getUserPreferences(): UserPreferences {
  return normalizePreferences(preferences);
}

export function setUserPreferences(next: UserPreferences): void {
  preferences = normalizePreferences(next);
  notifyPreferencesListeners();
}

export function setUserPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K],
): void {
  preferences = normalizePreferences({ ...preferences, [key]: value });
  notifyPreferencesListeners();
}

export function moveFabricToSensitive(fabric: SupportedFabric): void {
  preferences = normalizePreferences({
    ...preferences,
    sensitiveFabrics: [...new Set([...preferences.sensitiveFabrics, fabric])],
    preferredFabrics: preferences.preferredFabrics.filter((item) => item !== fabric),
  });
  notifyPreferencesListeners();
}

export function moveFabricToPreferred(fabric: SupportedFabric): void {
  preferences = normalizePreferences({
    ...preferences,
    preferredFabrics: [...new Set([...preferences.preferredFabrics, fabric])],
    sensitiveFabrics: preferences.sensitiveFabrics.filter((item) => item !== fabric),
  });
  notifyPreferencesListeners();
}

export function toggleSensitiveFabric(fabric: SupportedFabric): void {
  const current = preferences.sensitiveFabrics ?? [];
  const next = current.includes(fabric)
    ? current.filter((item) => item !== fabric)
    : [...current, fabric];
  preferences = normalizePreferences({ ...preferences, sensitiveFabrics: next });
  notifyPreferencesListeners();
}

export function togglePreferredFabric(fabric: SupportedFabric): void {
  const current = preferences.preferredFabrics ?? [];
  const next = current.includes(fabric)
    ? current.filter((item) => item !== fabric)
    : [...current, fabric];
  preferences = normalizePreferences({ ...preferences, preferredFabrics: next });
  notifyPreferencesListeners();
}

export function toggleDressingContext(context: DressingContext): void {
  const current = preferences.dressingContexts ?? [];
  const next = current.includes(context)
    ? current.filter((item) => item !== context)
    : [...current, context];
  preferences = normalizePreferences({ ...preferences, dressingContexts: next });
  notifyPreferencesListeners();
}

export function clearUserPreferences(): void {
  preferences = {
    ...EMPTY_PREFERENCES,
    sensitiveFabrics: [],
    preferredFabrics: [],
    dressingContexts: [],
  };
  notifyPreferencesListeners();
}

/** In-flight save so hydrate never reads DB before the latest write finishes. */
let pendingPreferencesSave: Promise<void> = Promise.resolve();

async function waitForPreferencesSave(): Promise<void> {
  try {
    await pendingPreferencesSave;
  } catch {
    // Prior save errors should not block hydrate/load.
  }
}

export async function hydrateUserPreferences(
  userId: string | null | undefined,
  options?: { apply?: boolean },
): Promise<UserPreferences> {
  await waitForPreferencesSave();
  const loaded = normalizePreferences(await getPreferences(userId));
  if (options?.apply !== false) {
    const localHasData = hasActiveUserPreferences();
    const loadedHasData = Boolean(
      loaded.skinTone ||
        loaded.skinUndertone ||
        loaded.colorSeason ||
        loaded.sensitiveFabrics.length > 0 ||
        loaded.preferredFabrics.length > 0 ||
        loaded.dressingContexts.length > 0,
    );

    // Keep fresher in-memory edits if SQLite still returns empty (save lag/failure).
    if (localHasData && !loadedHasData) {
      return getUserPreferences();
    }

    preferences = loaded;
    notifyPreferencesListeners();
  }
  return loaded;
}

export function persistUserPreferences(userId: string | null | undefined): Promise<void> {
  if (!userId) {
    console.warn('persistUserPreferences skipped: no userId');
    return Promise.resolve();
  }

  const snapshot = getUserPreferences();

  pendingPreferencesSave = waitForPreferencesSave().then(async () => {
    try {
      await savePreferences(userId, snapshot);
    } catch (error) {
      console.error('Failed to save preferences', error);
      throw error;
    }
  });

  return pendingPreferencesSave;
}

export function hasActiveUserPreferences(): boolean {
  return Boolean(
    preferences.skinTone ||
      preferences.skinUndertone ||
      preferences.colorSeason ||
      preferences.sensitiveFabrics.length > 0 ||
      preferences.preferredFabrics.length > 0 ||
      (preferences.dressingContexts ?? []).length > 0,
  );
}

export function getUserPreferencesSummary(): string | null {
  const parts: string[] = [];

  if (preferences.colorSeason) {
    parts.push(preferences.colorSeason);
  } else {
    if (preferences.skinTone) {
      parts.push(preferences.skinTone === 'Deep Dark' ? 'Deep / Dark' : preferences.skinTone);
    }
    if (preferences.skinUndertone) {
      parts.push(`${preferences.skinUndertone} undertone`);
    }
  }

  if (preferences.sensitiveFabrics.length > 0) {
    parts.push(`${preferences.sensitiveFabrics.length} sensitivities`);
  }

  if (preferences.preferredFabrics.length > 0) {
    parts.push(`${preferences.preferredFabrics.length} preferred fiber types`);
  }

  if ((preferences.dressingContexts ?? []).length > 0) {
    parts.push(`${(preferences.dressingContexts ?? []).length} dressing contexts`);
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}
