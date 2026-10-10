import type { CaptureType, ScanCaptureMeta } from '@/data/scans/mock-data';
import type { LightingReading, LightingWarning } from '@/features/scan/lib/ml/lighting';

export const NOT_RECORDED = 'Not recorded';

const CAPTURE_TYPE_LABELS: Record<CaptureType, string> = {
  live_camera: 'Live camera',
  system_camera: 'Phone camera app',
  gallery: 'Gallery photo',
};

export function isCaptureType(value: unknown): value is CaptureType {
  // Own keys only: `in` would also accept inherited names such as "toString".
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CAPTURE_TYPE_LABELS, value);
}

/** Plain-language name of how a photo was captured; "Not recorded" for older scans. */
export function captureTypeLabel(type: CaptureType | string | null | undefined): string {
  return isCaptureType(type) ? CAPTURE_TYPE_LABELS[type] : NOT_RECORDED;
}

export type DetailRow = { label: string; value: string };

export type ScanDetails = {
  /** False for scans saved before capture details were recorded. */
  recorded: boolean;
  /** Short text for the collapsed card header. */
  summary: string;
  rows: DetailRow[];
  /** Measurements and identifiers, shown only under "Technical details". */
  technical: DetailRow[];
};

const BLUR_CHECK_LABELS: Record<ScanCaptureMeta['sharpnessCheck'], string> = {
  passed: 'Passed',
  overridden: 'Warned as blurry, used anyway',
  unchecked: 'Could not be checked',
};

function formatReading(value: number | null): string {
  return value == null ? 'not measured' : String(value);
}

const LIGHTING_WARNING_LABELS: Record<LightingWarning, string> = {
  very_dark: 'Very dark',
  bright_areas: 'Very bright areas',
};

function lightingSummary(lighting: ScanCaptureMeta['lighting']): string {
  if (!lighting) {
    return NOT_RECORDED;
  }
  if (lighting.warnings.length === 0) {
    return 'No notices';
  }
  return lighting.warnings.map((warning) => LIGHTING_WARNING_LABELS[warning] ?? warning).join(', ');
}

function joinPerPhoto(
  readings: (LightingReading | null)[],
  format: (reading: LightingReading) => string,
): string {
  return readings.length > 0
    ? readings.map((reading) => (reading ? format(reading) : 'not measured')).join(' / ')
    : NOT_RECORDED;
}

function lightingTechnicalRows(lighting: ScanCaptureMeta['lighting']): DetailRow[] {
  if (!lighting) {
    return [{ label: 'Lighting readings', value: NOT_RECORDED }];
  }
  return [
    { label: 'Brightness (0-255)', value: joinPerPhoto(lighting.perPhoto, (r) => String(r.meanLuma)) },
    {
      label: 'Blown-out pixels',
      value: joinPerPhoto(lighting.perPhoto, (r) => `${Math.round(r.clippedShare * 1000) / 10}%`),
    },
    { label: 'Shading (recorded only)', value: joinPerPhoto(lighting.perPhoto, (r) => String(r.unevenness)) },
  ];
}

/**
 * Turns a scan's saved capture details into rows for the "Scan details" card. Reads only what was
 * saved; nothing is computed or inferred, and fields an older scan lacks are shown as "Not
 * recorded" instead of being guessed.
 */
export function describeScanDetails(capture: ScanCaptureMeta | null | undefined): ScanDetails {
  if (!capture) {
    return {
      recorded: false,
      summary: NOT_RECORDED,
      rows: [
        {
          label: 'Capture details',
          value: `${NOT_RECORDED} (this scan was saved before they were kept)`,
        },
      ],
      technical: [],
    };
  }

  const perPhoto = capture.sharpnessPerPhoto;

  return {
    recorded: true,
    summary: captureTypeLabel(capture.captureType),
    rows: [
      { label: 'Capture', value: captureTypeLabel(capture.captureType) },
      { label: 'Clip-on macro lens', value: capture.clipOnLens ? 'Using (your answer)' : 'Not using (your answer)' },
      { label: 'Photos analyzed', value: String(capture.burstCount) },
      { label: 'Blur check', value: BLUR_CHECK_LABELS[capture.sharpnessCheck] ?? NOT_RECORDED },
      { label: 'Lighting', value: lightingSummary(capture.lighting) },
    ],
    technical: [
      { label: 'Sharpest photo reading', value: formatReading(capture.sharpness) },
      {
        label: 'Each photo\'s reading',
        value: perPhoto && perPhoto.length > 0 ? perPhoto.map(formatReading).join(' / ') : NOT_RECORDED,
      },
      ...lightingTechnicalRows(capture.lighting),
      { label: 'Time in the model', value: `${capture.inferenceMs} ms` },
      { label: 'Total analysis time', value: `${capture.totalMs} ms` },
      { label: 'Model version', value: capture.modelVersion },
    ],
  };
}
