import type {
  CaptureType,
  ScanCaptureMeta,
  SharpnessCheckStatus,
} from '@/data/scans/mock-data';
import { MODEL_VERSION } from '@/features/scan/lib/ml/constants';
import { roundLightingReading, type LightingAssessment } from '@/features/scan/lib/ml/lighting';
import type { ClassificationResult } from '@/features/scan/lib/ml/model';

/** What the scan screen knows about the capture before the model runs. */
export type CaptureInput = {
  captureType: CaptureType;
  clipOnLens: boolean;
  /** Sharpest reading of the capture, null if it could not be measured. */
  sharpness: number | null;
  /** One reading per captured photo, in capture order. */
  sharpnessPerPhoto?: (number | null)[];
  sharpnessCheck: SharpnessCheckStatus;
  /** The lighting check's readings and notices for this capture. */
  lighting?: LightingAssessment;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

/** Combines the capture facts with what the classification run measured. */
export function buildCaptureMeta(
  capture: CaptureInput,
  run: Pick<ClassificationResult, 'burstCount' | 'inferenceMs' | 'totalMs'>,
): ScanCaptureMeta {
  return {
    captureType: capture.captureType,
    clipOnLens: capture.clipOnLens,
    modelVersion: MODEL_VERSION,
    burstCount: run.burstCount,
    inferenceMs: run.inferenceMs,
    totalMs: run.totalMs,
    sharpness: capture.sharpness == null ? null : round1(capture.sharpness),
    sharpnessPerPhoto: capture.sharpnessPerPhoto?.map((value) =>
      value == null ? null : round1(value),
    ),
    sharpnessCheck: capture.sharpnessCheck,
    lighting: capture.lighting
      ? {
          perPhoto: capture.lighting.perPhoto.map(roundLightingReading),
          warnings: [...capture.lighting.warnings],
        }
      : undefined,
  };
}
