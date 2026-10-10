import { getEcoGuidance } from '@/data/fabrics/eco-alternatives';
import {
  SUSTAINABLE_CHOICES_CLAIMS,
  SUSTAINABLE_CHOICES_SHEET_NOTE,
  SUSTAINABLE_CHOICES_TEXT,
  SUSTAINABLE_CHOICES_TITLE,
} from '@/data/fabrics/sustainable-choices';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';

describe('Sustainable choices card (replaces the retired sustainability score)', () => {
  it('has a plain title and makes no claim about the scanned garment or fiber', () => {
    expect(SUSTAINABLE_CHOICES_TITLE).toBe('Sustainable choices');
    expect(SUSTAINABLE_CHOICES_TEXT).toMatch(/reusing clothes and wearing them longer/);
    expect(SUSTAINABLE_CHOICES_TEXT).toMatch(/Fiber type alone does not tell you a garment.s overall impact/);
    expect(SUSTAINABLE_CHOICES_TEXT).not.toMatch(/\d|score|rating|estimate|higher|lower|middle|greener|better/i);
  });

  it('says on the sheet that it is general guidance and that the app does not score sustainability', () => {
    expect(SUSTAINABLE_CHOICES_SHEET_NOTE).toMatch(/general guidance, not a measurement of your garment/);
    expect(SUSTAINABLE_CHOICES_SHEET_NOTE).toMatch(/does not score a garment.s sustainability, labor conditions or brand/);
  });

  it('pairs every benefit with a downside from the same source, and every claim has an existing source', () => {
    const benefits = SUSTAINABLE_CHOICES_CLAIMS.filter((claim) => claim.kind === 'benefit');
    const tradeoffs = SUSTAINABLE_CHOICES_CLAIMS.filter((claim) => claim.kind === 'tradeoff');
    expect(benefits).toHaveLength(2);
    expect(tradeoffs).toHaveLength(2);
    for (const claim of SUSTAINABLE_CHOICES_CLAIMS) {
      expect(findUnknownSourceIds(claim.sourceIds)).toEqual([]);
      expect(getSourceNumber(claim.sourceIds![0])).toBeGreaterThan(0);
    }
    for (const benefit of benefits) {
      expect(tradeoffs.some((tradeoff) => tradeoff.aspect === benefit.aspect)).toBe(true);
    }
  });

  it('keeps the reuse wording identical to the Eco tips reuse claims for the same source', () => {
    const reuse = getEcoGuidance('Cotton', []).reuseClaims;
    for (const claim of SUSTAINABLE_CHOICES_CLAIMS.filter((c) => c.sourceIds?.includes('sandin-peters-2018'))) {
      expect(reuse.map((item) => item.text)).toContain(claim.text);
    }
  });

  it('states the 44% figure as the foundation\'s own production-phase model, matching its source entry', () => {
    const says = getSource('emf-new-textiles-economy-2017')!.says.join(' ');
    expect(says).toMatch(/worn twice as often on average, greenhouse gas emissions would be 44% lower/);
    expect(says).toMatch(/its own calculation for the production phase/);
    const claims = SUSTAINABLE_CHOICES_CLAIMS.filter((claim) => claim.sourceIds?.includes('emf-new-textiles-economy-2017'));
    expect(claims.map((claim) => claim.text).join(' ')).toMatch(/In one foundation.s own calculation, greenhouse gas emissions would be 44% lower/);
    expect(claims.map((claim) => claim.text).join(' ')).toMatch(/model of the production phase only, not a measurement of any garment/);
  });
});
