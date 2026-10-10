import {
  assessLighting,
  DEFAULT_LIGHTING_THRESHOLDS,
  LIGHTING_NOTICES,
  LIGHTING_WARN_CLIPPED_SHARE_AT_LEAST,
  LIGHTING_WARN_MEAN_LUMA_BELOW,
  measureRgbaLighting,
  roundLightingReading,
  type LightingReading,
} from '@/features/scan/lib/ml/lighting';

function makeRgba(
  width: number,
  height: number,
  pixel: (x: number, y: number) => [number, number, number],
): Uint8Array {
  const rgba = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = pixel(x, y);
      const i = (y * width + x) * 4;
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      rgba[i + 3] = 255;
    }
  }
  return rgba;
}

const reading = (overrides: Partial<LightingReading> = {}): LightingReading => ({
  meanLuma: 120,
  darkShare: 0,
  clippedShare: 0,
  unevenness: 0.1,
  ...overrides,
});

describe('measureRgbaLighting', () => {
  // Expected values come from the NumPy measure in ml-training/scripts/evaluation/
  // lighting_calibration.py on the same synthetic images; that is what the thresholds were
  // studied with, so the two must agree.
  it('matches the NumPy measure used in the study (square image)', () => {
    const rgba = makeRgba(96, 96, (x, y) => [(x * 7 + y * 13) % 256, ((x * 3) ^ (y * 5)) % 256, (x * y) % 256]);
    const result = measureRgbaLighting(rgba, 96, 96);
    expect(result.meanLuma).toBeCloseTo(126.50806944444442, 6);
    expect(result.darkShare).toBeCloseTo(0.015082465277777778, 9);
    expect(result.clippedShare).toBeCloseTo(0.00010850694444444444, 9);
    expect(result.unevenness).toBeCloseTo(0.2882248955703349, 9);
  });

  it('matches the NumPy measure used in the study (non-square image)', () => {
    const rgba = makeRgba(120, 72, (x, y) => [(x * 5 + y * 11) % 256, ((x * 9) ^ (y * 3)) % 256, (x * y + 7) % 256]);
    const result = measureRgbaLighting(rgba, 120, 72);
    expect(result.meanLuma).toBeCloseTo(126.19455555555555, 6);
    expect(result.darkShare).toBeCloseTo(0.014699074074074074, 9);
    expect(result.clippedShare).toBe(0);
    expect(result.unevenness).toBeCloseTo(0.20473412995489815, 9);
  });

  it('matches the NumPy measure on a left-to-right brightness ramp', () => {
    const rgba = makeRgba(90, 90, (x) => {
      const v = Math.min(255, Math.trunc((x * 255) / 89));
      return [v, v, v];
    });
    const result = measureRgbaLighting(rgba, 90, 90);
    expect(result.meanLuma).toBeCloseTo(127.0111111111111, 6);
    expect(result.darkShare).toBeCloseTo(0.12222222222222222, 9);
    expect(result.clippedShare).toBeCloseTo(0.022222222222222223, 9);
    expect(result.unevenness).toBeCloseTo(1.3428521829702282, 6);
  });

  it('reads the extremes: black is all dark, white is all clipped, mid-gray is neither', () => {
    expect(measureRgbaLighting(makeRgba(30, 30, () => [0, 0, 0]), 30, 30)).toEqual({
      meanLuma: 0,
      darkShare: 1,
      clippedShare: 0,
      unevenness: 0,
    });
    const white = measureRgbaLighting(makeRgba(30, 30, () => [255, 255, 255]), 30, 30);
    expect(white.meanLuma).toBeCloseTo(255, 6);
    expect(white.clippedShare).toBe(1);
    expect(white.darkShare).toBe(0);
    const gray = measureRgbaLighting(makeRgba(30, 30, () => [128, 128, 128]), 30, 30);
    expect(gray).toMatchObject({ darkShare: 0, clippedShare: 0, unevenness: 0 });
    expect(gray.meanLuma).toBeCloseTo(128, 6);
  });

  it('reads shading: a lit left half and shaded right half is uneven, a flat image is not', () => {
    const shaded = measureRgbaLighting(makeRgba(60, 60, (x) => (x < 30 ? [200, 200, 200] : [50, 50, 50])), 60, 60);
    expect(shaded.unevenness).toBeGreaterThan(1);
    expect(measureRgbaLighting(makeRgba(60, 60, () => [100, 100, 100]), 60, 60).unevenness).toBe(0);
  });

  it('copes with images whose sides are not divisible by 3, and with tiny images', () => {
    const odd = measureRgbaLighting(makeRgba(31, 29, () => [100, 100, 100]), 31, 29);
    expect(odd.unevenness).toBe(0);
    const tiny = measureRgbaLighting(makeRgba(2, 2, () => [10, 10, 10]), 2, 2);
    expect(Number.isFinite(tiny.meanLuma)).toBe(true);
    expect(tiny.unevenness).toBe(0);
    expect(measureRgbaLighting(new Uint8Array(0), 0, 0)).toEqual({
      meanLuma: 0,
      darkShare: 0,
      clippedShare: 0,
      unevenness: 0,
    });
  });
});

