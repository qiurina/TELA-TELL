import type { EcoAlternative, EcoClaim, FabricComposition } from '@/data/scans/mock-data';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';
import { resolveSources, type Source } from '@/data/fabrics/source-registry';

/**
 * A fabric appears here as an alternative only if a source we could read compares it with the
 * original fabric and reports an environmental benefit. Which fabrics to look at is the app
 * authors' own idea, not a research ranking, and the Basis sheet says so on every card. Where no
 * source supports a swap, no card is shown: `evidenceNotes` says what we did and did not find.
 *
 * Every card is built from typed claims (see `EcoClaim`), and its text is just those claims in
 * order, so what is shown always matches what is sourced. Rules for editing this file (from the
 * fabric-alternatives evidence audits):
 * - `fact`: what the item is. Needs no source if it is only a definition.
 * - `certification`: what a label requires, never proof of a lower impact. Needs a source.
 * - `benefit` / `tradeoff`: environmental evidence for or against the swap. Needs a source that
 *   directly studies that comparison, attributed and narrowed to the study's conditions. If a
 *   card has a benefit, show any known downside as a `tradeoff` next to it. Say so when a study
 *   is funded by, or its data come from, the maker of the fiber.
 * - Anything environmental that a source does not directly support stays out. Keep the card to
 *   plain facts instead of guessing, and do not add a swap just to fill a number of cards. A
 *   benefit in one category does not make a fabric more sustainable overall.
 * - No hand-feel, drape, sheen or breathability comparisons, no statements about local demand or
 *   what collection programs accept (tell people to ask), and no "verified" or "certified"
 *   unless a source establishes it.
 * - Resale and donate tips share the reuse claims below. Upcycling and repair tips are practical
 *   ideas with no claimed environmental benefit.
 */
export type EcoGuidance = {
  ecoAlternatives: EcoAlternative[];
  /**
   * What we checked when there is nothing to suggest. Shown instead of a card, with its sources
   * on the Basis sheet. Never a recommendation.
   */
  evidenceNotes: EcoClaim[];
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
  /** Evidence behind the resale and donate tips, shown on the reuse Basis sheet. */
  reuseClaims: EcoClaim[];
  /** Source ids used by `reuseClaims`. */
  reuseSourceIds: string[];
};

export type EcoGuidanceContext = {
  kind: 'mostly' | 'mixed';
  title: string;
  detail?: string;
};

export type EcoGuidanceResult = EcoGuidance & {
  context: EcoGuidanceContext;
};

type EcoFiberGuide = EcoGuidance;

function uniqueSourceIds(claims: EcoClaim[]): string[] {
  return [...new Set(claims.flatMap((claim) => claim.sourceIds ?? []))];
}

/**
 * Builds a card whose text and source list come straight from its claims. Claims marked
 * `basisOnly` are left out of the card text but still appear, with their sources, on the Basis sheet.
 */
function alternative(name: string, claims: EcoClaim[]): EcoAlternative {
  const sourceIds = uniqueSourceIds(claims);
  return {
    name,
    claims,
    similarity: claims
      .filter((claim) => !claim.basisOnly)
      .map((claim) => claim.text)
      .join(' '),
    ...(sourceIds.length > 0 ? { sourceIds } : {}),
  };
}

const fact = (text: string, sourceIds?: string[]): EcoClaim => ({ kind: 'fact', text, sourceIds });
const certification = (text: string, sourceIds: string[]): EcoClaim => ({
  kind: 'certification',
  text,
  sourceIds,
});
const benefit = (
  text: string,
  sourceIds: string[],
  extra: Partial<Pick<EcoClaim, 'aspect' | 'basisOnly'>> = {},
): EcoClaim => ({ kind: 'benefit', text, sourceIds, ...extra });
const tradeoff = (
  text: string,
  sourceIds: string[],
  extra: Partial<Pick<EcoClaim, 'aspect' | 'basisOnly'>> = {},
): EcoClaim => ({ kind: 'tradeoff', text, sourceIds, ...extra });

