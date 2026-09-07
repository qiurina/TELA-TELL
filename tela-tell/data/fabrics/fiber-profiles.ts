import type { CareInstruction, SustainabilityRating } from '@/data/scans/mock-data';
import type { OccasionContext, WeatherContext } from '@/data/preferences/occasion-weather';
import type { SupportedFabric } from '@/data/fabrics/fabrics';

export type SustainabilityBreakdown = {
  biodegradability: number;
  waterEfficiency: number;
  recyclability: number;
  lowCarbon: number;
};

export type FiberProfile = {
  fabric: SupportedFabric;
  scientificName: string;
  fiberType: string;
  description: string;
  production: string;
  sustainabilityScore: number;
  sustainabilityLabel: string;
  sustainabilityRating: SustainabilityRating;
  breakdown: SustainabilityBreakdown;
  breathability: string;
  durability: string;
  stretch: string;
  moisture: string;
  texture: string;
  weaveType: string;
  weight: string;
  origin: string;
  bestWeather: WeatherContext[];
  bestOccasion: OccasionContext[];
  careInstructions: CareInstruction[];
};

const FIBER_SLUGS: Record<SupportedFabric, string> = {
  Cotton: 'cotton',
  Wool: 'wool',
  Silk: 'silk',
  Linen: 'linen',
  Polyester: 'polyester',
  Nylon: 'nylon',
  Acrylic: 'acrylic',
  Spandex: 'spandex',
  Rayon: 'rayon',
  Leather: 'leather',
  Suede: 'suede',
  Abaca: 'abaca',
};

const SLUG_TO_FABRIC = Object.fromEntries(
  Object.entries(FIBER_SLUGS).map(([fabric, slug]) => [slug, fabric]),
) as Record<string, SupportedFabric>;

