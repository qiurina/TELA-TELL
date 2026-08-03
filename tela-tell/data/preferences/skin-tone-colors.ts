import { resolveSupportedFabric } from '@/data/fabrics/fabric-references';
import type { FabricComposition } from '@/data/scans/mock-data';
import type { ColorSeason, SkinTone, SkinUndertone } from '@/features/profile/lib/user-preferences';

export type ColorRecommendationGroup = {
  category: string;
  colors: string;
};

export type SkinToneColorGuidance = {
  skinTone: SkinTone | null;
  skinUndertone: SkinUndertone | null;
  colorSeason: ColorSeason | null;
  detectedFabricLabel: string;
  recommended: ColorRecommendationGroup[];
  avoid: string[];
  fabricNote: string | null;
};

const SEASON_GUIDANCE: Record<
  ColorSeason,
  { recommended: ColorRecommendationGroup[]; avoid: string[] }
> = {
  // ── SPRING ────────────────────────────────────────────────────────────────
  'Light Spring': {
    recommended: [
      { category: 'Warm pastels', colors: 'peach, light yellow, blush pink, warm mint, apricot, light coral' },
      { category: 'Soft warms', colors: 'warm ivory, powder pink, buttercup, soft peach' },
      { category: 'Light accents', colors: 'light aqua, warm sky, pale gold' },
    ],
    avoid: ['charcoal', 'black', 'stark navy', 'cold grey', 'icy blue'],
  },
  'True Spring': {
    recommended: [
      { category: 'Clear warms', colors: 'coral, warm yellow, fresh lime, golden orange, warm turquoise' },
      { category: 'Vibrant brights', colors: 'bright coral, sunny yellow, spring green, warm aqua' },
      { category: 'Golden neutrals', colors: 'camel, warm beige, ivory, peach' },
    ],
    avoid: ['cool grey', 'icy lavender', 'burgundy', 'cold navy', 'black'],
  },
  'Bright Spring': {
    recommended: [
      { category: 'High-contrast brights', colors: 'turquoise, bright red, vivid lime, electric orange, hot pink' },
      { category: 'Clear warms', colors: 'warm coral, bright yellow, vivid green, sunny orange' },
      { category: 'Bold neutrals', colors: 'pure white, warm tan, bright camel' },
    ],
    avoid: ['dusty rose', 'muted olive', 'soft beige', 'cool mauve', 'grey'],
  },

  // ── SUMMER ────────────────────────────────────────────────────────────────
  'Light Summer': {
    recommended: [
      { category: 'Cool pastels', colors: 'baby blue, lavender, soft pink, light mint, powder blue' },
      { category: 'Soft cools', colors: 'rose quartz, periwinkle, mauve, soft lilac' },
      { category: 'Light neutrals', colors: 'soft white, dove grey, pale blue grey' },
    ],
    avoid: ['stark black', 'harsh orange', 'neon brights', 'warm mustard', 'vivid red'],
  },
  'True Summer': {
    recommended: [
      { category: 'Muted cools', colors: 'rose, periwinkle, soft navy, dusty blue, muted teal' },
      { category: 'Soft mid-tones', colors: 'mauve, smoky lavender, greyish pink, soft blue green' },
      { category: 'Cool neutrals', colors: 'soft white, rose beige, ash grey, cool taupe' },
    ],
    avoid: ['warm orange', 'golden yellow', 'bright red', 'olive', 'earthy brown'],
  },
  'Soft Summer': {
    recommended: [
      { category: 'Muted soft tones', colors: 'sage green, mauve, soft grey, rose taupe, dusty lavender' },
      { category: 'Blended cools', colors: 'slate blue, dusty rose, muted teal, soft plum' },
      { category: 'Greyed neutrals', colors: 'rose grey, greyish beige, cool stone, ash taupe' },
    ],
    avoid: ['vivid orange', 'bright yellow', 'electric blue', 'stark white', 'black'],
  },

  // ── AUTUMN ────────────────────────────────────────────────────────────────
  'Soft Autumn': {
    recommended: [
      { category: 'Muted warms', colors: 'moss green, soft brown, muted gold, warm caramel, dusty terracotta' },
      { category: 'Earthy mid-tones', colors: 'warm taupe, soft rust, muted olive, sand' },
      { category: 'Gentle warms', colors: 'warm cream, peach beige, dusty rose, bronze tan' },
    ],
    avoid: ['icy blue', 'cool pink', 'stark white', 'neon brights', 'black'],
  },
  'True Autumn': {
    recommended: [
      { category: 'Rich earthy tones', colors: 'rust, olive green, burnt orange, golden brown, warm teal' },
      { category: 'Deep warms', colors: 'dark camel, warm burgundy, chocolate, forest green' },
      { category: 'Golden accents', colors: 'gold, bronze, warm copper, amber' },
    ],
    avoid: ['cool pink', 'icy pastels', 'cool blue', 'cool grey', 'silver'],
  },
  'Deep Autumn': {
    recommended: [
      { category: 'Dark warm tones', colors: 'deep teal, dark olive, chocolate brown, dark amber, burgundy' },
      { category: 'Rich jewels', colors: 'deep rust, forest green, dark gold, warm plum' },
      { category: 'High contrast', colors: 'black brown, ivory, dark copper' },
    ],
    avoid: ['light pastels', 'baby pink', 'icy lavender', 'cool silver', 'dusty rose'],
  },

  // ── WINTER ────────────────────────────────────────────────────────────────
  'Deep Winter': {
    recommended: [
      { category: 'Dark cool tones', colors: 'black, deep blue, dark emerald, deep burgundy, dark navy' },
      { category: 'Rich jewels', colors: 'sapphire, deep plum, dark teal, cobalt' },
      { category: 'High contrast', colors: 'true white, silver, charcoal' },
    ],
    avoid: ['warm camel', 'golden yellow', 'peach', 'muted olive', 'rust'],
  },
  'True Winter': {
    recommended: [
      { category: 'Clear cools', colors: 'crimson, icy blue, stark white, true navy, emerald' },
      { category: 'Vivid jewels', colors: 'royal blue, magenta, cool red, electric teal' },
      { category: 'Sharp neutrals', colors: 'black, white, cool grey, silver' },
    ],
    avoid: ['earthy brown', 'warm olive', 'golden mustard', 'peach', 'dusty pastels'],
  },
  'Bright Winter': {
    recommended: [
      { category: 'Bright cools', colors: 'electric blue, fuchsia, bright silver, vivid emerald, cool red' },
      { category: 'High clarity', colors: 'icy pink, vivid teal, neon blue, true white' },
      { category: 'Bold accents', colors: 'black, cobalt, hot pink, vivid green' },
    ],
    avoid: ['muted beige', 'dusty rose', 'soft olive', 'warm brown', 'earthy tones'],
  },
};

