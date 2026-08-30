import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getSignificantFibers } from '@/data/scans/scan-confidence';
import type { FabricComposition } from '@/data/scans/mock-data';
import {
  OCCASION_CONTEXT_OPTIONS,
  WEATHER_CONTEXT_OPTIONS,
} from '@/data/preferences/occasion-weather';
import type { UserPreferences } from '@/features/profile/lib/user-preferences';
import type { Href } from 'expo-router';

export type PreferenceMatchResult = {
  matched: { fabric: SupportedFabric; percentage?: number }[];
  unmatchedPreferred: SupportedFabric[];
  hasPreferredList: boolean;
};

export type InsightsSetupItem = {
  key: 'skin-tone' | 'allergies' | 'preferred' | 'weather' | 'occasion';
  label: string;
  href: Href;
};

function resolveScanFibers(
  dominantFabric: string,
  compositions: FabricComposition[],
): { fabric: SupportedFabric; percentage?: number }[] {
  const significant = getSignificantFibers(compositions);
  const resolved: { fabric: SupportedFabric; percentage?: number }[] = [];

  for (const item of significant) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric || resolved.some((entry) => entry.fabric === fabric)) {
      continue;
    }
    resolved.push({ fabric, percentage: item.percentage });
  }

  if (resolved.length === 0) {
    const fabric = resolveFabricAlias(dominantFabric);
    if (fabric) {
      resolved.push({ fabric });
    }
  }

  return resolved;
}

export function getPreferenceMatch(
  preferredFabrics: SupportedFabric[],
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): PreferenceMatchResult {
  const scanFibers = resolveScanFibers(dominantFabric, compositions);
  const matched = preferredFabrics.flatMap((preferred) => {
    const hit = scanFibers.find((item) => item.fabric === preferred);
    return hit ? [{ fabric: preferred, percentage: hit.percentage }] : [];
  });

  return {
    matched,
    unmatchedPreferred: preferredFabrics.filter(
      (fabric) => !matched.some((item) => item.fabric === fabric),
    ),
    hasPreferredList: preferredFabrics.length > 0,
  };
}

export function getInsightsSetupItems(preferences: UserPreferences): InsightsSetupItem[] {
  const items: InsightsSetupItem[] = [];
  const weatherIds = new Set(WEATHER_CONTEXT_OPTIONS.map((item) => item.id));
  const occasionIds = new Set(OCCASION_CONTEXT_OPTIONS.map((item) => item.id));
  const contexts = preferences.dressingContexts ?? [];

  if (!preferences.skinTone && !preferences.colorSeason) {
    items.push({ key: 'skin-tone', label: 'Skin tone', href: '/skin-tone' as Href });
  }
  if (preferences.sensitiveFabrics.length === 0) {
    items.push({ key: 'allergies', label: 'Sensitivities', href: '/fabric-allergies' as Href });
  }
  if (preferences.preferredFabrics.length === 0) {
    items.push({ key: 'preferred', label: 'Preferred fibers', href: '/preferred-fabrics' as Href });
  }
  if (!contexts.some((id) => weatherIds.has(id))) {
    items.push({ key: 'weather', label: 'Weather', href: '/weather' as Href });
  }
  if (!contexts.some((id) => occasionIds.has(id))) {
    items.push({ key: 'occasion', label: 'Occasion', href: '/occasion' as Href });
  }

  return items;
}
