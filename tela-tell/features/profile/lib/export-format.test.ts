import {
  encodeUtf8,
  ImportInvalidFileError,
  isSafeScanId,
  parseExportPayload,
  writeExportJson,
  type ExportBody,
} from '@/features/profile/lib/export-format';

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
      scan_b: '/+9AbC123',
    });

    const parsed = JSON.parse(text);
    expect(parsed.exportedAt).toBe(BODY.exportedAt);
    expect(parsed.scans).toEqual(BODY.scans);
    expect(parsed.favoriteScanIds).toEqual(['scan_a']);
    expect(parsed.photos).toEqual({ scan_a: 'QUJDREVGRw==', scan_b: '/+9AbC123' });
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
      JSON.stringify({ exportedAt: 'x', scans: [{ id: 's1' }], preferences: {} }),
    );
    expect(payload.scans).toHaveLength(1);
    expect(payload.favoriteScanIds).toEqual([]);
    expect(payload.photos).toBeUndefined();
  });

  it('reads the photos from a new file', () => {
    const payload = parseExportPayload(
      JSON.stringify({ scans: [], favoriteScanIds: ['s1'], photos: { s1: 'QUJD' } }),
    );
    expect(payload.photos).toEqual({ s1: 'QUJD' });
    expect(payload.favoriteScanIds).toEqual(['s1']);
  });

  it('drops photo entries with unsafe ids or non-base64 data instead of failing the import', () => {
    const payload = parseExportPayload(
      JSON.stringify({
        scans: [],
        photos: { '../../evil': 'QUJD', 'a/b': 'QUJD', ok_1: 'QUJD', bad: '<script>', num: 5 },
      }),
    );
    expect(payload.photos).toEqual({ ok_1: 'QUJD' });
  });

  it('ignores a malformed photos member', () => {
    expect(parseExportPayload(JSON.stringify({ scans: [], photos: ['QUJD'] })).photos).toBeUndefined();
    expect(parseExportPayload(JSON.stringify({ scans: [], photos: 'QUJD' })).photos).toBeUndefined();
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
