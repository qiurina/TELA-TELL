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
  title: 'Not sure about this result',
  message:
    'This result may not be accurate. Try moving closer so you can see the fabric threads clearly. A clip-on macro lens can help too.',
} as const;

export const COMPOSITION_DISCLAIMER =
  "These percentages show how confident the model is that each fiber is the one in your photo. TELA-TELL cannot measure how much of each fiber is in a garment, and this is not a laboratory result. Check the care tag for the real composition.";

// A "clear share" of the scan's confidence: a candidate at or above this is more than a stray
// score. Used to tell a clearly supported declared fiber from a faintly supported one
// (declared-label.ts) and to list the candidate fibers considered for personalized insights.
// It is NOT a fiber proportion: the classifier is single-label, so these percentages are
// confidence, not a measured blend. No sustainability/health research supports 15% specifically;
// it is an acknowledged, uncited display heuristic (see TRACE_DETECTION_MIN_PERCENT below for
// the floor used for health-risk and label checks).
export const CLEAR_SHARE_MIN_PERCENT = 15;

// CALCULATION NOISE FLOOR — used for label-accuracy checking, shedding/health-risk fiber
// inclusion, and allergy matching. This is deliberately NOT the FTC's 5% "other fibers" labeling
// carve-out: that number exists to reduce a manufacturer's disclosure burden, not because sub-5%
// fiber content is scientifically inert — a 2023 ScienceDirect study on elastane-blend microfiber
// release and Zhang et al. (2025, Environmental Pollution) both found the opposite (low fiber
// shares can still shed materially, and blends can shed more than the pure dominant fiber; see
// synthetic-health-risk.ts and docs/fiber-percentage-methodology.md §C for the full citation).
// Using the FTC figure here would be citing a real source for a question it doesn't actually
// answer. This value itself is a practical ML-noise floor (is this a real detection or model
// artifact), the same category of number as the confidence thresholds above — not a cited
// scientific threshold.
export const TRACE_DETECTION_MIN_PERCENT = 2;

export type CompositionInput = {
  material: string;
  percentage: number;
};

export function getSignificantFibers(
  compositions: CompositionInput[],
  minPercent = CLEAR_SHARE_MIN_PERCENT,
): CompositionInput[] {
  return [...compositions]
    .filter((item) => item.percentage >= minPercent)
    .sort((a, b) => b.percentage - a.percentage);
}
