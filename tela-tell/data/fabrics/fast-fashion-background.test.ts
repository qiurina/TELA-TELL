import { getClaimSources, getEcoGuidance } from '@/data/fabrics/eco-alternatives';
import {
  FAST_FASHION_BASIS_TITLE,
  FAST_FASHION_CLAIMS,
  FAST_FASHION_EDITORIAL_NOTE,
  FAST_FASHION_SOURCE_IDS,
  FAST_FASHION_TEXT,
  FAST_FASHION_TITLE,
  getFastFashionSources,
} from '@/data/fabrics/fast-fashion-background';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import { SOURCE_LIST, findUnknownSourceIds, getSourceNumber } from '@/data/fabrics/source-registry';

// Sources for this note must be from the last 10 years. Fixed at the 2026 review date so the test
// does not start failing on its own as the calendar moves.
const OLDEST_ALLOWED_YEAR = 2016;

const claimText = FAST_FASHION_CLAIMS.map((claim) => claim.text).join(' ');

describe('fast fashion note (About screen)', () => {
  it('is short and explains what fast fashion does', () => {
    expect(FAST_FASHION_TITLE).toBe('Fast fashion');
    expect(FAST_FASHION_BASIS_TITLE.length).toBeGreaterThan(0);
    expect(FAST_FASHION_TEXT.length).toBeLessThan(330);
    expect(FAST_FASHION_TEXT).toMatch(/more clothes get made and each is worn less/);
  });

  it('does not say a fabric or purchase is eco-friendly, or that anything is always better', () => {
    const everything = `${FAST_FASHION_TEXT} ${FAST_FASHION_EDITORIAL_NOTE}`;
    expect(everything).not.toMatch(/\balways\b|\bnever\b|guarantee|\bgreener\b|\bbest\b/i);
    expect(FAST_FASHION_TEXT).not.toMatch(/eco-?friendly|sustainable/i);
    expect(FAST_FASHION_EDITORIAL_NOTE).toMatch(/does not make a purchase eco-friendly/);
    expect(FAST_FASHION_TEXT).toMatch(/matters alongside which fabric you pick/);
  });

  it('is general information: no fabric is named', () => {
    const everything = `${FAST_FASHION_TEXT} ${claimText} ${FAST_FASHION_EDITORIAL_NOTE}`;
    for (const fabric of SUPPORTED_FABRICS) {
      expect({ fabric, found: new RegExp(`\\b${fabric}\\b`, 'i').test(everything) }).toEqual({
        fabric,
        found: false,
      });
    }
  });
});

describe('fast fashion note citations', () => {
  it('gives every claim a source, and every source id exists in the registry', () => {
    expect(FAST_FASHION_CLAIMS.length).toBeGreaterThan(0);
    for (const claim of FAST_FASHION_CLAIMS) {
      expect({ text: claim.text, count: claim.sourceIds?.length ?? 0 }).not.toEqual({
        text: claim.text,
        count: 0,
      });
      expect(findUnknownSourceIds(claim.sourceIds)).toEqual([]);
    }
  });

  it('only cites sources published in the last 10 years', () => {
    const sources = getFastFashionSources();
    expect(sources.map((source) => source.id).sort()).toEqual([...FAST_FASHION_SOURCE_IDS].sort());
    expect(sources.length).toBeGreaterThanOrEqual(2);
    for (const source of sources) {
      expect(typeof source.year).toBe('number');
      expect(source.year as number).toBeGreaterThanOrEqual(OLDEST_ALLOWED_YEAR);
    }
  });

  it('shows the sources on the sheet, numbered like the About reference list', () => {
    const sheetSources = getClaimSources(FAST_FASHION_CLAIMS);
    expect(sheetSources.map((source) => source.id)).toEqual(FAST_FASHION_SOURCE_IDS);
    for (const source of sheetSources) {
      const index = SOURCE_LIST.findIndex((entry) => entry.id === source.id);
      expect(getSourceNumber(source.id)).toBe(index + 1);
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.says.length).toBeGreaterThan(0);
      expect(source.caveats.length).toBeGreaterThan(0);
      expect(source.usedFor).toMatch(/fast fashion note/i);
    }
  });

  it('backs each number in the text with the Ellen MacArthur Foundation claim', () => {
    expect(FAST_FASHION_TEXT).toMatch(/roughly doubled in 15 years/);
    expect(FAST_FASHION_TEXT).toMatch(/fell 36%/);
    const fact = FAST_FASHION_CLAIMS.find(
      (claim) => claim.text.includes('roughly doubled') && claim.text.includes('36%'),
    );
    expect(fact?.sourceIds).toEqual(['emf-new-textiles-economy-2017']);
  });

  it('attributes the 44% figure as the foundation’s own production-phase model, not a measurement', () => {
    const claim = FAST_FASHION_CLAIMS.find((entry) => entry.text.includes('44%'));
    expect(claim?.kind).toBe('benefit');
    expect(claim?.text).toMatch(/Ellen MacArthur Foundation estimates/);
    expect(claim?.text).toMatch(/its own calculation for the production phase/);
    expect(FAST_FASHION_TEXT).not.toMatch(/44%/);
  });

  it('records the sources’ limits in the registry', () => {
    const sources = getFastFashionSources();
    const peters = sources.find((source) => source.id === 'peters-2021-fast-fashion');
    const emf = sources.find((source) => source.id === 'emf-new-textiles-economy-2017');
    expect(peters?.caveats.join(' ')).toMatch(/Only the abstract could be read/);
    expect(peters?.says.join(' ')).toMatch(/debated/);
    expect(emf?.caveats.join(' ')).toMatch(/model, not a measurement/);
    expect(emf?.caveats.join(' ')).toMatch(/promotes a circular economy/);
    const text = sources
      .flatMap((source) => [source.shortName, source.gist, ...source.says, ...source.caveats])
      .join('\n');
    expect(text).not.toMatch(/\bfibres?\b|utilisation|labelling/);
  });
});

describe('secondhand evidence stays with the Resale and Donate tips', () => {
  it('keeps the benefit and its conditions on the reuse sheet for every fabric', () => {
    for (const fabric of SUPPORTED_FABRICS) {
      const claims = getEcoGuidance(fabric).reuseClaims;
      const text = claims.map((claim) => claim.text).join(' ');
      expect(text).toMatch(/replaces buying something new/);
      expect(text).toMatch(/does not replace a new purchase/);
      expect(text).toMatch(/extra transport/);
      expect(text).not.toMatch(/\balways\b/i);
    }
  });
});
