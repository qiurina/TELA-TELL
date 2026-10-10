import { getEnvironmentalSummary } from '@/features/fabrics/lib/fiber-profile-insights';
import { FIBER_PROFILES } from '@/data/fabrics/fiber-profiles';
import { SUPPORTED_FABRICS, type SupportedFabric } from '@/data/fabrics/fabrics';
import { SHEDDING_BASIS_CLAIMS } from '@/data/fabrics/shedding-basis';
import {
  FIBER_SHEDDING_INFO,
  FIBER_SHEDDING_KEEP_IN_MIND,
  getFiberSheddingSheet,
} from '@/data/fabrics/shedding-why';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';
import { getFiberHealthRiskLabel, getFiberHealthRiskLevel } from '@/data/fabrics/synthetic-health-risk';

const NEW_IDS = ['zambrano-2019', 'zambrano-2020', 'fernandes-2024', 'lara-2025', 'cotton-2020', 'gundogdu-2026'] as const;

const info = (fabric: SupportedFabric) => FIBER_SHEDDING_INFO[fabric];

describe('shedding information for all 12 classified fibers', () => {
  it('has a description for every classified fiber', () => {
    expect(Object.keys(FIBER_SHEDDING_INFO).sort()).toEqual([...SUPPORTED_FABRICS].sort());
    for (const fabric of SUPPORTED_FABRICS) {
      expect(info(fabric).text.length).toBeGreaterThan(40);
    }
  });

  it('keeps the existing High / Moderate levels for the four synthetic fibers and rates nothing else', () => {
    expect(info('Polyester').value).toBe('High');
    expect(info('Acrylic').value).toBe('High');
    expect(info('Nylon').value).toBe('Moderate');
    expect(info('Spandex').value).toBe('Moderate');
    for (const fabric of ['Cotton', 'Wool', 'Silk', 'Linen', 'Rayon', 'Leather', 'Suede', 'Abaca'] as const) {
      expect(info(fabric).value).toBe('Not rated');
    }
    // Same levels as the rating logic used for the scan card.
    for (const fabric of ['Polyester', 'Acrylic', 'Nylon', 'Spandex'] as const) {
      expect(info(fabric).value).toBe(getFiberHealthRiskLabel(fabric));
      expect(getFiberHealthRiskLevel(fabric)).toBe(info(fabric).value.toLowerCase());
    }
  });

  it('shows these values on the fiber profile page, so Rayon is no longer "Moderate" and natural fibers are no longer "Low"', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      expect(getEnvironmentalSummary(FIBER_PROFILES[fabric]).microplasticShedding).toBe(info(fabric).value);
    }
    expect(getEnvironmentalSummary(FIBER_PROFILES.Rayon).microplasticShedding).toBe('Not rated');
    expect(getEnvironmentalSummary(FIBER_PROFILES.Cotton).microplasticShedding).toBe('Not rated');
  });

  it('shows a sheet per fiber with what studies found and what to keep in mind', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const sheet = getFiberSheddingSheet(fabric);
      expect(sheet.map((section) => section.heading)).toEqual(['What studies found', 'Keep in mind']);
      expect(sheet[0].body).toBe(info(fabric).text);
      expect(sheet[1].body).toBe(FIBER_SHEDDING_KEEP_IN_MIND);
    }
    expect(FIBER_SHEDDING_KEEP_IN_MIND).toMatch(/not of your garment, and the app cannot measure how many fibers a garment releases/);
    expect(FIBER_SHEDDING_KEEP_IN_MIND).toMatch(/A blend can release plastic fibers even if it is mostly natural/);
    expect(FIBER_SHEDDING_KEEP_IN_MIND).toMatch(/Not rated means our references do not support a level/);
    expect(FIBER_SHEDDING_KEEP_IN_MIND).toMatch(/None is an established scientific ranking/);
  });
});

