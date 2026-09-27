import type { CareInstruction, SustainabilityRating } from '@/data/scans/mock-data';
import type { OccasionContext, WeatherContext } from '@/data/preferences/occasion-weather';
import type { SupportedFabric } from '@/data/fabrics/fabrics';

export type SustainabilityBreakdown = {
  biodegradability: number;
  waterEfficiency: number;
  /**
   * SCOPE CLARIFIED (2026-09-27): this measures technical/infrastructure recyclability
   * (does common recycling machinery/process exist for this fiber), NOT the real-world
   * rate at which garments of this fiber actually get recycled - those are genuinely
   * different numbers. Global textile collection sits around just 14% regardless of
   * fiber type (Ellen MacArthur Foundation 2024, already cited in eco-alternatives.ts),
   * so even a fiber scoring high here should not be read as "this usually gets recycled
   * in practice." The UI copy ("commonly recyclable") means capability, not outcome.
   */
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

// sustainabilityScore = avg of the 4 breakdown values; normalized from the peer-reviewed and
// industry-report sources listed per fiber below (60+ numbered references in full at
// docs/fabric-score-sources.md — not a vague "research says" claim, each score traces to a
// specific study or standard).
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
    // ~10,000 L/kg water footprint (Mekonnen & Hoekstra 2011, Hydrology and Earth System
    // Sciences, "The green, blue and grey water footprint of crops and derived crop
    // products" - corrected from a previously-cited "2016" year, which doesn't match any
    // real Mekonnen & Hoekstra publication; ICAC 2025 corroborates), ~75% of it rainfed
    // rather than irrigated — see docs/fabric-score-sources.md
    // lowCarbon DISCLOSED (2026-09-27), not independently pinned to one figure: cotton's
    // carbon footprint is genuinely contested in the literature, not just inconsistently
    // reported — verified this directly, and found real studies ranging from ~2.5-3.7 kg
    // CO2e/kg (raw lint) up to 22-32 kg CO2e/kg (finished T-shirt-level GHG estimates),
    // driven by allocation methodology, system boundary, and whether farming/dyeing stages
    // are included. This is an open scientific disagreement, not a citable single number -
    // the score of 5 (Moderate) reflects a reasonable middle position within that range,
    // not a consensus figure.
    breakdown: { biodegradability: 9.5, waterEfficiency: 4.5, recyclability: 7.5, lowCarbon: 5 },
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
    sustainabilityScore: 4.9,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Worst carbon footprint of any fiber measured here (sheep methane) plus high water use —
    // Li et al. (2024, Journal of Cleaner Production, DOI 10.1016/j.jclepro.2024.141336) and
    // Bhatt & Abbassi (2021) both put farm-stage carbon at 20-60 kg CO2e/kg, the highest range
    // of any fiber in this set — see docs/fabric-score-sources.md refs [5]-[7] for the full trail.
    breakdown: { biodegradability: 8.5, waterEfficiency: 2.5, recyclability: 6.5, lowCarbon: 2 },
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
    sustainabilityScore: 5.6,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    breakdown: { biodegradability: 9, waterEfficiency: 3, recyclability: 5, lowCarbon: 5.5 },
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
    sustainabilityScore: 7.5,
    sustainabilityLabel: 'Sustainable',
    sustainabilityRating: 'green',
    // RECALCULATED (2026-09-27): previously sourced from the Misciano/SELVANE aggregator
    // (undated secondary) at "15-50 L/kg" — a real primary source exists after all, from
    // the SAME study already used for Cotton's water footprint: Mekonnen & Hoekstra (2011,
    // Hydrology and Earth System Sciences). Their table gives flax fibre (processed but
    // not spun) a total water footprint of 3,783 L/kg (2,866 green/rainfed + 481
    // blue/irrigated + 436 grey/pollution-dilution) - independently cross-confirmed via a
    // second secondary source quoting the same primary figures.
    // waterEfficiency rescored from this real figure, not guessed: two other fibers in
    // this file are already anchored to the same Mekonnen & Hoekstra water-footprint scale
    // (Wool 17,000 L/kg -> 2.5; Cotton 10,000 L/kg -> 4.5), giving a consistent rate of
    // ~1 point per 3,500 L/kg over that range. Extrapolating that same rate from Cotton's
    // anchor down to Linen's 3,783 L/kg gives ~6.3 (4.5 + (10,000-3,783)/3,500). This is a
    // linear interpolation from two real data points on the same primary source, not an
    // independently invented number - but it IS an approximation, not itself a published
    // score, since the original scorer's exact L/kg-to-point formula isn't documented
    // anywhere. sustainabilityScore recomputed to match (avg of the 4 breakdown values,
    // per this file's own documented convention): (9.5+6.3+7+7)/4 = 7.45, rounds to 7.5 -
    // still clears the >=7.5 "green/Sustainable" threshold in build-scan-profile.ts, so the
    // fiber's displayed tier is unchanged despite the corrected underlying number.
    breakdown: { biodegradability: 9.5, waterEfficiency: 6.3, recyclability: 7, lowCarbon: 7 },
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
    sustainabilityScore: 5.5,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    // Low process water and moderate carbon per kg raise production impact even though it
    // barely biodegrades and sheds the most microplastic of any fiber tested. CORRECTED
    // (2026-09-27): these are two separate claims that were previously both attributed to
    // Napper & Thompson (2016) and De Falco et al. (2020) - but those two papers are
    // specifically about microfiber SHEDDING, not biodegradability, so they only actually
    // support the shedding half of this claim (see docs/fabric-score-sources.md refs
    // [12]-[13]). The biodegradability half now has its own real, current, directly
    // relevant source: Erayman Yuksel, Y., & Korkmaz, Y. (2026). Soil biodegradation of
    // virgin and recycled cotton and PET based fabrics. Biodegradation, 37, 124. DOI:
    // 10.1007/s10532-026-10343-5. Found zero degradation for 100% PET fabric after 1, 4,
    // and 7 months of soil burial, versus 93-95% degradation for cotton after just 1 month
    // - a direct, current, comparative confirmation of this exact claim.
    // lowCarbon DISCLOSED (2026-09-27), same treatment as Cotton above: polyester's carbon
    // footprint is also genuinely contested, not just under-cited - verified real studies
    // ranging from ~3.7-4.5 t CO2e/t fiber up to 11.6-73.4 kg CO2e/kg at the finished
    // T-shirt level, varying by whether older (2001-2016-vintage) industry LCA data or
    // newer primary studies are used. The score of 6.5 (Moderate-good) is a reasonable
    // position within that disputed range, not a single settled figure.
    breakdown: { biodegradability: 1.5, waterEfficiency: 7.5, recyclability: 6.5, lowCarbon: 6.5 },
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
    sustainabilityScore: 5.5,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    // ADDED (2026-09-27): biodegradability score previously had no citation in this file.
    // Changes in the Chemical and Physical Properties of Untreated and Finished Polyamide
    // 6.6 Fabrics Buried in Different Soil Matrices, from the Lab-Scale to a House Garden
    // (2026). Sustainable Chemistry, 7(1), 13. DOI: 10.3390/suschem7010013. Found no
    // significant weight loss or macroscopic degradation for polyamide 6.6 fabric across
    // soil-burial trials from lab-scale to real outdoor garden conditions.
    breakdown: { biodegradability: 2, waterEfficiency: 7, recyclability: 7, lowCarbon: 6 },
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
    sustainabilityScore: 4.4,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Highest microplastic shedding rate of any fiber tested (122 fibers/g per wash); no direct water/carbon study found for acrylic specifically — see docs/fabric-score-sources.md
    // Biodegradability score ADDED (2026-09-27), previously uncited: "Current status on the
    // biodegradability of acrylic polymers: microorganisms, enzymes and metabolic pathways
    // involved" (2021). Applied Microbiology and Biotechnology, 105(3). DOI:
    // 10.1007/s00253-020-11073-1. Polyacrylonitrile is an addition-polymerized thermoplastic
    // that cannot be depolymerized back to its monomer, a structural barrier to
    // biodegradation distinct from (and more severe than) most other synthetics reviewed.
    breakdown: { biodegradability: 2, waterEfficiency: 7.5, recyclability: 4.5, lowCarbon: 3.5 },
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
    sustainabilityScore: 3.8,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // REMOVED (2026-09-27): this comment previously gave a specific "~200 years to break
    // down in landfill" estimate. Searched multiple real avenues for a rigorous primary
    // source for that specific number - peer-reviewed biodegradation journals, an EPA
    // textile-waste data page, a GAO textile-waste report, and materials-science
    // degradation-kinetics literature - and none state this figure or any other specific
    // landfill decomposition timeframe for polyurethane. It appears to be a widely-repeated
    // number with no traceable rigorous origin, so it has been removed rather than kept as
    // an uncited precise-sounding figure. What real peer-reviewed research DOES confirm
    // (the lowest biodegradability score in this file, 1, is based on this): polyurethane
    // degrades very slowly under both environmental and lab conditions, is not practically
    // recyclable at scale, and is overwhelmingly landfilled or incinerated as post-consumer
    // waste. The shedding-rises-with-share finding is separately real and peer-reviewed
    // (Persson et al. 2026) - see docs/fabric-score-sources.md refs [14], [28]-[29] for the
    // full trail, including this correction.
    breakdown: { biodegradability: 1, waterEfficiency: 7, recyclability: 4, lowCarbon: 3 },
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
    sustainabilityScore: 5.9,
    sustainabilityLabel: 'Moderate',
    sustainabilityRating: 'yellow',
    // Processing still uses toxic carbon disulfide, but forest-sourcing has improved industry-wide (Canopy Hot Button Report 2025) — see docs/fabric-score-sources.md
    // Biodegradability score ADDED (2026-09-27), previously uncited: "Native and regenerated
    // cellulose show similar environmental biodegradation behavior across global terrestrial
    // and aquatic ecosystems" (2025), bioRxiv. Found viscose/rayon biodegrades at rates
    // comparable to cotton and linen. Caveat: this is a bioRxiv preprint, not yet published
    // in a peer-reviewed journal - weaker-tier evidence than the journal-published citations
    // elsewhere in this file, though it is a recent, directly relevant, large-scope study.
    breakdown: { biodegradability: 7.5, waterEfficiency: 5.5, recyclability: 5.5, lowCarbon: 5 },
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
    sustainabilityScore: 4.6,
    sustainabilityLabel: 'Low',
    sustainabilityRating: 'red',
    // Chromium tanning is documented to pollute waterways and farmland; ~126L water + 2.83kg
    // chemicals per m² of finished leather — Scientific Reports (2024, DOI
    // 10.1038/s41598-024-84726-0), Environmental Chemistry Letters (2025), and Water Quality
    // Research Journal/IWA (2023); see docs/fabric-score-sources.md refs [21]-[23].
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
