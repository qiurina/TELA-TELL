import type { SupportedFabric } from '@/data/fabrics/fabrics';

/**
 * Eco tips content from "TELA-TELL | Microplastics & Sustainable Choices Guide" (12 materials).
 * Wording is copied from the guide as written; source IDs (S01-S21) refer to GUIDE_SOURCES below,
 * the guide's own offline bibliography. It is a separate list from source-registry.ts.
 */

export type GuideSourceId =
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06' | 'S07' | 'S08' | 'S09' | 'S10' | 'S11'
  | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18' | 'S19' | 'S20' | 'S21';

export type GuideSource = {
  id: GuideSourceId;
  /** Author or organization and year, as printed in the guide. */
  citation: string;
  title: string;
  url: string;
};

export type FiberEcoGuide = {
  classification: string;
  shedding: string;
  reduceShedding: string;
  alternative: { name: string; reason: string };
  reuse: string;
  sourceIds: GuideSourceId[];
};

/**
 * The guide's "How to read this guide" and "Use note", shortened into plain words for thrift
 * (ukay-ukay) shoppers. Same points: a photo guess, not a measurement; natural fibers shed but are
 * not plastic; shedding depends on the fabric; health effects are unclear.
 */
export const ECO_GUIDE_HOW_TO_READ =
  "The scan guesses the fabric from a photo. It can't tell the exact fiber mix, any coating, how much it sheds, or any health risk.";

export const ECO_GUIDE_USE_NOTE =
  "All fabrics shed tiny fibers, but natural ones like cotton aren't plastic. How much a piece sheds depends on how it's made and used. Health effects from wearing clothes are still unclear.";

/**
 * The guide's everyday advice, shown under each fiber's own "How to reduce shedding" tip. Two of
 * its five lines ("Wash only when needed; follow the label." and "For synthetics, use shorter,
 * cooler, gentler cycles.") are left out because every fiber's own tip already covers washing.
 */
export const ECO_GUIDE_EXTRA_REDUCE_TIPS = {
  all: [
    'Consider a properly maintained washing-machine microfiber filter; dispose of trapped lint in household trash.',
    'Air dry when suitable; avoid unnecessary rubbing and abrasive cleaning.',
  ],
  syntheticOnly: [
    'If a synthetic textile is heavily fraying, prefer appropriate textile take-back over turning it into a frequently washed cleaning rag.',
  ],
} as const;

export function getExtraReduceTips(isSynthetic: boolean): readonly string[] {
  return isSynthetic
    ? [...ECO_GUIDE_EXTRA_REDUCE_TIPS.all, ...ECO_GUIDE_EXTRA_REDUCE_TIPS.syntheticOnly]
    : ECO_GUIDE_EXTRA_REDUCE_TIPS.all;
}

