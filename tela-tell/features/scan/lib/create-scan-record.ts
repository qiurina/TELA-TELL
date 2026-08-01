import { SCAN_RESULTS, type ScanResult } from '@/data/scans/mock-data';
import {
  resolveAllFabricAliases,
  resolveFabricAlias,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';
import { getSignificantFibers } from '@/data/scans/analysis';

export type CreateScanRecordInput = {
  /** Optional seller-declared label from the Seller Label modal. */
  sellerLabel?: string | null;
  /**
   * Which mock template to clone.
   * Omit to rotate through templates so demos aren't always the same cotton scan.
   */
  templateId?: string;
};

/** Simple unique id for offline scans. */
function createScanId(): string {
  return `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Human-readable time for History cards, e.g. "Today, 8:30 PM". */
function formatScannedAt(date: Date): string {
  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `Today, ${time}`;
}

/** ISO date for filtering, e.g. "2026-07-26". */
function formatScannedAtDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

/**
 * Rule-based mislabel check for the saved record.
 * Seller-claimed fibers (including blends) must all appear in the scan mix.
 */
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

/**
 * Builds a new ScanResult ready to save.
 * Classification content still comes from mock templates. Only the record is new.
 */
export function createScanRecord(input: CreateScanRecordInput = {}): ScanResult {
  const template = pickTemplate(input.templateId);
  const now = new Date();
  const sellerLabel = input.sellerLabel?.trim() || null;

  // Deep-ish clone so we never mutate the shared SCAN_RESULTS templates.
  const cloned: ScanResult = {
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
    id: createScanId(),
    scannedAt: formatScannedAt(now),
    scannedAtDate: formatScannedAtDate(now),
    sellerLabel: sellerLabel ?? undefined,
    mislabeling: buildMislabeling(template.dominantFabric, sellerLabel, template.compositions),
  };

  return cloned;
}
