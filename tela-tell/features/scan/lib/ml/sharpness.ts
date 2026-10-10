import {
  computeSharpnessSignals,
  getChannelLayout,
} from '@/features/scan/lib/ml/live/frame-signals';

/**
 * Blur check for captured photos. It reuses the same Laplacian measure the live camera hint uses
 * (computeSharpnessSignals), run over the whole photo after it is resized to the live frame size
 * (SHARPNESS_ANALYSIS_SIZE), so a reading here is on the same scale as the live one.
 *
 * `variance` is the variance of the |Laplacian| over a 48x48 grid: higher = more fine detail, a
 * very low value = blurry. Unlike a "is it ready" hint, this gate only REJECTS, and only a photo
 * whose sharpest frame is below BLUR_REJECT_VARIANCE.
 */
export const SHARPNESS_ANALYSIS_SIZE = 480;

/**
 * Photos whose sharpest frame reads below this are flagged as blurry and the person is asked to
 * retake (they can still choose "Use anyway").
 *
 * PROVISIONAL: not validated on a device. Chosen from ml-training/results/calibration/
 * sharpness_calibration_2026-10-10.txt, a study on 720 real dataset images (12 classes) with
 * synthetic Gaussian blur, which is not the same as real defocus or hand shake. At 100 it
 * rejected 0.4% of unblurred images (at most 2% in any one class) and caught about 47% of images
 * blurred to sigma 3 px at the model's 224 px scale and 94% at sigma 5 px, but only about 16% at
 * sigma 2 px, which the team's own probe found already cuts model accuracy from about 90% to
 * about 65%. It is deliberately conservative because low-texture fabrics (smooth knits, suede,
 * abaca) legitimately read low; a stricter value measurably rejects sharp photos of them (150:
 * up to 5% in a class, 300: up to 8%, 500: up to 27%).
 *
 * Team decision: keep 100 for now and treat it as UNVALIDATED until it has been tested with real
 * photos from the Android test phone with the clip-on lens; change it only after that testing.
 * The live hint's own 60 in camera-guide.tsx is a separate, still-uncalibrated placeholder and is
 * unchanged. Every scan records the sharpness it measured (capture.sharpness, plus whether the
 * person overrode the check), so this value can be recalibrated from real device scans.
 */
export const BLUR_REJECT_VARIANCE = 100;

/** Sharpness (variance of |Laplacian|) of an RGBA image. */
export function measureRgbaSharpness(rgba: Uint8Array, width: number, height: number): number {
  const layout = getChannelLayout('rgb-rgba-8-bit');
  if (!layout) {
    throw new Error('RGBA channel layout is unavailable.');
  }
  // The analysis reads through its own Uint8Array view, so give it an exactly-sized buffer.
  const buffer = rgba.buffer.slice(
    rgba.byteOffset,
    rgba.byteOffset + rgba.byteLength,
  ) as ArrayBuffer;
  return computeSharpnessSignals(buffer, width * 4, layout, {
    originX: 0,
    originY: 0,
    width,
    height,
  }).variance;
}

export type SharpnessVerdict = {
  /** The sharpest reading among the photos, null when nothing could be measured. */
  sharpest: number | null;
  /** True only when something was measured and even the sharpest photo is below the threshold. */
  blurry: boolean;
  /** False when no photo could be measured, so the check could not run. */
  measured: boolean;
  /**
   * Every photo's own reading, in capture order (null where a photo could not be measured). The
   * verdict above uses only the sharpest; this keeps the rest so they can be saved and studied.
   */
  readings: (number | null)[];
};

/**
 * Judges a capture from the readings of its photos. A burst passes if any one frame is sharp
 * enough; a failed measurement never blocks a scan (the check then reports `measured: false`).
 */
export function judgeSharpness(
  readings: (number | null)[],
  threshold: number = BLUR_REJECT_VARIANCE,
): SharpnessVerdict {
  const values = readings.filter((value): value is number => value != null && Number.isFinite(value));
  if (values.length === 0) {
    return { sharpest: null, blurry: false, measured: false, readings: [...readings] };
  }
  const sharpest = Math.max(...values);
  return { sharpest, blurry: sharpest < threshold, measured: true, readings: [...readings] };
}