export const ECO_GUIDE: Record<SupportedFabric, FiberEcoGuide> = {
  Cotton: {
    classification: 'Natural plant fiber',
    shedding: 'Natural lint possible; plastic microfibers: no, if pure.',
    reduceShedding: 'Wash only when needed; use a gentle, cool cycle.',
    alternative: { name: 'Linen', reason: 'Breathable plant fiber; European flax often needs little irrigation.' },
    reuse: 'Repair or turn worn cotton into a reusable bag or cleaning cloth.',
    sourceIds: ['S18', 'S05', 'S07', 'S09', 'S15'],
  },
  Wool: {
    classification: 'Natural animal fiber',
    shedding: 'Wool lint possible; plastic microfibers: no, if pure.',
    reduceShedding: 'Air between wears; wash gently when needed.',
    alternative: {
      name: 'Recycled wool',
      reason: "Keeps wool's warmth and odor resistance while avoiding new fiber production.",
    },
    reuse: 'Darn holes or remake usable wool as patches or a scarf.',
    sourceIds: ['S18', 'S08', 'S15', 'S19'],
  },
  Silk: {
    classification: 'Natural animal fiber',
    shedding: 'Silk microfibers possible; plastic microfibers: no, if pure.',
    reduceShedding: 'Follow delicate-care instructions; avoid unnecessary washing.',
    alternative: {
      name: 'Responsibly sourced lyocell',
      reason: 'Soft, flowing fabric without raising silkworms; check forest sourcing.',
    },
    reuse: 'Repair or make small reusable accessories from scraps.',
    sourceIds: ['S18', 'S16', 'S12', 'S11', 'S15'],
  },
  Linen: {
    classification: 'Natural plant fiber',
    shedding: 'Linen lint possible; plastic microfibers: no, if pure.',
    reduceShedding: 'Use gentle care and repair worn seams.',
    alternative: { name: 'Recycled cotton', reason: 'Softer for some everyday garments and reuses existing fibers.' },
    reuse: 'Turn linen scraps into napkins or storage bags.',
    sourceIds: ['S18', 'S09', 'S07', 'S15', 'S19'],
  },
  Polyester: {
    classification: 'Plastic-based synthetic fiber',
    shedding: 'Plastic microfiber shedding: variable; often higher for brushed fleece.',
    reduceShedding: 'Wash less, cold and gently; use a microfiber filter if available.',
    alternative: {
      name: 'Linen for everyday wear; wool for fleece',
      reason: 'Linen breathes; wool insulates. Both avoid plastic-fiber shedding if pure.',
    },
    reuse: 'Make sound fabric into a low-use storage pouch; use textile collection if badly frayed.',
    sourceIds: ['S01', 'S02', 'S04', 'S05', 'S09', 'S08', 'S15', 'S21'],
  },
  Nylon: {
    classification: 'Plastic-based synthetic fiber',
    shedding: 'Plastic microfiber shedding: possible; amount varies with fabric construction.',
    reduceShedding: 'Limit abrasion and washing; use gentle cycles and a filter.',
    alternative: {
      name: 'Cotton canvas or abaca for bags',
      reason: 'Durable plant-fiber options for everyday bags, but not equally waterproof.',
    },
    reuse: 'Reuse intact panels as a tool roll or occasional-use bag.',
    sourceIds: ['S01', 'S02', 'S04', 'S05', 'S14', 'S15'],
  },
  Acrylic: {
    classification: 'Plastic-based synthetic fiber',
    shedding: 'Plastic microfiber shedding: can be high in some sweaters or fuzzy knits.',
    reduceShedding: 'Wash only when needed, gently; catch fibers with a filter.',
    alternative: {
      name: 'Wool, or cotton knit if avoiding animal fibers',
      reason: 'Wool offers warmth; cotton knit offers softness without plastic fibers if pure.',
    },
    reuse: 'Repurpose intact fabric for rarely handled storage; collect if heavily pilled.',
    sourceIds: ['S01', 'S02', 'S03', 'S05', 'S08', 'S15', 'S21'],
  },
  Spandex: {
    classification: 'Plastic-based synthetic fiber (often a blend)',
    shedding: 'Plastic microfiber shedding: possible; no reliable fiber-wide rate.',
    reduceShedding: 'Avoid harsh heat and frequent washing; follow care label.',
    alternative: {
      name: 'Rib-knit cotton for low-stretch needs',
      reason: "Knitted cotton has some give, but cannot fully replace spandex's recovery.",
    },
    reuse: 'Repair stretch clothing; reuse intact panels or seek textile take-back.',
    sourceIds: ['S01', 'S10', 'S05', 'S15'],
  },
  Rayon: {
    classification: 'Regenerated plant-cellulose fiber (viscose)',
    shedding: 'Sheds cellulosic microfibers; these are not polyester-type microplastics.',
    reduceShedding: 'Use the care label; gentle washing helps limit fabric wear.',
    alternative: {
      name: 'Traceable, closed-loop lyocell',
      reason: 'Similarly soft; cleaner solvent recovery is possible with responsible sourcing.',
    },
    reuse: 'Mend or upcycle into scarves or lightweight accessories.',
    sourceIds: ['S18', 'S11', 'S12', 'S20', 'S05', 'S15'],
  },
  Leather: {
    classification: 'Animal hide material',
    shedding: 'Surface particles possible; hide itself is not plastic; coatings may be.',
    reduceShedding: 'Brush or wipe instead of unnecessary washing; maintain finish.',
    alternative: {
      name: 'Cotton canvas for bags',
      reason: 'Can make sturdy bags without animal tanning; less water-resistant.',
    },
    reuse: 'Repair shoes or bags; make durable patches from offcuts.',
    sourceIds: ['S17', 'S13', 'S07', 'S15', 'S18'],
  },
  Suede: {
    classification: 'Animal hide material (napped leather)',
    shedding: 'Nap may wear and shed leather dust; not plastic unless coated.',
    reduceShedding: 'Use a suede brush; minimize rubbing and wet cleaning.',
    alternative: {
      name: 'Brushed 100% cotton',
      reason: 'Soft, matte textile feel without animal tanning, but not identical durability.',
    },
    reuse: 'Restore and reuse; make small pouches from sound offcuts.',
    sourceIds: ['S17', 'S13', 'S07', 'S15', 'S18'],
  },
  Abaca: {
    classification: 'Natural plant fiber',
    shedding: 'Plant fibers may fray; plastic microfibers: no, if pure.',
    reduceShedding: 'Avoid abrasive washing; maintain seams and edges.',
    alternative: {
      name: 'Linen for softer clothing',
      reason: 'Another plant fiber; more suitable for softer apparel than coarse abaca.',
    },
    reuse: 'Weave or reuse sound material as baskets, mats, or cordage.',
    sourceIds: ['S14', 'S09', 'S15', 'S18'],
  },
};

