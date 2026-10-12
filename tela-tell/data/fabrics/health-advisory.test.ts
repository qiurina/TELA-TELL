import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import {
  FIBER_SHEDDING_TITLE,
  NOT_MEDICAL_NOTE,
  SHEDDING_ESTIMATE_TITLE,
  WHY_IT_MATTERS,
  getFiberStatusAdvisory,
  isSyntheticFiber,
  otherSyntheticNote,
} from '@/data/fabrics/health-advisory';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';

// These tests check that the app says what the data files intend. They do not, by themselves,
// verify the scientific claims; those are recorded with their sources in source-registry.ts.

describe('health risk advisory', () => {
  it('backs "Why it matters" with the WHO 2022 report, added as reference 24 without renumbering', () => {
    expect(findUnknownSourceIds(WHY_IT_MATTERS.sourceIds)).toEqual([]);
    expect(getSourceNumber('who-2022-microplastics')).toBe(24);
    expect(getSourceNumber('gundogdu-2026')).toBe(23);
    const who = getSource('who-2022-microplastics')!;
    expect(who.year).toBe(2022);
    expect(who.title).toMatch(/ISBN 978-92-4-005460-8/);
    expect(who.gist).toMatch(/up to December 2021/);
  });

  it('dates the WHO finding, stresses limited evidence, keeps its recommendation, and estimates nothing', () => {
    expect(WHY_IT_MATTERS.text).toMatch(/WHO’s 2022 review, covering studies through December 2021/);
    expect(WHY_IT_MATTERS.text).toMatch(/too limited to assess human health risks reliably/);
    expect(WHY_IT_MATTERS.text).toMatch(/recommended reducing exposure/);
    expect(WHY_IT_MATTERS.text).toMatch(/This app cannot estimate your exposure or health risk/);
    // WHO makes no finding about wearing clothes, so the advisory must not claim one.
    expect(WHY_IT_MATTERS.text).not.toMatch(/wear|skin|cause|toxic|dangerous|cancer|so far/i);
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
      // Describes the predicted fiber; never confirms the garment's content.
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
