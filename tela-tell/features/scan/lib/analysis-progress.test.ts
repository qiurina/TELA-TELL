import { analysisProgressFraction, analysisProgressLabel } from '@/features/scan/lib/analysis-progress';

describe('analysis progress', () => {
  it('only moves the bar forward through the stages', () => {
    const fractions = [
      analysisProgressFraction(null),
      analysisProgressFraction({ stage: 'loading_model' }),
      analysisProgressFraction({ stage: 'reading_photo', photo: 1, photos: 3 }),
      analysisProgressFraction({ stage: 'reading_photo', photo: 2, photos: 3 }),
      analysisProgressFraction({ stage: 'reading_photo', photo: 3, photos: 3 }),
      analysisProgressFraction({ stage: 'saving' }),
    ];
    for (let i = 1; i < fractions.length; i += 1) {
      expect(fractions[i]).toBeGreaterThan(fractions[i - 1]);
    }
    // The bar never reads as full before the results open.
    expect(fractions[fractions.length - 1]).toBeLessThan(1);
  });

  it('counts photos only for a burst', () => {
    expect(analysisProgressLabel({ stage: 'reading_photo', photo: 2, photos: 3 })).toBe(
      'Reading the fibers · photo 2 of 3',
    );
    expect(analysisProgressLabel({ stage: 'reading_photo', photo: 1, photos: 1 })).toBe('Reading the fibers…');
    expect(analysisProgressLabel(null)).toBe('Preparing the fiber model…');
    expect(analysisProgressLabel({ stage: 'saving' })).toBe('Saving your scan…');
  });
});
