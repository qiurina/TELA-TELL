import { MODEL_VERSION } from '@/features/scan/lib/ml/constants';
import { buildCaptureMeta } from '@/features/scan/lib/scan-capture-meta';

describe('buildCaptureMeta', () => {
  const run = { burstCount: 3, inferenceMs: 120, totalMs: 940 };

  it('combines the capture facts, the model version and the run measurements', () => {
    expect(
      buildCaptureMeta(
        { captureType: 'live_camera', clipOnLens: true, sharpness: 1234.56, sharpnessCheck: 'passed' },
        run,
      ),
    ).toEqual({
      captureType: 'live_camera',
      clipOnLens: true,
      modelVersion: MODEL_VERSION,
      burstCount: 3,
      inferenceMs: 120,
      totalMs: 940,
      sharpness: 1234.6,
      sharpnessCheck: 'passed',
    });
  });

  it('records each photo\'s own sharpness, rounded, in capture order, with nulls kept', () => {
    const meta = buildCaptureMeta(
      {
        captureType: 'live_camera',
        clipOnLens: false,
        sharpness: 812.44,
        sharpnessPerPhoto: [95.26, 812.44, null],
        sharpnessCheck: 'passed',
      },
      run,
    );
    expect(meta.sharpnessPerPhoto).toEqual([95.3, 812.4, null]);
    // The existing single value is unchanged: it is still the sharpest photo's reading.
    expect(meta.sharpness).toBe(812.4);
  });

  it('leaves the per-photo readings out when none were given, as for a legacy caller', () => {
    const meta = buildCaptureMeta(
      { captureType: 'gallery', clipOnLens: false, sharpness: 50, sharpnessCheck: 'overridden' },
      { burstCount: 1, inferenceMs: 40, totalMs: 300 },
    );
    expect(meta.sharpnessPerPhoto).toBeUndefined();
    expect(JSON.parse(JSON.stringify(meta))).not.toHaveProperty('sharpnessPerPhoto');
  });

  it('records the lighting readings per photo, rounded, with the notices raised', () => {
    const meta = buildCaptureMeta(
      {
        captureType: 'live_camera',
        clipOnLens: false,
        sharpness: 500,
        sharpnessCheck: 'passed',
        lighting: {
          perPhoto: [
            { meanLuma: 126.5081, darkShare: 0.0150825, clippedShare: 0.1234, unevenness: 0.28822 },
            null,
          ],
          warnings: ['bright_areas'],
        },
      },
      run,
    );
    expect(meta.lighting).toEqual({
      perPhoto: [{ meanLuma: 126.5, darkShare: 0.015, clippedShare: 0.123, unevenness: 0.288 }, null],
      warnings: ['bright_areas'],
    });
  });

  it('leaves the lighting out when none was given, as for a legacy caller', () => {
    const meta = buildCaptureMeta(
      { captureType: 'gallery', clipOnLens: false, sharpness: 50, sharpnessCheck: 'passed' },
      { burstCount: 1, inferenceMs: 40, totalMs: 300 },
    );
    expect(meta.lighting).toBeUndefined();
    expect(JSON.parse(JSON.stringify(meta))).not.toHaveProperty('lighting');
  });

  it('records an unmeasured sharpness as null, not 0', () => {
    const meta = buildCaptureMeta(
      { captureType: 'gallery', clipOnLens: false, sharpness: null, sharpnessCheck: 'unchecked' },
      { burstCount: 1, inferenceMs: 40, totalMs: 300 },
    );
    expect(meta.sharpness).toBeNull();
    expect(meta.sharpnessCheck).toBe('unchecked');
    expect(meta.burstCount).toBe(1);
  });

  it('keeps each capture type and the overridden state as given', () => {
    const meta = buildCaptureMeta(
      { captureType: 'system_camera', clipOnLens: false, sharpness: 12, sharpnessCheck: 'overridden' },
      run,
    );
    expect(meta.captureType).toBe('system_camera');
    expect(meta.sharpnessCheck).toBe('overridden');
  });
});
