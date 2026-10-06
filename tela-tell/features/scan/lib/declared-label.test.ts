import { evaluateDeclaredLabel } from '@/features/scan/lib/declared-label';

const cottonScan = [
  { material: 'Cotton', percentage: 72 },
  { material: 'Linen', percentage: 20 },
  { material: 'Polyester', percentage: 5 },
];

describe('evaluateDeclaredLabel', () => {
  it('has nothing to say when no label was entered', () => {
    expect(evaluateDeclaredLabel('Cotton', '', cottonScan).status).toBe('none');
    expect(evaluateDeclaredLabel('Cotton', '   ', cottonScan).status).toBe('none');
    expect(evaluateDeclaredLabel('Cotton', null, cottonScan).status).toBe('none');
  });

  it('matches when the declared fiber is the scan top match', () => {
    expect(evaluateDeclaredLabel('Cotton', '100% Cotton', cottonScan).status).toBe('match');
  });

  it('matches a blend when every fiber has a clear share', () => {
    expect(evaluateDeclaredLabel('Cotton', 'Cotton / Linen blend', cottonScan).status).toBe(
      'match',
    );
  });

  it('flags a mismatch when the declared fiber is absent from the top 3', () => {
    const result = evaluateDeclaredLabel('Cotton', '100% Silk', cottonScan);
    expect(result.status).toBe('mismatch');
    expect(result.missing).toEqual(['Silk']);
  });

  it('does not call a faint hit a clean match, and does not raise a false alarm either', () => {
    // Polyester is in the top 3 but at 5%: seen, but not confirmed.
    const result = evaluateDeclaredLabel('Cotton', '95% Cotton 5% Polyester', cottonScan);
    expect(result.status).toBe('weak');
    expect(result.weak).toEqual([{ fabric: 'Polyester', percentage: 5 }]);
  });

  it('treats a declared fiber under the 2% trace floor as missing', () => {
    const scan = [
      { material: 'Cotton', percentage: 98 },
      { material: 'Rayon', percentage: 1 },
    ];
    expect(evaluateDeclaredLabel('Cotton', 'Cotton and Rayon', scan).status).toBe('mismatch');
  });

  it('recognizes common tag names for supported fibers', () => {
    const rayonScan = [{ material: 'Rayon', percentage: 80 }];
    expect(evaluateDeclaredLabel('Rayon', '100% Viscose', rayonScan).status).toBe('match');
    expect(evaluateDeclaredLabel('Linen', 'Flax', [{ material: 'Linen', percentage: 90 }]).status).toBe(
      'match',
    );
    expect(
      evaluateDeclaredLabel('Nylon', 'Polyamide', [{ material: 'Nylon', percentage: 90 }]).status,
    ).toBe('match');
  });

  it('never reports "matches" for a label it cannot read', () => {
    const cashmere = evaluateDeclaredLabel('Cotton', '100% Cashmere', cottonScan);
    expect(cashmere.status).toBe('unreadable');
    expect(cashmere.unsupported).toEqual(['cashmere']);

    expect(evaluateDeclaredLabel('Cotton', 'asdf 123', cottonScan).status).toBe('unreadable');
  });

  it('does not treat imitation leather as leather', () => {
    const scan = [{ material: 'Leather', percentage: 85 }];
    const result = evaluateDeclaredLabel('Leather', 'PU leather', scan);
    expect(result.status).toBe('unreadable');
    expect(result.unsupported).toEqual(['pu leather']);
    expect(evaluateDeclaredLabel('Leather', 'Genuine leather', scan).status).toBe('match');
  });

  it('checks the fibers it knows and says so when part of a label cannot be checked', () => {
    const result = evaluateDeclaredLabel('Cotton', 'Cotton 80% / Cashmere 20%', cottonScan);
    expect(result.status).toBe('match');
    expect(result.message).toMatch(/cashmere/i);
  });
});
