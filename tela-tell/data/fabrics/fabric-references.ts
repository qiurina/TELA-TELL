import type { ImageSourcePropType } from 'react-native';

import type { FabricComposition } from '@/data/scans/mock-data';
import { SUPPORTED_FABRICS, type SupportedFabric } from '@/data/fabrics/fabrics';

/** Reference swatches in assets/images/reference/ — lowercase fabric name, .jpg or .png */
const FABRIC_REFERENCE_IMAGES: Record<SupportedFabric, ImageSourcePropType> = {
  Cotton: require('@/assets/images/reference/cotton.jpg'),
  Wool: require('@/assets/images/reference/wool.jpg'),
  Silk: require('@/assets/images/reference/silk.jpg'),
  Linen: require('@/assets/images/reference/linen.jpg'),
  Polyester: require('@/assets/images/reference/polyester.jpg'),
  Nylon: require('@/assets/images/reference/nylon.jpg'),
  Acrylic: require('@/assets/images/reference/acrylic.jpg'),
  Rayon: require('@/assets/images/reference/rayon.jpg'),
  Abaca: require('@/assets/images/reference/abaca.jpg'),
  'Piña': require('@/assets/images/reference/pina.jpg'),
};

export type FabricReference = {
  fabric: SupportedFabric;
  title: string;
  lookFor: string;
  textureNote: string;
  image: ImageSourcePropType;
};

export const FABRIC_REFERENCES: Record<SupportedFabric, FabricReference> = {
  Cotton: {
    fabric: 'Cotton',
    title: 'Cotton',
    lookFor: 'Soft matte surface with a visible plain or twill weave',
    textureNote: 'Breathable, slightly fuzzy fibers common in everyday shirts and ukay tees',
    image: FABRIC_REFERENCE_IMAGES.Cotton,
  },
  Wool: {
    fabric: 'Wool',
    title: 'Wool',
    lookFor: 'Lofty, slightly fuzzy fibers that spring back when pressed',
    textureNote: 'Warm knit or felted look, less common in tropical ukay but seen in imports',
    image: FABRIC_REFERENCE_IMAGES.Wool,
  },
  Silk: {
    fabric: 'Silk',
    title: 'Silk',
    lookFor: 'Smooth lustrous surface with a subtle sheen under light',
    textureNote: 'Fine drape and clean reflection, often in formal blouses and lining fabrics',
    image: FABRIC_REFERENCE_IMAGES.Silk,
  },
  Linen: {
    fabric: 'Linen',
    title: 'Linen',
    lookFor: 'Crisp natural slubs and a slightly uneven basket weave',
    textureNote: 'Airy summer hand-feel that wrinkles easily in humid weather',
    image: FABRIC_REFERENCE_IMAGES.Linen,
  },
  Polyester: {
    fabric: 'Polyester',
    title: 'Polyester',
    lookFor: 'Smooth, uniform surface with a slight synthetic sheen',
    textureNote: 'Holds shape well, common in athletic wear and cheap prints',
    image: FABRIC_REFERENCE_IMAGES.Polyester,
  },
  Nylon: {
    fabric: 'Nylon',
    title: 'Nylon',
    lookFor: 'Tight, slick weave with high stretch and light reflection',
    textureNote: 'Often used in bags, jackets, and sportswear',
    image: FABRIC_REFERENCE_IMAGES.Nylon,
  },
  Acrylic: {
    fabric: 'Acrylic',
    title: 'Acrylic',
    lookFor: 'Fluffy knit loft similar to wool but more uniform and plasticky',
    textureNote: 'Budget sweaters that pill faster than natural wool',
    image: FABRIC_REFERENCE_IMAGES.Acrylic,
  },
  Rayon: {
    fabric: 'Rayon',
    title: 'Rayon',
    lookFor: 'Soft flowy drape with a cool, smooth hand-feel',
    textureNote: 'Used in dresses and blouses, can look silk-like at lower cost',
    image: FABRIC_REFERENCE_IMAGES.Rayon,
  },
  Abaca: {
    fabric: 'Abaca',
    title: 'Abaca',
    lookFor: 'Strong plant-fiber weave with natural tan or cream tones',
    textureNote: 'Mindanao sinamay and structured barong panels, stiff but breathable',
    image: FABRIC_REFERENCE_IMAGES.Abaca,
  },
  'Piña': {
    fabric: 'Piña',
    title: 'Piña',
    lookFor: 'Fine translucent weave with a heritage barong luster',
    textureNote: 'Aklan pineapple-leaf fiber prized for formal Filipiniana',
    image: FABRIC_REFERENCE_IMAGES['Piña'],
  },
};

export function resolveSupportedFabric(
  dominantFabric: string,
  compositions?: FabricComposition[],
): SupportedFabric | null {
  const normalized = dominantFabric.trim().toLowerCase();

  for (const fabric of SUPPORTED_FABRICS) {
    if (normalized.includes(fabric.toLowerCase())) {
      return fabric;
    }
  }

  const sorted = [...(compositions ?? [])].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0]?.material;

  if (top && SUPPORTED_FABRICS.includes(top as SupportedFabric)) {
    return top as SupportedFabric;
  }

  return null;
}

export function getFabricReference(
  dominantFabric: string,
  compositions?: FabricComposition[],
): FabricReference | null {
  const fabric = resolveSupportedFabric(dominantFabric, compositions);

  if (!fabric) {
    return null;
  }

  return FABRIC_REFERENCES[fabric];
}
