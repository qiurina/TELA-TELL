import { SHEDDING_BASIS_CLAIMS } from '@/data/fabrics/shedding-basis';
import { SUPPORTED_FABRICS, type SupportedFabric } from '@/data/fabrics/fabrics';
import {
  SHEDDING_FIBER_REASONS,
  SHEDDING_LIMITS_SECTIONS,
  buildSheddingReason,
} from '@/data/fabrics/shedding-why';
import { findUnknownSourceIds } from '@/data/fabrics/source-registry';
import { getSyntheticHealthRisk } from '@/data/fabrics/synthetic-health-risk';

const reasonFor = (dominant: string, compositions: { material: string; percentage: number }[] = []) =>
  getSyntheticHealthRisk(dominant, compositions)?.reason ?? '';

const CARD_TEXT = {
  Polyester:
    'Polyester is a plastic-based fiber. Studies found that polyester clothes can release tiny plastic fibers during washing. How much they release depends on how the fabric is made.',
  Acrylic:
    'Acrylic is a plastic-based fiber. Studies found that acrylic fabrics can release tiny plastic fibers during washing. However, only some types of acrylic fabric have been tested.',
  Nylon:
    'Nylon is a plastic-based fiber. Studies found that nylon fabrics can release tiny plastic fibers during washing. The amount released varies with the type of fabric.',
  Spandex:
    "Spandex is the stretchy fiber used in many fitted clothes. Studies found that the tested cotton fabrics with more spandex released more tiny fibers during washing, and some of those fibers were spandex. Your garment's actual fiber content may differ.",
} as const;

describe('shedding card text', () => {
  it.each(Object.entries(CARD_TEXT))('shows the short %s description', (fiber, expected) => {
    expect(reasonFor(fiber)).toBe(expected);
  });

  it('is three short sentences, easy to scan', () => {
    for (const fiber of Object.keys(CARD_TEXT)) {
      const reason = reasonFor(fiber);
      expect(reason.split(/(?<=[.!?])\s+/)).toHaveLength(3);
      expect(reason.length).toBeLessThan(260);
    }
  });

  it('changes with the scan: the level and the fiber named', () => {
    expect(getSyntheticHealthRisk('Polyester', [])?.label).toBe('High');
    expect(getSyntheticHealthRisk('Acrylic', [])?.label).toBe('High');
    expect(getSyntheticHealthRisk('Nylon', [])?.label).toBe('Moderate');
    expect(getSyntheticHealthRisk('Spandex', [])?.label).toBe('Moderate');
    expect(new Set(Object.keys(CARD_TEXT).map((fiber) => reasonFor(fiber))).size).toBe(4);
  });

  it('follows the most likely fiber only: a lower-ranked prediction never changes the level or the text', () => {
    const risk = getSyntheticHealthRisk('Spandex', [
      { material: 'Spandex', percentage: 85 },
      { material: 'Acrylic', percentage: 15 },
    ]);
    expect(risk?.label).toBe('Moderate');
    expect(risk?.fibers).toEqual(['Spandex']);
    expect(risk?.reason).toBe(CARD_TEXT.Spandex);
  });

  it('shows no card when the most likely fiber is not synthetic', () => {
    expect(
      getSyntheticHealthRisk('Cotton', [
        { material: 'Cotton', percentage: 60 },
        { material: 'Polyester', percentage: 35 },
      ]),
    ).toBeNull();
  });

  it('keeps the existing message when few synthetic fibers are identified', () => {
    expect(buildSheddingReason('Cotton')).toBe(
      "Few synthetic fibers were identified in this scan. This does not mean the fabric won't shed fibers.",
    );
  });

  it('puts no figure, study name or health claim on the card, and does not rank fibers against each other', () => {
    for (const fiber of Object.keys(CARD_TEXT)) {
      const reason = reasonFor(fiber);
      expect(reason).not.toMatch(/\d/);
      expect(reason).not.toMatch(/Napper|Thompson|Vassilenko|Falco|Rathinamoorthy|Carney|mg\b|per kg/);
      expect(reason).not.toMatch(/harm|toxic|disease|safe\b|dangerous/i);
      expect(reason).not.toMatch(/than (polyester|acrylic|nylon|spandex)|more than|less than/i);
    }
  });

  it('phrases every fiber line as what studies found, narrowed to what was tested', () => {
    for (const reason of Object.values(SHEDDING_FIBER_REASONS)) {
      expect(reason?.text).toMatch(/Studies found/);
      expect(reason?.text).toMatch(/\bcan release\b|released more tiny fibers/);
    }
    expect(reasonFor('Acrylic')).toMatch(/only some types of acrylic fabric have been tested/);
    expect(reasonFor('Spandex')).toMatch(/the tested cotton fabrics with more spandex/);
    expect(reasonFor('Spandex')).toMatch(/actual fiber content may differ/);
  });
});