describe('what each fiber says matches what was tested', () => {
  it('synthetic fibers say studies found plastic fibers release from the tested fabrics', () => {
    for (const fabric of ['Polyester', 'Acrylic', 'Nylon'] as const) {
      expect(info(fabric).text).toMatch(/plastic-based fiber/);
      expect(info(fabric).text).toMatch(/tiny plastic fibers/);
    }
    expect(info('Acrylic').text).toMatch(/only some types of acrylic fabric have been tested/);
  });

  it('spandex does not claim every released fiber was plastic, and says some were spandex', () => {
    const text = info('Spandex').text;
    expect(text).toMatch(/some of those fibers were spandex/);
    expect(text).not.toMatch(/plastic fibers|microplastic/);
    const claim = SHEDDING_BASIS_CLAIMS.find((item) => item.aspect === 'Elastane fibers released');
    expect(claim?.text).toMatch(/13\.40%.*19\.60%/);
    expect(claim?.sourceIds).toEqual(['rathinamoorthy-2023']);
    expect(getSource('rathinamoorthy-2023')!.says.join(' ')).toMatch(/so not every released fiber was elastane/);
  });

  it('cotton and wool shed fibers too, and the fibers are not called microplastics', () => {
    const cotton = info('Cotton').text;
    expect(cotton).toMatch(/^Cotton fibers are cellulose-based, not plastic\./);
    // The comparison with polyester is limited to the fabrics and conditions tested, and is not a ranking.
    expect(cotton).toMatch(/in some of the fabrics and conditions tested, as much or more by weight than polyester\. That is not a ranking/);
    expect(cotton).not.toMatch(/in several tests|than all|always|generally/);
    // Fiber weight is not plastic pollution or environmental impact.
    expect(cotton).toMatch(/fiber weight alone does not show plastic pollution or environmental impact/);
    // A garment can contain blends, coatings or finishes, so released fibers are not necessarily cotton.
    expect(cotton).toMatch(/blends, coatings or finishes, so not every fiber it releases is necessarily cotton/);
    const wool = info('Wool').text;
    expect(wool).toMatch(/^Wool is a natural protein fiber, not plastic, and it can shed fibers\./);
    expect(wool).toMatch(/a group of four spun-staple knits that included one wool fabric \(the others were cotton and cotton-polyester blends\)/);
    expect(wool).toMatch(/That is too few wool fabrics to describe wool in general/);
    expect(wool).not.toMatch(/100% wool|all wool|wool fabrics shed/);
    for (const fabric of ['Cotton', 'Wool'] as const) {
      expect(info(fabric).text).not.toMatch(/microplastic/i);
      expect(info(fabric).text).not.toMatch(/never shed|do not shed|does not shed\b(?!\.)/i);
    }
    const caveats = getSource('vassilenko-2021')!.caveats.join(' ');
    expect(caveats).toMatch(/one cotton, one wool and two cotton-polyester blends/);
    expect(caveats).toMatch(/only one 100% wool fabric was tested/);
    expect(SHEDDING_BASIS_CLAIMS.find((item) => item.aspect === 'Natural fibers')?.text).toMatch(/one cotton, one wool and two cotton-polyester blends/);
  });

  it('rayon keeps shedding, plastic and biodegradation apart', () => {
    const text = info('Rayon').text;
    expect(text).toMatch(/cellulose-based fiber made from plant material and chemically processed/);
    expect(text).toMatch(/In accelerated lab washing of knitted fabrics, rayon and cotton released more fiber by weight than polyester/);
    // The biodegradation figures are tied to the lab tests, and the authors' caution is kept.
    expect(text).toMatch(/In lab biodegradation tests, rayon and cotton yarns broke down by about 50% in seawater and over 70% in lake water and sludge while polyester did not appreciably degrade/);
    expect(text).toMatch(/shows potential under the tested conditions, not what happens in every environment/);
    expect(text).toMatch(/which is not a ranking and does not show plastic pollution/);
    expect(text).not.toMatch(/all rayon|rapidly|every aquatic/i);
    expect(text).not.toMatch(/microplastic|plastic fibers/i);
    expect(info('Rayon').sourceIds).toEqual(['zambrano-2019', 'zambrano-2020']);
  });

  it('linen, silk, abaca, leather and suede say no study was found, and never that they do not shed', () => {
    for (const fabric of ['Silk', 'Linen', 'Abaca'] as const) {
      expect(info(fabric).text).toMatch(/We did not find a laundry study on \w+ in our current references/);
      expect(info(fabric).text).toMatch(/These references do not show how much it sheds, and that does not mean it does not shed/);
      expect(info(fabric).sourceIds).toEqual([]);
    }
    for (const fabric of ['Leather', 'Suede'] as const) {
      expect(info(fabric).text).toMatch(/We did not find evidence on fibers or microplastics released by real \w+ in our current references/);
      expect(info(fabric).text).toMatch(/Some imitation \w+ contain synthetic polymers, and the app cannot confirm whether a scanned material is genuine or imitation/);
      // Not all imitations are called plastic.
      expect(info(fabric).text).not.toMatch(/Imitation .* is plastic|all imitation|imitation (leather|suede) is plastic/i);
      expect(info(fabric).sourceIds).toEqual([]);
    }
  });

  it('never says a fiber cannot shed, and makes no health or sustainability claim', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const text = info(fabric).text;
      expect(text).not.toMatch(/never shed|cannot shed|does not release|do not release|no shedding/i);
      expect(text).not.toMatch(/harm|toxic|disease|safe\b|dangerous|eco-?friendly|sustainable|better for the environment/i);
    }
  });
});

