import {
  getFiberHealthRiskLabel,
  getFiberHealthRiskLevel,
  getSyntheticHealthRisk,
  HEALTH_RISK_DISCLAIMER,
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
    expect(getFiberHealthRiskLabel('Cotton')).toBe('No risk');
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

  it('takes the highest risk level among detected synthetic fibers', () => {
    const result = getSyntheticHealthRisk('Polyester', [
      { material: 'Nylon', percentage: 55 },
      { material: 'Polyester', percentage: 45 },
    ]);

    expect(result?.level).toBe('high');
    expect(result?.fibers).toEqual(expect.arrayContaining(['Nylon', 'Polyester']));
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

  it('always includes the health-risk disclaimer', () => {
    const result = getSyntheticHealthRisk('Polyester', []);
    expect(result?.disclaimer).toBe(HEALTH_RISK_DISCLAIMER);
  });
});
