import type {
  CaptureType,
  ScanCaptureMeta,
  SharpnessCheckStatus,
} from '@/data/scans/mock-data';
import { MODEL_VERSION } from '@/features/scan/lib/ml/constants';
import { roundLightingReading, type LightingAssessment } from '@/features/scan/lib/ml/lighting';
import type { ClassificationResult } from '@/features/scan/lib/ml/model';

export type CaptureInput = {
  captureType: CaptureType;
  clipOnLens?: boolean;
  sharpness: number | null;
  sharpnessPerPhoto?: (number | null)[];
  sharpnessCheck: SharpnessCheckStatus;
  lighting?: LightingAssessment;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

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
