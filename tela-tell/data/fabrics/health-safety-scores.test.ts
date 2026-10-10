import { getHealthSafetyMetrics } from '@/data/fabrics/health-safety-scores';

describe('getHealthSafetyMetrics', () => {
  it('returns only the Wearing Comfort metric; the shedding level lives in the Synthetic & Microplastic section', () => {
    for (const fabric of ['Cotton', 'Polyester', 'Nylon']) {
      const metrics = getHealthSafetyMetrics(fabric, [{ material: fabric, percentage: 100 }]);
      expect(metrics.map((metric) => metric.id)).toEqual(['skinHealth']);
      expect(metrics[0].title).toBe('Wearing Comfort');
    }
  });

  it('gives a 1-10 comfort score with a note', () => {
    const [comfort] = getHealthSafetyMetrics('Cotton', [{ material: 'Cotton', percentage: 100 }]);
    expect(comfort.score).toBeGreaterThanOrEqual(1);
    expect(comfort.score).toBeLessThanOrEqual(10);
    expect(comfort.note.length).toBeGreaterThan(0);
  });
});
