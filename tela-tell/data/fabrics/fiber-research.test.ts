import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import {
  FIBER_RESEARCH,
  RESEARCH_BANNER,
  RESEARCH_INSUFFICIENT,
  RESEARCH_SHEDDING_NOTE,
  getFiberResearch,
  getResearchClaims,
} from '@/data/fabrics/fiber-research';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';

const WITH_FINDINGS = ['Cotton', 'Wool', 'Rayon', 'Polyester', 'Nylon'] as const;
const INSUFFICIENT = ['Silk', 'Linen', 'Abaca', 'Acrylic', 'Spandex', 'Leather', 'Suede'] as const;

const allText = Object.values(FIBER_RESEARCH)
  .flat()
  .map((finding) => finding.text)
  .join(' ');

describe('"What research says" fiber findings', () => {
  it('covers all 12 fibers, with findings for five and "insufficient evidence" for the other seven', () => {
    expect(Object.keys(FIBER_RESEARCH).sort()).toEqual([...SUPPORTED_FABRICS].sort());
    for (const fabric of WITH_FINDINGS) {
      expect(getFiberResearch(fabric).length).toBeGreaterThan(0);
    }
    for (const fabric of INSUFFICIENT) {
      expect(getFiberResearch(fabric)).toEqual([]);
    }
    expect(RESEARCH_INSUFFICIENT).toBe('Insufficient evidence in our current sources.');
  });

  it('gives every finding a source that exists in the registry and has a reference number', () => {
    for (const finding of Object.values(FIBER_RESEARCH).flat()) {
      expect(finding.sourceIds.length).toBeGreaterThan(0);
      expect(findUnknownSourceIds(finding.sourceIds)).toEqual([]);
      for (const id of finding.sourceIds) {
        expect(getSourceNumber(id)).toBeGreaterThan(0);
      }
    }
  });

  it('labels each finding "full text" or "abstract only" to match what the source entry says was read', () => {
    for (const finding of Object.values(FIBER_RESEARCH).flat()) {
      const notes = finding.sourceIds.map((id) => getSource(id)!.caveats.join(' '));
      const expected = finding.evidence === 'full text' ? /Full text read\./ : /Only the abstract could be read\./;
      for (const note of notes) {
        expect(note).toMatch(expected);
      }
    }
  });

  it('states the test conditions in every composting finding and says it is not home compost, landfill or nature', () => {
    const composting = Object.values(FIBER_RESEARCH)
      .flat()
      .filter((finding) => finding.sourceIds.includes('collie-2024'));
    // Wool, rayon, polyester and nylon each have one composting finding.
    expect(composting.length).toBe(4);
    for (const finding of composting) {
      expect(finding.text).toMatch(/industrial-composting test \(shredded fabric, 58 °C, 181 days\)/);
      expect(finding.text).toMatch(/not home compost, landfill or nature/);
    }
  });

  it('matches the numbers in the Collie 2024 source entry', () => {
    const says = getSource('collie-2024')!.says.join(' ');
    expect(says).toMatch(/about 83% for viscose rayon, 68% for machine-washable wool and 48% for untreated wool/);
    expect(says).toMatch(/Nylon \(polyamide\) reached about 2% and polyester about 0%/);
    const text = (fabric: (typeof WITH_FINDINGS)[number]) =>
      getFiberResearch(fabric).map((finding) => finding.text).join(' ');
    expect(text('Wool')).toMatch(/about 48% .*untreated wool and about 68% in machine-washable wool/);
    expect(text('Rayon')).toMatch(/about 83% of the carbon in viscose rayon/);
    expect(text('Nylon')).toMatch(/about 2% biodegradation/);
    expect(text('Polyester')).toMatch(/no biodegradation \(about 0%\)/);
  });

  it('matches the numbers in the Zambrano 2020 source entry for the water tests', () => {
    expect(getSource('zambrano-2020')!.says.join(' ')).toMatch(
      /more than 70% biodegradation in activated sludge and lake water, and about 50% in seawater\. Polyester did not appreciably degrade/,
    );
    for (const fabric of ['Cotton', 'Rayon'] as const) {
      const water = getFiberResearch(fabric).find((finding) => finding.sourceIds.includes('zambrano-2020'))!;
      expect(water.text).toMatch(/more than 70% biodegradation in activated sludge and lake water and about 50% in seawater/);
      expect(water.text).toMatch(/shows potential under the tested conditions, not what happens in nature/);
    }
    const polyester = getFiberResearch('Polyester').find((finding) => finding.sourceIds.includes('zambrano-2020'))!;
    expect(polyester.text).toMatch(/did not appreciably degrade/);
  });

  it('never ranks fibers, calls one better, or describes a finished garment or its overall impact', () => {
    expect(allText).not.toMatch(/\b(better|worse|best|worst|greener|cleaner|sustainable|eco-?friendly|ranks?|ranking)\b/i);
    expect(allText).not.toMatch(/\b(your garment|garment's impact|overall impact)\b/i);
  });

  it('puts no percentage anywhere except the ones the sources report', () => {
    const percentages = allText.match(/\d+(\.\d+)?%/g) ?? [];
    const allowed = new Set(['70%', '50%', '48%', '68%', '83%', '2%', '0%']);
    for (const value of percentages) {
      expect(allowed.has(value)).toBe(true);
    }
  });

  it('says these are lab results, not a garment, and that breakdown is not shedding', () => {
    expect(RESEARCH_BANNER).toMatch(/specific lab studies/);
    expect(RESEARCH_BANNER).toMatch(/not a finished garment/);
    expect(RESEARCH_BANNER).toMatch(/do not show what happens in the environment/);
    expect(RESEARCH_SHEDDING_NOTE).toMatch(/not the same as fiber shedding/);
  });

  it('gives the source sheet one sourced fact per finding, and none for a fiber with no evidence', () => {
    expect(getResearchClaims('Wool')).toHaveLength(getFiberResearch('Wool').length);
    for (const claim of getResearchClaims('Rayon')) {
      expect(claim.kind).toBe('fact');
      expect((claim.sourceIds ?? []).length).toBeGreaterThan(0);
    }
    expect(getResearchClaims('Silk')).toEqual([]);
  });

  it('uses no crop-water figures, recycling statistics, or carbon values', () => {
    expect(allText).not.toMatch(/litre|liter|\bL\/kg|water footprint|recycl|landfilled|carbon footprint|CO2e|emission/i);
  });
});