export const GUIDE_SOURCES: Record<GuideSourceId, GuideSource> = {
  S01: {
    id: 'S01',
    citation: 'European Environment Agency (2022)',
    title: 'Microplastics from textiles: towards a circular economy for textiles in Europe',
    url: 'https://www.eea.europa.eu/en/analysis/publications/microplastics-from-textiles-towards-a-circular-economy-for-textiles-in-europe',
  },
  S02: {
    id: 'S02',
    citation: 'Carney Almroth et al. (2018)',
    title: 'Quantifying shedding of synthetic fibers from textiles; a source of microplastics released into the environment',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5766707/',
  },
  S03: {
    id: 'S03',
    citation: 'Napper & Thompson (2016)',
    title: 'Release of synthetic microplastic plastic fibres from domestic washing machines',
    url: 'https://pubmed.ncbi.nlm.nih.gov/27686821/',
  },
  S04: {
    id: 'S04',
    citation: 'Ocean Wise (2022)',
    title: 'Wash cycle conditions shown to have significant impact on microfiber shedding',
    url: 'https://ocean.org/blog/wash-cycle-conditions-shown-to-have-significant-impact-on-microfiber-shedding/',
  },
  S05: {
    id: 'S05',
    citation: 'U.S. National Park Service (n.d.)',
    title: 'Reducing Laundry Microfibers',
    url: 'https://www.nps.gov/articles/000/laundry_microplastics.htm',
  },
  S06: {
    id: 'S06',
    citation: 'World Health Organization (2022)',
    title: 'Dietary and inhalation exposure to nano- and microplastic particles and potential implications for human health',
    url: 'https://www.who.int/publications/i/item/9789240054608',
  },
  S07: {
    id: 'S07',
    citation: 'World Wildlife Fund (n.d.)',
    title: 'Sustainable Cotton: Securing the Future of the Industry',
    url: 'https://www.worldwildlife.org/our-work/food/sustainable-agriculture/cotton/',
  },
  S08: {
    id: 'S08',
    citation: 'Textile Exchange (n.d.)',
    title: 'Wool',
    url: 'https://textileexchange.org/wool/',
  },
  S09: {
    id: 'S09',
    citation: 'Alliance for European Flax-Linen & Hemp (n.d.)',
    title: 'Environmental features of European Flax-Linen',
    url: 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-environmental-features',
  },
  S10: {
    id: 'S10',
    citation: 'Textile Exchange (n.d.)',
    title: 'Other Synthetics',
    url: 'https://textileexchange.org/other-synthetics/',
  },
  S11: {
    id: 'S11',
    citation: 'Canopy (n.d.)',
    title: 'CanopyStyle',
    url: 'https://canopyplanet.org/change-together/canopystyle',
  },
  S12: {
    id: 'S12',
    citation: 'Textile Exchange (n.d.)',
    title: 'Other Manmade Cellulosic Fibers',
    url: 'https://textileexchange.org/other-manmade-cellulosics/',
  },
  S13: {
    id: 'S13',
    citation: 'UNIDO (2000)',
    title: 'The Scope for Decreasing Pollution Load in Leather Processing',
    url: 'https://www.unido.org/publications/ot/9654232',
  },
  S14: {
    id: 'S14',
    citation: 'DOST-PCAARRD (n.d.)',
    title: 'Abaca Industry Profile',
    url: 'https://ispweb.pcaarrd.dost.gov.ph/isp-commodities/abaca/',
  },
  S15: {
    id: 'S15',
    citation: 'WRAP (n.d.)',
    title: 'Household Waste Prevention Hub: Re-use – Clothing',
    url: 'https://www.wrap.ngo/resources/guide/textiles/clothing',
  },
  S16: {
    id: 'S16',
    citation: 'Astudillo, Thalwitz & Vollrath (2014)',
    title: 'Life cycle assessment of Indian silk',
    url: 'https://www.sciencedirect.com/science/article/pii/S0959652614005939',
  },
  S17: {
    id: 'S17',
    citation: 'International Council of Tanners (n.d.)',
    title: 'Code of Practice on Labelling & Designation',
    url: 'https://leather-council.org/what-we-do/labelling-descriptions-of-leather/code-of-practice-on-labelling-designation/',
  },
  S18: {
    id: 'S18',
    citation: 'European Environment Agency (2026)',
    title: 'Microplastic from synthetic textiles unintentionally released into the environment in the EU',
    url: 'https://www.eea.europa.eu/en/circularity/sectoral-modules/textiles/microplastic-from-synthetic-textiles-unintentionally-released-into-the-environment-in-the-eu',
  },
  S19: {
    id: 'S19',
    citation: 'Textile Exchange (n.d.)',
    title: 'Materials Portfolio',
    url: 'https://textileexchange.org/materials-portfolio/',
  },
  S20: {
    id: 'S20',
    citation: 'Textile Exchange (n.d.)',
    title: 'Lyocell',
    url: 'https://textileexchange.org/glossary/lyocell/',
  },
  S21: {
    id: 'S21',
    citation: 'University of Plymouth (2020)',
    title: 'Study shows devices can reduce fibres produced in laundry cycle by up to 80%',
    url: 'https://www.plymouth.ac.uk/news/study-shows-devices-can-reduce-fibres-produced-in-laundry-cycle-by-up-to-80',
  },
};

export function getGuideSources(ids: readonly GuideSourceId[]): GuideSource[] {
  return ids.map((id) => GUIDE_SOURCES[id]);
}
