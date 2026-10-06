import type { ScanResult } from '@/data/scans/mock-data';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { evaluateDeclaredLabel } from '@/features/scan/lib/declared-label';
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

/**
 * The shape stored with a scan. `detected` is true only for a real mismatch (see
 * evaluateDeclaredLabel); the results screen re-evaluates the label live, so edits to the stated
 * label or to the matching rules apply to old scans without touching the database.
 */
export function buildMislabeling(
  dominantFabric: string,
  sellerLabel: string | null,
  compositions: { material: string; percentage: number }[] = [],
): ScanResult['mislabeling'] {
  const check = evaluateDeclaredLabel(dominantFabric, sellerLabel, compositions);
  if (check.status !== 'mismatch') {
    return { detected: false, title: '', message: '' };
  }
  return { detected: true, title: check.title, message: check.message };
}

function buildResultFromClassification(classification: ClassificationResult): ScanResult {
  const primary = (resolveFabricAlias(classification.dominantFabric) ??
    classification.dominantFabric) as SupportedFabric;
  const { profile, sustainability, recommendations } = buildScanProfile(
    primary,
    classification.dominantFabric,
    classification.compositions,
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
