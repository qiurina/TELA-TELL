import {
  getScanResultHeadline,
  getUnsureHeadline,
} from '@/features/results/lib/scan-result-headline';

describe('getUnsureHeadline', () => {
  it('names no fiber as the answer and lists the two closest candidates', () => {
    const headline = getUnsureHeadline([
      { material: 'Rayon', percentage: 30 },
      { material: 'Cotton', percentage: 45 },
      { material: 'Linen', percentage: 25 },
    ]);
    expect(headline.title).toBe('Unsure');
    expect(headline.title).not.toMatch(/Likely/);
    expect(headline.subtitle).toBe('Closest: Cotton 45% · Rayon 30%');
  });

  it('handles a single candidate and an empty list', () => {
    expect(getUnsureHeadline([{ material: 'Cotton', percentage: 40 }]).subtitle).toBe(
      'Closest: Cotton 40%',
    );
    expect(getUnsureHeadline([])).toEqual({ title: 'Unsure', subtitle: undefined });
  });
});

describe('getScanResultHeadline', () => {
  it('still names the most likely fiber for a normal scan', () => {
    expect(getScanResultHeadline('Cotton', [{ material: 'Cotton', percentage: 82 }])).toEqual({
      title: 'Likely Cotton',
      subtitle: '82% confidence',
    });
  });
});
