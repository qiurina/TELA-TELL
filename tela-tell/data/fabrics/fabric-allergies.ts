import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { getSignificantFibers, TRACE_DETECTION_MIN_PERCENT } from '@/data/scans/scan-confidence';
import type { FabricComposition } from '@/data/scans/mock-data';

export type HypoallergenicAlternative = {
  name: string;
  note: string;
};

export type AllergyAlert = {
  sensitiveFabric: SupportedFabric;
  detectedFabric: string;
  conflictDetected: boolean;
  message: string;
  alternatives: HypoallergenicAlternative[];
  conflictFibers?: { fabric: SupportedFabric; percentage?: number }[];
};

const DEFAULT_ALTERNATIVES: HypoallergenicAlternative[] = [
  { name: 'Cotton', note: 'Naturally hypoallergenic and breathable for everyday wear' },
  { name: 'Linen', note: 'Airy weave with low irritation in hot, humid weather' },
  { name: 'Abaca', note: 'Philippine plant fiber for breathable alternatives' },
];

const FABRIC_ALTERNATIVES: Partial<Record<SupportedFabric, HypoallergenicAlternative[]>> = {
  Cotton: [
    { name: 'Linen', note: 'Breathable natural weave with a crisp hand-feel' },
    { name: 'Bamboo fabric', note: 'Smooth, gentle option for reactive skin' },
    { name: 'Tencel / lyocell', note: 'Soft drape with moisture-wicking comfort' },
  ],
  Linen: [
    { name: 'Cotton', note: 'Soft everyday option when linen feels too coarse' },
    { name: 'Bamboo fabric', note: 'Smooth finish with low irritation' },
    { name: 'Tencel / lyocell', note: 'Fluid drape without linen stiffness' },
  ],
  Abaca: [
    { name: 'Cotton', note: 'Softer hand-feel for everyday comfort' },
    { name: 'Linen', note: 'Similar breathability with a familiar weave' },
    { name: 'Bamboo fabric', note: 'Gentle alternative for sensitive skin' },
  ],
  Wool: [
    { name: 'Cotton', note: 'Naturally hypoallergenic and breathable for everyday wear' },
    { name: 'Bamboo fabric', note: 'Gentle on skin with a smooth hand-feel' },
    { name: 'Linen', note: 'Breathable with low irritation in hot, humid weather' },
  ],
  Silk: [
    { name: 'Cotton', note: 'Soft natural option without silk protein fibers' },
    { name: 'Linen', note: 'Crisp and breathable for tropical climates' },
    { name: 'Tencel / lyocell', note: 'Smooth drape similar to silk with closed-loop processing' },
  ],
  Polyester: [
    { name: 'Cotton', note: 'Natural fiber less likely to trap heat and sweat' },
    { name: 'Linen', note: 'Airy weave with low synthetic content' },
    { name: 'Abaca', note: 'Philippine plant fiber for breathable alternatives' },
  ],
  Nylon: [
    { name: 'Cotton', note: 'Natural fiber less likely to trap heat and sweat' },
    { name: 'Linen', note: 'Airy weave with low synthetic content' },
    { name: 'Abaca', note: 'Philippine plant fiber for breathable alternatives' },
  ],
  Acrylic: [
    { name: 'Cotton', note: 'Natural fiber less likely to trap heat and sweat' },
    { name: 'Linen', note: 'Airy weave with low synthetic content' },
    { name: 'Abaca', note: 'Philippine plant fiber for breathable alternatives' },
  ],
  Rayon: [
    { name: 'Cotton', note: 'Natural fiber less likely to trap heat and sweat' },
    { name: 'Linen', note: 'Airy weave with low synthetic content' },
    { name: 'Abaca', note: 'Philippine plant fiber for breathable alternatives' },
  ],
  Spandex: [
    { name: 'Cotton', note: 'Natural fiber without tight synthetic stretch' },
    { name: 'Linen', note: 'Breathable alternative when stretch is not required' },
    { name: 'Loose rayon', note: 'Flowy drape without elastic compression on skin' },
  ],
  Leather: [
    { name: 'Cotton canvas', note: 'Plant-based alternative for bags and outer layers' },
    { name: 'Linen', note: 'Breathable natural option for warm climates' },
    { name: 'Abaca', note: 'Philippine plant fiber for structured formal pieces' },
  ],
  Suede: [
    { name: 'Cotton canvas', note: 'Plant-based alternative without animal hide' },
    { name: 'Linen', note: 'Breathable natural option for warm climates' },
    { name: 'Microfiber (verified)', note: 'Synthetic suede-like finish without animal material' },
  ],
};

