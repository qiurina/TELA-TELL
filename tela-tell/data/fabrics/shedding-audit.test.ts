import { SHEDDING_BASIS_CLAIMS } from '@/data/fabrics/shedding-basis';
import { SHEDDING_EXPLAINER_SECTIONS } from '@/data/fabrics/shedding-explainer';
import { SHEDDING_FIBER_REASONS, SHEDDING_LIMITS_SECTIONS } from '@/data/fabrics/shedding-why';
import { getSource } from '@/data/fabrics/source-registry';
import {
  HEALTH_RISK_DISCLAIMER,
  SHEDDING_TIPS_FOOTNOTE,
  getSyntheticHealthRisk,
} from '@/data/fabrics/synthetic-health-risk';

const polyester = () => getSyntheticHealthRisk('Polyester', [])!;
const claim = (aspect: string, kind?: string) =>
  SHEDDING_BASIS_CLAIMS.find((item) => item.aspect === aspect && (!kind || item.kind === kind));

describe('shedding care tips', () => {
  it('are the four short tips, each with a bold-style lead-in', () => {
    expect(polyester().tips).toEqual([
      'Wash cooler and quicker: When the care label allows, try a cooler, shorter wash cycle.',
      "Avoid tiny loads: Wash a reasonably full load, but don't overfill the machine.",
      'Drying releases fibers too: Tumble drying can also release fibers.',
      "Choose with care: Natural-fiber clothing may be an option if you're trying to avoid plastic fibers, but natural fibers shed too, and fabrics that mix natural and synthetic fibers can still release plastic fibers.",
    ]);
  });

  it('does not give the old advice: no gentle/delicate cycle, no dryer-heat claim', () => {
    const tips = polyester().tips.join(' ');
    expect(tips).not.toMatch(/gentle cycle|cold water|delicate|high heat|hot/i);
    expect(tips).not.toMatch(/dryer heat|heat/i);
  });

  it('does not imply natural-dominant mixes cannot release plastic fibers', () => {
    const tip = polyester().tips[3];
    expect(tip).toMatch(/natural fibers shed too/);
    expect(tip).toMatch(/fabrics that mix natural and synthetic fibers can still release plastic fibers/);
    expect(tip).not.toMatch(/don't shed plastic|do not shed plastic/);
  });

  it('says under the tips which come from lab studies and which is only a practical suggestion', () => {
    expect(SHEDDING_TIPS_FOOTNOTE).toMatch(/first three tips come from lab studies, listed in About with their limits/);
    expect(SHEDDING_TIPS_FOOTNOTE).toMatch(/"Choose with care", and any tip about a worn or damaged garment, are practical suggestions based on clothing-care guides, also listed in About, not research findings/);
  });

  it('keeps the worn and damaged tips as practical suggestions, not tested findings', () => {
    const worn = getSyntheticHealthRisk('Polyester', [], 'Worn')!.tips.at(-1);
    const damaged = getSyntheticHealthRisk('Polyester', [], 'Damaged')!.tips.at(-1);
    expect(worn).toBe(
      'Practical suggestion: this piece already shows wear. Wash it only when needed and follow the care label, since each wash wears a garment down. Studies disagree on whether worn clothes shed more.',
    );
    expect(damaged).toBe(
      'Practical suggestion: mending a torn seam may help keep the garment in use longer. This has not been shown to reduce fiber shedding.',
    );
    // Neither tip claims a shedding effect.
    expect(`${worn} ${damaged}`).not.toMatch(/reduce(s)? (fiber )?shedding(?!\.)|less shedding|shed less/i);
  });

  it('keeps a verified source for each wash tip, with the limits recorded in the evidence record and on the About page', () => {
    // Cooler, shorter cycle: Lant 2020 (15 C / 30 min vs 40 C / 85 min, 30% less), limit stated.
    expect(claim('Wash cycle', 'fact')?.text).toMatch(/15 °C for 30 minutes.*30% fewer.*40 °C cycle of 85 minutes/);
    expect(claim('Wash cycle', 'tradeoff')?.text).toMatch(/does not show the effect of temperature alone/);
    const aboutText = SHEDDING_EXPLAINER_SECTIONS.flatMap((section) => section.items.map((item) => item.text)).join(' ');
    expect(aboutText).toMatch(/changed the temperature and the wash time together/);
    // Fuller loads and less water for the load: Lant 2020 and Kelly 2019.
    expect(claim('Wash water volume')?.sourceIds).toEqual(['kelly-2019']);
    expect(claim('Wash load size')?.sourceIds).toEqual(['lant-2020']);
    expect(claim('Wash load size')?.text).toMatch(/3\.5 to 6\.0 kg.*1\.0 to 3\.5 kg/);
    // Tumble drying releases fibers: Karkkainen 2021 (drying only; no heat comparison).
    const drying = claim('Washing and drying');
    expect(drying?.sourceIds).toEqual(['karkkainen-2021']);
    expect(drying?.text).not.toMatch(/heat|temperature/i);
  });

  it('records that Lant 2020 was read in full and that two of its authors work for a laundry-products company', () => {
    const lant = getSource('lant-2020')!;
    expect(lant.caveats.join(' ')).toMatch(/full text was read on PubMed Central/);
    expect(lant.caveats.join(' ')).toMatch(/Procter & Gamble/);
    expect(getSource('kelly-2019')!.caveats.join(' ')).toMatch(/Only the abstract could be read/);
  });
});

describe('shedding notes and limits', () => {
  it('replaces the skin-irritation claim with a statement of what the estimate does not assess', () => {
    for (const fabric of ['Polyester', 'Acrylic', 'Nylon', 'Spandex']) {
      const note = getSyntheticHealthRisk(fabric, [])!.note;
      expect(note).toBe('This shedding estimate does not assess skin irritation, allergies, or other health effects.');
      expect(note).not.toMatch(/usually caused|dyes|finishing/i);
    }
  });

  it('keeps every limitation: on the (i) sheet in short, in full on the About page', () => {
    const sheet = SHEDDING_LIMITS_SECTIONS.map((section) => section.body).join(' ');
    expect(sheet).toMatch(/prediction may be wrong/);
    expect(sheet).toMatch(/cannot measure how many tiny fibers your garment releases/);
    expect(sheet).toMatch(/Natural fibers can shed too/);

    const about = SHEDDING_EXPLAINER_SECTIONS.flatMap((section) => section.items.map((item) => item.text)).join(' ');
    expect(about).toMatch(/confidence percentage shows how sure the app is about its prediction\. It does not show how much of that fiber is in the garment/);
    expect(about).toMatch(/cannot see or measure how many tiny fibers your garment releases/);
    expect(about).toMatch(/Natural fibers like cotton and wool can shed fibers too/);
    expect(about).toMatch(/Studies of fabrics that mix fibers disagree because they used different materials and methods/);
    expect(about).toMatch(/lab tests of particular fabrics and washes/);
  });

  it('calls the High / Moderate / Low levels the app’s estimate, based on selected studies, not a scientific ranking', () => {
    expect(SHEDDING_LIMITS_SECTIONS[1].body).toMatch(/app's estimates based on selected studies, not an established scientific ranking/);
    expect(HEALTH_RISK_DISCLAIMER[0].body).toMatch(/estimated shedding level, based on selected studies/);
    expect(HEALTH_RISK_DISCLAIMER[0].body).toMatch(/Not an established ranking/);
  });

  it('does not say worn clothes shed more as a general rule', () => {
    const everything = [
      ...Object.values(SHEDDING_FIBER_REASONS).map((reason) => reason?.text ?? ''),
      ...SHEDDING_EXPLAINER_SECTIONS.flatMap((section) => section.items.map((item) => item.text)),
    ].join(' ');
    expect(everything).not.toMatch(/worn (pieces|fabrics|clothes) (shed|release)[^.]* more than new/i);
    expect(everything).toMatch(/Studies differ on whether worn clothes shed more/);
    expect(claim('Wear and age')?.kind).toBe('tradeoff');
  });
});

describe('shedding card claims stay inside what was tested', () => {
  const reason = (fiber: 'Polyester' | 'Acrylic' | 'Nylon' | 'Spandex') => SHEDDING_FIBER_REASONS[fiber]!.text;

  it('does not state a result as a rule for every garment of a fiber', () => {
    for (const fiber of ['Polyester', 'Acrylic', 'Nylon', 'Spandex'] as const) {
      expect(reason(fiber)).not.toMatch(/\b(always|all|every) (polyester|acrylic|nylon|spandex)\b/i);
      expect(reason(fiber)).toMatch(/can release|released more tiny fibers/);
    }
  });

  it('keeps the 2-10% spandex range off the card; it is on the About page as a general range', () => {
    expect(reason('Spandex')).not.toMatch(/\d/);
    const about = SHEDDING_EXPLAINER_SECTIONS.flatMap((section) => section.items.map((item) => item.text)).join(' ');
    expect(about).toMatch(/Stretch fabrics usually contain about 2-10% spandex, and more in compression wear and shapewear\. That is a general range, not a measurement of your garment/);
  });

  it('backs the elastane share with the paper’s own statement, read in full', () => {
    const share = claim('Elastane share');
    expect(share?.sourceIds).toEqual(['azevedo-2025-elastane']);
    expect(share?.text).toMatch(/typically in the range of 2% to 10% by weight for stretch fabrics/);
    expect(share?.text).toMatch(/higher contents may be used in specialized compression or shapewear applications/);
    const azevedo = getSource('azevedo-2025-elastane')!;
    expect(azevedo.says.join(' ')).toMatch(/2-10% by weight for stretch fabrics/);
    expect(azevedo.says.join(' ')).toMatch(/specialized compression or shapewear/);
    expect(azevedo.caveats.join(' ')).toMatch(/The full text was read on PubMed Central/);
    expect(azevedo.caveats.join(' ')).toMatch(/background statement in the introduction, not a result of the study/);
  });

  it('says natural fibers shed, citing the study that measured it', () => {
    const natural = claim('Natural fibers');
    expect(natural?.sourceIds).toEqual(['vassilenko-2021']);
    expect(natural?.text).toMatch(/a group of four knit spun-staple textiles described as natural \(one cotton, one wool and two cotton-polyester blends in its sample table\)/);
  });
});

describe('clothing-care guides behind the practical-suggestion tips', () => {
  it('cites a published guide for each practical suggestion, and says what it is not', () => {
    const guide = getSource('earthday-fashion-guide-2021')!;
    expect(guide.year).toBe(2021);
    expect(guide.url).toBe('https://www.earthday.org/earth-friendly-fashion-guide-14-ways-to-green-your-style/');
    expect(guide.says.join(' ')).toMatch(/buy clothing made with natural fabric fibers instead of synthetic fabrics/);
    expect(guide.says.join(' ')).toMatch(/reducing the microplastics in water sources that come from synthetic fibers that shed during washes/);
    expect(guide.caveats.join(' ')).toMatch(/not a study and not peer reviewed/);
    expect(guide.caveats.join(' ')).toMatch(/does not say natural fibers never shed/);

    const toolkit = getSource('earthday-care-toolkit')!;
    expect(toolkit.year).toBeNull();
    expect(toolkit.says.join(' ')).toMatch(/each washing shortens the life of a garment/);
    expect(toolkit.caveats.join(' ')).toMatch(/not a study/);
    expect(toolkit.caveats.join(' ')).toMatch(/Its repair advice covers shoes only, not clothing/);
    expect(toolkit.caveats.join(' ')).toMatch(/delicate cycles released more microfibers/);

    const emf = getSource('emf-new-textiles-economy-2017')!;
    expect(emf.says.join(' ')).toMatch(/repairing or restyling and adequate washing and storing, could help preserve clothes/);
    expect(emf.usedFor).toMatch(/mending tip/);
  });

  it('does not use the toolkit for the wash-cycle advice, which comes from the lab studies', () => {
    expect(getSource('earthday-care-toolkit')!.usedFor).toMatch(/Worn-garment tip/);
    expect(getSource('earthday-care-toolkit')!.caveats.join(' ')).toMatch(/not used for the wash tip/);
  });
});
