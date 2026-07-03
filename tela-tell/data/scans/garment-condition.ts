export type GarmentCondition = 'New' | 'Good' | 'Worn' | 'Damaged';

export const DEFAULT_GARMENT_CONDITION: GarmentCondition = 'New';

export type GarmentConditionOption = {
  value: GarmentCondition;
  label: string;
  subtitle: string;
};

export const GARMENT_CONDITION_OPTIONS: GarmentConditionOption[] = [
  { value: 'New', label: 'New', subtitle: 'Unused / tags on' },
  { value: 'Good', label: 'Good', subtitle: 'Minor wear only' },
  { value: 'Worn', label: 'Worn', subtitle: 'Visible use / faded' },
  { value: 'Damaged', label: 'Damaged', subtitle: 'Tears / heavy wear' },
];
