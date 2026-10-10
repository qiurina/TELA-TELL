import type { ConstructionKind, ScanTesterFields } from '@/data/scans/mock-data';

export const CONSTRUCTION_OPTIONS: { value: ConstructionKind; label: string }[] = [
  { value: 'knit', label: 'Knit' },
  { value: 'woven', label: 'Woven' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Not sure' },
];

export const TESTER_FIELD_MAX_LENGTH = {
  careLabelComposition: 200,
  colour: 60,
  garmentId: 60,
} as const;

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  // Collapse line breaks and runs of spaces: these are short single-line notes.
  const trimmed = value.replace(/\s+/g, ' ').trim().slice(0, maxLength).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Cleans what a tester typed before it is saved: trims, limits length, drops blanks and any
 * construction value that is not one of the options. Returns undefined when nothing is left, so a
 * scan with no tester notes carries no `testerFields` at all.
 */
export function normalizeTesterFields(input: unknown): ScanTesterFields | undefined {
  if (!input || typeof input !== 'object') {
    return undefined;
  }
  const raw = input as Record<string, unknown>;

  const fields: ScanTesterFields = {};
  const careLabelComposition = cleanText(raw.careLabelComposition, TESTER_FIELD_MAX_LENGTH.careLabelComposition);
  const colour = cleanText(raw.colour, TESTER_FIELD_MAX_LENGTH.colour);
  const garmentId = cleanText(raw.garmentId, TESTER_FIELD_MAX_LENGTH.garmentId);
  const construction = CONSTRUCTION_OPTIONS.find((option) => option.value === raw.construction)?.value;

  if (careLabelComposition) fields.careLabelComposition = careLabelComposition;
  if (construction) fields.construction = construction;
  if (colour) fields.colour = colour;
  if (garmentId) fields.garmentId = garmentId;

  return Object.keys(fields).length > 0 ? fields : undefined;
}
