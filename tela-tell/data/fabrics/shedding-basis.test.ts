import { SHEDDING_BASIS_CLAIMS } from '@/data/fabrics/shedding-basis';
import {
  findUnknownSourceIds,
  getSource,
  getSourceNumber,
  resolveSources,
  SOURCE_LIST,
} from '@/data/fabrics/source-registry';
import { getFiberHealthRiskLevel } from '@/data/fabrics/synthetic-health-risk';
import { TRACE_DETECTION_MIN_PERCENT } from '@/data/scans/scan-confidence';

const NEW_SOURCE_IDS = [
  'napper-thompson-2016',
  'de-falco-2019',
  'carney-almroth-2018',
  'vassilenko-2021',
  'karkkainen-2021',
  'rathinamoorthy-2023',
  'zhang-2025',
  'de-falco-2020',
] as const;

const allText = () => SHEDDING_BASIS_CLAIMS.map((claim) => claim.text).join(' ');

describe('shedding evidence record', () => {
  it('has only findings and limits, and every one cites at least one source that exists', () => {
    expect(SHEDDING_BASIS_CLAIMS.length).toBeGreaterThan(0);
    for (const claim of SHEDDING_BASIS_CLAIMS) {
      expect(['fact', 'tradeoff']).toContain(claim.kind);
      expect((claim.sourceIds ?? []).length).toBeGreaterThan(0);
      expect({ text: claim.text, unknown: findUnknownSourceIds(claim.sourceIds) }).toEqual({
        text: claim.text,
        unknown: [],
      });
      expect(claim.aspect?.length).toBeGreaterThan(0);
    }
  });

  it('puts every figure it shows in the cited sources\' own summaries, with the units those summaries give', () => {
    // [text the claim must contain, text the cited sources' "says" must also contain]
    const expectations: { source: string; claimHas: string; sourceHas: string }[] = [
      { source: 'de-falco-2019', claimHas: '124 to 308 mg per kg of washed fabric', sourceHas: '124 to 308 mg per kg of washed fabric' },
      { source: 'napper-thompson-2016', claimHas: 'over 700,000 fibers', sourceHas: 'over 700,000 fibers' },
      { source: 'napper-thompson-2016', claimHas: '6 kg', sourceHas: '6 kg' },
      { source: 'vassilenko-2021', claimHas: '161 ± 173 mg per kg per wash', sourceHas: '161 ± 173 mg per kg per wash' },
      { source: 'vassilenko-2021', claimHas: '27 ± 14 mg per kg per wash', sourceHas: '27 ± 14 mg per kg per wash' },
      { source: 'vassilenko-2021', claimHas: 'up to 90%', sourceHas: 'up to 90%' },
      { source: 'vassilenko-2021', claimHas: '46%', sourceHas: '46%' },
      { source: 'karkkainen-2021', claimHas: '1.0 × 10⁵ to 6.3 × 10⁶ fibers per kg', sourceHas: '1.0 × 10⁵ to 6.3 × 10⁶ per kg' },
      { source: 'karkkainen-2021', claimHas: '10 to 1,700 mg', sourceHas: '10 to 1,700 mg per kg' },
      { source: 'karkkainen-2021', claimHas: '39% and 10%', sourceHas: '39% and 10%' },
      { source: 'persson-2026', claimHas: 'about 4.3 and 6.2 times', sourceHas: 'about 4.3 and 6.2 times' },
      { source: 'persson-2026', claimHas: '30% recycled', sourceHas: '30% recycled' },
      { source: 'rathinamoorthy-2023', claimHas: '2%, 5% and 8% elastane', sourceHas: '2%, 5% and 8%' },
    ];

    for (const { source, claimHas, sourceHas } of expectations) {
      const claim = SHEDDING_BASIS_CLAIMS.find((item) => (item.sourceIds ?? []).includes(source) && item.text.includes(claimHas));
      expect({ source, claimHas, found: Boolean(claim) }).toEqual({ source, claimHas, found: true });
      const cited = getSource(source);
      const sourceText = [cited?.gist ?? '', ...(cited?.says ?? [])].join(' ');
      expect({ source, sourceHas, inSource: sourceText.includes(sourceHas) }).toEqual({
        source,
        sourceHas,
        inSource: true,
      });
    }
  });

  it('leaves out figures whose unit could not be confirmed from the abstract', () => {
    const text = allText();
    // De Falco 2019 gives 640,000 to 1,500,000 fibers with no unit.
    expect(text).not.toMatch(/640,000|1,500,000|640 000/);
    // Carney Almroth 2018 gives counts in a method-specific unit.
    expect(text).not.toMatch(/7360|7,360/);
    expect(text).not.toMatch(/per wash cycle/);
  });

  it('does not make a general claim about blends or about one fiber being safe', () => {
    const text = allText().toLowerCase();
    expect(text).not.toMatch(/blends (always|usually|generally) /);
    expect(text).not.toMatch(/\bsafe\b|harmless|no risk|health risk|causes? (harm|disease)/);
    // The blend limit states that studies differ and that this app does not model blends.
    const blends = SHEDDING_BASIS_CLAIMS.find((claim) => claim.aspect === 'Blends');
    expect(blends?.text).toMatch(/differ/);
    expect(blends?.text).toMatch(/does not model blends/);
    expect(blends?.sourceIds).toEqual(['napper-thompson-2016', 'zhang-2025']);
  });

  it('keeps the 2% confidence floor separate from the shedding research', () => {
    expect(TRACE_DETECTION_MIN_PERCENT).toBe(2);
    expect(allText()).not.toMatch(/confidence|noise floor|trace|TRACE_DETECTION/i);
  });

  it('does not change the existing shedding levels', () => {
    expect(getFiberHealthRiskLevel('Polyester')).toBe('high');
    expect(getFiberHealthRiskLevel('Acrylic')).toBe('high');
    expect(getFiberHealthRiskLevel('Nylon')).toBe('moderate');
    expect(getFiberHealthRiskLevel('Spandex')).toBe('moderate');
    expect(getFiberHealthRiskLevel('Cotton')).toBe('low');
  });
});

