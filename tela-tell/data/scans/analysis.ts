/** Panel-aligned analysis rules — shared by UI and future ML backend. */

export {
  FABRIC_CATEGORY_COLORS,
  FABRIC_REGISTRY,
  SUPPORTED_FABRICS,
  resolveFabricAlias,
  getFabricCategory,
  isSupportedFabric,
  type FabricCategory,
  type FabricDefinition,
  type SupportedFabric,
} from '@/data/fabrics/fabrics';

export const CONFIDENCE_HIGH_THRESHOLD = 75;
export const CONFIDENCE_LOW_THRESHOLD = 60;
export const MISLABEL_ALERT_MIN_CONFIDENCE = 75;

export type ConfidenceLevel = 'high' | 'moderate' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_HIGH_THRESHOLD) {
    return 'high';
  }
  if (confidence >= CONFIDENCE_LOW_THRESHOLD) {
    return 'moderate';
  }
  return 'low';
}

export function getConfidenceLabel(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  if (level === 'high') {
    return 'High confidence';
  }
  if (level === 'moderate') {
    return 'Moderate confidence';
  }
  return 'Low confidence';
}

export const LOW_CONFIDENCE_WARNING = {
  title: 'Low confidence result',
  message:
    'This fabric may be difficult to classify accurately. Consider rescanning under better lighting or try a different angle.',
} as const;

export const MODERATE_CONFIDENCE_NOTE =
  'Results may vary with lighting and angle. An IoT device scan can improve certainty.';

export const BACKUP_SCAN_DISCLAIMER =
  'Scan results from phone photos or gallery uploads may be less accurate. For the best results, please use the IoT scanner device.';

export const COMPOSITION_DISCLAIMER =
  "These fiber percentages represent the model's visual confidence scores, not laboratory-verified composition.";

/** Fibers at or above this share count as "significant" for blend detection (Revision 12). */
export const BLEND_SIGNIFICANT_MIN_PERCENT = 15;

export type CompositionInput = {
  material: string;
  percentage: number;
};

export function getSignificantFibers(
  compositions: CompositionInput[],
  minPercent = BLEND_SIGNIFICANT_MIN_PERCENT,
): CompositionInput[] {
  return [...compositions]
    .filter((item) => item.percentage >= minPercent)
    .sort((a, b) => b.percentage - a.percentage);
}

export function isBlendDetected(compositions: CompositionInput[]): boolean {
  return getSignificantFibers(compositions).length >= 2;
}

function formatBlendFiberPhrase(fibers: string[]): string {
  const labels = fibers.map((fiber) => fiber.toLowerCase());

  if (labels.length === 0) {
    return '';
  }
  if (labels.length === 1) {
    return labels[0];
  }
  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

export type BlendNoticeContent = {
  title: string;
  body: string;
  caution?: string;
};

export function getBlendNotice(
  compositions: CompositionInput[],
  confidence?: number,
): BlendNoticeContent | null {
  if (!isBlendDetected(compositions)) {
    return null;
  }

  const topFibers = getSignificantFibers(compositions)
    .slice(0, 2)
    .map((item) => item.material);
  const fiberPhrase = formatBlendFiberPhrase(topFibers);
  const isLowConfidence =
    confidence !== undefined && getConfidenceLevel(confidence) === 'low';

  return {
    title: 'Multiple fibers detected',
    body: `Possible ${fiberPhrase} blend. Visual estimate only.`,
    caution: isLowConfidence ? 'Low confidence. Rescan recommended.' : undefined,
  };
}
