/**
 * Exact 2:1 box downscale of an RGBA buffer. For an exact factor of 2, OpenCV's
 * cv2.resize(..., INTER_AREA) -- the resize ml-training/common/opencv_preprocess.py ends with --
 * is a 2x2 average rounded to nearest, so this reproduces it exactly.
 */
export function downscaleRgbaByTwo(
  rgba: Uint8Array,
  width: number,
  height: number,
): { data: Uint8Array; width: number; height: number } {
  const outWidth = width >> 1;
  const outHeight = height >> 1;
  const out = new Uint8Array(outWidth * outHeight * 4);

  for (let y = 0; y < outHeight; y++) {
    const row0 = y * 2 * width * 4;
    const row1 = row0 + width * 4;
    for (let x = 0; x < outWidth; x++) {
      const a = row0 + x * 8;
      const b = row1 + x * 8;
      const o = (y * outWidth + x) * 4;
      for (let c = 0; c < 3; c++) {
        out[o + c] = (rgba[a + c] + rgba[a + 4 + c] + rgba[b + c] + rgba[b + 4 + c] + 2) >> 2;
      }
      out[o + 3] = 255;
    }
  }

  return { data: out, width: outWidth, height: outHeight };
}
