/**
 * Worklet-callable pixel analysis for the live camera guidance signals
 * (distance/fill-ratio + blur/focus). Runs on VisionCamera's frame-processor
 * thread, not the JS thread — every exported function is a worklet (`'worklet'`
 * directive) so Reanimated's babel plugin compiles it for that runtime and it
 * can be called from another worklet (the onFrame callback in camera-guide.tsx).
 *
 * Deliberately NOT the same pipeline as the accurate offline one
 * (features/scan/lib/ml/preprocess.ts) — no white balance, no CLAHE, no LAB
 * colorspace. That pipeline is too slow to run per live frame; this one exists
 * purely to drive a live on-screen hint, not the actual classification result.
 */

export type ChannelLayout = {
  bytesPerPixel: number;
  redOffset: number;
  greenOffset: number;
  blueOffset: number;
};

/**
 * Maps VisionCamera's concrete negotiated pixel format to byte offsets.
 * Returns null for formats this pipeline can't read directly (planar YUV,
 * RAW, private/GPU-only) — caller should skip that frame.
 */
export function getChannelLayout(pixelFormat: string): ChannelLayout | null {
  'worklet';
  switch (pixelFormat) {
    case 'rgb-bgra-8-bit':
      return { bytesPerPixel: 4, redOffset: 2, greenOffset: 1, blueOffset: 0 };
    case 'rgb-rgba-8-bit':
      return { bytesPerPixel: 4, redOffset: 0, greenOffset: 1, blueOffset: 2 };
    case 'rgb-rgb-8-bit':
      return { bytesPerPixel: 3, redOffset: 0, greenOffset: 1, blueOffset: 2 };
    default:
      return null;
  }
}

export type PixelRect = {
  originX: number;
  originY: number;
  width: number;
  height: number;
};

/**
 * Worklet-safe port of crop-to-guide.ts's mapCoverCrop() — same cover-crop math
 * (the frame here plays the role that "image" plays there), duplicated rather
 * than imported because that file's functions aren't worklet-marked and are
 * also used from plain JS elsewhere (the actual photo-capture crop). Maps the
 * on-screen guide-box rectangle into frame-pixel coordinates, so the live
 * analysis looks at the same region the user is actually framing, not the
 * camera's whole field of view — analyzing the whole FOV was the reason a
 * background-filled "too far" shot didn't reliably read differently from a
 * close-up: many ordinary backgrounds have enough texture to pass a fixed
 * threshold when averaged over the entire frame instead of just the guide box.
 */
export function computeGuideRegionInFrame(
  viewWidth: number,
  viewHeight: number,
  frameWidth: number,
  frameHeight: number,
  guideX: number,
  guideY: number,
  guideWidth: number,
  guideHeight: number,
): PixelRect {
  'worklet';
  if (viewWidth <= 0 || viewHeight <= 0 || frameWidth <= 0 || frameHeight <= 0) {
    return { originX: 0, originY: 0, width: frameWidth, height: frameHeight };
  }

  const frameAspect = frameWidth / frameHeight;
  const viewAspect = viewWidth / viewHeight;

  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (frameAspect > viewAspect) {
    scale = viewHeight / frameHeight;
    offsetX = (frameWidth * scale - viewWidth) / 2;
  } else {
    scale = viewWidth / frameWidth;
    offsetY = (frameHeight * scale - viewHeight) / 2;
  }

  let originX = (guideX + offsetX) / scale;
  let originY = (guideY + offsetY) / scale;
  let width = guideWidth / scale;
  let height = guideHeight / scale;

  originX = Math.max(0, Math.min(originX, frameWidth - 2));
  originY = Math.max(0, Math.min(originY, frameHeight - 2));
  width = Math.min(width, frameWidth - originX);
  height = Math.min(height, frameHeight - originY);

  return {
    originX: Math.floor(originX),
    originY: Math.floor(originY),
    width: Math.max(2, Math.floor(width)),
    height: Math.max(2, Math.floor(height)),
  };
}

export type SharpnessSignals = {
  /** Overall Laplacian-response variance across the downsample — low = blurry. */
  variance: number;
  /** Share of pixels with above-noise-floor edge response — low = too far/flat. */
  texturedFraction: number;
};

const DOWNSAMPLE_SIZE = 48;
/** Laplacian magnitude below this is treated as sensor noise, not real texture.
 * Placeholder — needs on-device calibration against real blurred/in-focus and
 * near/far shots, per the plan. */
const NOISE_FLOOR = 8;

/**
 * Downsamples the frame to a small grayscale grid (nearest-neighbor — cheap,
 * fine at this throttled cadence) and runs one Laplacian pass over it,
 * producing both signals from a single O(pixels) traversal.
 */
export function computeSharpnessSignals(
  pixelBuffer: ArrayBuffer,
  bytesPerRow: number,
  layout: ChannelLayout,
  region: PixelRect,
): SharpnessSignals {
  'worklet';
  const size = DOWNSAMPLE_SIZE;
  const bytes = new Uint8Array(pixelBuffer);
  const gray = new Uint8Array(size * size);

  for (let y = 0; y < size; y++) {
    const srcY = region.originY + Math.min(region.height - 1, Math.floor((y / size) * region.height));
    const rowStart = srcY * bytesPerRow;
    for (let x = 0; x < size; x++) {
      const srcX =
        region.originX + Math.min(region.width - 1, Math.floor((x / size) * region.width));
      const pixelStart = rowStart + srcX * layout.bytesPerPixel;
      const r = bytes[pixelStart + layout.redOffset];
      const g = bytes[pixelStart + layout.greenOffset];
      const b = bytes[pixelStart + layout.blueOffset];
      gray[y * size + x] = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
    }
  }

  let sum = 0;
  let sumSq = 0;
  let texturedCount = 0;
  let count = 0;

  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const idx = y * size + x;
      const center = gray[idx];
      const laplacian = gray[idx - size] + gray[idx + size] + gray[idx - 1] + gray[idx + 1] - 4 * center;
      const magnitude = Math.abs(laplacian);
      sum += magnitude;
      sumSq += magnitude * magnitude;
      if (magnitude > NOISE_FLOOR) {
        texturedCount++;
      }
      count++;
    }
  }

  const mean = count > 0 ? sum / count : 0;
  const variance = count > 0 ? sumSq / count - mean * mean : 0;
  const texturedFraction = count > 0 ? texturedCount / count : 0;

  return { variance, texturedFraction };
}
