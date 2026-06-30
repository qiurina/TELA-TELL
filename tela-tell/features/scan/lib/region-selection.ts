import type { DualSwatchRegion } from '@/data/scans/mock-data';

export type NormalizedRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

let markedRegions: NormalizedRect[] = [];
let regionResults: DualSwatchRegion[] | null = null;

export function getDefaultRegionBoxes(): NormalizedRect[] {
  return [
    { id: 'fabric-1', x: 0.06, y: 0.14, width: 0.4, height: 0.58 },
    { id: 'fabric-2', x: 0.54, y: 0.14, width: 0.4, height: 0.58 },
  ];
}

export function getMarkedRegions(): NormalizedRect[] {
  return markedRegions.map((region) => ({ ...region }));
}

export function setMarkedRegions(regions: NormalizedRect[]): void {
  markedRegions = regions.map((region) => ({ ...region }));
}

export function setRegionAnalysisResults(results: DualSwatchRegion[]): void {
  regionResults = results.map((result) => ({ ...result }));
}

export function getRegionAnalysisResults(): DualSwatchRegion[] | null {
  if (!regionResults) {
    return null;
  }

  return regionResults.map((result) => ({ ...result }));
}

export function clearRegionSelection(): void {
  markedRegions = [];
  regionResults = null;
}

export function hasCompleteRegionSelection(): boolean {
  return markedRegions.length >= 2;
}
