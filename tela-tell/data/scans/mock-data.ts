import type { ImageSourcePropType } from 'react-native';

import type { GarmentCondition } from '@/data/scans/garment-condition';

export type SustainabilityRating = 'green' | 'yellow' | 'red';

export type SustainabilityFactor = {
  text: string;
  positive: boolean;
};

export type FabricComposition = {
  material: string;
  percentage: number;
};

export type CareInstruction = {
  text: string;
  recommended: boolean;
};

export type FabricProfile = {
  texture: string;
  weave: string;
  breathability: string;
  durability: string;
  stretch: string;
  careInstructions: CareInstruction[];
  useCases: string[];
};

export type SuitabilityLevel = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type GarmentPurposeItem = {
  purpose: string;
  suitability: SuitabilityLevel;
  note: string;
};

export type EcoAlternative = {
  name: string;
  similarity?: string;
  description?: string;
};

export type ScanRecommendations = {
  garmentPurposes: GarmentPurposeItem[];
  ecoAlternatives: EcoAlternative[];
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
};

export type ScanResult = {
  id: string;
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
  scannedAt: string;
  scannedAtDate: string;
  sellerLabel?: string;
  imageUri?: string | null;
  garmentCondition?: GarmentCondition;
  sustainability: {
    rating: SustainabilityRating;
    label: string;
    score: number;
    factors: SustainabilityFactor[];
  };
  mislabeling: {
    detected: boolean;
    title: string;
    message: string;
  };
  profile: FabricProfile;
  recommendations: ScanRecommendations;
};

export function resolveScanId(rawId: string | string[] | undefined): string {
  if (Array.isArray(rawId)) {
    return rawId[0] ?? '';
  }

  return rawId ?? '';
}

export type RecentScanPreview = {
  id: string;
  primaryFabric: string;
  composition: string;
  scannedAt: string;
  scannedAtDate: string;
  sustainability: SustainabilityRating;
  sustainabilityLabel: string;
  mislabeling: boolean;
  sellerLabel?: string;
  image: ImageSourcePropType;
  isFavorite?: boolean;
  deletedAt?: string | null;
  daysRemaining?: number;
};

export const SUSTAINABILITY_DOT: Record<SustainabilityRating, string> = {
  green: '#16a34a',
  yellow: '#ca8a04',
  red: '#dc2626',
};

export const SUSTAINABILITY_BORDER: Record<SustainabilityRating, string> = {
  green: '#bbf7d0',
  yellow: '#fde68a',
  red: '#fecaca',
};

export const SUSTAINABILITY_BG: Record<SustainabilityRating, string> = {
  green: '#f0fdf4',
  yellow: '#fffbeb',
  red: '#fef2f2',
};

export const FABRIC_PROPERTY_COLOR = {
  high: '#16a34a',
  medium: '#ca8a04',
  low: '#dc2626',
  neutral: '#212121',
} as const;

export function getFabricPropertyColor(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes('very high') || normalized === 'high' || normalized.includes('excellent')) {
    return FABRIC_PROPERTY_COLOR.high;
  }
  if (normalized.includes('medium') || normalized.includes('moderate') || normalized.includes('fair')) {
    return FABRIC_PROPERTY_COLOR.medium;
  }
  if (normalized.includes('very low') || normalized === 'low' || normalized.includes('poor') || normalized === 'none') {
    return FABRIC_PROPERTY_COLOR.low;
  }

  return FABRIC_PROPERTY_COLOR.neutral;
}