describe('references behind the fiber descriptions', () => {
  it('only cite sources that exist, and every cited source is a real entry in the reference list', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      expect(findUnknownSourceIds(info(fabric).sourceIds)).toEqual([]);
      for (const id of info(fabric).sourceIds) {
        expect(getSourceNumber(id)).toBeGreaterThan(0);
      }
    }
  });

  it('adds six verified sources after the existing ones, numbered 36 to 41, each with DOI, limits and an honest access note', () => {
    NEW_IDS.forEach((id, index) => {
      const source = getSource(id)!;
      expect(getSourceNumber(id)).toBe(36 + index);
      expect(source.url).toMatch(/^https:\/\/doi\.org\/10\./);
      expect(source.says.length).toBeGreaterThan(0);
      expect(source.caveats.join(' ')).toMatch(/Only the abstract could be read/);
      expect(typeof source.year).toBe('number');
      expect(source.year as number).toBeGreaterThanOrEqual(2016);
    });
    expect(getSource('zambrano-2019')!.url).toBe('https://doi.org/10.1016/j.marpolbul.2019.02.062');
    expect(getSource('zambrano-2019')!.title).toMatch(/Microfibers generated from the laundering of cotton, rayon and polyester based fabrics and their aquatic biodegradation/);
    expect(getSource('zambrano-2019')!.says.join(' ')).toMatch(/cellulose-based fabrics released more microfibers by weight \(0\.2-4 mg per g of fabric\) than polyester \(0\.1-1 mg per g\)/);
  });

  it('records the evidence for each new statement in the evidence record', () => {
    const claim = (aspect: string) => SHEDDING_BASIS_CLAIMS.find((item) => item.aspect === aspect);
    expect(claim('Cellulose fabrics')?.sourceIds).toEqual(['zambrano-2019']);
    expect(claim('Cotton by weight')?.sourceIds).toEqual(['gundogdu-2026', 'fernandes-2024']);
    expect(claim('Water temperature')?.sourceIds).toEqual(['zambrano-2019']);
    expect(claim('Cold, quick cycle')?.sourceIds).toEqual(['cotton-2020']);
    expect(claim('Garment age and wear')?.sourceIds).toEqual(['fernandes-2024', 'lara-2025']);
    expect(claim('Biodegradation')?.sourceIds).toEqual(['zambrano-2019', 'zambrano-2020']);
  });

  it('records the limits of the new and upgraded sources', () => {
    expect(getSource('zambrano-2020')!.caveats.join(' ')).toMatch(/It is about biodegradation, not how much a fabric sheds/);
    expect(getSource('cotton-2020')!.caveats.join(' ')).toMatch(/Temperature and wash time changed together/);
    expect(getSource('cotton-2020')!.caveats.join(' ')).toMatch(/Procter & Gamble/);
    expect(getSource('lara-2025')!.caveats.join(' ')).toMatch(/Six shirts of one blend, washed by hand/);
    expect(getSource('gundogdu-2026')!.caveats.join(' ')).toMatch(/very recent paper/);
    expect(getSource('carney-almroth-2018')!.caveats.join(' ')).toMatch(/knitted in a lab for the study/);
    expect(getSource('karkkainen-2021')!.caveats.join(' ')).toMatch(/heat was not varied and its effect was not tested/);
  });
});
