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
  'Results may vary with lighting and angle. A clip-on macro lens can improve close-up detail.';

export const COMPOSITION_DISCLAIMER =
  "These fiber percentages represent the model's visual confidence scores, not laboratory-verified composition.";

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