const REUSE_CLAIMS: EcoClaim[] = [
  benefit(
    'Reselling or donating clothes usually has less environmental impact than throwing them away, mainly when the item replaces buying something new.',
    ['sandin-peters-2018'],
  ),
  tradeoff(
    'The benefit can disappear if the item does not replace a new purchase, or if extra transport is needed.',
    ['sandin-peters-2018'],
  ),
];

const REUSE_SOURCE_IDS = uniqueSourceIds(REUSE_CLAIMS);

const ASK_LOCAL = 'Ask your barangay hall or a local charity what clothes they accept.';

/** Lenzing-based findings: the same 2010 study is the only comparison of TENCEL we could read. */
const TENCEL_FIBER_FACT = fact('A man-made fiber made from cellulose, a plant material.');

const TENCEL_TRADEOFF = tradeoff(
  'That study covers fiber production only, up to the factory gate, and its fiber data came from Lenzing, which makes TENCEL.',
  ['shen-cellulose-2010'],
  { aspect: 'Limits of the study' },
);

const NO_SWAP_FOUND = 'We found no study showing that a swap is better for the environment, so none is suggested.';

const ECO_GUIDANCE_BY_FIBER: Record<SupportedFabric, EcoFiberGuide> = {
  Cotton: {
    ecoAlternatives: [
      alternative('Organic cotton', [
        fact('Cotton grown organically.'),
        benefit(
          'A 2005 study found organic cotton can use less energy to grow than conventional cotton.',
          ['cherrett-sei-2005'],
          { aspect: 'Growing the cotton' },
        ),
        tradeoff(
          'That report cites organic yields 20-50% lower, so it needs more land.',
          ['cherrett-sei-2005'],
          { aspect: 'Land use' },
        ),
        certification(
          'A GOTS label covers processing, not the farm: at least 70% of the fiber must be certified organic.',
          ['gots-8-0'],
        ),
        // Industry-funded, and its own authors say it makes no formal comparison with conventional
        // cotton, so it is shown with that caveat on the Basis sheet and never as card text.
        benefit(
          'A 2014 industry-funded life-cycle study for Textile Exchange estimated 62% less non-renewable energy, and other savings, for organic cotton fiber. It says it makes no formal comparison with conventional cotton.',
          ['textile-exchange-organic-cotton-lca-2014'],
          { aspect: 'Industry-funded estimate', basisOnly: true },
        ),
      ]),
      alternative('Recycled cotton (rCotton)', [
        fact('Made partly from recycled cotton. Check the tag for how much.'),
        benefit(
          'A 2016 life-cycle report written for H&M found that recycling collected cotton clothes mechanically has a considerable potential to lower the overall environmental impact in the most important categories, though not in all.',
          ['wendin-2016-recycled-cotton'],
          { aspect: 'Making the fiber' },
        ),
        tradeoff(
          'A 2018 review of 41 studies found reuse and recycling benefits mainly come from avoiding new production, and may not occur if recycled products replace new ones only rarely.',
          ['sandin-peters-2018'],
          { aspect: 'Whether it replaces new fiber' },
        ),
      ]),
      alternative('TENCEL / lyocell', [
        TENCEL_FIBER_FACT,
        benefit(
          'A 2010 life-cycle study using Lenzing data ranked TENCEL among the fibers with the lowest overall impact and cotton as the least preferred choice, because of cotton\'s ecotoxicity, eutrophication, water use and land use.',
          ['shen-cellulose-2010'],
          { aspect: 'Making the fiber' },
        ),
        TENCEL_TRADEOFF,
      ]),
    ],
    evidenceNotes: [],
    reuse: {
      resale: "On Carousell or Facebook Marketplace, list the fiber shown on the garment's tag.",
      donate: ASK_LOCAL,
      upcycle: 'Cut into cleaning cloths, tote bags, or patchwork quilts.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Wool: {
    ecoAlternatives: [
      alternative('Recycled wool', [
        fact('Wool made fully or partly from recycled wool.'),
        certification(
          'A GRS label means an outside auditor checked the recycled content and how the product was made. Labeled products have at least 50% recycled content.',
          ['grs-manual-4-2', 'grs-quick-guide-2020'],
        ),
        benefit(
          'A 2022 life-cycle study of recycled wool fiber from one Italian producer found a carbon footprint of 0.1-0.9 kg CO2e per kg, against 10-103 kg CO2e per kg for virgin wool fiber.',
          ['bianco-2022-recycled-wool'],
          { aspect: 'Carbon footprint of the fiber' },
        ),
        tradeoff(
          'That study used data from one company, and its virgin wool range comes mostly from literature, so the size of the difference is uncertain.',
          ['bianco-2022-recycled-wool'],
          { aspect: 'Limits of the study' },
        ),
        // Funded by a wool industry body and combines recycled content with better care, so it is
        // shown with those caveats on the Basis sheet and never as card text.
        benefit(
          'A 2022 wool-industry-funded study found a recycled wool blend sweater kept with best-practice care had 66-90% lower climate, energy and water impacts per wear than a virgin pure wool sweater with standard care. The figure combines recycled content with better care.',
          ['wiedemann-2022-recycled-wool-sweater'],
          { aspect: 'Industry-funded estimate', basisOnly: true },
        ),
      ]),
    ],
    evidenceNotes: [],
    reuse: {
      resale: 'Mention any pilling or wear in your listing.',
      donate: 'Ask local craft groups whether they accept wool for felting.',
      upcycle: 'Felt into slippers, coasters, or insulation padding.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Silk: {
    ecoAlternatives: [],
    evidenceNotes: [fact(NO_SWAP_FOUND)],
    reuse: {
      resale: 'Describe the fiber as shown on the tag.',
      donate: 'Ask local theater or cultural groups whether they accept silk garments.',
      upcycle: 'Small panels can become hair accessories or ceremonial sashes.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Linen: {
    ecoAlternatives: [],
    evidenceNotes: [
      certification(
        'The Masters of FLAX FIBRE mark (formerly European Flax) covers where the flax was grown and some farming rules, such as not soaking the stalks in water.',
        ['masters-of-flax-fibre-claims-2025'],
      ),
      fact(NO_SWAP_FOUND),
    ],
    reuse: {
      resale: 'Steam or press linen before taking photos.',
      donate: ASK_LOCAL,
      upcycle: 'Napkins, table runners, or beach cover-ups.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Polyester: {
    ecoAlternatives: [
      // The two studies differ in both what they measure and which recycling route they cover:
      // Shen 2010 is manufacturing impact of fiber made from PET bottles; Persson 2026 is microfiber
      // shedding in laundering of fabrics with 30% mechanically recycled polyester fiber. Neither
      // covers the other, so show both, each with its own numbers and conditions.
      alternative('Recycled polyester', [
        fact('Made partly from recycled polyester.'),
        benefit(
          'A 2010 life-cycle study of fiber made from recycled PET bottles found it took less energy (40-85% less, depending on how the impacts were shared out) and produced fewer greenhouse gases (25-75% less) to make than new polyester.',
          ['shen-2010-pet'],
          { aspect: 'Making the fiber' },
        ),
        tradeoff(
          'A 2026 laundering study of fabrics with 30% recycled polyester found fiber recycled once shed no clearly different amount of microfibers than new polyester, but fiber recycled two or three times shed about 4.3 and 6.2 times more.',
          ['persson-2026'],
          { aspect: 'Washing clothes' },
        ),
      ]),
      alternative('TENCEL / lyocell blend', [
        TENCEL_FIBER_FACT,
        benefit(
          'A 2010 life-cycle study using Lenzing data ranked TENCEL below polyester (PET) in overall impact. Viscose made in Asia ranked about the same as PET.',
          ['shen-cellulose-2010'],
          { aspect: 'Making the fiber' },
        ),
        TENCEL_TRADEOFF,
      ]),
    ],
    evidenceNotes: [],
    reuse: {
      resale: 'Mention any odor or wear in your listing.',
      donate: 'Ask whether the program accepts synthetic fabrics.',
      upcycle: 'Stuffing for pillows, pet beds, or craft insulation.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Nylon: {
    ecoAlternatives: [
      alternative('Recycled nylon (Econyl)', [
        fact(
          'Recycled nylon that its maker, Aquafil, says is made from nylon waste such as fishing nets and old carpets.',
          ['aquafil-epd-econyl-2018', 'aquafil-sustainability-2023'],
        ),
        benefit(
          'Aquafil, the maker, reports 74% lower CO2 emissions for its ECONYL nylon 6 polymer than for its own standard nylon (1.69 kg CO2e per kg, up to the factory gate).',
          ['aquafil-lca-2024'],
          { aspect: 'Making the polymer' },
        ),
        tradeoff(
          'This is a manufacturer-reported figure from a one-page summary. We found no independent study of ECONYL.',
          ['aquafil-lca-2024'],
          { aspect: 'Limits of the evidence' },
        ),
      ]),
    ],
    evidenceNotes: [],
    reuse: {
      resale: 'List sportswear and bags separately with clear photos of wear.',
      donate: 'Ask whether the program accepts nylon items.',
      upcycle: 'Straps, cords, and patch reinforcements for bags.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Acrylic: {
    ecoAlternatives: [],
    evidenceNotes: [
      tradeoff(
        'A 2014 benchmarking study found fabric made of acrylic had less environmental impact than fabric made of cotton, from raw materials to discarded textile.',
        ['van-der-velden-2014'],
        { aspect: 'Acrylic compared with cotton' },
      ),
      fact(NO_SWAP_FOUND),
    ],
    reuse: {
      resale: 'Mention any pilling or stretch loss in your listing.',
      donate: 'Ask local craft groups whether they accept acrylic yarn from unraveled garments.',
      upcycle: 'Amigurumi stuffing, draft stoppers, or pet blankets.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Spandex: {
    ecoAlternatives: [],
    evidenceNotes: [
      tradeoff(
        'A 2014 benchmarking study found fabric made of elastane had less environmental impact than fabric made of cotton, from raw materials to discarded textile.',
        ['van-der-velden-2014'],
        { aspect: 'Elastane compared with cotton' },
      ),
      fact(
        'A 2025 laboratory study says even a low elastane content makes shredding less efficient, contaminates recycled streams and limits how well recovered fibers can be spun.',
        ['azevedo-2025-elastane'],
      ),
      fact(NO_SWAP_FOUND),
    ],
    reuse: {
      resale: 'List activewear and stretch denim with clear fiber notes.',
      donate: 'Confirm programs accept synthetic blends.',
      upcycle: 'Hair ties, elastic bands, or craft stretch panels.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Rayon: {
    ecoAlternatives: [],
    evidenceNotes: [
      tradeoff(
        'In a 2010 life-cycle study using Lenzing data, viscose made in Austria ranked among the lowest-impact fibers, but viscose made in Asia ranked about the same as polyester. The impact depends on who makes it.',
        ['shen-cellulose-2010'],
        { aspect: 'Differences between viscose makers' },
      ),
      fact(NO_SWAP_FOUND),
    ],
    reuse: {
      resale: 'Mention any shrinkage you know of.',
      donate: ASK_LOCAL,
      upcycle: 'Lining fabric, scarves, or craft backing.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Leather: {
    ecoAlternatives: [],
    evidenceNotes: [
      benefit(
        'A 2022 study funded by MycoWorks, which makes it, found one mycelium leather at pilot scale had 6.20 kg CO2e per m2 against 32.97 for a modeled bovine leather. The authors say this should not be extrapolated to all leather.',
        ['williams-2022-reishi'],
        { aspect: 'One company-funded product' },
      ),
      tradeoff(
        'A 2026 review says many commercial plant-based leathers still rely on petroleum-based resins or coatings, which can limit how biodegradable they are.',
        ['oleksinska-2026-bio-leather'],
        { aspect: 'Coatings' },
      ),
      fact(
        'We found no independent study showing that plant-based, recycled or canvas alternatives are better for the environment than leather, so none is suggested.',
      ),
    ],
    reuse: {
      resale: 'Photograph the grain, seams, and note any odor.',
      donate: 'Ask local craft groups whether they accept clean leather scraps.',
      upcycle: 'Patches, bookmarks, or small accessory panels.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Suede: {
    ecoAlternatives: [],
    evidenceNotes: [
      fact(
        'We found no study comparing suede with microfiber suede or other fabrics, so no swap is suggested.',
      ),
    ],
    reuse: {
      resale: 'Photograph the nap and note any wear.',
      donate: ASK_LOCAL,
      upcycle: 'Small pouches, patches, or craft appliqué.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
  Abaca: {
    ecoAlternatives: [],
    evidenceNotes: [
      fact('Abaca (Musa textilis) is used for ropes, textiles and specialty papers.', [
        'philfida-abaca-manual',
      ]),
      fact(
        'We found no study comparing abaca with linen, sisal, maguey or cotton, so no swap is suggested.',
      ),
    ],
    reuse: {
      resale:
        "Describe the fiber as the tag or maker states it. Don't call it abaca or sinamay unless confirmed.",
      donate: 'Ask local weaving cooperatives whether they accept clean plant-fiber yardage.',
      upcycle: 'Placemats, coasters, lampshades, or bag panels.',
    },
    reuseClaims: REUSE_CLAIMS,
    reuseSourceIds: REUSE_SOURCE_IDS,
  },
};

const MIXED_FIBER_GUIDANCE: EcoGuidance = {
  ecoAlternatives: [],
  evidenceNotes: [
    fact('Rescan one fabric area in even lighting, or check the garment tag, for a clearer match.'),
  ],
  reuse: {
    resale: 'Check the care label for fiber content before listing.',
    donate: "Check the garment's tag before donating.",
    upcycle: 'Test a small swatch before cutting into a project.',
  },
  reuseClaims: REUSE_CLAIMS,
  reuseSourceIds: REUSE_SOURCE_IDS,
};

function resolvePrimaryFiber(
  dominantFabric: string,
  compositions?: FabricComposition[],
): SupportedFabric | null {
  const fromDominant = resolveFabricAlias(dominantFabric);
  if (fromDominant) {
    return fromDominant;
  }

  const sorted = [...(compositions ?? [])].sort((a, b) => b.percentage - a.percentage);
  const top = sorted[0]?.material;

  if (top) {
    return resolveFabricAlias(top);
  }

  return null;
}

/**
 * Guidance is for the single most likely fiber. The classifier cannot measure a blend (its
 * top-3 are confidence scores), so there is no blend branch.
 */
export function getEcoGuidance(
  dominantFabric: string,
  compositions: FabricComposition[] = [],
): EcoGuidanceResult {
  const primary = resolvePrimaryFiber(dominantFabric, compositions);

  if (!primary) {
    return {
      ...MIXED_FIBER_GUIDANCE,
      context: {
        kind: 'mixed',
        title: 'Fiber unclear',
        detail: 'Check the garment tag when you can',
      },
    };
  }

  return {
    ...ECO_GUIDANCE_BY_FIBER[primary],
    context: {
      kind: 'mostly',
      title: `Likely ${primary}`,
    },
  };
}

export function getEcoAlternativeText(alternative: EcoAlternative): string {
  return alternative.similarity ?? alternative.description ?? '';
}

/** Sources behind a set of claims, in order of first use. */
export function getClaimSources(claims: EcoClaim[]): Source[] {
  return resolveSources(uniqueSourceIds(claims));
}

export function getAllGuides(): EcoGuidance[] {
  return [...Object.values(ECO_GUIDANCE_BY_FIBER), MIXED_FIBER_GUIDANCE];
}