describe('shedding (i) sheet', () => {
  it('is short: what the result means, and what to keep in mind', () => {
    expect(SHEDDING_LIMITS_SECTIONS.map((section) => section.heading)).toEqual([
      'What this result means',
      'Keep in mind',
    ]);
    const [means, keep] = SHEDDING_LIMITS_SECTIONS;
    expect(means.body).toBe(
      'This is an estimate based on the fiber the app predicts is most likely. The prediction may be wrong. The app cannot measure how many tiny fibers your garment releases.',
    );
    expect(keep.body).toBe(
      "Shedding depends on the fabric, how it is made, its condition, and how it is washed. Natural fibers can shed too.\n\nHigh, Moderate, and Low are the app's estimates based on selected studies, not an established scientific ranking. This result does not assess health effects.",
    );
    expect(`${means.body}${keep.body}`.length).toBeLessThan(460);
  });

  it('keeps the essential limits: estimate, may be wrong, not measured, natural fibers, not a scientific ranking, no health claim', () => {
    const text = SHEDDING_LIMITS_SECTIONS.map((section) => section.body).join(' ');
    expect(text).toMatch(/estimate based on the fiber the app predicts is most likely/);
    expect(text).toMatch(/prediction may be wrong/);
    expect(text).toMatch(/cannot measure how many tiny fibers your garment releases/);
    expect(text).toMatch(/Natural fibers can shed too/);
    expect(text).toMatch(/not an established scientific ranking/);
    expect(text).toMatch(/does not assess health effects/);
    expect(text).not.toMatch(/\d/);
  });

  it('leaves the detail (confidence, studies, limits) to the About page instead of repeating it', () => {
    const text = SHEDDING_LIMITS_SECTIONS.map((section) => section.body).join(' ');
    expect(text).not.toMatch(/confidence|percentage/);
  });
});

describe('shedding fiber lines are backed by the verified evidence record', () => {
  it('only explains fibers the app rates, and every source id exists', () => {
    for (const [fiber, reason] of Object.entries(SHEDDING_FIBER_REASONS)) {
      expect(SUPPORTED_FABRICS).toContain(fiber as SupportedFabric);
      expect(reason?.sourceIds.length).toBeGreaterThan(0);
      expect(findUnknownSourceIds(reason?.sourceIds)).toEqual([]);
    }
  });

  it('cites, for each fiber, studies that a claim in the evidence record also cites', () => {
    const claimSources = new Set(SHEDDING_BASIS_CLAIMS.flatMap((claim) => claim.sourceIds ?? []));
    for (const reason of Object.values(SHEDDING_FIBER_REASONS)) {
      for (const id of reason?.sourceIds ?? []) {
        expect({ id, cited: claimSources.has(id) }).toEqual({ id, cited: true });
      }
    }
  });

  it('matches what those claims say about each fiber', () => {
    const claimFor = (id: string, needle: RegExp) =>
      SHEDDING_BASIS_CLAIMS.find((claim) => (claim.sourceIds ?? []).includes(id) && needle.test(claim.text));
    expect(claimFor('napper-thompson-2016', /polyester or acrylic/)).toBeDefined();
    expect(claimFor('vassilenko-2021', /polyester.*released/)).toBeDefined();
    expect(claimFor('carney-almroth-2018', /acrylic, nylon and polyester samples shed/)).toBeDefined();
    expect(claimFor('rathinamoorthy-2023', /more elastane meant more/)).toBeDefined();
  });
});
