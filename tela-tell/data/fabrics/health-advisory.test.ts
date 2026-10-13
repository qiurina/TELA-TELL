import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import {
  FIBER_SHEDDING_TITLE,
  NOT_MEDICAL_NOTE,
  SHEDDING_ESTIMATE_TITLE,
  getWhyItMatters,
  getFiberStatusAdvisory,
  isSyntheticFiber,
  otherSyntheticNote,
} from '@/data/fabrics/health-advisory';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';

describe('health risk advisory', () => {
  it('backs "Why it matters" with BfR 2019 (28), EEA 2022 (27), BfR 2025 (29) and WHO 2022 (24)', () => {
    const lines = getWhyItMatters('Polyester');
    expect(findUnknownSourceIds(lines.flatMap((line) => line.sourceIds))).toEqual([]);
    expect(lines.map((line) => line.key)).toEqual(['where', 'people', 'known', 'limit']);
    expect(lines.map((line) => line.sourceIds)).toEqual([
      ['bfr-2019-microplastics-faq', 'eea-2022-textiles'],
      ['eea-2022-textiles', 'bfr-2025-microplastics'],
      ['who-2022-microplastics'],
      [],
    ]);
    expect(getSourceNumber('bfr-2019-microplastics-faq')).toBe(28);
    expect(getSourceNumber('bfr-2025-microplastics')).toBe(29);
    expect(getSource('bfr-2019-microplastics-faq')!.says.join(' ')).toMatch(/wearing and washing of textiles/);
    expect(getSource('bfr-2025-microplastics')!.says.join(' ')).toMatch(/mainly enter the body through inhalation or ingestion/);
    expect(getSourceNumber('who-2022-microplastics')).toBe(24);
    expect(getSourceNumber('eea-2022-textiles')).toBe(27);
    expect(getSource('who-2022-microplastics')!.gist).toMatch(/up to December 2021/);
    expect(getSource('eea-2022-textiles')!.says.join(' ')).toMatch(/discharged with the washing machine effluent/);
    expect(getSource('eea-2022-textiles')!.says.join(' ')).toMatch(/release microplastics into the air/);
  });

  it('names the scanned fiber, stresses limited evidence, keeps the WHO recommendation, and estimates nothing', () => {
    const [where, people, known, limit] = getWhyItMatters('Nylon');
    expect(where.text).toBe('When you wear or wash nylon, the tiny plastic fibers it sheds can go into the air and out with the wash water.');
    expect(people.text).toMatch(/^Fibers shed from nylon clothes can get into the air\./);
    expect(people.text).toMatch(/Microplastics mainly enter the body by being breathed in or swallowed\./);
    expect(people.label).toBe('How they reach people');
    expect(people.text).not.toMatch(/dust|food|water|WHO/);
    expect(known.label).toBe('What’s known');
    expect(known.text).toBe('Health effects are still uncertain (WHO, 2022), but reducing exposure is recommended.');
    expect(limit.text).toMatch(/can’t tell how much this garment sheds or estimate your own exposure/);
    const all = getWhyItMatters('Polyester').map((line) => line.text).join(' ');
    expect(all).not.toMatch(/skin|cause|toxic|dangerous|cancer|so far|harms?/i);
  });

  it('says "clothes with spandex", since spandex is almost always a small part of a blend', () => {
    const [where, people] = getWhyItMatters('Spandex');
    expect(where.text).toBe('When you wear or wash clothes with spandex, the tiny plastic fibers they shed can go into the air and out with the wash water.');
    expect(people.text).toMatch(/^Fibers shed from clothes with spandex can get into the air\./);
    expect(`${where.text} ${people.text}`).not.toMatch(/spandex clothes/);
  });

  it('labels the synthetic card as an estimate and is never presented as a medical result', () => {
    expect(SHEDDING_ESTIMATE_TITLE).toBe('Estimated fiber shedding');
    expect(FIBER_SHEDDING_TITLE).toBe('Fiber shedding');
    expect(NOT_MEDICAL_NOTE).toMatch(/not a medical assessment/);
  });

  it('gives every non-synthetic fiber a status, never a level, and never a "Not plastic" pill', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const advisory = getFiberStatusAdvisory(fabric, [{ material: fabric, percentage: 100 }], false);
      if (isSyntheticFiber(fabric)) {
        expect(advisory).toBeNull();
        continue;
      }
      expect(advisory).not.toBeNull();
      expect(advisory!.pillLabel).not.toMatch(/not plastic|low|moderate|high/i);
      expect(advisory!.text).not.toMatch(/\b(low|moderate|high)\b|safe|no risk|healthy|100%/i);
      expect(advisory!.text).toMatch(/cannot (identify|confirm)/);
    }
  });

  it('calls rayon cellulose-based and asks whether leather and suede are genuine or imitation', () => {
    expect(getFiberStatusAdvisory('Rayon', [], false)?.pillLabel).toBe('Cellulose-based fiber');
    expect(getFiberStatusAdvisory('Rayon', [], false)?.text).toMatch(/regenerated cellulose fiber/);
    for (const fabric of ['Leather', 'Suede']) {
      const advisory = getFiberStatusAdvisory(fabric, [], false)!;
      expect(advisory.pillLabel).toBe('Real or imitation?');
      expect(advisory.tone).toBe('neutral');
      expect(advisory.text).toMatch(/Genuine/);
      expect(advisory.text).toMatch(/is plastic/);
      expect(advisory.text).toMatch(/cannot confirm whether the material is genuine or imitation/);
    }
  });

  it('notes a synthetic among the other predictions at the 15% display threshold, without claiming a blend', () => {
    const withNylon = getFiberStatusAdvisory(
      'Cotton',
      [
        { material: 'Cotton', percentage: 70 },
        { material: 'Nylon', percentage: 20 },
      ],
      false,
    )!;
    expect(withNylon.otherSynthetics).toEqual(['Nylon']);
    expect(otherSyntheticNote(withNylon.otherSynthetics)).toBe(
      'Nylon also appears among the predictions. The scan cannot confirm a blend; check the label for actual fiber content.',
    );

    const trace = getFiberStatusAdvisory(
      'Cotton',
      [
        { material: 'Cotton', percentage: 86 },
        { material: 'Nylon', percentage: 14 },
      ],
      false,
    )!;
    expect(trace.otherSynthetics).toEqual([]);
    expect(otherSyntheticNote(trace.otherSynthetics)).toBeNull();

    expect(otherSyntheticNote(['Nylon', 'Polyester'])).toMatch(/^Nylon and Polyester also appear among the predictions/);
  });

  it('gives no advisory for an Unsure scan or an unknown fiber', () => {
    expect(getFiberStatusAdvisory('Cotton', [{ material: 'Cotton', percentage: 100 }], true)).toBeNull();
    expect(getFiberStatusAdvisory('Mystery', [], false)).toBeNull();
  });
});
