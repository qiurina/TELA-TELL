import type { ImageSourcePropType } from 'react-native';

import type { GarmentCondition } from '@/data/scans/garment-condition';
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

/**
 * What a sentence on an alternative card is: a material `fact`, what a `certification` requires,
 * evidence of an environmental `benefit`, or a `tradeoff` (a downside or conflicting finding).
 * The authors' decision to suggest the swap is editorial and is not a claim kind.
 */
export type EcoClaimKind = 'fact' | 'certification' | 'benefit' | 'tradeoff';

export type EcoClaim = {
  kind: EcoClaimKind;
  text: string;
  /** Ids in `data/fabrics/source-registry.ts`. Required for every kind except plain `fact`s. */
  sourceIds?: string[];
  /** What is being measured, e.g. "Making the fiber" or "Washing clothes". Shown on the Basis sheet. */
  aspect?: string;
  /** Shown only on the Basis sheet, not on the card (for caveated, industry-funded evidence). */
  basisOnly?: boolean;
};

export type EcoAlternative = {
  name: string;
  /** The card text: the claims' sentences, in order. */
  similarity?: string;
  description?: string;
  claims?: EcoClaim[];
  /** Every source id used by the claims, in order of first use. */
  sourceIds?: string[];
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

/** How the photo reached the app. `system_camera` is the phone's own camera app (the fallback). */
export type CaptureType = 'live_camera' | 'system_camera' | 'gallery';

/**
 * Outcome of the blur check on the captured photo(s): `passed` (sharp enough), `overridden` (the
 * person chose to use a photo the check flagged as blurry), `unchecked` (the check could not run).
 */
export type SharpnessCheckStatus = 'passed' | 'overridden' | 'unchecked';

/**
 * Facts about how a scan was taken and run, kept with the scan so results can be compared across
 * capture conditions, model versions and devices later. Stored inside the scan's saved JSON.
 */
export type ScanCaptureMeta = {
  captureType: CaptureType;
  /** The person's own answer to "using a clip-on macro lens?". The app cannot detect a lens. */
  clipOnLens: boolean;
  /** Which bundled model produced the scores (see MODEL_VERSION in ml/constants.ts). */
  modelVersion: string;
  /** How many photos were classified and averaged (1 for single shots, up to 3 for a live burst). */
  burstCount: number;
  /** Milliseconds spent inside the model itself, summed over the burst. */
  inferenceMs: number;
  /**
   * Milliseconds for the whole classification call: preprocessing and the model for every photo,
   * plus loading the model if this was the first scan since the app started.
   */
  totalMs: number;
  /** Sharpness reading of the sharpest photo (the app's Laplacian measure), null if not measured. */
  sharpness: number | null;
  /**
   * Each captured photo's own sharpness reading, in capture order (null where a photo could not
   * be measured). `sharpness` is the highest of these. The photo shown and saved with the scan is
   * the first one. Absent on scans saved before per-photo readings were recorded.
   */
  sharpnessPerPhoto?: (number | null)[];
  sharpnessCheck: SharpnessCheckStatus;
  /**
   * Brightness, blown-highlight and shading readings for each photo (capture order), and the
   * advisory notices raised. Absent on scans saved before the lighting check existed.
   */
  lighting?: {
    perPhoto: (LightingReading | null)[];
    warnings: LightingWarning[];
  };
};

/** How the fabric is made, as noted by a tester. */
export type ConstructionKind = 'knit' | 'woven' | 'other' | 'unknown';

/**
 * Optional notes a tester can add to a scan in Research mode (Settings), to give the scan a known
 * answer to be compared with later. Stored in the scan's saved JSON; none of it affects results.
 */
export type ScanTesterFields = {
  /** The fiber content as printed on the garment's care label, exactly as written. */
  careLabelComposition?: string;
  construction?: ConstructionKind;
  colour?: string;
  /** A tester's own identifier for the physical garment, so one garment's scans can be grouped. */
  garmentId?: string;
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
  /** Absent on scans saved before capture details were recorded. */
  capture?: ScanCaptureMeta;
  /** Absent unless a tester filled it in (Research mode). */
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
  /** The scan could not name one fiber reliably (see assessScanReliability). */
  unsure?: boolean;
  /** How the photo was captured; null for scans saved before this was recorded. */
  captureType?: CaptureType | null;
  sellerLabel?: string;
  image: ImageSourcePropType;
  isFavorite?: boolean;
  deletedAt?: string | null;
  daysRemaining?: number;
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
