import {
  encodeUtf8,
  ImportInvalidFileError,
  isSafeScanId,
  parseExportPayload,
  writeExportJson,
  type ExportBody,
} from '@/features/profile/lib/export-format';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';

function scan(id = 's1') {
  const compositions = [{ material: 'Cotton', percentage: 90 }];
  return {
    id, dominantFabric: 'Cotton', compositions, confidence: 90,
    scannedAt: '12:00 PM', scannedAtDate: '2026-10-01',
    mislabeling: { detected: false, title: '', message: '' },
    ...buildScanProfile('Cotton', 'Cotton', compositions),
  };
}

const BODY: ExportBody = {
  exportedAt: '2026-10-10T12:00:00.000Z',
  scans: [{ id: 'scan_a', sellerLabel: 'Katsa – 100% algodón ✓' } as never, { id: 'scan_b' } as never],
  favoriteScanIds: ['scan_a'],
  preferences: {} as never,
};

async function write(body: ExportBody, ids: string[], photos: Record<string, string | null>) {
  const chunks: string[] = [];
  const result = await writeExportJson(
    body,
    ids,
    async (id) => photos[id] ?? null,
    (chunk) => {
      chunks.push(chunk);
    },
  );
  return { text: chunks.join(''), chunks, ...result };
}

describe('writeExportJson', () => {
  it('writes one valid JSON document with the data and each photo under its scan id', async () => {
    const { text, photosWritten } = await write(BODY, ['scan_a', 'scan_b'], {
      scan_a: 'QUJDREVGRw==',
      scan_b: '/+9AbC12',
    });

    const parsed = JSON.parse(text);
    expect(parsed.exportedAt).toBe(BODY.exportedAt);
    expect(parsed.scans).toEqual(BODY.scans);
    expect(parsed.favoriteScanIds).toEqual(['scan_a']);
    expect(parsed.photos).toEqual({ scan_a: 'QUJDREVGRw==', scan_b: '/+9AbC12' });
    expect(photosWritten).toBe(2);
  });

  it('skips scans whose photo is missing, and still writes valid JSON when there are none', async () => {
    const some = await write(BODY, ['scan_a', 'scan_b'], { scan_a: null, scan_b: 'QUJD' });
    expect(JSON.parse(some.text).photos).toEqual({ scan_b: 'QUJD' });
    expect(some.photosWritten).toBe(1);

    const none = await write(BODY, ['scan_a'], {});
    expect(JSON.parse(none.text).photos).toEqual({});
    expect(none.photosWritten).toBe(0);
  });

  it('refuses unsafe ids and anything that is not base64, so the file stays valid', async () => {
    const { text } = await write(BODY, ['../evil', 'scan_a', 'scan_b'], {
      '../evil': 'QUJD',
      scan_a: 'not base64 "quote',
      scan_b: 'QUJD',
    });
    expect(JSON.parse(text).photos).toEqual({ scan_b: 'QUJD' });
  });

  it('writes photos as separate pieces rather than building one big string', async () => {
    const photo = 'A'.repeat(100_000);
    const { chunks, text } = await write(BODY, ['scan_a', 'scan_b'], { scan_a: photo, scan_b: photo });
    expect(chunks.length).toBeGreaterThanOrEqual(4);
    expect(Math.max(...chunks.map((chunk) => chunk.length))).toBeLessThan(text.length);
    expect(JSON.parse(text).photos.scan_b).toHaveLength(100_000);
  });

  it('keeps non-ASCII text in the scan data intact', async () => {
    const { text } = await write(BODY, [], {});
    expect(JSON.parse(text).scans[0].sellerLabel).toBe('Katsa – 100% algodón ✓');
  });
});

