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

// "UNSURE" OUTCOME. When the scan cannot name one fiber reliably, the app says "Unsure" instead of
// presenting the top guess as a finding. Two independent checks, both on the integer percentages
// the model produces (after the burst average):
//  - low_confidence: the top fiber is below UNSURE_MIN_CONFIDENCE_PERCENT. This reuses the
//    existing "low confidence" boundary (60) instead of adding a new number. Basis, from the
//    bundled model on the held-out validation/test splits (ml-training/results/calibration/
//    calibration_analysis_2026-10-10.txt): images the model scored under 60% were right half
//    the time or less (val 25-51%, test 0-55% across the bins below 0.6), and flagging them as
//    unsure removes about 40% of all wrong predictions (val 43%, test 40%) at a cost of about
//    7.5% of scans.
//  - close_call: the gap between the top two fibers is under UNSURE_MIN_MARGIN_POINTS. 20 is a
//    value the validation table covers on its own (a margin rule with no floor flags about
//    4.5-4.7% of images and catches 22-30% of the errors). It is also the largest gap the 60%
//    floor already guarantees (a top fiber at 60% or more leaves the runner-up at 40% or less),
//    so with today's floor this check cannot fire by itself; it only matters if the team lowers
//    the floor or raises the margin. Checked on the rounded percentages the app shows: of the
//    1,497 validation and 1,426 test images, none had a top fiber at 60% or more and a gap under
//    20, so the margin rule currently catches no extra errors. Raising it to 25-30 would add only
//    2-3 caught errors per split; raising it to 40 adds 11-18 but flags 16-19 more correct
//    predictions too (about half of what it flags is right).
// These numbers come from in-distribution validation data. They are PROVISIONAL, pending team
// approval and on-device checks, and they cannot catch a confidently wrong answer: about 30% of
// the model's wrong test predictions were scored 75% or higher. Calibration does not make a
// prediction correct.
export const UNSURE_MIN_CONFIDENCE_PERCENT = CONFIDENCE_LOW_THRESHOLD;
export const UNSURE_MIN_MARGIN_POINTS = 20;

export type UnsureReason = 'low_confidence' | 'close_call';

export type ScanReliability = {
  /** False means the scan should be shown as "Unsure" rather than as a fiber finding. */
  reliable: boolean;
  reason: UnsureReason | null;
  /** The top fiber's share, 0 when there are no compositions. */
  topPercent: number;
  /** Top share minus the runner-up's (the runner-up counts as 0 when there is none). */
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

/**
 * Decides whether a scan's top-3 is trustworthy enough to name a fiber. A scan with no
 * compositions (nothing to judge) is left as reliable so legacy rows never change meaning.
 */
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
  /** Shown where the shedding and sustainable-choices cards would be. */
  fiberDetails: {
    title: 'Fiber details not shown',
    pill: 'Unsure',
    message:
      "Shedding and fiber details depend on knowing the fiber, and this scan couldn't identify it reliably. Check the care label for the fiber content, or scan again.",
  },
} as const;

export const LOW_CONFIDENCE_WARNING = {
  title: 'Not sure about this result',
  message:
    'This result may not be accurate. Try moving closer so you can see the fabric threads clearly. A clip-on macro lens can help too.',
} as const;

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
// carve-out: that number exists to reduce a manufacturer's disclosure burden, and it answers a
// labeling-compliance question, not the question this floor answers. This value itself is a
// practical ML-noise floor (is this a real detection or model artifact) applied to the model's
// CONFIDENCE percentages, which are not fiber proportions. It is the same category of number as
// the confidence thresholds above: not a cited scientific threshold, and no shedding study sets
// or supports it. (Studies of physical fiber content, such as a cotton/elastane study in which a
// 2% elastane knit still released microfibers, are context only; see the notes in
// synthetic-health-risk.ts and docs/shedding-evidence-2026-10-10.md.)
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
