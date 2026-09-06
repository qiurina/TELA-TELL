import type { ScanResult } from '@/data/scans/mock-data';
import {
  resolveAllFabricAliases,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import { getSignificantFibers, isBlendDetected } from '@/data/scans/scan-confidence';
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

  for (const item of getSignificantFibers(compositions)) {
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

function formatFoundLabel(fibers: SupportedFabric[], dominantFabric: string): string {
  if (fibers.length >= 2) {
    return `${fibers[0]}-${fibers[1]} blend`;
  }
  if (fibers.length === 1) {
    return fibers[0];
  }
  return dominantFabric.replace(/\s*dominant\s*/i, '').trim() || 'a different fabric';
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

  const foundLabel = formatFoundLabel(scanFibers, dominantFabric);
  const missingLabel =
    missingFromScan.length === 1 ? missingFromScan[0] : missingFromScan.join(' / ');

  return {
    detected: true,
    title: 'Possible Mislabeling Detected',
    message: `Seller stated '${trimmed}' but the scan did not find ${missingLabel}. Scan found ${foundLabel}. Consider negotiating the price.`,
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
