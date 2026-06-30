import type { DressingContext } from '@/data/preferences/occasion-weather';
import type { SupportedFabric } from '@/data/fabrics/fabrics';

export type SkinTone =
  | 'Fair'
  | 'Light'
  | 'Light-Medium'
  | 'Medium'
  | 'Tan'
  | 'Deep Dark';

export type SkinUndertone = 'Cool' | 'Warm' | 'Neutral' | 'Olive';

export type UserPreferences = {
  skinTone: SkinTone | null;
  skinUndertone: SkinUndertone | null;
  sensitiveFabrics: SupportedFabric[];
  preferredFabrics: SupportedFabric[];
  dressingContexts: DressingContext[];
};

const EMPTY_PREFERENCES: UserPreferences = {
  skinTone: null,
  skinUndertone: null,
  sensitiveFabrics: [],
  preferredFabrics: [],
  dressingContexts: [],
};

let preferences: UserPreferences = { ...EMPTY_PREFERENCES };

type LegacyUserPreferences = Partial<UserPreferences> & {
  dressingContext?: DressingContext | null;
};

function normalizePreferences(raw: LegacyUserPreferences): UserPreferences {
  const legacyContext = raw.dressingContext;
  const dressingContexts =
    raw.dressingContexts ?? (legacyContext ? [legacyContext] : []);

  return {
    skinTone: raw.skinTone ?? null,
    skinUndertone: raw.skinUndertone ?? null,
    sensitiveFabrics: [...(raw.sensitiveFabrics ?? [])],
    preferredFabrics: [...(raw.preferredFabrics ?? [])],
    dressingContexts: [...dressingContexts],
  };
}

export function getUserPreferences(): UserPreferences {
  return normalizePreferences(preferences);
}

export function setUserPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K],
): void {
  preferences = normalizePreferences({ ...preferences, [key]: value });
}

export function toggleSensitiveFabric(fabric: SupportedFabric): void {
  const current = preferences.sensitiveFabrics ?? [];
  const next = current.includes(fabric)
    ? current.filter((item) => item !== fabric)
    : [...current, fabric];
  preferences = normalizePreferences({ ...preferences, sensitiveFabrics: next });
}

export function togglePreferredFabric(fabric: SupportedFabric): void {
  const current = preferences.preferredFabrics ?? [];
  const next = current.includes(fabric)
    ? current.filter((item) => item !== fabric)
    : [...current, fabric];
  preferences = normalizePreferences({ ...preferences, preferredFabrics: next });
}

export function toggleDressingContext(context: DressingContext): void {
  const current = preferences.dressingContexts ?? [];
  const next = current.includes(context)
    ? current.filter((item) => item !== context)
    : [...current, context];
  preferences = normalizePreferences({ ...preferences, dressingContexts: next });
}

export function clearUserPreferences(): void {
  preferences = { ...EMPTY_PREFERENCES };
}

export function hasActiveUserPreferences(): boolean {
  return Boolean(
    preferences.skinTone ||
      preferences.skinUndertone ||
      preferences.sensitiveFabrics.length > 0 ||
      preferences.preferredFabrics.length > 0 ||
      (preferences.dressingContexts ?? []).length > 0,
  );
}

export function getUserPreferencesSummary(): string | null {
  const parts: string[] = [];

  if (preferences.skinTone) {
    parts.push(preferences.skinTone === 'Deep Dark' ? 'Deep / Dark' : preferences.skinTone);
  }

  if (preferences.skinUndertone) {
    parts.push(`${preferences.skinUndertone} undertone`);
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
