import {
  DEFAULT_GARMENT_CONDITION,
  type GarmentCondition,
} from '@/data/scans/garment-condition';

/** Garment condition for the current scan session (maps to tblScan.garmentCondition). */
let lastGarmentCondition: GarmentCondition = DEFAULT_GARMENT_CONDITION;

export function getLastGarmentCondition(): GarmentCondition {
  return lastGarmentCondition;
}

export function setLastGarmentCondition(condition: GarmentCondition): void {
  lastGarmentCondition = condition;
}

export function clearLastGarmentCondition(): void {
  lastGarmentCondition = DEFAULT_GARMENT_CONDITION;
}
