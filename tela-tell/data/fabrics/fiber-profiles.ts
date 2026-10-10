import type { CareInstruction } from '@/data/scans/mock-data';
import type { OccasionContext, WeatherContext } from '@/data/preferences/occasion-weather';
import type { SupportedFabric } from '@/data/fabrics/fabrics';

// The per-fiber sustainability score, rating and sub-scores that used to live here were retired
// (2026-10-11). The old values and the reasons are archived in docs/sustainability-score-archive.md.
export type FiberProfile = {
  fabric: SupportedFabric;
  scientificName: string;
  fiberType: string;
  description: string;
  production: string;
  breathability: string;
  durability: string;
  stretch: string;
  moisture: string;
  // texture uses vocabulary (Soft/Crisp/Slick/Stiff/etc.) that corresponds to real,
  // objectively-measurable fabric-hand properties under the Kawabata Evaluation System
  // for Fabrics (KES-F, Kawabata 1972) — an established textile-science instrument set
  // that quantifies bending, shear, compression, and surface friction and correlates them
  // to exactly this kind of hand-feel terminology. This file assigns the qualitative
  // label per fiber from general textile knowledge rather than a lab-measured KES-F score
  // per fiber (no such per-fiber dataset was located for all 12 fibers here), so treat the
  // vocabulary itself as grounded, the specific assignment per fiber as informed judgment.
  // weight (typical garment-weight range) has no equivalent measurement standard behind
  // it — it's a practical, descriptive category, not a claim.
  texture: string;
  weaveType: string;
  weight: string;
  origin: string;
  bestWeather: WeatherContext[];
  bestOccasion: OccasionContext[];
  // Follows the general temperature/heat conventions of ISO 3758:2023 (the GINETEX
  // international textile care-labeling standard: cold/low-heat as the conservative
  // default, natural protein fibers like wool needing gentler handling than plant/
  // synthetic fibers). These aren't independently researched per fiber beyond that
  // general framework, except where a fiber-specific source is noted inline (see Wool).
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

export const FIBER_PROFILES: Record<SupportedFabric, FiberProfile> = {
  Cotton: {
    fabric: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    fiberType: 'Natural plant-based fiber',
    description: 'A soft natural plant fiber. It feels cool and comfortable on skin.',
    production: 'Grown from cotton plants, spun into yarn, then woven or knitted.',
    breathability: 'High',
    durability: 'Medium',
    stretch: 'Low',
    // Moisture regain ~7-11% at standard test conditions (Mandal, Textile Learner,
    // "Comparison Table of Different Textile Fiber Properties") — one of the more
    // absorbent naturals, well above synthetics like polyester (~0.4%).
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
    breathability: 'High',
    durability: 'High',
    stretch: 'Medium',
    // Standard moisture regain ~17% (Mandal, Textile Learner comparison table) — the
    // highest of the common naturals measured this way. A distinct, larger figure
    // (~30% absorbed into the fiber core specifically) is cited separately in
    // comfort-profile.ts via The Woolmark Company; the two are different measurements,
    // not a contradiction.
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
    // The Woolmark Company's official guide recommends lukewarm water (~30°C), not
    // cold, for hand-washing wool. "Cold" here is a deliberately more conservative
    // choice (still well within the safe range Woolmark gives, just the cooler end of
    // it) rather than a factual error — cold water cannot damage wool the way hot
    // water can, so it's a safe simplification for a general-audience app.
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
    breathability: 'High',
    durability: 'Low',
    stretch: 'Low',
    // Moisture regain ~11% (Mandal, Textile Learner comparison table) — moderate,
    // between the low-absorption synthetics and the most absorbent naturals.
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
    breathability: 'Very high',
    durability: 'High',
    stretch: 'Low',
    // Moisture regain ~12% at standard test conditions (ASTM D2654 / ISO 139 equilibrium
    // regain convention, 20°C/65% RH — the same standard convention behind the other
    // fibers' regain figures in this file). Corrected 2026-09-27: previously misattributed
    // this specific number to the Alliance for European Flax-Linen-Hemp's "Flax fibre -
    // Performance and properties" page, which was directly checked and found to describe
    // linen's breathability/moisture-transfer only qualitatively, without stating this
    // percentage — that source still supports the general "hollow-tube structure aids
    // wicking and breathability" claim below, just not the specific number.
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
    breathability: 'Low',
    durability: 'High',
    stretch: 'Low',
    // Moisture regain ~0.4% (Mandal, Textile Learner comparison table) — among the
    // lowest of any fiber measured this way, why sweat stays on the surface instead
    // of being absorbed.
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
    breathability: 'Low',
    durability: 'Very high',
    stretch: 'High',
    // Moisture regain ~4% (Mandal, Textile Learner comparison table) — low relative
    // to naturals, though higher than polyester or acrylic.
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
    breathability: 'Low',
    durability: 'Medium',
    stretch: 'Medium',
    // Moisture regain ~1-2% (Mandal, Textile Learner comparison table) — low
    // absorption typical of synthetic fibers.
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
    breathability: 'Low',
    durability: 'Medium',
    stretch: 'Very high',
    // Moisture regain ~0.3-1.2% (CAMEO — Conservation & Art Materials Encyclopedia
    // Online, Museum of Fine Arts Boston, "Spandex fiber") — minimal absorption; in a
    // blend, moisture behavior mostly comes from whatever fiber spandex is combined with.
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
    breathability: 'High',
    durability: 'Low',
    stretch: 'Low',
    // Moisture regain ~13% for viscose rayon (Mandal, Textile Learner comparison
    // table) — among the more absorbent fibers measured this way, similar to wool.
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
    description: 'A plant fiber from Musa textilis, a banana-family plant. It is used for ropes, textiles and specialty papers.',
    production: 'Harvested, stripped, dried, and woven into sinamay or textile.',
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