function topMaterial(compositions: FabricComposition[]): string {
  const sorted = [...compositions].sort((a, b) => b.percentage - a.percentage);
  return sorted[0]?.material?.toLowerCase() ?? '';
}

function formatDetectedFabric(dominantFabric: string, compositions: FabricComposition[]): string {
  const fabric = resolveSupportedFabric(dominantFabric, compositions);
  if (fabric) {
    return fabric;
  }

  const cleaned = dominantFabric.replace(/\s*dominant\s*/i, '').trim();
  return cleaned || 'this material';
}

function resolveScanFibers(
  dominantFabric: string,
  compositions: FabricComposition[],
): { fabric: SupportedFabric; percentage?: number }[] {
  // A user's declared allergen shouldn't be hidden by a blend-display cutoff — use the noise
  // floor so a real trace detection still surfaces a conflict.
  const significant = getSignificantFibers(compositions, TRACE_DETECTION_MIN_PERCENT);
  const resolved: { fabric: SupportedFabric; percentage?: number }[] = [];

  for (const item of significant) {
    const fabric = resolveFabricAlias(item.material);
    if (!fabric || resolved.some((entry) => entry.fabric === fabric)) {
      continue;
    }
    resolved.push({ fabric, percentage: item.percentage });
  }

  if (resolved.length === 0) {
    const top = topMaterial(compositions);
    const fromDominant = resolveFabricAlias(dominantFabric);
    const fromTop = resolveFabricAlias(top);
    if (fromDominant) {
      resolved.push({ fabric: fromDominant });
    } else if (fromTop) {
      resolved.push({ fabric: fromTop });
    }
  }

  return resolved;
}

function alternativeMatchesFabric(alternativeName: string, fabric: SupportedFabric): boolean {
  return alternativeName.toLowerCase().includes(fabric.toLowerCase());
}

function filterAlternatives(
  alternatives: HypoallergenicAlternative[],
  excludeFabrics: SupportedFabric[],
): HypoallergenicAlternative[] {
  const filtered = alternatives.filter(
    (alternative) =>
      !excludeFabrics.some((fabric) => alternativeMatchesFabric(alternative.name, fabric)),
  );

  if (filtered.length > 0) {
    return filtered;
  }

  return DEFAULT_ALTERNATIVES.filter(
    (alternative) =>
      !excludeFabrics.some((fabric) => alternativeMatchesFabric(alternative.name, fabric)),
  );
}

function getAlternatives(
  fabric: SupportedFabric,
  excludeFabrics: SupportedFabric[] = [],
): HypoallergenicAlternative[] {
  const base = FABRIC_ALTERNATIVES[fabric] ?? DEFAULT_ALTERNATIVES;
  return filterAlternatives(base, excludeFabrics);
}

export function getAllergyAlert(
  sensitiveFabrics: SupportedFabric[],
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): AllergyAlert | null {
  if (sensitiveFabrics.length === 0) {
    return null;
  }

  const detectedFabric = formatDetectedFabric(dominantFabric, compositions);
  const scanFibers = resolveScanFibers(dominantFabric, compositions);
  const conflictFibers = scanFibers.filter((item) => sensitiveFabrics.includes(item.fabric));
  const matchedSensitive = conflictFibers[0]?.fabric;

  if (!matchedSensitive) {
    return {
      sensitiveFabric: sensitiveFabrics[0],
      detectedFabric,
      conflictDetected: false,
      message: 'No conflict',
      alternatives: getAlternatives(sensitiveFabrics[0], sensitiveFabrics),
    };
  }

  const conflictLabel = conflictFibers
    .map((item) =>
      typeof item.percentage === 'number'
        ? `${item.fabric} ${item.percentage}%`
        : item.fabric,
    )
    .join(' · ');

  return {
    sensitiveFabric: matchedSensitive,
    detectedFabric,
    conflictDetected: true,
    message: `Contains ${conflictLabel}`,
    alternatives: getAlternatives(matchedSensitive, sensitiveFabrics),
    conflictFibers,
  };
}
