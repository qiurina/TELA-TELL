import {
  ECO_GUIDE,
  getExtraReduceTips,
  GUIDE_SOURCES,
  getGuideSources,
  type GuideSourceId,
} from '@/data/fabrics/eco-guide';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

describe('Microplastics & Sustainable Choices Guide data', () => {
  it('has a complete entry for every supported fiber', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const guide = ECO_GUIDE[fabric];
      expect(guide.classification).not.toBe('');
      expect(guide.shedding).not.toBe('');
      expect(guide.reduceShedding).not.toBe('');
      expect(guide.alternative.name).not.toBe('');
      expect(guide.alternative.reason).not.toBe('');
      expect(guide.reuse).not.toBe('');
      expect(guide.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it('resolves every cited source to a bibliography entry with an https link', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      for (const source of getGuideSources(ECO_GUIDE[fabric].sourceIds)) {
        expect(source).toBeDefined();
        expect(source.url).toMatch(/^https:\/\//);
      }
    }
    const ids = Object.keys(GUIDE_SOURCES) as GuideSourceId[];
    expect(ids).toHaveLength(21);
    for (const id of ids) {
      expect(GUIDE_SOURCES[id].id).toBe(id);
    }
  });

  it('adds the filter and air-dry tips for every fiber, and the take-back tip only for synthetics', () => {
    expect(getExtraReduceTips(false)).toHaveLength(2);
    expect(getExtraReduceTips(true)).toHaveLength(3);
    expect(getExtraReduceTips(false).join(' ')).not.toMatch(/synthetic/i);
    expect(getExtraReduceTips(true).join(' ')).toMatch(/textile take-back/);
  });

  it('never says a natural or regenerated fiber sheds plastic microfibers', () => {
    for (const fabric of ['Cotton', 'Wool', 'Silk', 'Linen', 'Abaca'] as const) {
      expect(ECO_GUIDE[fabric].shedding).toMatch(/plastic microfibers: no, if pure/);
    }
    expect(ECO_GUIDE.Rayon.shedding).toMatch(/not polyester-type microplastics/);
  });
});