// ---------------------------------------------------------------------------
// LEGACY 6-TONE + UNDERTONE FALLBACK (used when colorSeason is not set)
// ---------------------------------------------------------------------------

const SKIN_TONE_GUIDANCE: Record<
  SkinTone,
  { recommended: ColorRecommendationGroup[]; avoid: string[] }
> = {
  Fair: {
    recommended: [
      { category: 'Soft pastels', colors: 'blush pink, powder blue, lavender, mint, pale pink, sky blue' },
      { category: 'Cool neutrals', colors: 'grey, dove grey, navy, charcoal, crisp white, pale blue, light taupe' },
      { category: 'Jewel accents', colors: 'sapphire, emerald, ruby, cobalt, fuchsia' },
    ],
    avoid: [
      'Harsh neon',
      'overly washed-out beige',
      'yellow-green near the face',
      'Extreme neons',
    ],
  },
  Light: {
    recommended: [
      {
        category: 'Light neutrals',
        colors: 'soft white, dove grey, pale blue, light taupe, cream, balanced taupe',
      },
      { category: 'Gentle pastels', colors: 'peach, lilac, sky blue, soft mint, pale pink, icy blue' },
      {
        category: 'Soft contrast',
        colors: 'navy, dusty rose, sage green, denim blue, maroon, mauve',
      },
    ],
    avoid: ['Stark black near the face', 'neon brights', 'muddy brown-grey', 'Extreme neons'],
  },
  'Light-Medium': {
    recommended: [
      { category: 'Balanced brights', colors: 'coral, teal, soft olive, dusty rose, mustard, maroon' },
      { category: 'Warm-cool mix', colors: 'denim blue, camel, soft white, mauve, cream, terracotta' },
      { category: 'Everyday tones', colors: 'terracotta, forest green, maroon, rust, bronze' },
    ],
    avoid: [
      'Overly pale yellow',
      'dusty grey that dulls warmth',
      'harsh orange at neckline',
      'neon orange',
      'muddy brown-on-brown',
    ],
  },
  Medium: {
    recommended: [
      { category: 'Balanced brights', colors: 'teal, coral, olive, mustard, maroon, jade green, burgundy' },
      { category: 'Warm neutrals', colors: 'taupe, camel, soft white, denim blue, cream, dove grey' },
      { category: 'Earth tones', colors: 'terracotta, rust, forest green, bronze, copper' },
    ],
    avoid: [
      'Muddy brown-on-brown',
      'dusty grey that dulls the complexion',
      'neon orange at neckline',
      'washed-out pastels',
    ],
  },
  Tan: {
    recommended: [
      { category: 'Earth tones', colors: 'brown, terracotta, olive, copper, caramel, bronze' },
      { category: 'Jewel tones', colors: 'emerald, ruby, sapphire, cobalt, plum' },
      { category: 'Warm neutrals', colors: 'cream, rust, warm beige, bronze, caramel' },
    ],
    avoid: ['Pale yellow', 'pale pink', 'cool beige that washes out warm depth', 'icy pastels'],
  },
  'Deep Dark': {
    recommended: [
      { category: 'Rich jewel tones', colors: 'emerald, sapphire, plum, fuchsia, ruby' },
      { category: 'Bold warm hues', colors: 'gold, burnt orange, magenta, bright white, cobalt' },
      { category: 'High-contrast neutrals', colors: 'true white, black, cobalt' },
    ],
    avoid: ['Dull brown-grey', 'muddy olive near the face', 'washed-out pastels', 'Extreme neons'],
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
      colors: 'plum, burgundy, forest green, taupe, dusty rose',
    },
    avoid: ['Bright orange', 'lime green', 'cool baby pink that turns ashy'],
  },
};

