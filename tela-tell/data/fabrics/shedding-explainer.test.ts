import {
  SHEDDING_EXPLAINER_FOOTNOTE,
  SHEDDING_EXPLAINER_INTRO,
  SHEDDING_EXPLAINER_SECTIONS,
  SHEDDING_EXPLAINER_TITLE,
  SHEDDING_REFERENCES_HEADING,
  SHEDDING_REFERENCE_IDS,
} from '@/data/fabrics/shedding-explainer';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';
import { getFiberHealthRiskLevel } from '@/data/fabrics/synthetic-health-risk';

const HEALTH_WORDS =
  /health|harm|disease|toxic|cancer|\blungs?\b|inhal|breath|\bskin\b|allerg|asthma|blood|cell|irritat|hazard|danger|safe\b|risk/i;

const section = (heading: string) => SHEDDING_EXPLAINER_SECTIONS.find((item) => item.heading === heading)!;
const text = (heading: string) =>
  section(heading)
    .items.map((item) => item.text)
    .join(' ');

describe('shedding explainer page', () => {
  it('is organized under the requested headings', () => {
    expect(SHEDDING_EXPLAINER_TITLE).toBe('Why synthetics shed');
    expect(SHEDDING_EXPLAINER_SECTIONS.map((item) => item.heading)).toEqual([
      'Why fabrics shed',
      'What affects shedding',
      'What studies found',
      'What the estimate means',
    ]);
    expect(SHEDDING_REFERENCES_HEADING).toBe('References');
  });

  it('explains why fabrics shed and says natural fibers can shed too', () => {
    expect(text('Why fabrics shed')).toMatch(/Washing, drying and wearing can pull tiny fibers loose/);
    expect(text('Why fabrics shed')).toMatch(/plastic-based fibers/);
    expect(text('Why fabrics shed')).toMatch(/Natural fibers like cotton and wool can shed fibers too, and in some of the fabrics and conditions tested, cotton released as much or more fiber by weight than polyester\. That is not a ranking, and cotton and wool fibers are not plastic/);
    expect(text('Why fabrics shed')).toMatch(/Three things are separate: how much fiber a fabric sheds, what the fibers are made of, and how long they last in the environment\. Fiber weight alone does not show plastic pollution or environmental impact/);
    expect(text('Why fabrics shed')).toMatch(/cotton and rayon yarns biodegraded under the conditions tested \(about 50% in seawater, over 70% in lake water and sludge\) while polyester did not appreciably degrade\. The authors say this shows potential, not what happens in every environment/);
  });

  it('says what affects shedding without calling a result a rule, and that studies disagree on wear', () => {
    const affects = text('What affects shedding');
    expect(affects).toMatch(/In the studies, some thick fabrics and some loosely knitted \(open, stretchy\) fabrics, such as fleece/);
    expect(affects).toMatch(/Fuller loads and cycles that use less water for the load released fewer fibers/);
    expect(affects).toMatch(/hotter water increased release from knitted cotton, rayon and polyester fabrics/);
    expect(affects).toMatch(/Studies differ on whether worn clothes shed more\. In real-use studies, older garments and worn shirts released more fibers, while in one test a polyester fleece's release fell after repeated washing/);
  });

  it('keeps the detailed findings and their limits on this page', () => {
    const found = text('What studies found');
    expect(found).toMatch(/only some acrylic fabrics have been tested/);
    expect(found).toMatch(/woven nylon released fewer fibers than mostly polyester fleece, but the fabrics were made differently/);
    expect(found).toMatch(/In the tested cotton fabrics with spandex, all released tiny fibers during washing, and those with more spandex released more/);
    expect(found).toMatch(/Stretch fabrics usually contain about 2-10% spandex, and more in compression wear and shapewear\. That is a general range, not a measurement of your garment/);
    expect(found).toMatch(/Studies of fabrics that mix fibers disagree because they used different materials and methods/);
    // The cooler, shorter wash tip's limit is stated, and drying is not tied to heat.
    expect(found).toMatch(/changed the temperature and the wash time together, so they cannot say which one made the difference/);
    expect(found).toMatch(/A separate study found that hotter water increased release from knitted fabrics/);
    expect(found).toMatch(/Some of the fibers released were spandex/);
    expect(found).toMatch(/Its heat was not tested/);
  });

  it('says what the estimate means, including that confidence is not fiber content', () => {
    const means = text('What the estimate means');
    expect(means).toMatch(/shedding estimate follows it\. The prediction may be wrong/);
    expect(means).toMatch(/confidence percentage shows how sure the app is about its prediction\. It does not show how much of that fiber is in the garment/);
    expect(means).toMatch(/cannot see or measure how many tiny fibers your garment releases/);
    expect(means).toMatch(/lab tests of particular fabrics and washes/);
    expect(means).toMatch(/We did not find laundry studies on silk, linen, abaca, leather or suede in our current references, so they do not show how much these shed\. That is not evidence that they do not shed/);
    expect(means).toMatch(/some imitations contain synthetic polymers and the app cannot confirm whether a scanned material is genuine or imitation/);
    expect(means).toMatch(/High, Moderate and Low are the app's estimates based on selected studies, not an established scientific ranking/);
    expect(means).toMatch(/No study we checked compares all four fibers/);
    expect(means).toMatch(/makes no claim about health effects and is not medical advice/);
  });

  it('cites a source for every research statement, and all of them resolve to numbered references', () => {
    for (const heading of ['Why fabrics shed', 'What affects shedding', 'What studies found']) {
      for (const item of section(heading).items) {
        expect({ text: item.text, count: item.sourceIds?.length ?? 0 }).not.toEqual({ text: item.text, count: 0 });
        expect(findUnknownSourceIds(item.sourceIds)).toEqual([]);
        for (const id of item.sourceIds ?? []) {
          expect(getSourceNumber(id)).toBeGreaterThan(0);
        }
      }
    }
    // The estimate section is limits and definitions, not research claims.
    for (const item of section('What the estimate means').items) {
      expect(item.sourceIds).toBeUndefined();
    }
  });

  it('lists a References section with every study the page cites, plus the other shedding studies', () => {
    const cited = SHEDDING_EXPLAINER_SECTIONS.flatMap((item) => item.items.flatMap((entry) => entry.sourceIds ?? []));
    for (const id of cited) {
      expect(SHEDDING_REFERENCE_IDS).toContain(id);
    }
    expect(new Set(SHEDDING_REFERENCE_IDS).size).toBe(SHEDDING_REFERENCE_IDS.length);
    expect(SHEDDING_REFERENCE_IDS).toHaveLength(21);
    for (const id of SHEDDING_REFERENCE_IDS) {
      expect(getSource(id)).toBeDefined();
      expect(getSourceNumber(id)).toBeGreaterThan(0);
    }
    expect(SHEDDING_EXPLAINER_FOOTNOTE).toMatch(/References list on the About screen/);
  });

  it('puts figures nowhere except the spandex range and the biodegradation percentages', () => {
    const everything = [
      SHEDDING_EXPLAINER_INTRO,
      ...SHEDDING_EXPLAINER_SECTIONS.flatMap((item) => item.items.map((entry) => entry.text)),
    ].join(' ');
    expect(everything.replace(/2-10%|50%|70%/g, '')).not.toMatch(/\d/);
    expect(everything).not.toMatch(/\bmg\b|per kg|\[\d/);
  });

  it('makes no health claim; its only mention of health is to say the page makes none', () => {
    const outsideLimits = [
      SHEDDING_EXPLAINER_INTRO,
      ...SHEDDING_EXPLAINER_SECTIONS.filter((item) => item.heading !== 'What the estimate means').flatMap((item) =>
        item.items.map((entry) => entry.text),
      ),
    ].join(' ');
    expect(outsideLimits).not.toMatch(HEALTH_WORDS);
    const healthItems = section('What the estimate means').items.filter((item) => HEALTH_WORDS.test(item.text));
    expect(healthItems).toHaveLength(1);
    expect(healthItems[0].text).toMatch(/makes no claim about health effects and is not medical advice/);
  });

  it('keeps the shedding wording separate from the 2% confidence floor and from the existing levels', () => {
    const everything = SHEDDING_EXPLAINER_SECTIONS.flatMap((item) => item.items.map((entry) => entry.text)).join(' ');
    expect(everything).not.toMatch(/noise floor|trace/i);
    expect(getFiberHealthRiskLevel('Polyester')).toBe('high');
    expect(getFiberHealthRiskLevel('Acrylic')).toBe('high');
    expect(getFiberHealthRiskLevel('Nylon')).toBe('moderate');
    expect(getFiberHealthRiskLevel('Spandex')).toBe('moderate');
  });
});
