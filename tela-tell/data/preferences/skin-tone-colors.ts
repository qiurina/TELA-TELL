import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import type { FabricComposition } from '@/data/scans/mock-data';
import type { SkinTone, SkinUndertone } from '@/features/profile/lib/user-preferences';

export type ColorRecommendationGroup = {
  category: string;
  colors: string;
};

export type SkinToneColorGuidance = {
  skinTone: SkinTone;
  skinUndertone: SkinUndertone | null;
  detectedFabricLabel: string;
  recommended: ColorRecommendationGroup[];
  avoid: string[];
  fabricNote: string | null;
};

const SKIN_TONE_GUIDANCE: Record<
  SkinTone,
  { recommended: ColorRecommendationGroup[]; avoid: string[] }
> = {
  Fair: {
    recommended: [
      { category: 'Soft pastels', colors: 'blush pink, powder blue, lavender, mint' },
      { category: 'Cool neutrals', colors: 'grey, navy, charcoal, crisp white' },
      { category: 'Jewel accents', colors: 'sapphire, emerald, ruby — in small doses' },
    ],
    avoid: ['Harsh neon', 'overly washed-out beige', 'yellow-green near the face'],
  },
  Light: {
    recommended: [
      { category: 'Light neutrals', colors: 'soft white, dove grey, pale blue, light taupe' },
      { category: 'Gentle pastels', colors: 'peach, lilac, sky blue, soft mint' },
      { category: 'Soft contrast', colors: 'navy, dusty rose, sage green' },
    ],
    avoid: ['Stark black near the face', 'neon brights', 'muddy brown-grey'],
  },
  'Light-Medium': {
    recommended: [
      { category: 'Balanced brights', colors: 'coral, teal, soft olive, dusty rose' },
      { category: 'Warm-cool mix', colors: 'denim blue, camel, soft white, mauve' },
      { category: 'Everyday tones', colors: 'terracotta, forest green, maroon' },
    ],
    avoid: ['Overly pale yellow', 'dusty grey that dulls warmth', 'harsh orange at neckline'],
  },
  Medium: {
    recommended: [
      { category: 'Balanced brights', colors: 'teal, coral, olive, mustard, maroon' },
      { category: 'Warm neutrals', colors: 'taupe, camel, soft white, denim blue' },
      { category: 'Earth tones', colors: 'terracotta, rust, forest green' },
    ],
    avoid: ['Muddy brown-on-brown', 'dusty grey that dulls the complexion', 'neon orange at neckline'],
  },
  Tan: {
    recommended: [
      { category: 'Earth tones', colors: 'brown, terracotta, olive, copper, caramel' },
      { category: 'Jewel tones', colors: 'emerald, royal blue, purple, deep teal' },
      { category: 'Warm neutrals', colors: 'cream, rust, warm beige, bronze' },
    ],
    avoid: ['Pale yellow', 'pale pink', 'cool beige that washes out warm depth'],
  },
  'Deep Dark': {
    recommended: [
      { category: 'Rich jewel tones', colors: 'emerald, royal blue, deep purple, fuchsia' },
      { category: 'Bold warm hues', colors: 'gold, burnt orange, magenta, bright white' },
      { category: 'High-contrast neutrals', colors: 'true white, black, cobalt' },
    ],
    avoid: ['Dull brown-grey', 'muddy olive near the face', 'washed-out pastels'],
  },
};

const UNDERTONE_GUIDANCE: Record<
  SkinUndertone,
  { recommended: ColorRecommendationGroup; avoid: string[] }
> = {
  Cool: {
    recommended: {
      category: 'Cool undertone boost',
      colors: 'icy blue, lavender, silver grey, berry pink, true navy',
    },
    avoid: ['Orange-heavy rust', 'golden mustard near the face', 'warm camel that clashes'],
  },
  Warm: {
    recommended: {
      category: 'Warm undertone boost',
      colors: 'peach, coral, golden yellow, warm olive, burnt sienna',
    },
    avoid: ['Icy pastels', 'cool grey-beige', 'blue-based pinks that look ashy'],
  },
  Neutral: {
    recommended: {
      category: 'Neutral undertone boost',
      colors: 'soft white, true red, jade green, medium denim, balanced taupe',
    },
    avoid: ['Extreme neons', 'overly yellow or overly blue casts near the face'],
  },
  Olive: {
    recommended: {
      category: 'Olive undertone boost',
      colors: 'plum, burgundy, forest green, warm taupe, dusty rose',
    },
    avoid: ['Bright orange', 'lime green', 'cool baby pink that turns ashy'],
  },
};

const FABRIC_COLOR_NOTES: Partial<Record<string, string>> = {
  Cotton: 'Cotton holds everyday dyes well — solid colors and prints are easy to compare in ukay bins.',
  Linen: 'Natural linen looks best in earthy undyed tones or soft whites — avoid neon on heavy weaves.',
  Silk: 'Silk reflects light — jewel tones look richer; pastels suit formal barong and Filipiniana.',
  Polyester: 'Synthetic sheen amplifies bright colors — jewel tones pop but neons can look harsh.',
  Wool: 'Deep winter hues suit wool best — stick to rich solids rather than pale washes.',
  Nylon: 'Athletic nylon favors bold contrast — pair saturated tops with neutral bottoms.',
  Acrylic: 'Knit acrylic shows color clearly — medium-depth tones wear better than very pale shades.',
  Rayon: 'Flowy rayon drapes beautifully in saturated jewel or earth tones.',
  Spandex: 'Stretch synthetics hold bold prints — pair saturated activewear with neutral layers.',
  Leather: 'Rich earth tones and deep burgundy suit leather — avoid pale washes that show scuffs.',
  Suede: 'Matte suede reads best in camel, tan, and muted jewel tones — keep away from high-contrast neons.',
  Abaca: 'Natural abaca and sinamay look elegant in cream, gold, and heritage earth tones.',
};

export function getSkinToneColorGuidance(
  skinTone: SkinTone | null,
  dominantFabric: string,
  compositions?: FabricComposition[],
  skinUndertone?: SkinUndertone | null,
): SkinToneColorGuidance | null {
  if (!skinTone) {
    return null;
  }

  const base = SKIN_TONE_GUIDANCE[skinTone];
  const fabric = resolveSupportedFabric(dominantFabric, compositions);
  const cleanedLabel = dominantFabric.replace(/\s*dominant\s*/i, '').trim();
  const detectedFabricLabel = fabric ?? (cleanedLabel || 'this material');

  let recommended = [...base.recommended];
  let avoid = [...base.avoid];

  if (skinUndertone) {
    const undertone = UNDERTONE_GUIDANCE[skinUndertone];
    recommended = [...recommended, undertone.recommended];
    avoid = [...avoid, ...undertone.avoid];
  }

  return {
    skinTone,
    skinUndertone: skinUndertone ?? null,
    detectedFabricLabel,
    recommended,
    avoid,
    fabricNote: fabric ? (FABRIC_COLOR_NOTES[fabric] ?? null) : null,
  };
}
