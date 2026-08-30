import {
  CONFIDENCE_HIGH_THRESHOLD,
  CONFIDENCE_LOW_THRESHOLD,
  getConfidenceLabel,
  getConfidenceLevel,
  getSignificantFibers,
  isBlendDetected,
} from '@/data/scans/scan-confidence';

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

describe('isBlendDetected', () => {
  it('is false with fewer than two significant fibers', () => {
    expect(isBlendDetected([{ material: 'Cotton', percentage: 90 }])).toBe(false);
    expect(
      isBlendDetected([
        { material: 'Cotton', percentage: 90 },
        { material: 'Polyester', percentage: 5 },
      ]),
    ).toBe(false);
  });

  it('is true with two or more significant fibers', () => {
    expect(
      isBlendDetected([
        { material: 'Cotton', percentage: 60 },
        { material: 'Polyester', percentage: 40 },
      ]),
    ).toBe(true);
  });
});
