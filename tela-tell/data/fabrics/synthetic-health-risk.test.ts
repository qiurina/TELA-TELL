import {
  getPredictedSyntheticFibers,
  getFiberHealthRiskLabel,
  getFiberHealthRiskLevel,
  getSyntheticHealthRisk,
} from '@/data/fabrics/synthetic-health-risk';

describe('getFiberHealthRiskLevel', () => {
  it('is low for non-synthetic fibers', () => {
    expect(getFiberHealthRiskLevel('Cotton')).toBe('low');
    expect(getFiberHealthRiskLevel('Rayon')).toBe('low');
  });

  it('matches the documented risk level per synthetic fiber', () => {
    expect(getFiberHealthRiskLevel('Polyester')).toBe('high');
    expect(getFiberHealthRiskLevel('Acrylic')).toBe('high');
    expect(getFiberHealthRiskLevel('Nylon')).toBe('moderate');
    expect(getFiberHealthRiskLevel('Spandex')).toBe('moderate');
  });
});

describe('getFiberHealthRiskLabel', () => {
  it('reports no risk for non-synthetic fibers', () => {
    expect(getFiberHealthRiskLabel('Cotton')).toBe('Not synthetic');
  });

  it('labels synthetic fibers by their risk level', () => {
    expect(getFiberHealthRiskLabel('Polyester')).toBe('High');
    expect(getFiberHealthRiskLabel('Nylon')).toBe('Moderate');
  });
});

describe('getSyntheticHealthRisk', () => {
  it('returns null when nothing synthetic is detected', () => {
    const result = getSyntheticHealthRisk('Cotton', [
      { material: 'Cotton', percentage: 80 },
      { material: 'Linen', percentage: 20 },
    ]);

    expect(result).toBeNull();
  });

  it('falls back to the dominant fabric when no composition is significant enough', () => {
    const result = getSyntheticHealthRisk('Polyester', []);

    expect(result).not.toBeNull();
    expect(result?.fibers).toEqual(['Polyester']);
    expect(result?.syntheticPercent).toBe(100);
  });

  it('follows the most likely fiber, not the highest level among the predictions', () => {
    const result = getSyntheticHealthRisk('Nylon', [
      { material: 'Nylon', percentage: 55 },
      { material: 'Polyester', percentage: 45 },
    ]);

    expect(result?.level).toBe('moderate');
    expect(result?.fibers).toEqual(['Nylon']);
  });

  it('returns null when the most likely fiber is not synthetic, even if a synthetic is predicted lower', () => {
    expect(
      getSyntheticHealthRisk('Cotton', [
        { material: 'Cotton', percentage: 60 },
        { material: 'Polyester', percentage: 35 },
      ]),
    ).toBeNull();
  });

  it('sums only the synthetic share into syntheticPercent', () => {
    const result = getSyntheticHealthRisk('Polyester', [
      { material: 'Polyester', percentage: 60 },
      { material: 'Cotton', percentage: 40 },
    ]);

    expect(result?.syntheticPercent).toBe(60);
  });

  it('adds a garment-condition tip when the garment is damaged', () => {
    const withoutCondition = getSyntheticHealthRisk('Polyester', []);
    const withDamaged = getSyntheticHealthRisk('Polyester', [], 'Damaged');

    expect(withDamaged?.tips.length).toBe((withoutCondition?.tips.length ?? 0) + 1);
    expect(withDamaged?.tips.at(-1)).toMatch(/frayed|torn/i);
  });

  it('gives the scan its own reason, and an (i) sheet with the limits', () => {
    const result = getSyntheticHealthRisk('Polyester', []);
    expect(result?.reason).toMatch(/polyester clothes can release tiny plastic fibers during washing/);
    expect(result?.disclaimer.map((section) => section.heading)).toEqual(['What this result means', 'Keep in mind']);
    expect(result?.disclaimer[1].body).toMatch(/does not assess health effects/);
  });
});

describe('getPredictedSyntheticFibers', () => {
  it('lists every predicted synthetic, most likely first, so a possible synthetic can still be flagged', () => {
    expect(
      getPredictedSyntheticFibers('Cotton', [
        { material: 'Cotton', percentage: 60 },
        { material: 'Polyester', percentage: 35 },
        { material: 'Nylon', percentage: 5 },
      ]),
    ).toEqual(['Polyester', 'Nylon']);
    expect(getPredictedSyntheticFibers('Cotton', [{ material: 'Cotton', percentage: 90 }])).toEqual([]);
    expect(getPredictedSyntheticFibers('Polyester', [])).toEqual(['Polyester']);
  });
});
