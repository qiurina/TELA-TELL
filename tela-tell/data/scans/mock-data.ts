import type { ImageSourcePropType } from 'react-native';

import type { GarmentCondition } from '@/data/scans/garment-condition';
import type { UnsureReason } from '@/data/scans/scan-confidence';
import type { FiberBadge } from '@/features/results/lib/fiber-badge';
import type { DeclaredLabelStatus } from '@/features/scan/lib/declared-label';
import type { LightingReading, LightingWarning } from '@/features/scan/lib/ml/lighting';

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

export type EcoClaimKind = 'fact' | 'certification' | 'benefit' | 'tradeoff';

export type EcoClaim = {
  kind: EcoClaimKind;
  text: string;
  sourceIds?: string[];
  aspect?: string;
  basisOnly?: boolean;
};

export type ScanRecommendations = {
  garmentPurposes: GarmentPurposeItem[];
};

export type CaptureType = 'live_camera' | 'system_camera' | 'gallery';

export type SharpnessCheckStatus = 'passed' | 'overridden' | 'unchecked';

export type ScanCaptureMeta = {
  captureType: CaptureType;
  clipOnLens?: boolean;
  modelVersion: string;
  burstCount: number;
  inferenceMs: number;
  totalMs: number;
  sharpness: number | null;
  sharpnessPerPhoto?: (number | null)[];
  sharpnessCheck: SharpnessCheckStatus;
  lighting?: {
    perPhoto: (LightingReading | null)[];
    warnings: LightingWarning[];
  };
};

export type ConstructionKind = 'knit' | 'woven' | 'other' | 'unknown';

export type ScanTesterFields = {
  careLabelComposition?: string;
  construction?: ConstructionKind;
  colour?: string;
  garmentId?: string;
};

export type ScanResult = {
  id: string;
  createdAt?: string;
  dominantFabric: string;
  compositions: FabricComposition[];
  confidence: number;
  scannedAt: string;
  scannedAtDate: string;
  sellerLabel?: string;
  imageUri?: string | null;
  garmentCondition?: GarmentCondition;
  capture?: ScanCaptureMeta;
  testerFields?: ScanTesterFields;
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
  mislabeling: boolean;
  fiberBadgeKind?: FiberBadge['kind'] | null;
  labelStatus?: DeclaredLabelStatus;
  unsure?: boolean;
  unsureReason?: UnsureReason | null;
  closestCandidates?: { material: string; percentage: number }[];
  captureType?: CaptureType | null;
  sellerLabel?: string;
  image: ImageSourcePropType;
  isFavorite?: boolean;
  deletedAt?: string | null;
  daysRemaining?: number;
};
