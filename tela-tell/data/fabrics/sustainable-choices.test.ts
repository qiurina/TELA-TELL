import {
  SUSTAINABLE_CHOICES_CLAIMS,
  SUSTAINABLE_CHOICES_KEEP_IN_MIND,
  SUSTAINABLE_CHOICES_TEXT,
  SUSTAINABLE_CHOICES_TITLE,
} from '@/data/fabrics/sustainable-choices';
import { findUnknownSourceIds, getSource, getSourceNumber } from '@/data/fabrics/source-registry';

describe('Sustainable choices card (replaces the retired sustainability score)', () => {
  it('has a plain title and makes no claim about the scanned garment or fiber', () => {
    expect(SUSTAINABLE_CHOICES_TITLE).toBe('Sustainable choices');
    expect(SUSTAINABLE_CHOICES_TEXT).toMatch(/reusing clothes and wearing them longer/i);
    expect(SUSTAINABLE_CHOICES_TEXT).toMatch(/Fiber type alone does not tell you a garment.s overall impact/);
    expect(SUSTAINABLE_CHOICES_TEXT).not.toMatch(/\d|score|rating|estimate|higher|lower|middle|greener|better/i);
  });

  it('says on the sheet that these are general studies, not about the scanned garment', () => {
    expect(SUSTAINABLE_CHOICES_KEEP_IN_MIND).toMatch(/general studies, not about your garment or the Philippines/);
    expect(SUSTAINABLE_CHOICES_KEEP_IN_MIND).toMatch(/does not replace a new purchase/);
  });

  it('has two short points, each with an existing source', () => {
    expect(SUSTAINABLE_CHOICES_CLAIMS).toHaveLength(2);
    for (const claim of SUSTAINABLE_CHOICES_CLAIMS) {
      expect(claim.aspect).toBeTruthy();
      expect(findUnknownSourceIds(claim.sourceIds)).toEqual([]);
      expect(getSourceNumber(claim.sourceIds![0])).toBeGreaterThan(0);
    }
  });

  it('attributes the wear-longer point to the foundation\'s estimate about making clothes, without quoting a percentage', () => {
    const says = getSource('emf-new-textiles-economy-2017')!.says.join(' ');
    expect(says).toMatch(/worn twice as often on average, greenhouse gas emissions would be 44% lower/);
    expect(says).toMatch(/its own calculation for the production phase/);
    const claims = SUSTAINABLE_CHOICES_CLAIMS.filter((claim) => claim.sourceIds?.includes('emf-new-textiles-economy-2017'));
    const text = claims.map((claim) => claim.text).join(' ');
    expect(text).toMatch(/one foundation.s estimate/);
    expect(text).toMatch(/emissions from making clothes/);
    // The source's 44% figure is kept in the registry, not shown, so the sheet does not alarm.
    expect(`${text} ${SUSTAINABLE_CHOICES_KEEP_IN_MIND}`).not.toMatch(/\d+\s*%/);
  });
});
