import { guideToSnapshotRect, rgbaPixels } from '@/features/scan/lib/preview-snapshot';

describe('guideToSnapshotRect', () => {
  it('scales the guide from view points to snapshot pixels', () => {
    // The device from the capture log: a 360x800 view, its guide, and a 2x snapshot.
    const rect = guideToSnapshotRect(
      { width: 360, height: 800 },
      { width: 720, height: 1600 },
      { x: 20, y: 187, width: 320, height: 320 },
    );
    expect(rect).toEqual({ startX: 40, startY: 374, endX: 680, endY: 1014 });
  });

  it('handles a non-integer density', () => {
    const rect = guideToSnapshotRect(
      { width: 392, height: 872 },
      { width: 1080, height: 2400 },
      { x: 20, y: 200, width: 352, height: 352 },
    );
    expect(rect.endX - rect.startX).toBe(970);
    expect(rect.endY - rect.startY).toBe(969);
  });

  it('keeps the crop inside the snapshot', () => {
    const rect = guideToSnapshotRect(
      { width: 360, height: 800 },
      { width: 720, height: 1600 },
      { x: -10, y: 700, width: 400, height: 400 },
    );
    expect(rect.startX).toBe(0);
    expect(rect.endX).toBe(720);
    expect(rect.endY).toBe(1600);
    expect(rect.endY).toBeGreaterThan(rect.startY);
  });
});

describe('rgbaPixels', () => {
  const raw = (pixelFormat: string, byteLength: number) =>
    ({ buffer: new ArrayBuffer(byteLength), width: 2, height: 2, pixelFormat }) as never;

  it('returns tightly packed RGBA pixels', () => {
    expect(rgbaPixels(raw('RGBA', 16))?.length).toBe(16);
  });

  it('refuses other channel orders, so the file-based check is used instead', () => {
    expect(rgbaPixels(raw('BGRA', 16))).toBeNull();
  });

  it('refuses rows with padding', () => {
    expect(rgbaPixels(raw('RGBA', 24))).toBeNull();
  });
});
