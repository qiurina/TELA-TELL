import { getFiberBadge } from '@/features/results/lib/fiber-badge';

describe('getFiberBadge', () => {
  it('shows nothing for a trace synthetic share under a natural top fiber (Abaca 86%, Polyester 3%)', () => {
    const badge = getFiberBadge(
      'Abaca',
      [
        { material: 'Abaca', percentage: 86 },
        { material: 'Silk', percentage: 11 },
        { material: 'Polyester', percentage: 3 },
      ],
      false,
    );
    expect(badge).toBeNull();
  });

  it('names a synthetic with a clear share as "Other prediction", not as the result', () => {
    const badge = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 60 },
        { material: 'Polyester', percentage: 20 },
        { material: 'Silk', percentage: 20 },
      ],
      false,
    );
    expect(badge?.kind).toBe('possible');
    expect(badge?.label).toBe('Other prediction: Polyester');
    expect(badge?.fibers).toEqual(['Polyester']);
    expect(badge?.tone).toBe('caution');
  });

  it('applies the 15% line inclusively and not below it', () => {
    const at = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 70 },
        { material: 'Nylon', percentage: 15 },
        { material: 'Silk', percentage: 15 },
      ],
      false,
    );
    const below = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 72 },
        { material: 'Nylon', percentage: 14 },
        { material: 'Silk', percentage: 14 },
      ],
      false,
    );
    expect(at?.label).toBe('Other prediction: Nylon');
    expect(below).toBeNull();
  });

  it('lists two synthetics, most likely first, and shortens longer lists', () => {
    const two = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 40 },
        { material: 'Polyester', percentage: 35 },
        { material: 'Nylon', percentage: 25 },
      ],
      false,
    );
    expect(two?.label).toBe('Other predictions: Polyester, Nylon');

    const three = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 40 },
        { material: 'Polyester', percentage: 30 },
        { material: 'Nylon', percentage: 20 },
        { material: 'Acrylic', percentage: 20 },
      ],
      false,
    );
    expect(three?.label).toBe('Other predictions: Polyester +2');
    expect(three?.fibers).toHaveLength(3);
  });

  it('says "Likely synthetic" with the fiber name when the top fiber is synthetic', () => {
    const badge = getFiberBadge(
      'Polyester',
      [
        { material: 'Polyester', percentage: 80 },
        { material: 'Cotton', percentage: 12 },
        { material: 'Silk', percentage: 8 },
      ],
      false,
    );
    expect(badge?.kind).toBe('likely');
    expect(badge?.label).toBe('Likely synthetic: Polyester');
    expect(badge?.tone).toBe('caution');
  });

  it('shows no badge for an Unsure scan, even with a synthetic top fiber', () => {
    expect(
      getFiberBadge('Polyester', [{ material: 'Polyester', percentage: 45 }], true),
    ).toBeNull();
    expect(
      getFiberBadge(
        'Cotton',
        [
          { material: 'Cotton', percentage: 40 },
          { material: 'Polyester', percentage: 38 },
        ],
        true,
      ),
    ).toBeNull();
  });

  it('never claims the fabric has no synthetic fibers', () => {
    const none = getFiberBadge('Wool', [{ material: 'Wool', percentage: 95 }], false);
    expect(none).toBeNull();
  });

  it('explains that it is a model prediction, not a measurement, and names the fibers', () => {
    const possible = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 60 },
        { material: 'Polyester', percentage: 40 },
      ],
      false,
    );
    expect(possible?.infoTitle).toBe('Other fiber predictions');
    expect(possible?.infoMessage).toBe(
      "The model's other predictions include Polyester. This is a visual prediction, not a measurement of what the fabric contains. Check the care tag for the actual fiber content.",
    );

    const two = getFiberBadge(
      'Cotton',
      [
        { material: 'Cotton', percentage: 40 },
        { material: 'Polyester', percentage: 35 },
        { material: 'Nylon', percentage: 25 },
      ],
      false,
    );
    expect(two?.infoMessage).toMatch(/other predictions include Polyester and Nylon\./);

    const likely = getFiberBadge('Nylon', [{ material: 'Nylon', percentage: 90 }], false);
    expect(likely?.infoMessage).toMatch(/not a measurement of what the fabric contains/);
    expect(likely?.infoMessage).toMatch(/top prediction is Nylon/);
  });
});
