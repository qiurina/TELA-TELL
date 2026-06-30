import type { DualSwatchRegion, FabricComposition } from '@/data/scans/mock-data';
import { getScanResult } from '@/data/scans/mock-data';
import type { NormalizedRect } from '@/features/scan/lib/region-selection';

type RegionTemplate = {
  scanId: string;
  label: string;
  dominantFabric: string;
  compositions?: FabricComposition[];
  confidenceOffset?: number;
};

const REGION_TEMPLATES: RegionTemplate[] = [
  {
    scanId: '2',
    label: 'Fabric 1',
    dominantFabric: 'Linen',
  },
  {
    scanId: '1',
    label: 'Fabric 2',
    dominantFabric: 'Cotton',
    compositions: [
      { material: 'Cotton', percentage: 92 },
      { material: 'Linen', percentage: 8 },
    ],
    confidenceOffset: 2,
  },
];

export function analyzeMarkedRegions(rects: NormalizedRect[]): DualSwatchRegion[] {
  return rects.slice(0, 2).map((rect, index) => {
    const template = REGION_TEMPLATES[index] ?? REGION_TEMPLATES[0];
    const scan = getScanResult(template.scanId);

    if (!scan) {
      return {
        label: template.label,
        dominantFabric: template.dominantFabric,
        compositions: template.compositions ?? [],
        confidence: 80,
        region: { ...rect },
      };
    }

    return {
      label: template.label,
      dominantFabric: template.dominantFabric,
      compositions: template.compositions ?? scan.compositions,
      confidence: Math.max(scan.confidence - (template.confidenceOffset ?? 0), 70),
      region: { ...rect },
    };
  });
}
