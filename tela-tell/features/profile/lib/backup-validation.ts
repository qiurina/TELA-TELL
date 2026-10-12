import { resolveFabricAlias, SUPPORTED_FABRICS } from '@/data/fabrics/fabrics';
import { DRESSING_CONTEXT_OPTIONS } from '@/data/preferences/occasion-weather';
import type { ScanCaptureMeta, ScanResult } from '@/data/scans/mock-data';
import { CONSTRUCTION_OPTIONS, normalizeTesterFields } from '@/features/results/lib/tester-fields';
import { COLOR_SEASON_GROUPS, type UserPreferences } from '@/features/profile/lib/user-preferences';
import { buildScanProfile } from '@/features/scan/lib/build-scan-profile';
import { evaluateDeclaredLabel } from '@/features/scan/lib/declared-label';

export class ImportInvalidFileError extends Error {
  constructor(message = "This doesn't look like a TELA-TELL export file.") {
    super(message);
    this.name = 'ImportInvalidFileError';
  }
}

export function isSafeScanId(id: string): boolean {
  return /^[A-Za-z0-9_-]{1,100}$/.test(id);
}

function requireValid(condition: unknown, field: string): asserts condition {
  if (!condition) throw new ImportInvalidFileError(`Invalid backup field: ${field}. No scans were imported.`);
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function numberInRange(value: unknown, min = 0, max = Infinity): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

export function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && validDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function optionalText(value: unknown, field: string): void {
  requireValid(value === undefined || value === null || typeof value === 'string', field);
}

function validateCapture(value: unknown): ScanCaptureMeta {
  requireValid(record(value), 'capture');
  requireValid(['live_camera', 'system_camera', 'gallery'].includes(value.captureType as string), 'capture type');
  requireValid(value.clipOnLens === undefined || typeof value.clipOnLens === 'boolean', 'lens setting');
  requireValid(typeof value.modelVersion === 'string', 'capture settings');
  requireValid(Number.isInteger(value.burstCount) && numberInRange(value.burstCount, 1), 'burst count');
  requireValid(numberInRange(value.inferenceMs) && numberInRange(value.totalMs), 'capture timing');
  requireValid(value.sharpness === null || numberInRange(value.sharpness), 'sharpness');
  requireValid(['passed', 'overridden', 'unchecked'].includes(value.sharpnessCheck as string), 'sharpness check');
  if (value.sharpnessPerPhoto !== undefined) {
    requireValid(Array.isArray(value.sharpnessPerPhoto)
      && value.sharpnessPerPhoto.every((item) => item === null || numberInRange(item)), 'per-photo sharpness');
  }
  if (value.lighting !== undefined) {
    const lighting = value.lighting;
    requireValid(record(lighting) && Array.isArray(lighting.perPhoto) && Array.isArray(lighting.warnings), 'lighting');
    requireValid(lighting.perPhoto.every((item) => item === null || (record(item)
      && numberInRange(item.meanLuma, 0, 255) && numberInRange(item.darkShare, 0, 1)
      && numberInRange(item.clippedShare, 0, 1) && numberInRange(item.unevenness))), 'lighting readings');
    requireValid(lighting.warnings.every((item) => ['very_dark', 'bright_areas'].includes(item)), 'lighting warnings');
  }
  return value as ScanCaptureMeta;
}

/** Validate user-entered/model fields; rebuild derived reference content with the current app data. */
export function validateBackupScan(value: unknown): ScanResult {
  requireValid(record(value), 'scan');
  requireValid(typeof value.id === 'string' && isSafeScanId(value.id), 'scan id');
  requireValid(typeof value.dominantFabric === 'string', 'dominant fabric');
  const primary = resolveFabricAlias(value.dominantFabric);
  requireValid(primary, 'dominant fabric');
  requireValid(numberInRange(value.confidence, 0, 100), 'confidence');
  requireValid(typeof value.scannedAt === 'string' && value.scannedAt.length > 0, 'scan time');
  requireValid(validDate(value.scannedAtDate), 'scan date');
  requireValid(value.createdAt === undefined || validTimestamp(value.createdAt), 'original timestamp');
  requireValid(Array.isArray(value.compositions), 'candidate fibers');
  const compositions = value.compositions.map((item) => {
    requireValid(record(item) && typeof item.material === 'string' && numberInRange(item.percentage, 0, 100), 'candidate fiber');
    const material = resolveFabricAlias(item.material);
    requireValid(material, 'candidate fiber name');
    return { material, percentage: item.percentage };
  });
  requireValid(new Set(compositions.map((item) => item.material)).size === compositions.length, 'duplicate candidate fibers');
  optionalText(value.sellerLabel, 'stated label');
  requireValid(value.garmentCondition === undefined || ['New', 'Good', 'Worn', 'Damaged'].includes(value.garmentCondition as string), 'garment condition');
  if (value.testerFields !== undefined) {
    const fields = value.testerFields;
    requireValid(record(fields), 'tester notes');
    for (const key of ['careLabelComposition', 'colour', 'garmentId']) optionalText(fields[key], `tester ${key}`);
    requireValid(fields.construction === undefined
      || CONSTRUCTION_OPTIONS.some((item) => item.value === fields.construction), 'construction');
  }
  const sellerLabel = typeof value.sellerLabel === 'string' ? value.sellerLabel : undefined;
  const check = evaluateDeclaredLabel(value.dominantFabric, sellerLabel ?? null, compositions);
  return {
    id: value.id,
    dominantFabric: value.dominantFabric,
    compositions,
    confidence: value.confidence,
    scannedAt: value.scannedAt,
    scannedAtDate: value.scannedAtDate,
    ...(value.createdAt !== undefined ? { createdAt: new Date(value.createdAt as string).toISOString() } : {}),
    sellerLabel,
    garmentCondition: value.garmentCondition as ScanResult['garmentCondition'],
    ...(value.capture !== undefined ? { capture: validateCapture(value.capture) } : {}),
    ...(value.testerFields !== undefined ? { testerFields: normalizeTesterFields(value.testerFields) } : {}),
    mislabeling: check.status === 'mismatch'
      ? { detected: true, title: check.title, message: check.message }
      : { detected: false, title: '', message: '' },
    ...buildScanProfile(primary, value.dominantFabric, compositions),
  };
}

function choices<T extends string>(value: unknown, allowed: readonly T[], field: string): T[] {
  if (value === undefined) return [];
  requireValid(Array.isArray(value) && value.every((item) => allowed.includes(item)), field);
  return [...new Set(value)] as T[];
}

function nullableChoice<T extends string>(value: unknown, allowed: readonly T[], field: string): T | null {
  if (value === undefined || value === null) return null;
  requireValid(allowed.includes(value as T), field);
  return value as T;
}

export function validateBackupPreferences(value: unknown): UserPreferences {
  requireValid(record(value), 'preferences');
  const sensitiveFabrics = choices(value.sensitiveFabrics, SUPPORTED_FABRICS, 'sensitivities');
  const contexts = value.dressingContexts !== undefined
    ? value.dressingContexts
    : value.dressingContext == null ? undefined : [value.dressingContext];
  return {
    skinTone: nullableChoice(value.skinTone, ['Fair', 'Light', 'Light-Medium', 'Medium', 'Tan', 'Deep Dark'] as const, 'skin tone'),
    skinUndertone: nullableChoice(value.skinUndertone, ['Cool', 'Warm', 'Neutral', 'Olive'] as const, 'undertone'),
    colorSeason: nullableChoice(value.colorSeason, COLOR_SEASON_GROUPS.flatMap((group) => group.sub), 'color season'),
    sensitiveFabrics,
    preferredFabrics: choices(value.preferredFabrics, SUPPORTED_FABRICS, 'preferred fabrics').filter((item) => !sensitiveFabrics.includes(item)),
    dressingContexts: choices(contexts, DRESSING_CONTEXT_OPTIONS.map((item) => item.id), 'weather and occasion'),
  };
}