// ---------------------------------------------------------------------------
// FABRIC NOTES
// ---------------------------------------------------------------------------

const FABRIC_COLOR_NOTES: Partial<Record<string, string>> = {
  Cotton: 'Holds everyday dyes well. Solids and prints are easy to compare.',
  Linen: 'Looks best in earthy tones or soft whites. Skip neon on heavy weaves.',
  Silk: 'Catches the light well. Jewel tones look richest.',
  Polyester: 'Sheen makes bright colors pop. Neons can look harsh.',
  Wool: 'Suits deep, rich solids better than pale washes.',
  Nylon: 'Bold contrast works well on athletic nylon.',
  Acrylic: 'Medium-depth tones look cleaner than very pale shades.',
  Rayon: 'Drapes well in jewel or earth tones.',
  Spandex: 'Saturated prints pair best with neutral layers.',
  Leather: 'Rich earth and burgundy age better than pale washes.',
  Suede: 'Camel, tan, and muted jewels suit matte suede.',
  Abaca: 'Cream, gold, and earth tones suit abaca and sinamay.',
};

export function getSkinToneColorGuidance(
  skinTone: SkinTone | null,
  dominantFabric: string,
  compositions?: FabricComposition[],
  skinUndertone?: SkinUndertone | null,
  colorSeason?: ColorSeason | null,
): SkinToneColorGuidance | null {
  if (!colorSeason && !skinTone) {
    return null;
  }

  const fabric = resolveSupportedFabric(dominantFabric, compositions);
  const cleanedLabel = dominantFabric.replace(/\s*dominant\s*/i, '').trim();
  const detectedFabricLabel = fabric ?? (cleanedLabel || 'this material');

  let recommended: ColorRecommendationGroup[];
  let avoid: string[];

  if (colorSeason) {
    const season = SEASON_GUIDANCE[colorSeason];
    recommended = [...season.recommended];
    avoid = [...season.avoid];
  } else {
    const base = SKIN_TONE_GUIDANCE[skinTone!];
    recommended = [...base.recommended];
    avoid = [...base.avoid];

    if (skinUndertone) {
      const undertone = UNDERTONE_GUIDANCE[skinUndertone];
      recommended = [...recommended, undertone.recommended];
      avoid = [...avoid, ...undertone.avoid];
    }
  }

  const significant = (compositions ?? [])
    .filter((item) => item.percentage >= 15)
    .sort((a, b) => b.percentage - a.percentage);
  const isBlend = significant.length >= 2;
  const primaryNote = fabric ? (FABRIC_COLOR_NOTES[fabric] ?? null) : null;
  const fabricNote = primaryNote
    ? isBlend
      ? `${primaryNote} Judge this blend as a whole.`
      : primaryNote
    : isBlend
      ? 'Judge this blend by how the finished garment looks in light.'
      : null;

  return {
    skinTone: skinTone ?? null,
    skinUndertone: skinUndertone ?? null,
    colorSeason: colorSeason ?? null,
    detectedFabricLabel,
    recommended,
    avoid,
    fabricNote,
  };
}
