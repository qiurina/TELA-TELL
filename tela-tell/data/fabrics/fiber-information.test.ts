import {
  FIBER_INFORMATION_SHEET,
  FIBER_INFORMATION_TITLE,
  FIBER_SHEDDING_INFO,
  getFiberInformation,
} from '@/data/fabrics/shedding-why';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import { getSourceNumber } from '@/data/fabrics/source-registry';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';

const NATURAL_AND_OTHER = ['Cotton', 'Wool', 'Silk', 'Linen', 'Rayon', 'Leather', 'Suede', 'Abaca'] as const;
const RATED = ['Polyester', 'Acrylic', 'Nylon', 'Spandex'] as const;

describe('Results information card for natural and other non-rated fibers', () => {
  it('shows information for each of the eight fibers without a rating, and for no other', () => {
    for (const fabric of NATURAL_AND_OTHER) {
      const info = getFiberInformation(fabric);
      expect(info?.fabric).toBe(fabric);
      expect(info?.text).toBe(FIBER_SHEDDING_INFO[fabric].text);
    }
    for (const fabric of RATED) {
      expect(getFiberInformation(fabric)).toBeNull();
    }
    expect(getFiberInformation('Not a fabric')).toBeNull();
    expect(getFiberInformation('')).toBeNull();
  });

  it('is shown for exactly the fibers that do not get the rated card, so every classified fiber gets one or the other', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const rated = getSyntheticHealthRisk(fabric, []);
      const info = getFiberInformation(fabric);
      expect({ fabric, shown: Boolean(rated) !== Boolean(info) }).toEqual({ fabric, shown: true });
    }
  });

  it('keeps the rated card and its levels for the four synthetic fibers', () => {
    expect(getSyntheticHealthRisk('Polyester', [])?.label).toBe('High');
    expect(getSyntheticHealthRisk('Acrylic', [])?.label).toBe('High');
    expect(getSyntheticHealthRisk('Nylon', [])?.label).toBe('Moderate');
    expect(getSyntheticHealthRisk('Spandex', [])?.label).toBe('Moderate');
  });

  it('uses a neutral title and has no High, Moderate or Low level', () => {
    expect(FIBER_INFORMATION_TITLE).toBe('Fiber information');
    for (const fabric of NATURAL_AND_OTHER) {
      const text = getFiberInformation(fabric)!.text;
      expect(FIBER_SHEDDING_INFO[fabric].value).toBe('Not rated');
      expect(text).not.toMatch(/\b(High|Moderate|Low)\b/);
    }
  });

  it('says it is based on the predicted fiber, which may be wrong, and that the app does not detect or measure microplastics', () => {
    const [means, keep] = FIBER_INFORMATION_SHEET;
    expect(means.heading).toBe('What this means');
    expect(means.body).toBe(
      'This information is based on the fiber the app predicts is most likely, which may be wrong. The app cannot detect or measure microplastics or the fibers your garment releases.',
    );
    expect(keep.heading).toBe('Keep in mind');
    expect(keep.body).toMatch(/A blend can release plastic fibers even if it is mostly natural/);
  });

  it('cites numbered references for the fibers with studies, and none for the fibers without', () => {
    for (const fabric of ['Cotton', 'Wool', 'Rayon'] as const) {
      const info = getFiberInformation(fabric)!;
      expect(info.sourceIds.length).toBeGreaterThan(0);
      for (const id of info.sourceIds) {
        expect(getSourceNumber(id)).toBeGreaterThan(0);
      }
    }
    for (const fabric of ['Silk', 'Linen', 'Abaca', 'Leather', 'Suede'] as const) {
      expect(getFiberInformation(fabric)!.sourceIds).toEqual([]);
    }
  });

  it('is short enough for a phone card: at most four sentences and about 600 characters', () => {
    for (const fabric of NATURAL_AND_OTHER) {
      const text = getFiberInformation(fabric)!.text;
      expect(text.split(/(?<=[.!?])\s+/).length).toBeLessThanOrEqual(4);
      expect(text.length).toBeLessThan(600);
    }
  });
});
