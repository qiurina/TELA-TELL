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

// Calibrated: ml-training/results/calibration/calibration_analysis_2026-10-10.txt.
export const UNSURE_MIN_CONFIDENCE_PERCENT = CONFIDENCE_LOW_THRESHOLD;
export const UNSURE_MIN_MARGIN_POINTS = 20;

export type UnsureReason = 'low_confidence' | 'close_call';

export type ScanReliability = {
  reliable: boolean;
  reason: UnsureReason | null;
  topPercent: number;
  marginPoints: number;
};

export type UnsureThresholds = {
  minConfidencePercent: number;
  minMarginPoints: number;
};

export const DEFAULT_UNSURE_THRESHOLDS: UnsureThresholds = {
  minConfidencePercent: UNSURE_MIN_CONFIDENCE_PERCENT,
  minMarginPoints: UNSURE_MIN_MARGIN_POINTS,
};

export function assessScanReliability(
  compositions: CompositionInput[] | null | undefined,
  thresholds: UnsureThresholds = DEFAULT_UNSURE_THRESHOLDS,
): ScanReliability {
  const ranked = [...(compositions ?? [])].sort((a, b) => b.percentage - a.percentage);
  if (ranked.length === 0) {
    return { reliable: true, reason: null, topPercent: 0, marginPoints: 0 };
  }

  const topPercent = ranked[0].percentage;
  const marginPoints = topPercent - (ranked[1]?.percentage ?? 0);

  if (topPercent < thresholds.minConfidencePercent) {
    return { reliable: false, reason: 'low_confidence', topPercent, marginPoints };
  }
  if (marginPoints < thresholds.minMarginPoints) {
    return { reliable: false, reason: 'close_call', topPercent, marginPoints };
  }
  return { reliable: true, reason: null, topPercent, marginPoints };
}

export const UNSURE_NOTICE = {
  title: 'Unsure about this fabric',
  lowConfidence:
    "The scan couldn't pick one fabric with enough confidence, so it isn't naming one. Try again closer to the threads with steady focus, or check the care tag.",
  closeCall:
    'Two fabrics scored too close together to call. Try again closer to the threads with steady focus, or check the care tag.',
} as const;

export const LOW_CONFIDENCE_WARNING = {
  title: 'Not sure about this result',
  message:
    'This result may not be accurate. Try moving closer so you can see the fabric threads clearly. A clip-on macro lens can help too.',
} as const;

// App display thresholds, not the FTC 5% labeling rule.
export const CLEAR_SHARE_MIN_PERCENT = 15;

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