describe('assessLighting', () => {
  it('has no warnings for ordinary lighting', () => {
    expect(assessLighting([reading(), reading()]).warnings).toEqual([]);
  });

  it('warns "very dark" only below the provisional brightness threshold', () => {
    expect(LIGHTING_WARN_MEAN_LUMA_BELOW).toBe(30);
    expect(assessLighting([reading({ meanLuma: 29.9 })]).warnings).toEqual(['very_dark']);
    expect(assessLighting([reading({ meanLuma: 30 })]).warnings).toEqual([]);
  });

  it('warns "bright areas" at or above the provisional blown-highlight share', () => {
    expect(LIGHTING_WARN_CLIPPED_SHARE_AT_LEAST).toBe(0.1);
    expect(assessLighting([reading({ clippedShare: 0.1 })]).warnings).toEqual(['bright_areas']);
    expect(assessLighting([reading({ clippedShare: 0.099 })]).warnings).toEqual([]);
  });

  it('never warns about shading, however uneven, because the study found it cannot be told from fabric pattern', () => {
    expect(assessLighting([reading({ unevenness: 5 })]).warnings).toEqual([]);
  });

  it('can raise both notices at once', () => {
    expect(assessLighting([reading({ meanLuma: 10, clippedShare: 0.3 })]).warnings).toEqual([
      'very_dark',
      'bright_areas',
    ]);
  });

  it('judges a burst by the average of its measured photos and ignores unmeasured ones', () => {
    // Average brightness 40 (not below 30), even though one photo alone is darker.
    expect(assessLighting([reading({ meanLuma: 20 }), reading({ meanLuma: 60 })]).warnings).toEqual([]);
    expect(assessLighting([reading({ meanLuma: 20 }), null, reading({ meanLuma: 30 })]).warnings).toEqual([
      'very_dark',
    ]);
  });

  it('keeps every photo\'s reading in capture order and flags nothing when nothing was measured', () => {
    const photos = [reading({ meanLuma: 50 }), null, reading({ meanLuma: 60 })];
    const result = assessLighting(photos);
    expect(result.perPhoto).toEqual(photos);
    expect(result.perPhoto).not.toBe(photos);
    expect(assessLighting([null, null])).toEqual({ perPhoto: [null, null], warnings: [] });
    expect(assessLighting([])).toEqual({ perPhoto: [], warnings: [] });
  });

  it('accepts custom thresholds', () => {
    const strict = { ...DEFAULT_LIGHTING_THRESHOLDS, meanLumaBelow: 80 };
    expect(assessLighting([reading({ meanLuma: 60 })], strict).warnings).toEqual(['very_dark']);
  });
});

describe('roundLightingReading', () => {
  it('rounds for storage and keeps nulls', () => {
    expect(
      roundLightingReading({ meanLuma: 126.5081, darkShare: 0.0150825, clippedShare: 0.00010851, unevenness: 0.28822 }),
    ).toEqual({ meanLuma: 126.5, darkShare: 0.015, clippedShare: 0, unevenness: 0.288 });
    expect(roundLightingReading(null)).toBeNull();
  });
});

describe('lighting notices', () => {
  it('are advisory: they say to ignore the notice when the light is fine, and never mention accuracy or blocking', () => {
    for (const notice of Object.values(LIGHTING_NOTICES)) {
      const text = `${notice.title} ${notice.message}`.toLowerCase();
      expect(text).toMatch(/ignore this if the light is fine/);
      for (const forbidden of ['accura', 'wrong', 'unsure', 'cannot', "can't", 'must', 'blocked']) {
        expect(text).not.toContain(forbidden);
      }
    }
  });
});
