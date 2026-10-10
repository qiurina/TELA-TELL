import type { ScanCaptureMeta } from '@/data/scans/mock-data';
import {
  captureTypeLabel,
  describeScanDetails,
  isCaptureType,
  NOT_RECORDED,
} from '@/features/results/lib/scan-details';

const CAPTURE: ScanCaptureMeta = {
  captureType: 'live_camera',
  clipOnLens: true,
  modelVersion: 'efficientnet-lite0-grayscale-6a47bf37',
  burstCount: 3,
  inferenceMs: 120,
  totalMs: 940,
  sharpness: 812.4,
  sharpnessPerPhoto: [95.3, 812.4, null],
  sharpnessCheck: 'passed',
};

describe('captureTypeLabel', () => {
  it('names each capture type in plain language', () => {
    expect(captureTypeLabel('live_camera')).toBe('Live camera');
    expect(captureTypeLabel('system_camera')).toBe('Phone camera app');
    expect(captureTypeLabel('gallery')).toBe('Gallery photo');
  });

  it('says "Not recorded" for scans saved before capture details existed, and for anything unrecognized', () => {
    expect(captureTypeLabel(null)).toBe(NOT_RECORDED);
    expect(captureTypeLabel(undefined)).toBe(NOT_RECORDED);
    expect(captureTypeLabel('drone')).toBe(NOT_RECORDED);
    // Names every object inherits must not be mistaken for a capture type.
    expect(captureTypeLabel('toString')).toBe(NOT_RECORDED);
    expect(captureTypeLabel('constructor')).toBe(NOT_RECORDED);
    expect(NOT_RECORDED).toBe('Not recorded');
  });
});

describe('isCaptureType', () => {
  it('accepts only the three known types', () => {
    expect(isCaptureType('gallery')).toBe(true);
    expect(isCaptureType('toString')).toBe(false);
    expect(isCaptureType(5)).toBe(false);
    expect(isCaptureType(null)).toBe(false);
  });
});

describe('describeScanDetails', () => {
  it('lists the saved capture details and keeps measurements under technical', () => {
    const details = describeScanDetails(CAPTURE);
    expect(details.recorded).toBe(true);
    expect(details.summary).toBe('Live camera');
    expect(details.rows).toEqual([
      { label: 'Capture', value: 'Live camera' },
      { label: 'Clip-on macro lens', value: 'Using (your answer)' },
      { label: 'Photos analyzed', value: '3' },
      { label: 'Blur check', value: 'Passed' },
      { label: 'Lighting', value: 'Not recorded' },
    ]);
    expect(details.technical).toEqual([
      { label: 'Sharpest photo reading', value: '812.4' },
      { label: "Each photo's reading", value: '95.3 / 812.4 / not measured' },
      { label: 'Lighting readings', value: 'Not recorded' },
      { label: 'Time in the model', value: '120 ms' },
      { label: 'Total analysis time', value: '940 ms' },
      { label: 'Model version', value: 'efficientnet-lite0-grayscale-6a47bf37' },
    ]);
  });

  it("shows the lighting result and each photo's readings when they were recorded", () => {
    const lighting = {
      perPhoto: [
        { meanLuma: 142.3, darkShare: 0.01, clippedShare: 0.123, unevenness: 0.31 },
        null,
        { meanLuma: 139.9, darkShare: 0, clippedShare: 0.1, unevenness: 0.29 },
      ],
      warnings: ['bright_areas' as const],
    };
    const details = describeScanDetails({ ...CAPTURE, lighting });
    expect(details.rows.find((row) => row.label === 'Lighting')?.value).toBe('Very bright areas');
    const technical = Object.fromEntries(details.technical.map((row) => [row.label, row.value]));
    expect(technical['Brightness (0-255)']).toBe('142.3 / not measured / 139.9');
    expect(technical['Blown-out pixels']).toBe('12.3% / not measured / 10%');
    expect(technical['Shading (recorded only)']).toBe('0.31 / not measured / 0.29');
  });

  it('says "No notices" when the lighting check found nothing, and joins several notices', () => {
    const reading = { meanLuma: 120, darkShare: 0, clippedShare: 0, unevenness: 0.1 };
    expect(
      describeScanDetails({ ...CAPTURE, lighting: { perPhoto: [reading], warnings: [] } }).rows.find(
        (row) => row.label === 'Lighting',
      )?.value,
    ).toBe('No notices');
    expect(
      describeScanDetails({
        ...CAPTURE,
        lighting: { perPhoto: [reading], warnings: ['very_dark', 'bright_areas'] },
      }).rows.find((row) => row.label === 'Lighting')?.value,
    ).toBe('Very dark, Very bright areas');
  });

  it('says so when the person used a photo the blur check flagged', () => {
    const details = describeScanDetails({ ...CAPTURE, sharpnessCheck: 'overridden' });
    expect(details.rows.find((row) => row.label === 'Blur check')?.value).toBe(
      'Warned as blurry, used anyway',
    );
    expect(describeScanDetails({ ...CAPTURE, sharpnessCheck: 'unchecked' }).rows[3].value).toBe(
      'Could not be checked',
    );
  });

  it('shows the lens answer as the person\'s own, never as something detected', () => {
    expect(describeScanDetails({ ...CAPTURE, clipOnLens: false }).rows[1].value).toBe(
      'Not using (your answer)',
    );
  });

  it('handles a scan saved before per-photo readings existed, without inventing them', () => {
    const { sharpnessPerPhoto: _omitted, ...older } = CAPTURE;
    const details = describeScanDetails(older);
    expect(details.technical.find((row) => row.label === "Each photo's reading")?.value).toBe(NOT_RECORDED);
    expect(details.technical[0].value).toBe('812.4');
  });

  it('shows an unmeasured sharpest reading as not measured', () => {
    const details = describeScanDetails({ ...CAPTURE, sharpness: null, sharpnessPerPhoto: [null] });
    expect(details.technical[0].value).toBe('not measured');
  });

  it('says "Not recorded" for a scan with no capture details at all', () => {
    for (const missing of [undefined, null]) {
      const details = describeScanDetails(missing);
      expect(details.recorded).toBe(false);
      expect(details.summary).toBe('Not recorded');
      expect(details.rows).toHaveLength(1);
      expect(details.rows[0].value).toMatch(/^Not recorded/);
      expect(details.technical).toEqual([]);
    }
  });
});
