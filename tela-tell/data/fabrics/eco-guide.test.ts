import {
  ECO_GUIDE,
  ALTERNATIVE_OPTIONS,
  getExtraReduceTips,
  getReduceSteps,
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

  it('turns the tips into a checklist that never repeats a step the fiber tip already covers', () => {
    const polyester = getReduceSteps(ECO_GUIDE.Polyester, true);
    expect(polyester).toEqual([
      'Wash less, cold and gently',
      'Use a microfiber filter if available',
      'Air dry when suitable; avoid unnecessary rubbing',
      'Heavily fraying? Prefer textile take-back over making it a cleaning rag',
    ]);
    expect(polyester.filter((step) => /filter/i.test(step))).toHaveLength(1);
    const cotton = getReduceSteps(ECO_GUIDE.Cotton, false);
    expect(cotton.some((step) => /filter/.test(step))).toBe(true);
    expect(cotton.some((step) => /take-back/.test(step))).toBe(false);
  });

  it('has short alternative chips for every fiber, each naming a fabric from the guide alternative', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const options = ALTERNATIVE_OPTIONS[fabric];
      expect(options.length).toBeGreaterThan(0);
      for (const option of options) {
        const fabricName = option.split(' · ')[0].toLowerCase();
        expect(ECO_GUIDE[fabric].alternative.name.toLowerCase()).toContain(fabricName.split(',')[0]);
      }
    }
  });

  it('never says a natural or regenerated fiber sheds plastic microfibers', () => {
    for (const fabric of ['Cotton', 'Wool', 'Silk', 'Linen', 'Abaca'] as const) {
      expect(ECO_GUIDE[fabric].shedding).toMatch(/plastic microfibers: no, if pure/);
    }
    expect(ECO_GUIDE.Rayon.shedding).toMatch(/not polyester-type microplastics/);
  });
});