// sustainabilityScore = avg of the 4 breakdown values; normalized from published research, see docs/fabric-score-sources.md
export const FIBER_PROFILES: Record<SupportedFabric, FiberProfile> = {
  Cotton: {
    fabric: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    fiberType: 'Natural plant-based fiber',
    description: 'A soft natural plant fiber. It feels cool and comfortable on skin.',
    production: 'Grown from cotton plants, spun into yarn, then woven or knitted.',
    sustainabilityScore: 6.6,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    // ~10,000 L/kg water footprint (Mekonnen & Hoekstra 2016; ICAC 2025), ~75% of it rainfed rather than irrigated — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 9.5, waterEfficiency: 4.5, recyclability: 7.5, lowCarbon: 5 },
    breathability: 'High',
    durability: 'Medium',
    stretch: 'Low',
    moisture: 'Absorbs',
    texture: 'Soft',
    weaveType: 'Plain / Twill',
    weight: 'Light to medium',
    origin: 'Plant fiber',
    bestWeather: ['sunny', 'partly_cloudy', 'cloudy'],
    bestOccasion: ['casual', 'school', 'beach', 'home_wear', 'sleepwear', 'outdoor_activities'],
    careInstructions: [
      { text: 'Machine wash warm (30 to 40°C)', recommended: true },
      { text: 'Tumble dry on low heat', recommended: true },
      { text: 'Iron on medium heat', recommended: true },
      { text: 'Avoid bleach. It can cause yellowing', recommended: false },
      { text: 'Avoid high heat drying. It can shrink', recommended: false },
    ],
  },
  Wool: {
    fabric: 'Wool',
    scientificName: 'Ovis aries fleece',
    fiberType: 'Natural animal protein fiber',
    description: 'A warm fiber from sheep. It traps air and holds heat well.',
    production: 'Sheared from sheep, cleaned, carded, and spun into yarn.',
    sustainabilityScore: 4.9,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Worst carbon footprint of any fiber measured here (sheep methane) plus high water use — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 8.5, waterEfficiency: 2.5, recyclability: 6.5, lowCarbon: 2 },
    breathability: 'High',
    durability: 'High',
    stretch: 'Medium',
    moisture: 'Wicks slowly',
    texture: 'Lofty',
    weaveType: 'Knit / Felted',
    weight: 'Medium to heavy',
    origin: 'Animal fiber',
    bestWeather: ['cool', 'foggy', 'windy'],
    // 'outdoor_activities' removed: occasion-weather.ts's avoid-list for that context names
    // "Heavy wool" specifically ("too warm for most Philippine outdoor activity") — see
    // docs/profile-screen-audit.md for the full reconciliation between these two datasets.
    bestOccasion: ['office_work', 'travel'],
    careInstructions: [
      { text: 'Hand wash cold with mild soap', recommended: true },
      { text: 'Lay flat to dry', recommended: true },
      { text: 'Store with moth protection', recommended: true },
      { text: 'Avoid hot water. It can shrink and felt', recommended: false },
      { text: 'Avoid tumble dry on high heat', recommended: false },
    ],
  },
  Silk: {
    fabric: 'Silk',
    scientificName: 'Bombyx mori silk',
    fiberType: 'Natural animal protein fiber',
    description: 'A fine fiber with smooth shine and light drape.',
    production: 'Spun from silkworm cocoons, then woven into fine cloth.',
    sustainabilityScore: 5.6,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 9, waterEfficiency: 3, recyclability: 5, lowCarbon: 5.5 },
    breathability: 'High',
    durability: 'Low',
    stretch: 'Low',
    moisture: 'Light absorb',
    texture: 'Smooth',
    weaveType: 'Plain / Satin',
    weight: 'Light',
    origin: 'Animal fiber',
    bestWeather: ['cool', 'sunny', 'partly_cloudy'],
    bestOccasion: ['formal', 'wedding', 'party'],
    careInstructions: [
      { text: 'Hand wash cold or dry clean', recommended: true },
      { text: 'Steam to remove wrinkles', recommended: true },
      { text: 'Store away from direct sun', recommended: true },
      { text: 'Do not twist or scrub', recommended: false },
      { text: 'Avoid high heat ironing', recommended: false },
    ],
  },
  Linen: {
    fabric: 'Linen',
    scientificName: 'Linum usitatissimum',
    fiberType: 'Natural plant-based fiber',
    description: 'A crisp fiber from flax. It feels airy and cool in heat.',
    production: 'Flax stems are retted, spun, and woven into linen cloth.',
    sustainabilityScore: 8.1,
    sustainabilityLabel: 'Sustainable',
    sustainabilityRating: 'green',
    // Lowest water footprint of any fiber found (rain-fed flax) keeps this the top natural score — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 9.5, waterEfficiency: 9, recyclability: 7, lowCarbon: 7 },
    breathability: 'Very high',
    durability: 'High',
    stretch: 'Low',
    moisture: 'Absorbs fast',
    texture: 'Crisp',
    weaveType: 'Plain / Basket',
    weight: 'Light to medium',
    origin: 'Plant fiber',
    bestWeather: ['sunny', 'partly_cloudy'],
    // 'travel' removed: occasion-weather.ts's avoid-list for travel names "Pure linen"
    // ("wrinkles heavily in luggage") — see docs/profile-screen-audit.md.
    bestOccasion: ['casual', 'formal', 'wedding', 'beach'],
    careInstructions: [
      { text: 'Machine wash cold on gentle cycle', recommended: true },
      { text: 'Line dry to reduce shrinkage', recommended: true },
      { text: 'Iron while slightly damp', recommended: true },
      { text: 'Avoid over-drying in high heat', recommended: false },
    ],
  },
  Polyester: {
    fabric: 'Polyester',
    scientificName: 'Polyethylene terephthalate',
    fiberType: 'Synthetic petroleum-based fiber',
    description: 'A plastic-based fiber. It holds shape and dries fast.',
    production: 'Made from petroleum polymers, melted and extruded into fibers.',
    sustainabilityScore: 5.5,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    // Low process water and moderate carbon per kg raise production impact even though it barely biodegrades and sheds the most microplastic of any fiber tested — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 1.5, waterEfficiency: 7.5, recyclability: 6.5, lowCarbon: 6.5 },
    breathability: 'Low',
    durability: 'High',
    stretch: 'Low',
    moisture: 'Repels',
    texture: 'Smooth',
    weaveType: 'Knit / Woven',
    weight: 'Light to medium',
    origin: 'Synthetic',
    bestWeather: ['rainy', 'windy', 'thunderstorms'],
    bestOccasion: ['sports_gym', 'party', 'travel'],
    careInstructions: [
      { text: 'Machine wash cold', recommended: true },
      { text: 'Tumble dry low or air dry', recommended: true },
      { text: 'Use low heat when ironing', recommended: true },
      { text: 'Avoid high heat. It can melt fibers', recommended: false },
    ],
  },
  Nylon: {
    fabric: 'Nylon',
    scientificName: 'Polyamide synthetic',
    fiberType: 'Synthetic petroleum-based fiber',
    description: 'A strong synthetic fiber with stretch and a slick feel.',
    production: 'Made from synthetic polymers drawn into fine filaments.',
    sustainabilityScore: 5.5,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 2, waterEfficiency: 7, recyclability: 7, lowCarbon: 6 },
    breathability: 'Low',
    durability: 'Very high',
    stretch: 'High',
    moisture: 'Repels',
    texture: 'Slick',
    weaveType: 'Tight knit / Ripstop',
    weight: 'Light',
    origin: 'Synthetic',
    bestWeather: ['rainy', 'windy', 'thunderstorms'],
    bestOccasion: ['sports_gym', 'travel', 'outdoor_activities'],
    careInstructions: [
      { text: 'Machine wash cold in a mesh bag', recommended: true },
      { text: 'Air dry away from direct sun', recommended: true },
      { text: 'Check seams before buying to resell', recommended: true },
      { text: 'Avoid high heat. It weakens fibers', recommended: false },
    ],
  },
  Acrylic: {
    fabric: 'Acrylic',
    scientificName: 'Polyacrylonitrile synthetic',
    fiberType: 'Synthetic petroleum-based fiber',
    description: 'A synthetic fiber that mimics wool at lower cost.',
    production: 'Made from acrylonitrile polymers, spun into fluffy yarns.',
    sustainabilityScore: 4.4,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Highest microplastic shedding rate of any fiber tested (122 fibers/g per wash); no direct water/carbon study found for acrylic specifically — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 2, waterEfficiency: 7.5, recyclability: 4.5, lowCarbon: 3.5 },
    breathability: 'Low',
    durability: 'Medium',
    stretch: 'Medium',
    moisture: 'Repels',
    texture: 'Fluffy',
    weaveType: 'Knit',
    weight: 'Light to medium',
    origin: 'Synthetic',
    bestWeather: ['cool', 'cloudy', 'foggy'],
    // 'home_wear' and 'casual' removed: occasion-weather.ts's avoid-lists for those contexts
    // name "Scratchy acrylic" and "Thick acrylic" respectively — see
    // docs/profile-screen-audit.md.
    bestOccasion: ['travel'],
    careInstructions: [
      { text: 'Machine wash cold on gentle cycle', recommended: true },
      { text: 'Lay flat to dry', recommended: true },
      { text: 'Use a fabric shaver on pills', recommended: true },
      { text: 'Avoid high heat drying', recommended: false },
    ],
  },
  Spandex: {
    fabric: 'Spandex',
    scientificName: 'Polyurethane elastane',
    fiberType: 'Synthetic stretch fiber',
    description: 'A stretch fiber also called elastane or Lycra.',
    production: 'Made from polyurethane, usually blended in small amounts.',
    sustainabilityScore: 3.8,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Estimated ~200 years to break down in landfill, the most extreme non-biodegradability finding in this set — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 1, waterEfficiency: 7, recyclability: 4, lowCarbon: 3 },
    breathability: 'Low',
    durability: 'Medium',
    stretch: 'Very high',
    moisture: 'Repels',
    texture: 'Smooth',
    weaveType: 'Knit blend',
    weight: 'Light',
    origin: 'Synthetic',
    bestWeather: ['sunny', 'partly_cloudy', 'cloudy'],
    bestOccasion: ['sports_gym', 'beach', 'casual'],
    careInstructions: [
      { text: 'Wash cold on gentle cycle', recommended: true },
      { text: 'Air dry to protect stretch', recommended: true },
      { text: 'Skip fabric softener', recommended: true },
      { text: 'Avoid high heat. It breaks elasticity', recommended: false },
    ],
  },
  Rayon: {
    fabric: 'Rayon',
    scientificName: 'Regenerated cellulose',
    fiberType: 'Semi-synthetic plant-based fiber',
    description: 'A fiber from plant pulp. It drapes like silk.',
    production: 'Cellulose from wood or bamboo is dissolved, then spun into fiber.',
    sustainabilityScore: 5.9,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    // Processing still uses toxic carbon disulfide, but forest-sourcing has improved industry-wide (Canopy Hot Button Report 2025) — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 7.5, waterEfficiency: 5.5, recyclability: 5.5, lowCarbon: 5 },
    breathability: 'High',
    durability: 'Low',
    stretch: 'Low',
    moisture: 'Absorbs',
    texture: 'Flowy',
    weaveType: 'Plain / Twill',
    weight: 'Light',
    origin: 'Plant pulp',
    bestWeather: ['sunny', 'partly_cloudy'],
    bestOccasion: ['casual', 'office_work', 'school', 'party', 'home_wear', 'sleepwear'],
    careInstructions: [
      { text: 'Hand wash cold or delicate cycle', recommended: true },
      { text: 'Hang dry in shade', recommended: true },
      { text: 'Press water out gently', recommended: true },
      { text: 'Do not wring. Fiber is weak when wet', recommended: false },
    ],
  },
  Leather: {
    fabric: 'Leather',
    scientificName: 'Tanned animal hide',
    fiberType: 'Natural animal material',
    description: 'Treated animal hide. Firm, durable, and ages with patina.',
    production: 'Hides are tanned, dyed, and finished into leather goods.',
    sustainabilityScore: 4.6,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Chromium tanning is documented to pollute waterways and farmland; ~126L water + 2.83kg chemicals per m² of finished leather — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 4, waterEfficiency: 4, recyclability: 6, lowCarbon: 4.5 },
    breathability: 'Medium',
    durability: 'Very high',
    stretch: 'Low',
    moisture: 'Resists when treated',
    texture: 'Grain',
    weaveType: 'Non-woven hide',
    weight: 'Medium to heavy',
    origin: 'Animal hide',
    bestWeather: ['sunny', 'cool', 'cloudy'],
    // 'outdoor_activities' removed: occasion-weather.ts's avoid-list for that context names
    // "Leather" directly ("too stiff and heavy for active outdoor use") — see
    // docs/profile-screen-audit.md.
    bestOccasion: ['formal', 'travel'],
    careInstructions: [
      { text: 'Wipe with damp cloth and air dry', recommended: true },
      { text: 'Condition to prevent cracking', recommended: true },
      { text: 'Note scuffs honestly when reselling', recommended: true },
      { text: 'Avoid soaking. Humidity damages hide', recommended: false },
    ],
  },
  Suede: {
    fabric: 'Suede',
    scientificName: 'Napped split leather',
    fiberType: 'Natural animal material',
    description: 'Leather with a soft napped surface. Matte and velvety.',
    production: 'Hide is split and brushed to create a fuzzy nap.',
    sustainabilityScore: 4.4,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // No independent data for suede — proxied from Leather's tanning-process figures — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 3.5, waterEfficiency: 4, recyclability: 5.5, lowCarbon: 4.5 },
    breathability: 'Medium',
    durability: 'Medium',
    stretch: 'Low',
    moisture: 'Absorbs easily',
    texture: 'Napped',
    weaveType: 'Napped hide',
    weight: 'Medium',
    origin: 'Animal hide',
    bestWeather: ['sunny', 'cool'],
    bestOccasion: ['formal', 'party', 'travel'],
    careInstructions: [
      { text: 'Brush nap with a suede brush', recommended: true },
      { text: 'Spot clean only', recommended: true },
      { text: 'Use water repellent in humid storage', recommended: true },
      { text: 'Do not soak. Water marks stay visible', recommended: false },
    ],
  },
  Abaca: {
    fabric: 'Abaca',
    scientificName: 'Musa textilis',
    fiberType: 'Philippine native plant fiber',
    description: 'A strong fiber from banana family plants, grown across the Philippines.',
    production: 'Harvested, stripped, dried, and woven into sinamay or textile.',
    sustainabilityScore: 8.1,
    sustainabilityLabel: 'Sustainable',
    sustainabilityRating: 'green',
    // Biodegradability confirmed directly by PhilFIDA; water/carbon figures are inferred from rain-fed cultivation, not directly measured — see docs/fabric-score-sources.md
    breakdown: { biodegradability: 9.5, waterEfficiency: 8, recyclability: 8, lowCarbon: 7 },
    breathability: 'High',
    durability: 'Very high',
    stretch: 'Low',
    moisture: 'Resists',
    texture: 'Stiff',
    weaveType: 'Sinamay / Plain',
    weight: 'Light to medium',
    origin: 'Philippine plant',
    bestWeather: ['sunny', 'windy', 'partly_cloudy'],
    bestOccasion: ['formal', 'wedding', 'beach', 'outdoor_activities'],
    careInstructions: [
      { text: 'Spot clean with damp cloth', recommended: true },
      { text: 'Steam lightly to smooth creases', recommended: true },
      { text: 'Store flat in a dry place', recommended: true },
      { text: 'Avoid heavy washing', recommended: false },
    ],
  },
};

export function getFiberSlug(fabric: SupportedFabric): string {
  return FIBER_SLUGS[fabric];
}

export function getFiberProfile(fabric: SupportedFabric): FiberProfile {
  const profile = FIBER_PROFILES[fabric];
  if (!profile) {
    throw new Error(`No fiber profile found for "${fabric}".`);
  }
  return profile;
}

export function resolveFiberFromSlug(slug: string): SupportedFabric | null {
  return SLUG_TO_FABRIC[slug.trim().toLowerCase()] ?? null;
}
