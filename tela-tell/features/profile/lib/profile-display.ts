import {
  getDressingContextLabel,
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
  type DressingContext,
} from '@/data/preferences/occasion-weather';
import type { ScanResult } from '@/data/scans/mock-data';
import type { AuthSession } from '@/features/auth/lib/auth-session';
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

export type ProfileScanStats = {
  totalScans: number;
  sustainableCount: number;
  mislabeledCount: number;
};

/** Prefers registered name; falls back to email local-part. */
export function formatProfileDisplayName(
  emailOrSession: string | Pick<AuthSession, 'email' | 'firstName' | 'lastName' | 'middleInitial'>,
): string {
  if (typeof emailOrSession !== 'string') {
    const { firstName, lastName, middleInitial, email } = emailOrSession;
    const parts = [firstName, middleInitial?.trim(), lastName].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    return formatProfileDisplayName(email);
  }

  const local = emailOrSession.split('@')[0] ?? emailOrSession;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getProfileInitial(
  emailOrSession: string | Pick<AuthSession, 'email' | 'firstName' | 'lastName' | 'middleInitial'>,
): string {
  if (typeof emailOrSession !== 'string' && emailOrSession.firstName) {
    return emailOrSession.firstName.charAt(0).toUpperCase() || '?';
  }
  const name = formatProfileDisplayName(emailOrSession);
  return name.charAt(0).toUpperCase() || '?';
}

export function getScanStats(scans: ScanResult[]): ProfileScanStats {
  const totalScans = scans.length;
  const sustainableCount = scans.filter(
    (scan) =>
      scan.sustainability.rating === 'green' ||
      scan.sustainability.rating === 'yellow',
  ).length;
  const mislabeledCount = scans.filter((scan) => scan.mislabeling.detected).length;
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
