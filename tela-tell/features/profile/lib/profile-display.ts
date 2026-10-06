import {
  getDressingContextLabel,
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
  type DressingContext,
} from '@/data/preferences/occasion-weather';
import {
  getUserPreferences,
  type SkinTone,
  type UserPreferences,
} from '@/features/profile/lib/user-preferences';

export const SKIN_TONE_SWATCHES: Record<SkinTone, string> = {
  Fair: '#F5D0B5',
  Light: '#E8C4A0',
  'Light-Medium': '#DDB88A',
  Medium: '#C99B6E',
  Tan: '#A67B4E',
  'Deep Dark': '#4A3228',
};

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

export function getSkinToneDisplay(prefs?: UserPreferences): {
  label: string;
  swatch: string | null;
} {
  const { skinTone, skinUndertone, colorSeason } = resolvePrefs(prefs);

  if (colorSeason) {
    const toneLabel = skinTone ? (skinTone === 'Deep Dark' ? 'Deep / Dark' : skinTone) : null;
    const label = toneLabel ? `${colorSeason} · ${toneLabel}` : colorSeason;
    return { label, swatch: skinTone ? SKIN_TONE_SWATCHES[skinTone] : null };
  }

  if (!skinTone) {
    return { label: 'Not set', swatch: null };
  }

  const toneLabel = skinTone === 'Deep Dark' ? 'Deep / Dark' : skinTone;
  const label = skinUndertone ? `${toneLabel} · ${skinUndertone} undertone` : toneLabel;

  return {
    label,
    swatch: SKIN_TONE_SWATCHES[skinTone],
  };
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