describe('parseExportPayload', () => {
  it('reads a file exported before photos were included, with no photos', () => {
    const payload = parseExportPayload(
      JSON.stringify({ exportedAt: '2026-10-10T12:00:00.000Z', scans: [scan()], preferences: {} }),
    );
    expect(payload.scans).toHaveLength(1);
    expect(payload.favoriteScanIds).toEqual([]);
    expect(payload.photos).toBeUndefined();
  });

  it('reads the photos from a new file', () => {
    const payload = parseExportPayload(
      JSON.stringify({ scans: [scan()], favoriteScanIds: ['s1'], photos: { s1: 'QUJD' } }),
    );
    expect(payload.photos).toEqual({ s1: 'QUJD' });
    expect(payload.favoriteScanIds).toEqual(['s1']);
  });

  it('validates a large photo without decoding it or overflowing the regular-expression stack', () => {
    const photo = 'A'.repeat(2_000_000);
    expect(parseExportPayload(JSON.stringify({ scans: [scan()], photos: { s1: photo } })).photos?.s1).toBe(photo);
  });

  it.each([{ '../../evil': 'QUJD' }, { 'a/b': 'QUJD' }, { s1: '<script>' }, { s1: 5 }, { s1: 'Q' }])('rejects invalid photos before importing: %j', (photos) => {
    expect(() => parseExportPayload(JSON.stringify({ scans: [scan()], photos }))).toThrow(ImportInvalidFileError);
  });

  it('rejects a malformed photos member', () => {
    expect(() => parseExportPayload(JSON.stringify({ scans: [], photos: ['QUJD'] }))).toThrow(ImportInvalidFileError);
    expect(() => parseExportPayload(JSON.stringify({ scans: [], photos: 'QUJD' }))).toThrow(ImportInvalidFileError);
  });

  it.each([
    null, { ...scan(), id: '../evil' }, { ...scan(), confidence: 101 },
    { ...scan(), compositions: [{ material: 'Cotton', percentage: '90' }] },
    { ...scan(), dominantFabric: 'Unknown' }, { ...scan(), scannedAtDate: '2026-02-30' },
    { ...scan(), createdAt: '2026-02-30T12:00:00Z' }, { ...scan(), garmentCondition: 'Broken' },
    { ...scan(), capture: { captureType: 'gallery' } }, { ...scan(), testerFields: { colour: [] } },
  ])('rejects invalid scan fields: %j', (value) => {
    expect(() => parseExportPayload(JSON.stringify({ scans: [value] }))).toThrow(ImportInvalidFileError);
  });

  it.each([
    [], { skinTone: 'purple' }, { skinUndertone: 1 }, { colorSeason: 'Fall' },
    { sensitiveFabrics: 'Cotton' }, { preferredFabrics: ['Unknown'] },
    { dressingContexts: ['mars'] }, { dressingContexts: [null] }, { dressingContexts: null },
  ])('rejects invalid preferences: %j', (preferences) => {
    expect(() => parseExportPayload(JSON.stringify({ scans: [], preferences }))).toThrow(ImportInvalidFileError);
  });

  it('normalizes legacy preferences and deduplicates lists', () => {
    const payload = parseExportPayload(JSON.stringify({ scans: [], preferences: {
      dressingContext: 'sunny', sensitiveFabrics: ['Wool', 'Wool'], preferredFabrics: ['Cotton', 'Wool'],
    } }));
    expect(payload.preferences).toMatchObject({ skinTone: null, colorSeason: null,
      sensitiveFabrics: ['Wool'], preferredFabrics: ['Cotton'], dressingContexts: ['sunny'] });
  });

  it('rejects duplicate ids, dangling favorites and photos without matching scans', () => {
    for (const payload of [
      { scans: [scan(), scan()] }, { scans: [scan()], favoriteScanIds: [5] },
      { scans: [], favoriteScanIds: ['missing'] }, { scans: [], photos: { missing: 'QUJD' } },
    ]) expect(() => parseExportPayload(JSON.stringify(payload))).toThrow(ImportInvalidFileError);
  });

  it('rebuilds derived content and removes device-specific paths from imported scans', () => {
    const payload = parseExportPayload(JSON.stringify({ scans: [{ ...scan(),
      imageUri: 'file:///another-device/photo.jpg', profile: null, recommendations: [],
    }] }));
    expect(payload.scans[0].profile).toEqual(scan().profile);
    expect(payload.scans[0].recommendations).toEqual(scan().recommendations);
    expect(payload.scans[0].imageUri).toBeUndefined();
  });

  it('still rejects files that are not exports', () => {
    expect(() => parseExportPayload('not json')).toThrow(ImportInvalidFileError);
    expect(() => parseExportPayload('{"hello":1}')).toThrow(ImportInvalidFileError);
    expect(() => parseExportPayload('[]')).toThrow(ImportInvalidFileError);
  });
});

describe('isSafeScanId', () => {
  it('accepts the app\'s own ids and rejects path-like ones', () => {
    expect(isSafeScanId('scan_mgx3k2_a8f3k1z0')).toBe(true);
    expect(isSafeScanId('')).toBe(false);
    expect(isSafeScanId('../x')).toBe(false);
    expect(isSafeScanId('a/b')).toBe(false);
    expect(isSafeScanId('a.jpg')).toBe(false);
  });
});

describe('encodeUtf8', () => {
  it('encodes text to UTF-8 bytes', () => {
    expect(Array.from(encodeUtf8('aé✓'))).toEqual([97, 195, 169, 226, 156, 147]);
  });

  it('gives the same bytes without TextEncoder, using the fallback', () => {
    const original = globalThis.TextEncoder;
    // @ts-expect-error simulating a runtime with no TextEncoder
    delete globalThis.TextEncoder;
    try {
      expect(Array.from(encodeUtf8('aé✓'))).toEqual([97, 195, 169, 226, 156, 147]);
      expect(Array.from(encodeUtf8('plain ascii'))).toEqual(Array.from(Buffer.from('plain ascii')));
    } finally {
      globalThis.TextEncoder = original;
    }
  });
});
