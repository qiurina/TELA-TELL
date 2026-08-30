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

// Wording deliberately strengthened, not just "helps"/"can improve": on-device
// testing confirmed the model is unreliable on ordinary photos regardless of
// lighting/focus/angle — it needs true macro-level closeness (close enough to
// see individual threads) to match what it was actually trained on. A model's
// own confidence score isn't a safeguard against this either: models tend to
// be overconfident on inputs unlike anything in their training data, not
// hesitant, so a "moderate" or even "high" score doesn't rule out this being
// the actual limitation in effect.
export const LOW_CONFIDENCE_WARNING = {
  title: 'Low confidence result',
  message:
    'This result may not be reliable. Get close enough to see individual threads, not just a well-lit, in-focus photo — a clip-on macro lens is recommended for accurate results.',
} as const;

export const MODERATE_CONFIDENCE_NOTE =
  'For reliable results, get close enough to see individual threads — a clip-on macro lens is recommended, not just optional.';

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
