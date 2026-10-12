import {
  getDressingContextLabel,
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
  type DressingContext,
} from '@/data/preferences/occasion-weather';
import {
  getUserPreferences,
  type UserPreferences,
} from '@/features/profile/lib/user-preferences';

function formatContextList(contexts: DressingContext[], category: 'weather' | 'occasion'): string {
  const allowed = new Set(
    (category === 'weather' ? WEATHER_CONTEXT_OPTIONS : OCCASION_CONTEXT_OPTIONS).map(
      (option) => option.id,
    ),
  );
  const labels = contexts
    .filter((context) => allowed.has(context))
    .map((context) => getDressingContextLabel(context));

  return labels.length > 0 ? labels.join(', ') : 'Not set';
}

function resolvePrefs(prefs?: UserPreferences): UserPreferences {
  return prefs ?? getUserPreferences();
}

export function getSensitiveFabricsDisplay(prefs?: UserPreferences): string {
  const { sensitiveFabrics } = resolvePrefs(prefs);
  if (sensitiveFabrics.length === 0) {
    return 'Not set';
  }
  return sensitiveFabrics.join(', ');
}

export function getPreferredFabricsDisplay(prefs?: UserPreferences): string {
  const { preferredFabrics } = resolvePrefs(prefs);
  if (preferredFabrics.length === 0) {
    return 'Not set';
  }
  return preferredFabrics.join(', ');
}

export function getWeatherDisplay(prefs?: UserPreferences): string {
  return formatContextList(resolvePrefs(prefs).dressingContexts ?? [], 'weather');
}

export function getOccasionDisplay(prefs?: UserPreferences): string {
  return formatContextList(resolvePrefs(prefs).dressingContexts ?? [], 'occasion');
}
