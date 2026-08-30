import { SCAN_RESULTS, type ScanResult } from '@/data/scans/mock-data';
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
  templateId?: string;
  /** Burst of captured photos to run real on-device classification against; scores are averaged across them. */
  imageUris?: string[] | null;
};

function createScanId(): string {
  return `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function pickTemplate(templateId?: string): ScanResult {
  if (templateId) {
    const found = SCAN_RESULTS.find((scan) => scan.id === templateId);
    if (found) {
      return found;
    }
  }

  const index = Math.floor(Math.random() * SCAN_RESULTS.length);
  return SCAN_RESULTS[index] ?? SCAN_RESULTS[0];
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

function cloneTemplate(template: ScanResult): ScanResult {
  return {
    ...template,
    compositions: template.compositions.map((item) => ({ ...item })),
    sustainability: {
      ...template.sustainability,
      factors: template.sustainability.factors.map((factor) => ({ ...factor })),
    },
    profile: {
      ...template.profile,
      careInstructions: template.profile.careInstructions.map((item) => ({ ...item })),
      useCases: [...template.profile.useCases],
    },
    recommendations: {
      ...template.recommendations,
      garmentPurposes: template.recommendations.garmentPurposes.map((item) => ({ ...item })),
      ecoAlternatives: template.recommendations.ecoAlternatives.map((item) => ({ ...item })),
      reuse: { ...template.recommendations.reuse },
    },
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

async function classifyFromImages(imageUris: string[]): Promise<ClassificationResult | null> {
  try {
    return await classifyFabric(imageUris);
  } catch {
    return null;
  }
}

export async function createScanRecord(input: CreateScanRecordInput = {}): Promise<ScanResult> {
  const now = new Date();
  const sellerLabel = input.sellerLabel?.trim() || null;

  const imageUris = input.imageUris?.filter(Boolean) ?? [];
  const classification = imageUris.length > 0 ? await classifyFromImages(imageUris) : null;
  const base = classification
    ? buildResultFromClassification(classification)
    : cloneTemplate(pickTemplate(input.templateId));

  return {
    ...base,
    id: createScanId(),
    scannedAt: formatScanDisplayTime(now),
    scannedAtDate: formatScannedAtDate(now),
    sellerLabel: sellerLabel ?? undefined,
    mislabeling: buildMislabeling(base.dominantFabric, sellerLabel, base.compositions),
  };
}
