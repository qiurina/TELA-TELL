import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
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
};

const DEFAULT_ALTERNATIVES: HypoallergenicAlternative[] = [
  { name: 'Cotton', note: 'Naturally hypoallergenic and breathable for everyday wear' },
  { name: 'Linen', note: 'Airy weave with low irritation in hot, humid weather' },
  { name: 'Abaca or piña', note: 'Philippine plant fibers for breathable alternatives' },
];

const FABRIC_ALTERNATIVES: Partial<Record<SupportedFabric, HypoallergenicAlternative[]>> = {
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
    { name: 'Piña or abaca', note: 'Philippine plant fibers for structured formal pieces' },
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

function fabricMatchesScan(fabric: SupportedFabric, dominantFabric: string, top: string): boolean {
  return resolveFabricAlias(dominantFabric) === fabric || resolveFabricAlias(top) === fabric;
}

function getAlternatives(fabric: SupportedFabric): HypoallergenicAlternative[] {
  return FABRIC_ALTERNATIVES[fabric] ?? DEFAULT_ALTERNATIVES;
}

export function getAllergyAlert(
  sensitiveFabrics: SupportedFabric[],
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): AllergyAlert | null {
  if (sensitiveFabrics.length === 0) {
    return null;
  }

  const top = topMaterial(compositions);
  const detectedFabric = formatDetectedFabric(dominantFabric, compositions);
  const matchedSensitive = sensitiveFabrics.find((fabric) =>
    fabricMatchesScan(fabric, dominantFabric, top),
  );

  if (!matchedSensitive) {
    return {
      sensitiveFabric: sensitiveFabrics[0],
      detectedFabric,
      conflictDetected: false,
      message: 'No conflict',
      alternatives: getAlternatives(sensitiveFabrics[0]),
    };
  }

  return {
    sensitiveFabric: matchedSensitive,
    detectedFabric,
    conflictDetected: true,
    message: `${detectedFabric} detected`,
    alternatives: getAlternatives(matchedSensitive),
  };
}
