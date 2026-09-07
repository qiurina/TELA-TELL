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
    'This result may not be reliable. Get close enough to see individual threads. A clip-on macro lens is recommended for accurate results.',
} as const;

export const MODERATE_CONFIDENCE_NOTE =
  'For reliable results, get close enough to see individual threads. Use the clip-on macro lens for accurate results.';

export const COMPOSITION_DISCLAIMER =
  "These fiber percentages represent the model's visual confidence scores, not laboratory-verified composition.";

// UI-DISPLAY HEURISTIC ONLY — decides blend headline phrasing ("Cotton-Polyester blend" vs
// "Mostly Cotton") and which canned eco-guidance copy to show. NOT used for any sustainability,
// health-risk, or label-accuracy calculation (see TRACE_DETECTION_MIN_PERCENT below for those).
// No sustainability/health-significance research supports 15% specifically; the closest real
// standard (ISO 14044's LCA cut-off rule, ~1% of mass/impact) argues a calculation-facing cutoff
// should be far lower. Deliberately left as an acknowledged, uncited display heuristic rather
// than dressed up as a scientific or regulatory number. See docs/fiber-percentage-methodology.md.
export const BLEND_SIGNIFICANT_MIN_PERCENT = 15;

// CALCULATION NOISE FLOOR — used for label-accuracy checking, shedding/health-risk fiber
// inclusion, and allergy matching. This is deliberately NOT the FTC's 5% "other fibers" labeling
// carve-out: that number exists to reduce a manufacturer's disclosure burden, not because sub-5%
// fiber content is scientifically inert — blend-shedding research shows the opposite (low fiber
// shares can still shed materially, and blends can shed more than the pure dominant fiber). Using
// the FTC figure here would be citing a real source for a question it doesn't actually answer.
// This value is a practical ML-noise floor (is this a real detection or model artifact), the same
// category of number as the confidence thresholds above — not a cited scientific threshold.
// See docs/fiber-percentage-methodology.md.
export const TRACE_DETECTION_MIN_PERCENT = 2;

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
