import type { ScanResult } from '@/data/scans/mock-data';
import {
  resolveAllFabricAliases,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import {
  getSignificantFibers,
  isBlendDetected,
  TRACE_DETECTION_MIN_PERCENT,
} from '@/data/scans/scan-confidence';
import { formatScanDisplayTime, formatScannedAtDate } from '@/features/scan/lib/scan-timestamp';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';
import { classifyFabric, type ClassificationResult } from '@/features/scan/lib/ml/model';

export type CreateScanRecordInput = {
  sellerLabel?: string | null;
  imageUris?: string[] | null;
};

function createScanId(): string {
  return `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

type CompositionLike = { material: string; percentage: number };

function resolveScanFibers(
  dominantFabric: string,
  compositions: CompositionLike[] = [],
): SupportedFabric[] {
  const fibers: SupportedFabric[] = [];

  // Label-accuracy check: does the scan detect this fiber at all, not "is it blend-significant".
  for (const item of getSignificantFibers(compositions, TRACE_DETECTION_MIN_PERCENT)) {
    const fabric = resolveFabricAlias(item.material);
    if (fabric && !fibers.includes(fabric)) {
      fibers.push(fabric);
    }
  }

  const dominant = resolveFabricAlias(dominantFabric);
  if (dominant && !fibers.includes(dominant)) {
    fibers.push(dominant);
  }

  return fibers;
}

export function buildMislabeling(
  dominantFabric: string,
  sellerLabel: string | null,
  compositions: CompositionLike[] = [],
): ScanResult['mislabeling'] {
  const trimmed = sellerLabel?.trim() || null;
  if (!trimmed) {
    return {
      detected: false,
      title: '',
      message: '',
    };
  }

  const sellerFibers = resolveAllFabricAliases(trimmed);
  if (sellerFibers.length === 0) {
    return {
      detected: false,
      title: '',
      message: '',
    };
  }

  const scanFibers = resolveScanFibers(dominantFabric, compositions);
  if (scanFibers.length === 0) {
    return {
      detected: false,
      title: '',
      message: '',
    };
  }

  const missingFromScan = sellerFibers.filter((fiber) => !scanFibers.includes(fiber));
  if (missingFromScan.length === 0) {
    return {
      detected: false,
      title: '',
      message: '',
    };
  }

  return {
    detected: true,
    title: 'Possible Mislabeling Detected',
    message: "Doesn't match what the seller listed. Consider negotiating the price.",
  };
}

function buildResultFromClassification(classification: ClassificationResult): ScanResult {
  const primary = (resolveFabricAlias(classification.dominantFabric) ??
    classification.dominantFabric) as SupportedFabric;
  const blend = isBlendDetected(classification.compositions);
  const { profile, sustainability, recommendations } = buildScanProfile(
    primary,
    classification.dominantFabric,
    classification.compositions,
    blend,
  );

  return {
    id: '',
    dominantFabric: classification.dominantFabric,
    compositions: classification.compositions,
    confidence: classification.confidence,
    scannedAt: '',
    scannedAtDate: '',
    sustainability,
    mislabeling: { detected: false, title: '', message: '' },
    profile,
    recommendations,
  };
}

async function classifyFromImages(imageUris: string[]): Promise<ClassificationResult> {
  try {
    return await classifyFabric(imageUris);
  } catch (error) {
    console.error('[TELA-TELL] classifyFabric failed:', error);
    throw new Error('Could not analyze this photo. Please try again.');
  }
}

export async function createScanRecord(input: CreateScanRecordInput = {}): Promise<ScanResult> {
  const now = new Date();
  const sellerLabel = input.sellerLabel?.trim() || null;

  const imageUris = input.imageUris?.filter(Boolean) ?? [];
  if (imageUris.length === 0) {
    throw new Error('No photo to analyze.');
  }

  const classification = await classifyFromImages(imageUris);
  const base = buildResultFromClassification(classification);

  return {
    ...base,
    id: createScanId(),
    scannedAt: formatScanDisplayTime(now),
    scannedAtDate: formatScannedAtDate(now),
    sellerLabel: sellerLabel ?? undefined,
    mislabeling: buildMislabeling(base.dominantFabric, sellerLabel, base.compositions),
  };
}
