import {
  CONSTRUCTION_OPTIONS,
  normalizeTesterFields,
  TESTER_FIELD_MAX_LENGTH,
} from '@/features/results/lib/tester-fields';

describe('normalizeTesterFields', () => {
  it('keeps what a tester entered, trimmed', () => {
    expect(
      normalizeTesterFields({
        careLabelComposition: '  95% Cotton, 5% Spandex ',
        construction: 'knit',
        colour: ' navy blue ',
        garmentId: ' G-07 ',
      }),
    ).toEqual({
      careLabelComposition: '95% Cotton, 5% Spandex',
      construction: 'knit',
      colour: 'navy blue',
      garmentId: 'G-07',
    });
  });

  it('returns nothing when every field is blank or invalid, so no empty notes are saved', () => {
    expect(normalizeTesterFields({})).toBeUndefined();
    expect(normalizeTesterFields({ careLabelComposition: '   ', colour: '', garmentId: '\n' })).toBeUndefined();
    expect(normalizeTesterFields({ construction: 'braided' })).toBeUndefined();
    expect(normalizeTesterFields(null)).toBeUndefined();
    expect(normalizeTesterFields('text')).toBeUndefined();
    expect(normalizeTesterFields(undefined)).toBeUndefined();
  });

  it('keeps a field even when the others are blank', () => {
    expect(normalizeTesterFields({ garmentId: 'G-1', colour: '' })).toEqual({ garmentId: 'G-1' });
  });

  it('accepts exactly the construction options', () => {
    for (const option of CONSTRUCTION_OPTIONS) {
      expect(normalizeTesterFields({ construction: option.value })).toEqual({ construction: option.value });
    }
    expect(CONSTRUCTION_OPTIONS.map((option) => option.value)).toEqual(['knit', 'woven', 'other', 'unknown']);
  });

  it('collapses line breaks and repeated spaces into single spaces', () => {
    expect(normalizeTesterFields({ careLabelComposition: '60% cotton\n 40%   polyester' })).toEqual({
      careLabelComposition: '60% cotton 40% polyester',
    });
  });

  it('limits each text field\'s length', () => {
    const fields = normalizeTesterFields({
      careLabelComposition: 'a'.repeat(500),
      colour: 'b'.repeat(500),
      garmentId: 'c'.repeat(500),
    });
    expect(fields?.careLabelComposition).toHaveLength(TESTER_FIELD_MAX_LENGTH.careLabelComposition);
    expect(fields?.colour).toHaveLength(TESTER_FIELD_MAX_LENGTH.colour);
    expect(fields?.garmentId).toHaveLength(TESTER_FIELD_MAX_LENGTH.garmentId);
  });

  it('ignores fields it does not know and values that are not text', () => {
    expect(normalizeTesterFields({ colour: 5, garmentId: 'G-2', extra: 'x' })).toEqual({ garmentId: 'G-2' });
  });
});
