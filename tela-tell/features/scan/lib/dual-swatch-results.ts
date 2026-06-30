import type { DualSwatchRegion } from '@/data/scans/mock-data';
import { SCAN_RESULTS } from '@/data/scans/mock-data';
import { getRegionAnalysisResults } from '@/features/scan/lib/region-selection';

function getFallbackDualSwatchRegions(): DualSwatchRegion[] {
  const linen = SCAN_RESULTS.find((scan) => scan.id === '2');
  const cotton = SCAN_RESULTS.find((scan) => scan.id === '1');

  if (!linen || !cotton) {
    return [];
  }

  return [
    {
      label: 'Fabric 1',
      dominantFabric: 'Linen',
      compositions: linen.compositions,
      confidence: linen.confidence,
    },
    {
      label: 'Fabric 2',
      dominantFabric: 'Cotton',
      compositions: [
        { material: 'Cotton', percentage: 92 },
        { material: 'Linen', percentage: 8 },
      ],
      confidence: 86,
    },
  ];
}

export function getDualSwatchRegions(): DualSwatchRegion[] {
  const stored = getRegionAnalysisResults();

  if (stored && stored.length > 0) {
    return stored;
  }

  return getFallbackDualSwatchRegions();
}