describe('shedding sources in the registry', () => {
  it('adds eight sources after the existing ones without renumbering any', () => {
    expect(getSourceNumber('gots-8-0')).toBe(1);
    expect(getSourceNumber('persson-2026')).toBe(6);
    expect(getSourceNumber('peters-2021-fast-fashion')).toBe(23);
    NEW_SOURCE_IDS.forEach((id, index) => {
      expect(getSourceNumber(id)).toBe(24 + index);
    });
    expect(getSourceNumber('kelly-2019')).toBe(32);
    expect(getSourceNumber('lant-2020')).toBe(33);
    expect(getSourceNumber('earthday-fashion-guide-2021')).toBe(34);
    expect(getSourceNumber('earthday-care-toolkit')).toBe(35);
    ['zambrano-2019', 'zambrano-2020', 'fernandes-2024', 'lara-2025', 'cotton-2020', 'gundogdu-2026'].forEach((id, index) => {
      expect(getSourceNumber(id)).toBe(36 + index);
    });
    // Added with the "What research says" section (reference 42), also without renumbering.
    expect(getSourceNumber('collie-2024')).toBe(42);
    expect(SOURCE_LIST).toHaveLength(42);
  });

  it('gives each new source a DOI link, a plain summary, and its own limits', () => {
    for (const id of NEW_SOURCE_IDS) {
      const source = getSource(id)!;
      expect(source.url).toMatch(/^https:\/\/doi\.org\/10\./);
      expect(source.says.length).toBeGreaterThan(0);
      expect(source.usedFor).toMatch(/Shedding estimate wording/);
      // Honest about what was read: abstract only, except the two papers read in full on PubMed Central.
      expect(source.caveats.join(' ')).toMatch(
        ['vassilenko-2021', 'carney-almroth-2018', 'karkkainen-2021', 'de-falco-2019'].includes(id)
          ? /The full text was read on PubMed Central/
          : /Only the abstract could be read/,
      );
    }
  });

  it('records that De Falco 2020 covers polyester garments only, so it is not a basis for ranking other fibers', () => {
    const source = getSource('de-falco-2020')!;
    expect(source.caveats.join(' ')).toMatch(/Only polyester garments/);
    expect(source.caveats.join(' ')).toMatch(/nothing about nylon, acrylic or spandex/);
    // And no shedding-level claim cites it as a ranking.
    const claim = SHEDDING_BASIS_CLAIMS.find((item) => (item.sourceIds ?? []).includes('de-falco-2020'));
    expect(claim?.kind).toBe('tradeoff');
    expect(claim?.text).toMatch(/Only polyester was compared/);
  });

  it('records that the 2019 fiber count has no stated unit, so it is not used', () => {
    expect(getSource('de-falco-2019')!.caveats.join(' ')).toMatch(/does not say what that count is per/);
  });

  it('resolves every source the claims cite, in order, without duplicates', () => {
    const ids = SHEDDING_BASIS_CLAIMS.flatMap((claim) => claim.sourceIds ?? []);
    const resolved = resolveSources(ids).map((source) => source.id);
    expect(new Set(resolved).size).toBe(resolved.length);
    expect(resolved.sort()).toEqual([...new Set(ids)].sort());
  });
});
