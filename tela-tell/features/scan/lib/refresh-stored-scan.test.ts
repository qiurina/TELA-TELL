import { refreshStoredScan } from '@/features/scan/lib/refresh-stored-scan';

// A scan saved by an older build: a stored sustainability score, alternatives stored with their
// old text, plus user-entered and scan-time fields that a refresh must never touch.
const OLD_SCAN = {
  id: 'scan-1',
  dominantFabric: 'Cotton',
  compositions: [{ material: 'Cotton', percentage: 62 }],
  confidence: 0.62,
  scannedAt: '2026-09-01T10:00:00.000Z',
  scannedAtDate: '2026-09-01',
  sellerLabel: '100% silk',
  imageUri: 'file:///scans/scan-1.jpg',
  garmentCondition: 'worn',
  someFutureField: { keep: 'me' },
  profile: { texture: 'old' },
  sustainability: { rating: 'green', label: 'Sustainable', score: 9.9, factors: [] },
  recommendations: {
    garmentPurposes: [],
    ecoAlternatives: [{ name: 'Organic cotton', similarity: 'Old text.' }],
    reuse: { resale: 'old', donate: 'old', upcycle: 'old' },
  },
};

describe('refreshStoredScan', () => {
  it('re-derives only profile and recommendations, and removes the old stored sustainability score', () => {
    const next = refreshStoredScan(OLD_SCAN as never);

    expect(next.id).toBe(OLD_SCAN.id);
    expect(next.confidence).toBe(OLD_SCAN.confidence);
    expect(next.scannedAt).toBe(OLD_SCAN.scannedAt);
    expect(next.sellerLabel).toBe('100% silk');
    expect(next.imageUri).toBe('file:///scans/scan-1.jpg');
    expect(next.garmentCondition).toBe('worn');
    expect(next.compositions).toEqual(OLD_SCAN.compositions);
    expect(next.someFutureField).toEqual({ keep: 'me' });

    expect(next.profile).not.toEqual(OLD_SCAN.profile);
    // The old score never comes back: the key is gone, not carried over or rebuilt.
    expect('sustainability' in next).toBe(false);
    expect(JSON.stringify(next)).not.toMatch(/sustainab|Sustainable|9\.9/);
  });

  it('carries the saved capture details over untouched', () => {
    const capture = {
      captureType: 'live_camera',
      clipOnLens: true,
      modelVersion: 'test-model-1',
      burstCount: 3,
      inferenceMs: 120,
      totalMs: 900,
      sharpness: 640.2,
      sharpnessCheck: 'passed',
    };
    const next = refreshStoredScan({ ...OLD_SCAN, capture } as never);
    expect(next.capture).toEqual(capture);
  });

  it('carries the tester fields over untouched', () => {
    const testerFields = { careLabelComposition: '100% Silk', construction: 'woven', garmentId: 'G-3' };
    const next = refreshStoredScan({ ...OLD_SCAN, testerFields } as never);
    expect(next.testerFields).toEqual(testerFields);
  });

  it('is stable: refreshing twice produces identical JSON, so unchanged rows can be skipped', () => {
    const once = refreshStoredScan(OLD_SCAN as never);
    const twice = refreshStoredScan(once as never);
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once));
  });

  it('stores only the name and text of each alternative, not claims or sources', () => {
    const next = refreshStoredScan(OLD_SCAN as never) as unknown as {
      recommendations: { ecoAlternatives: Record<string, unknown>[] };
    };
    expect(next.recommendations.ecoAlternatives.length).toBeGreaterThan(0);
    for (const alt of next.recommendations.ecoAlternatives) {
      expect(Object.keys(alt).sort()).toEqual(['name', 'similarity']);
    }
  });

  it('handles missing compositions, and throws for an unknown fiber so the migration skips that row', () => {
    const next = refreshStoredScan({ id: 'x', dominantFabric: 'Cotton' } as never);
    expect(next.id).toBe('x');
    expect('sustainability' in next).toBe(false);
    // The migration wraps each row in try/catch, so a scan it cannot rebuild is left as saved.
    expect(() => refreshStoredScan({ id: 'y', dominantFabric: 'Mystery blend' } as never)).toThrow();
  });
});
