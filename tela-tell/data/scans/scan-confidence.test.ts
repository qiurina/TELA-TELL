import {
  assessScanReliability,
  CONFIDENCE_HIGH_THRESHOLD,
  CONFIDENCE_LOW_THRESHOLD,
  DEFAULT_UNSURE_THRESHOLDS,
  getConfidenceLabel,
  getConfidenceLevel,
  getSignificantFibers,
  UNSURE_MIN_CONFIDENCE_PERCENT,
  UNSURE_MIN_MARGIN_POINTS,
  UNSURE_NOTICE,
} from '@/data/scans/scan-confidence';

describe('assessScanReliability', () => {
  it('is reliable for a clear top fiber', () => {
    const result = assessScanReliability([
      { material: 'Cotton', percentage: 82 },
      { material: 'Linen', percentage: 12 },
      { material: 'Rayon', percentage: 6 },
    ]);
    expect(result).toEqual({ reliable: true, reason: null, topPercent: 82, marginPoints: 70 });
  });

  it('is unsure when the top fiber is below the confidence floor, which is the existing low tier', () => {
    expect(UNSURE_MIN_CONFIDENCE_PERCENT).toBe(CONFIDENCE_LOW_THRESHOLD);

    const result = assessScanReliability([
      { material: 'Cotton', percentage: UNSURE_MIN_CONFIDENCE_PERCENT - 1 },
      { material: 'Linen', percentage: 20 },
      { material: 'Rayon', percentage: 21 },
    ]);
    expect(result.reliable).toBe(false);
    expect(result.reason).toBe('low_confidence');
    // The compositions are not required to arrive sorted.
    expect(result.topPercent).toBe(UNSURE_MIN_CONFIDENCE_PERCENT - 1);
  });

  it('treats exactly the confidence floor as reliable', () => {
    const result = assessScanReliability([
      { material: 'Cotton', percentage: UNSURE_MIN_CONFIDENCE_PERCENT },
      { material: 'Linen', percentage: 100 - UNSURE_MIN_CONFIDENCE_PERCENT },
    ]);
    expect(result.reliable).toBe(true);
  });

  it('is unsure when the top two fibers are too close, even above the floor', () => {
    // With the shipped thresholds a close call cannot happen above the 60% floor (see the note in
    // scan-confidence.ts), so this exercises the margin check with a lower floor.
    const lowFloor = { ...DEFAULT_UNSURE_THRESHOLDS, minConfidencePercent: 30 };
    const result = assessScanReliability(
      [
        { material: 'Cotton', percentage: 40 },
        { material: 'Rayon', percentage: 35 },
        { material: 'Linen', percentage: 25 },
      ],
      lowFloor,
    );
    expect(result).toMatchObject({ reliable: false, reason: 'close_call', marginPoints: 5 });
  });

  it('with the shipped thresholds, the margin check alone never fires above the floor', () => {
    // The worst case at the floor: top at the minimum, runner-up taking everything else.
    const worst = assessScanReliability([
      { material: 'Cotton', percentage: UNSURE_MIN_CONFIDENCE_PERCENT },
      { material: 'Rayon', percentage: 100 - UNSURE_MIN_CONFIDENCE_PERCENT },
    ]);
    expect(worst.marginPoints).toBeGreaterThanOrEqual(UNSURE_MIN_MARGIN_POINTS);
    expect(worst.reliable).toBe(true);
  });

  it('reports the low-confidence reason first when both checks would fail', () => {
    const result = assessScanReliability([
      { material: 'Cotton', percentage: 34 },
      { material: 'Rayon', percentage: 33 },
      { material: 'Linen', percentage: 33 },
    ]);
    expect(result.reason).toBe('low_confidence');
  });

  it('counts a missing runner-up as 0, so a lone high-confidence fiber is reliable', () => {
    expect(assessScanReliability([{ material: 'Cotton', percentage: 90 }])).toMatchObject({
      reliable: true,
      marginPoints: 90,
    });
  });

  it('leaves a scan with no compositions reliable, so old or empty rows never change meaning', () => {
    expect(assessScanReliability([]).reliable).toBe(true);
    expect(assessScanReliability(undefined).reliable).toBe(true);
    expect(assessScanReliability(null).reliable).toBe(true);
  });

  it('explains, where fiber-dependent details are hidden, why and what to do', () => {
    const { message } = UNSURE_NOTICE.fiberDetails;
    expect(message).not.toMatch(/sustainab/i);
    expect(message).toMatch(/shedding/i);
    expect(message).toMatch(/couldn't identify it reliably/);
    expect(message).toMatch(/care label/);
  });

  it('does not mutate its input', () => {
    const input = [
      { material: 'Rayon', percentage: 20 },
      { material: 'Cotton', percentage: 50 },
    ];
    const copy = input.map((item) => ({ ...item }));
    assessScanReliability(input);
    expect(input).toEqual(copy);
  });
});

describe('getConfidenceLevel', () => {
  it('returns high at and above the high threshold', () => {
    expect(getConfidenceLevel(CONFIDENCE_HIGH_THRESHOLD)).toBe('high');
    expect(getConfidenceLevel(100)).toBe('high');
  });

  it('returns moderate between the low and high thresholds', () => {
    expect(getConfidenceLevel(CONFIDENCE_HIGH_THRESHOLD - 1)).toBe('moderate');
    expect(getConfidenceLevel(CONFIDENCE_LOW_THRESHOLD)).toBe('moderate');
  });

  it('returns low below the low threshold', () => {
    expect(getConfidenceLevel(CONFIDENCE_LOW_THRESHOLD - 1)).toBe('low');
    expect(getConfidenceLevel(0)).toBe('low');
  });
});

describe('getConfidenceLabel', () => {
  it('labels each confidence level', () => {
    expect(getConfidenceLabel(90)).toBe('High confidence');
    expect(getConfidenceLabel(65)).toBe('Moderate confidence');
    expect(getConfidenceLabel(10)).toBe('Low confidence');
  });
});

describe('getSignificantFibers', () => {
  it('drops fibers below the minimum percent and sorts by percent descending', () => {
    const result = getSignificantFibers([
      { material: 'Cotton', percentage: 40 },
      { material: 'Polyester', percentage: 10 },
      { material: 'Rayon', percentage: 50 },
    ]);

    expect(result).toEqual([
      { material: 'Rayon', percentage: 50 },
      { material: 'Cotton', percentage: 40 },
    ]);
  });

  it('respects a custom minimum percent', () => {
    const compositions = [
      { material: 'Cotton', percentage: 60 },
      { material: 'Polyester', percentage: 20 },
    ];

    expect(getSignificantFibers(compositions, 25)).toEqual([
      { material: 'Cotton', percentage: 60 },
    ]);
  });

  it('does not mutate the input array', () => {
    const compositions = [
      { material: 'Cotton', percentage: 40 },
      { material: 'Rayon', percentage: 50 },
    ];
    const original = [...compositions];

    getSignificantFibers(compositions);

    expect(compositions).toEqual(original);
  });
});

