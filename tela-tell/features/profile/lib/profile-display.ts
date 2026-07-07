import {
  getDressingContextLabel,
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
  type DressingContext,
} from '@/data/preferences/occasion-weather';
import { SCAN_RESULTS } from '@/data/scans/mock-data';
import { getUserPreferences, type SkinTone } from '@/features/profile/lib/user-preferences';

export const SKIN_TONE_SWATCHES: Record<SkinTone, string> = {
  Fair: '#F5D0B5',
  Light: '#E8C4A0',
  'Light-Medium': '#DDB88A',
  Medium: '#C99B6E',
  Tan: '#A67B4E',
  'Deep Dark': '#4A3228',
};

export function formatProfileDisplayName(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getProfileInitial(email: string): string {
  const name = formatProfileDisplayName(email);
  return name.charAt(0).toUpperCase() || '?';
}

export function getScanStats() {
  const totalScans = SCAN_RESULTS.length;
  const sustainableCount = SCAN_RESULTS.filter(
    (scan) => scan.sustainability.rating === 'green' || scan.sustainability.rating === 'yellow',
  ).length;
  const mislabeledCount = SCAN_RESULTS.filter((scan) => scan.mislabeling.detected).length;

  return { totalScans, sustainableCount, mislabeledCount };
}

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

export function getSkinToneDisplay(): { label: string; swatch: string | null } {
  const { skinTone, skinUndertone } = getUserPreferences();
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

export function getSensitiveFabricsDisplay(): string {
  const { sensitiveFabrics } = getUserPreferences();
  if (sensitiveFabrics.length === 0) {
    return 'Not set';
  }
  return sensitiveFabrics.join(', ');
}

export function getPreferredFabricsDisplay(): string {
  const { preferredFabrics } = getUserPreferences();
  if (preferredFabrics.length === 0) {
    return 'Not set';
  }
  return preferredFabrics.join(', ');
}

export function getWeatherDisplay(): string {
  return formatContextList(getUserPreferences().dressingContexts ?? [], 'weather');
}

export function getOccasionDisplay(): string {
  return formatContextList(getUserPreferences().dressingContexts ?? [], 'occasion');
}
