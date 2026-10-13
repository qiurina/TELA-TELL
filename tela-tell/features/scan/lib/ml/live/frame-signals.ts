export type ChannelLayout = {
  bytesPerPixel: number;
  redOffset: number;
  greenOffset: number;
  blueOffset: number;
};

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
  variance: number;
  texturedFraction: number;
};

const DOWNSAMPLE_SIZE = 48;
// Placeholder; not yet calibrated on a device.
const NOISE_FLOOR = 8;

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
