import type { CareInstruction, SustainabilityRating } from '@/data/scans/mock-data';
import type { WeatherContext } from '@/data/preferences/occasion-weather';
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
  useCases: string[];
  careInstructions: CareInstruction[];
  philippineMarkets: string;
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
    sustainabilityScore: 8.2,
    sustainabilityLabel: 'Sustainable',
    sustainabilityRating: 'green',
    breakdown: { biodegradability: 9.5, waterEfficiency: 4, recyclability: 7.5, lowCarbon: 8.5 },
    breathability: 'High',
    durability: 'Medium',
    stretch: 'Low',
    moisture: 'Absorbs',
    texture: 'Soft',
    weaveType: 'Plain / Twill',
    weight: 'Light to medium',
    origin: 'Plant fiber',
    bestWeather: ['sunny', 'partly_cloudy', 'cloudy'],
    useCases: ['Casual wear', 'School uniform', 'Bedsheets', 'Towels', 'Hot weather'],
    careInstructions: [
      { text: 'Machine wash warm (30 to 40°C)', recommended: true },
      { text: 'Tumble dry on low heat', recommended: true },
      { text: 'Iron on medium heat', recommended: true },
      { text: 'Avoid bleach. It can cause yellowing', recommended: false },
      { text: 'Avoid high heat drying. It can shrink', recommended: false },
    ],
    philippineMarkets:
      'Very common in ukay-ukay, tiangge, and mall surplus shops. Check labels on blended tees and bedsheets. Cotton is easy to resell when gently used.',
  },
  Wool: {
    fabric: 'Wool',
    scientificName: 'Ovis aries fleece',
    fiberType: 'Natural animal protein fiber',
    description: 'A warm fiber from sheep. It traps air and holds heat well.',
    production: 'Sheared from sheep, cleaned, carded, and spun into yarn.',
    sustainabilityScore: 6.8,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 8.5, waterEfficiency: 6, recyclability: 6.5, lowCarbon: 6 },
    breathability: 'High',
    durability: 'High',
    stretch: 'Medium',
    moisture: 'Wicks slowly',
    texture: 'Lofty',
    weaveType: 'Knit / Felted',
    weight: 'Medium to heavy',
    origin: 'Animal fiber',
    bestWeather: ['cool', 'foggy', 'windy'],
    useCases: ['Sweaters', 'Coats', 'Scarves', 'Imported knits'],
    careInstructions: [
      { text: 'Hand wash cold with mild soap', recommended: true },
      { text: 'Lay flat to dry', recommended: true },
      { text: 'Store with moth protection', recommended: true },
      { text: 'Avoid hot water. It can shrink and felt', recommended: false },
      { text: 'Avoid tumble dry on high heat', recommended: false },
    ],
    philippineMarkets:
      'Less common in tropical ukay bins but appears in imported secondhand coats and scarves. Price higher pieces carefully for pilling and moth damage.',
  },
  Silk: {
    fabric: 'Silk',
    scientificName: 'Bombyx mori silk',
    fiberType: 'Natural animal protein fiber',
    description: 'A fine fiber with smooth shine and light drape.',
    production: 'Spun from silkworm cocoons, then woven into fine cloth.',
    sustainabilityScore: 7.4,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 9, waterEfficiency: 5.5, recyclability: 5, lowCarbon: 7 },
    breathability: 'High',
    durability: 'Low',
    stretch: 'Low',
    moisture: 'Light absorb',
    texture: 'Smooth',
    weaveType: 'Plain / Satin',
    weight: 'Light',
    origin: 'Animal fiber',
    bestWeather: ['cool', 'sunny', 'partly_cloudy'],
    useCases: ['Blouses', 'Barong lining', 'Scarves', 'Formal wear'],
    careInstructions: [
      { text: 'Hand wash cold or dry clean', recommended: true },
      { text: 'Steam to remove wrinkles', recommended: true },
      { text: 'Store away from direct sun', recommended: true },
      { text: 'Do not twist or scrub', recommended: false },
      { text: 'Avoid high heat ironing', recommended: false },
    ],
    philippineMarkets:
      'Found in formal ukay pieces, barong shops, and costume sellers. Heritage silk blends are often underpriced. Inspect for snags before buying to resell.',
  },
  Linen: {
    fabric: 'Linen',
    scientificName: 'Linum usitatissimum',
    fiberType: 'Natural plant-based fiber',
    description: 'A crisp fiber from flax. It feels airy and cool in heat.',
    production: 'Flax stems are retted, spun, and woven into linen cloth.',
    sustainabilityScore: 8.5,
    sustainabilityLabel: 'Sustainable',
    sustainabilityRating: 'green',
    breakdown: { biodegradability: 9.5, waterEfficiency: 7, recyclability: 7, lowCarbon: 8.5 },
    breathability: 'Very high',
    durability: 'High',
    stretch: 'Low',
    moisture: 'Absorbs fast',
    texture: 'Crisp',
    weaveType: 'Plain / Basket',
    weight: 'Light to medium',
    origin: 'Plant fiber',
    bestWeather: ['sunny', 'partly_cloudy'],
    useCases: ['Resort shirts', 'Pants', 'Table linen', 'Beach cover-ups'],
    careInstructions: [
      { text: 'Machine wash cold on gentle cycle', recommended: true },
      { text: 'Line dry to reduce shrinkage', recommended: true },
      { text: 'Iron while slightly damp', recommended: true },
      { text: 'Avoid over-drying in high heat', recommended: false },
    ],
    philippineMarkets:
      'Popular in resort wear ukay finds and surplus linen shirts. Wrinkles fast in humidity, so mention care honestly when listing online.',
  },
  Polyester: {
    fabric: 'Polyester',
    scientificName: 'Polyethylene terephthalate',
    fiberType: 'Synthetic petroleum-based fiber',
    description: 'A plastic-based fiber. It holds shape and dries fast.',
    production: 'Made from petroleum polymers, melted and extruded into fibers.',
    sustainabilityScore: 4.2,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    breakdown: { biodegradability: 2, waterEfficiency: 7.5, recyclability: 6.5, lowCarbon: 3.5 },
    breathability: 'Low',
    durability: 'High',
    stretch: 'Low',
    moisture: 'Repels',
    texture: 'Smooth',
    weaveType: 'Knit / Woven',
    weight: 'Light to medium',
    origin: 'Synthetic',
    bestWeather: ['rainy', 'windy', 'thunderstorms'],
    useCases: ['Athletic wear', 'Printed shirts', 'Jackets', 'Ukay blends'],
    careInstructions: [
      { text: 'Machine wash cold', recommended: true },
      { text: 'Tumble dry low or air dry', recommended: true },
      { text: 'Use low heat when ironing', recommended: true },
      { text: 'Avoid high heat. It can melt fibers', recommended: false },
    ],
    philippineMarkets:
      'Extremely common in ukay bins and fast fashion surplus. Look for rPET labels in athletic wear. Sheds microplastics in wash, so air dry when possible.',
  },
  Nylon: {
    fabric: 'Nylon',
    scientificName: 'Polyamide synthetic',
    fiberType: 'Synthetic petroleum-based fiber',
    description: 'A strong synthetic fiber with stretch and a slick feel.',
    production: 'Made from synthetic polymers drawn into fine filaments.',
    sustainabilityScore: 4.5,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    breakdown: { biodegradability: 2.5, waterEfficiency: 7, recyclability: 6, lowCarbon: 4 },
    breathability: 'Low',
    durability: 'Very high',
    stretch: 'High',
    moisture: 'Repels',
    texture: 'Slick',
    weaveType: 'Tight knit / Ripstop',
    weight: 'Light',
    origin: 'Synthetic',
    bestWeather: ['rainy', 'windy', 'thunderstorms'],
    useCases: ['Bags', 'Jackets', 'Sportswear', 'Hosiery'],
    careInstructions: [
      { text: 'Machine wash cold in a mesh bag', recommended: true },
      { text: 'Air dry away from direct sun', recommended: true },
      { text: 'Check seams before buying to resell', recommended: true },
      { text: 'Avoid high heat. It weakens fibers', recommended: false },
    ],
    philippineMarkets:
      'Common in ukay bags, windbreakers, and sportswear. Econyl and recycled nylon appear in curated secondhand shops. Test elasticity before resale.',
  },
  Acrylic: {
    fabric: 'Acrylic',
    scientificName: 'Polyacrylonitrile synthetic',
    fiberType: 'Synthetic petroleum-based fiber',
    description: 'A synthetic fiber that mimics wool at lower cost.',
    production: 'Made from acrylonitrile polymers, spun into fluffy yarns.',
    sustainabilityScore: 3.8,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
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
    useCases: ['Budget sweaters', 'Blankets', 'Scarves', 'Craft yarn'],
    careInstructions: [
      { text: 'Machine wash cold on gentle cycle', recommended: true },
      { text: 'Lay flat to dry', recommended: true },
      { text: 'Use a fabric shaver on pills', recommended: true },
      { text: 'Avoid high heat drying', recommended: false },
    ],
    philippineMarkets:
      'Budget knitwear in ukay and surplus stores. Pills quickly, so price listings honestly and photograph texture. Craft groups may take unraveled yarn.',
  },
  Spandex: {
    fabric: 'Spandex',
    scientificName: 'Polyurethane elastane',
    fiberType: 'Synthetic stretch fiber',
    description: 'A stretch fiber also called elastane or Lycra.',
    production: 'Made from polyurethane, usually blended in small amounts.',
    sustainabilityScore: 3.5,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    breakdown: { biodegradability: 1.5, waterEfficiency: 7, recyclability: 4, lowCarbon: 3 },
    breathability: 'Low',
    durability: 'Medium',
    stretch: 'Very high',
    moisture: 'Repels',
    texture: 'Smooth',
    weaveType: 'Knit blend',
    weight: 'Light',
    origin: 'Synthetic',
    bestWeather: ['sunny', 'partly_cloudy', 'cloudy'],
    useCases: ['Leggings', 'Jeans', 'Swimwear', 'Stretch tops'],
    careInstructions: [
      { text: 'Wash cold on gentle cycle', recommended: true },
      { text: 'Air dry to protect stretch', recommended: true },
      { text: 'Skip fabric softener', recommended: true },
      { text: 'Avoid high heat. It breaks elasticity', recommended: false },
    ],
    philippineMarkets:
      'Almost always blended in ukay denim and activewear. Check fiber ratio on tags. Stretch-heavy synthetics shed more microplastics in wash.',
  },
  Rayon: {
    fabric: 'Rayon',
    scientificName: 'Regenerated cellulose',
    fiberType: 'Semi-synthetic plant-based fiber',
    description: 'A fiber from plant pulp. It drapes like silk.',
    production: 'Cellulose from wood or bamboo is dissolved, then spun into fiber.',
    sustainabilityScore: 5.8,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 7.5, waterEfficiency: 5, recyclability: 5.5, lowCarbon: 5.5 },
    breathability: 'High',
    durability: 'Low',
    stretch: 'Low',
    moisture: 'Absorbs',
    texture: 'Flowy',
    weaveType: 'Plain / Twill',
    weight: 'Light',
    origin: 'Plant pulp',
    bestWeather: ['sunny', 'partly_cloudy'],
    useCases: ['Dresses', 'Blouses', 'Linings', 'Flowy ukay tops'],
    careInstructions: [
      { text: 'Hand wash cold or delicate cycle', recommended: true },
      { text: 'Hang dry in shade', recommended: true },
      { text: 'Press water out gently', recommended: true },
      { text: 'Do not wring. Fiber is weak when wet', recommended: false },
    ],
    philippineMarkets:
      'Common in flowy ukay dresses and blouses. Can shrink or lose shape if washed harshly. Good resale item when fabric is smooth and unstained.',
  },
  Leather: {
    fabric: 'Leather',
    scientificName: 'Tanned animal hide',
    fiberType: 'Natural animal material',
    description: 'Treated animal hide. Firm, durable, and ages with patina.',
    production: 'Hides are tanned, dyed, and finished into leather goods.',
    sustainabilityScore: 5.2,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 4, waterEfficiency: 4.5, recyclability: 6, lowCarbon: 5 },
    breathability: 'Medium',
    durability: 'Very high',
    stretch: 'Low',
    moisture: 'Resists when treated',
    texture: 'Grain',
    weaveType: 'Non-woven hide',
    weight: 'Medium to heavy',
    origin: 'Animal hide',
    bestWeather: ['sunny', 'cool', 'cloudy'],
    useCases: ['Jackets', 'Belts', 'Bags', 'Shoes'],
    careInstructions: [
      { text: 'Wipe with damp cloth and air dry', recommended: true },
      { text: 'Condition to prevent cracking', recommended: true },
      { text: 'Note scuffs honestly when reselling', recommended: true },
      { text: 'Avoid soaking. Humidity damages hide', recommended: false },
    ],
    philippineMarkets:
      'Vintage leather jackets and bags appear in ukay imports. Humidity ages leather fast. Condition before resale and photograph grain and odor.',
  },
  Suede: {
    fabric: 'Suede',
    scientificName: 'Napped split leather',
    fiberType: 'Natural animal material',
    description: 'Leather with a soft napped surface. Matte and velvety.',
    production: 'Hide is split and brushed to create a fuzzy nap.',
    sustainabilityScore: 4.8,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
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
    useCases: ['Shoes', 'Bags', 'Jackets', 'Accent panels'],
    careInstructions: [
      { text: 'Brush nap with a suede brush', recommended: true },
      { text: 'Spot clean only', recommended: true },
      { text: 'Use water repellent in humid storage', recommended: true },
      { text: 'Do not soak. Water marks stay visible', recommended: false },
    ],
    philippineMarkets:
      'Seen in ukay footwear and bags. Stains easily in humid tiangge storage. Disclose water marks and nap wear in online listings.',
  },
  Abaca: {
    fabric: 'Abaca',
    scientificName: 'Musa textilis',
    fiberType: 'Philippine native plant fiber',
    description: 'A strong fiber from banana family plants grown in Mindanao.',
    production: 'Harvested, stripped, dried, and woven into sinamay or textile.',
    sustainabilityScore: 9.1,
    sustainabilityLabel: 'Sustainable',
    sustainabilityRating: 'green',
    breakdown: { biodegradability: 9.5, waterEfficiency: 8.5, recyclability: 8, lowCarbon: 9 },
    breathability: 'High',
    durability: 'Very high',
    stretch: 'Low',
    moisture: 'Resists',
    texture: 'Stiff',
    weaveType: 'Sinamay / Plain',
    weight: 'Light to medium',
    origin: 'Philippine plant',
    bestWeather: ['sunny', 'windy', 'partly_cloudy'],
    useCases: ['Barong panels', 'Sinamay', 'Bags', 'Home textiles'],
    careInstructions: [
      { text: 'Spot clean with damp cloth', recommended: true },
      { text: 'Steam lightly to smooth creases', recommended: true },
      { text: 'Store flat in a dry place', recommended: true },
      { text: 'Avoid heavy washing', recommended: false },
    ],
    philippineMarkets:
      'Strong local supply from Mindanao weavers. Sinamay and barong panels show up in formal ukay and weaving cooperatives. Support local weavers when buying new.',
  },
};

export function getFiberSlug(fabric: SupportedFabric): string {
  return FIBER_SLUGS[fabric];
}

export function getFiberProfile(fabric: SupportedFabric): FiberProfile {
  return FIBER_PROFILES[fabric];
}

export function resolveFiberFromSlug(slug: string): SupportedFabric | null {
  return SLUG_TO_FABRIC[slug.trim().toLowerCase()] ?? null;
}
