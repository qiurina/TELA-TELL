import type { DualSwatchRegion, FabricComposition } from '@/data/scans/mock-data';
import { getScanResult } from '@/data/scans/mock-data';
import type { NormalizedRect } from '@/features/scan/lib/region-selection';
import { cropImageToRect, getImageSize, type Size } from '@/features/scan/lib/crop-to-guide';
import { classifyFabric } from '@/features/scan/lib/ml/model';

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

function mockRegion(rect: NormalizedRect, template: RegionTemplate): DualSwatchRegion {
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
}

async function classifyRegion(
  imageUri: string,
  imageSize: Size,
  rect: NormalizedRect,
): Promise<{ dominantFabric: string; compositions: FabricComposition[]; confidence: number } | null> {
  try {
    const pixelCrop = {
      originX: Math.round(rect.x * imageSize.width),
      originY: Math.round(rect.y * imageSize.height),
      width: Math.round(rect.width * imageSize.width),
      height: Math.round(rect.height * imageSize.height),
    };
    const croppedUri = await cropImageToRect(imageUri, pixelCrop);
    return await classifyFabric(croppedUri);
  } catch {
    return null;
  }
}

export async function analyzeMarkedRegions(
  imageUri: string,
  rects: NormalizedRect[],
): Promise<DualSwatchRegion[]> {
  const selected = rects.slice(0, 2);

  let imageSize: Size | null = null;
  try {
    imageSize = await getImageSize(imageUri);
  } catch {
    imageSize = null;
  }

  return Promise.all(
    selected.map(async (rect, index) => {
      const template = REGION_TEMPLATES[index] ?? REGION_TEMPLATES[0];
      const classification = imageSize ? await classifyRegion(imageUri, imageSize, rect) : null;

      if (!classification) {
        return mockRegion(rect, template);
      }

      return {
        label: template.label,
        dominantFabric: classification.dominantFabric,
        compositions: classification.compositions,
        confidence: classification.confidence,
        region: { ...rect },
      };
    }),
  );
}
