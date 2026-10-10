import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import { BLEND_CAUTION_FIBERS, getBlendCaution } from '@/data/fabrics/blend-caution';

const clear = (fiber: string) => [
  { material: fiber, percentage: 88 },
  { material: 'Linen', percentage: 12 },
];

describe('getBlendCaution', () => {
  it.each(['Cotton', 'Linen', 'Rayon', 'Wool'])('shows the note for a clear %s result', (fiber) => {
    const caution = getBlendCaution(fiber, clear(fiber));
    expect(caution).not.toBeNull();
    expect(caution?.title).toMatch(/blends/i);
  });

  it('applies to exactly Cotton, Linen, Rayon and Wool', () => {
    expect([...BLEND_CAUTION_FIBERS].sort()).toEqual(['Cotton', 'Linen', 'Rayon', 'Wool']);
    for (const fiber of SUPPORTED_FABRICS) {
      const expected = ['Cotton', 'Linen', 'Rayon', 'Wool'].includes(fiber);
      expect(getBlendCaution(fiber, clear(fiber)) !== null).toBe(expected);
    }
  });

  it('is hidden for an Unsure scan, for low confidence and for a close call', () => {
    expect(
      getBlendCaution('Cotton', [
        { material: 'Cotton', percentage: 45 },
        { material: 'Rayon', percentage: 35 },
        { material: 'Linen', percentage: 20 },
      ]),
    ).toBeNull();
    expect(
      getBlendCaution('Wool', [
        { material: 'Wool', percentage: 59 },
        { material: 'Acrylic', percentage: 41 },
      ]),
    ).toBeNull();
  });

  it('shows at exactly the confidence floor (a reliable scan)', () => {
    expect(
      getBlendCaution('Cotton', [
        { material: 'Cotton', percentage: 60 },
        { material: 'Linen', percentage: 40 },
      ]),
    ).not.toBeNull();
  });

  it('is a neutral limitation: it claims nothing about shedding, health, or how common blends are', () => {
    const { title, message, pill } = getBlendCaution('Cotton', clear('Cotton'))!;
    const text = `${title} ${message} ${pill}`.toLowerCase();
    expect(text).toMatch(/care tag/);
    expect(text).toMatch(/cannot see a blend/);
    for (const forbidden of ['shed', 'microplastic', 'health', 'polyester', '%', 'common', 'often', 'many', 'usually']) {
      expect(text).not.toContain(forbidden);
    }
  });

  it('copes with missing compositions (older rows) by treating the scan as reliable', () => {
    expect(getBlendCaution('Cotton', undefined)).not.toBeNull();
    expect(getBlendCaution('Polyester', [])).toBeNull();
  });

  it('ignores names it cannot resolve', () => {
    expect(getBlendCaution('Mystery blend', clear('Cotton'))).toBeNull();
  });
});
