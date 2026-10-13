import { SENSITIVITY_CAVEAT, buildSensitivityMessage, getAllergyAlert } from '@/data/fabrics/fabric-allergies';
import { SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';

describe('sensitivity reminder', () => {
  it('names the top fiber when it is on the list, and never shows a percentage', () => {
    const alert = getAllergyAlert(['Wool'], 'Wool', [
      { material: 'Wool', percentage: 85 },
      { material: 'Cotton', percentage: 15 },
    ])!;
    expect(alert.conflictDetected).toBe(true);
    expect(alert.message).toBe("This scan's most likely fiber, Wool, is on your sensitivity list.");
    expect(alert.message).not.toMatch(/\d|%|contains/i);
  });

  it('says a lower prediction "appears among" the predictions instead of claiming content', () => {
    const alert = getAllergyAlert(['Nylon'], 'Cotton', [
      { material: 'Cotton', percentage: 75 },
      { material: 'Nylon', percentage: 20 },
    ])!;
    expect(alert.conflictDetected).toBe(true);
    expect(alert.message).toBe("Nylon appears among this scan's predictions and is on your sensitivity list.");
    expect(alert.message).not.toMatch(/\d|%|contains/i);
  });

  it('handles several matches, with and without the top fiber', () => {
    expect(buildSensitivityMessage(['Wool', 'Nylon'], 'Wool')).toBe(
      "This scan's most likely fiber, Wool, is on your sensitivity list. Nylon also appears among its predictions and is on your list.",
    );
    expect(buildSensitivityMessage(['Nylon', 'Polyester'], 'Cotton')).toBe(
      "Nylon and Polyester appear among this scan's predictions and are on your sensitivity list.",
    );
  });

  it('reports no match when nothing on the list is predicted, and nothing when the list is empty', () => {
    expect(getAllergyAlert(['Silk'], 'Cotton', [{ material: 'Cotton', percentage: 100 }])?.conflictDetected).toBe(false);
    expect(getAllergyAlert([], 'Cotton', [{ material: 'Cotton', percentage: 100 }])).toBeNull();
  });

  it.each(['Cotton', 'Linen', 'Silk'] as const)('excludes lyocell alternatives when Rayon and %s are on the sensitivity list', (fabric) => {
    const alert = getAllergyAlert([fabric, 'Rayon'], fabric, [{ material: fabric, percentage: 100 }])!;
    expect(alert.alternatives.length).toBeGreaterThan(0);
    expect(alert.alternatives.map((alternative) => alternative.name)).not.toContain('Tencel / lyocell');
  });

  it('uses an allowed fallback when sensitivity aliases exclude every suggested alternative', () => {
    const alert = getAllergyAlert(['Cotton', 'Linen', 'Rayon'], 'Cotton', [{ material: 'Cotton', percentage: 100 }])!;
    expect(alert.alternatives.map((alternative) => alternative.name)).toEqual(['Abaca']);
  });

  it('still excludes a sensitive fiber inside a descriptive alternative name', () => {
    const alert = getAllergyAlert(['Leather', 'Cotton'], 'Leather', [{ material: 'Leather', percentage: 100 }])!;
    expect(alert.alternatives.map((alternative) => alternative.name)).toEqual(['Linen', 'Abaca']);
  });

  it('does not suggest a fallback when every supported fiber is on the sensitivity list', () => {
    const alert = getAllergyAlert([...SUPPORTED_FABRICS], 'Cotton', [{ material: 'Cotton', percentage: 100 }])!;
    expect(alert.alternatives).toEqual([]);
  });

  it('says a photo cannot confirm content or see dyes and finishes, and alternatives are not guaranteed', () => {
    expect(SENSITIVITY_CAVEAT).toMatch(/cannot confirm fiber content or detect dyes and finishes/);
    expect(SENSITIVITY_CAVEAT).toMatch(/not guaranteed suitable for you/);
  });
});
