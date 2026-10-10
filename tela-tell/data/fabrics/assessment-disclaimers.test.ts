import {
  COMFORT_SHEET_SECTIONS,
  COMPOSITION_SHEET_SECTIONS,
  FIBER_GUIDANCE_CAPTION,
  LABEL_CHECK_SHEET_SECTIONS,
  SHEDDING_CAPTION,
  type InfoSection,
} from '@/data/fabrics/assessment-disclaimers';
import { HEALTH_RISK_DISCLAIMER } from '@/data/fabrics/synthetic-health-risk';

const ALL_SECTIONS: Record<string, InfoSection[]> = {
  shedding: HEALTH_RISK_DISCLAIMER,
  labelCheck: LABEL_CHECK_SHEET_SECTIONS,
  comfort: COMFORT_SHEET_SECTIONS,
  composition: COMPOSITION_SHEET_SECTIONS,
};

const text = (sections: InfoSection[]) =>
  sections.map((section) => `${section.heading} ${section.body}`).join(' ');

describe('assessment disclaimers', () => {
  it.each(Object.entries(ALL_SECTIONS))(
    'the %s sheet is short: two blocks, one saying what it is not',
    (_name, sections) => {
      expect(sections).toHaveLength(2);
      expect(sections[1].heading).toMatch(/isn't|aren't/i);
      expect(text(sections).length).toBeLessThan(330);
    },
  );

  it('the shedding sheet says particles cannot be detected and it is not medical advice', () => {
    expect(text(HEALTH_RISK_DISCLAIMER)).toMatch(/can't see or count microplastic particles/);
    expect(text(HEALTH_RISK_DISCLAIMER)).toMatch(/not medical advice/i);
  });

  it('the label check says a mismatch is not proof', () => {
    expect(text(LABEL_CHECK_SHEET_SECTIONS)).toMatch(/Proof/);
  });

  it('the percentages sheet says they are confidence, not fiber amounts, and that photos can mislead', () => {
    expect(text(COMPOSITION_SHEET_SECTIONS)).toMatch(/confident/);
    expect(text(COMPOSITION_SHEET_SECTIONS)).toMatch(/How much of each fiber is in the garment/);
    expect(text(COMPOSITION_SHEET_SECTIONS)).toMatch(/look alike in photos, so the top match can be wrong/);
    expect(text(COMPOSITION_SHEET_SECTIONS)).toMatch(/Check the care tag for the real composition/);
    // General information only: it names no specific fibers or test results.
    expect(text(COMPOSITION_SHEET_SECTIONS)).not.toMatch(/rayon|cotton|polyester|test photos/i);
  });

  it('short captions say the result is an estimate or guidance, not a measurement of the garment', () => {
    expect(FIBER_GUIDANCE_CAPTION).toMatch(/not measured on your garment/);
    expect(SHEDDING_CAPTION).toMatch(/not a measurement of your garment/);
  });

  it('no wording claims the app detects, identifies, or measures these things', () => {
    const all = [
      ...Object.values(ALL_SECTIONS).map(text),
      FIBER_GUIDANCE_CAPTION,
      SHEDDING_CAPTION,
    ].join(' ');
    expect(all).not.toMatch(/\b(detects|detected microplastic|measures exact|chemically identif)/i);
  });
});
