import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import {
  FIBER_PROFILE_EDUCATION,
  PROFILE_CARE_REMINDER,
  PROFILE_IDENTIFICATION_REMINDER,
  type ProfileStatement,
} from '@/data/fabrics/fiber-profile-education';
import { FIBER_PROFILE_SOURCES } from '@/data/fabrics/fiber-profile-sources';

describe('educational fiber profiles and maintenance evidence', () => {
  it('covers exactly the existing canonical materials without adding look-alikes to the registry', () => {
    expect(Object.keys(FIBER_PROFILE_EDUCATION).sort()).toEqual([...SUPPORTED_FABRICS].sort());
    for (const fabric of SUPPORTED_FABRICS) {
      const content = FIBER_PROFILE_EDUCATION[fabric];
      expect(content.about.properties.length).toBeGreaterThan(0);
      expect(content.care.length).toBeGreaterThan(0);
      expect(content.look.similarAppearances.text.length).toBeGreaterThan(0);
      expect(content.look.limitations.text.length).toBeGreaterThan(0);
    }
  });

  it('resolves evidence links and requires checked support for supported or qualified statements', () => {
    const statements: ProfileStatement[] = [PROFILE_CARE_REMINDER, PROFILE_IDENTIFICATION_REMINDER];
    for (const content of Object.values(FIBER_PROFILE_EDUCATION)) {
      statements.push(content.classification, content.about.origin, content.about.description,
        ...content.about.properties, ...Object.values(content.look), ...content.care);
    }
    for (const item of statements) {
      expect(item.text.trim().length).toBeGreaterThan(0);
      const { status, sourceIds, note } = item.verification;
      if (status === 'supported' || status === 'qualified') {
        expect(sourceIds.length).toBeGreaterThan(0);
      }
      if (status === 'qualified' || status === 'observation' || sourceIds.length === 0) {
        expect(note?.length).toBeGreaterThan(0);
      }
      for (const id of sourceIds) {
        const source = FIBER_PROFILE_SOURCES[id];
        expect(source).toBeDefined();
        expect(new URL(source.url).protocol).toBe('https:');
        expect(source.checkedSections.length).toBeGreaterThan(0);
        expect(source.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('does not label possible photo clues or similar appearances as supported identification tests', () => {
    for (const content of Object.values(FIBER_PROFILE_EDUCATION)) {
      expect(content.look.photos.verification.status).not.toBe('supported');
      expect(content.look.similarAppearances.verification.status).not.toBe('supported');
    }
    expect(FIBER_PROFILE_SOURCES['aatcc-tm20-scope'].caveat).toMatch(/not the paid method/);
  });

  it('keeps viscose-specific wet-strength guidance separate from modal and lyocell', () => {
    const rayon = FIBER_PROFILE_EDUCATION.Rayon;
    expect(rayon.about.description.text).toMatch(/Modal and lyocell.*different processes and properties/);
    expect(rayon.about.properties[0].text).toMatch(/Conventional viscose/);
    expect(rayon.about.properties[1].text).toMatch(/Do not apply.*every modal or lyocell/);
    expect(rayon.care[0].text).toMatch(/specific fiber name/);
  });
});
