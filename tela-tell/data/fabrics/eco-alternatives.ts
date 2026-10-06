import type { EcoAlternative, FabricComposition } from '@/data/scans/mock-data';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';

/**
 * The specific swap-this-for-that RECOMMENDATIONS below (why this alternative is worth
 * considering for a Philippine secondhand shopper) are hand-authored practical guidance,
 * not independently verified against research — same category as fabric-allergies.ts's
 * alternative suggestions. There is no dataset ranking whether Tencel or cotton is the
 * "better" swap for a given shopper; that judgment call is inherently editorial.
 *
 * However, the certifications and named materials referenced within those suggestions
 * are real, verifiable standards, not invented labels — confirmed directly:
 * - GOTS (Global Organic Textile Standard) — verifies organic fiber content and
 *   environmentally/socially responsible processing, from raw material to labeling.
 * - GRS (Global Recycled Standard) — verifies traceable recycled content (20%+ to
 *   certify, 50%+ to carry the label) plus labor and chemical-safety criteria.
 * - ECONYL — Aquafil's real regenerated-nylon product line, chemically recycled from
 *   fishing nets and other nylon waste since 2011; retains virgin-nylon quality.
 * - Peace silk / ahimsa silk — a real, named production method (moths allowed to
 *   emerge before the cocoon is processed, rather than boiled with the pupa inside).
 * - Tencel / lyocell's "closed-loop processing" and "moisture-wicking" descriptions are
 *   confirmed directly from Lenzing (the actual manufacturer): TENCEL™ Lyocell recovers
 *   over 99.8% of its solvent in production, and absorbs ~12-13% of its weight in
 *   moisture (vs. cotton's ~7-8%) via sub-microscopic fibril channels.
 * - "European Flax" (Linen entry) is a real certification mark (CELC, created 2012, now
 *   "Masters of FLAX FIBRE(TM)"), guaranteeing European-grown flax under zero-irrigation,
 *   zero-GMO, no-chemical-retting standards, third-party verified by Bureau Veritas.
 * - "Mindanao plant fiber" (Abaca, under Wool's alternatives) — verified: Mindanao
 *   provinces are a real, significant abaca-growing region (Davao Oriental alone ~8.5% of
 *   national production per 2025 PSA data), though Bicol/Catanduanes is the larger
 *   producer overall; the claim is accurate, not the full national picture.
 * - "Sisal / maguey blends... other PH plant fibers" (Abaca entry) — verified: maguey
 *   (Agave cantala, "Manila maguey") has been cultivated in the Philippines since 1783 as
 *   a genuine local fiber-crop industry, distinct from but related to true sisal (Agave
 *   sisalana).
 * Where a specific factual claim within a suggestion is research-backed beyond the
 * standard/product's own definition (e.g. recycled polyester's shedding behavior),
 * that's cited inline at the relevant entry.
 */
export type EcoGuidance = {
  ecoAlternatives: EcoAlternative[];
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
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

const ECO_GUIDANCE_BY_FIBER: Record<SupportedFabric, EcoFiberGuide> = {
  Cotton: {
    ecoAlternatives: [
      {
        name: 'Organic cotton',
        similarity: 'Soft, breathable everyday wear. Look for GOTS tags in ukay.',
      },
      {
        name: 'Linen-cotton blend',
        similarity: 'Comfortable with a crisper hand. Holds shape in humidity.',
      },
      {
        name: 'Recycled cotton (rCotton)',
        similarity: 'Same hand-feel for shirts and dresses. Popular with upcyclers.',
      },
    ],
    reuse: {
      resale: 'List as cotton or blend on Carousell or Facebook Marketplace if gently used.',
      donate: 'Most barangay textile drives accept cotton garments.',
      upcycle: 'Cut into cleaning cloths, tote bags, or patchwork quilts.',
    },
  },
  Wool: {
    ecoAlternatives: [
      {
        name: 'Recycled wool',
        similarity: 'Warm layers with loft. Look for GRS (Global Recycled Standard) tags in imported ukay.',
      },
      {
        name: 'Lightweight cotton blend',
        similarity: 'Light layering without heavy insulation. Suited to cool climates.',
      },
      {
        name: 'Abaca',
        similarity: 'Strong outer layers. Mindanao plant fiber, breathable in heat.',
      },
    ],
    reuse: {
      resale: 'Niche winter-wear buyers online. Note pilling honestly.',
      donate: 'Check if local craft groups accept wool for felting.',
      upcycle: 'Felt into slippers, coasters, or insulation padding.',
    },
  },
  Silk: {
    ecoAlternatives: [
      {
        name: 'Abaca',
        similarity: 'Lustrous plant fiber for barong and Filipiniana. Common in formal ukay.',
      },
      {
        name: 'Rayon',
        similarity: 'Smooth formal hand-feel for flowy blouses and pre-owned formal wear.',
      },
      {
        name: 'Peace silk (ahimsa)',
        similarity: 'Comparable sheen and drape. Ethical alternative for formal wear.',
      },
    ],
    reuse: {
      resale: 'Market to formal-wear and cultural costume buyers with clear fiber notes.',
      donate: 'School theater or cultural groups may accept verified silk garments.',
      upcycle: 'Small panels can become hair accessories or ceremonial sashes.',
    },
  },
  Linen: {
    ecoAlternatives: [
      {
        name: 'European flax linen',
        similarity: 'Crisp, breathable summer fabric for tropical heat.',
      },
      {
        name: 'Abaca',
        similarity: 'Airy and strong. Good for resort wear and bags.',
      },
      {
        name: 'Cotton-linen blend',
        similarity: 'Relaxed feel with less wrinkling in humid storage.',
      },
    ],
    reuse: {
      resale: 'Summer linen sells well in vintage markets. Steam before photos.',
      donate: 'Warm-weather drives welcome linen blends.',
      upcycle: 'Napkins, table runners, or beach cover-ups.',
    },
  },
  Polyester: {
    ecoAlternatives: [
      {
        name: 'Recycled polyester (rPET)',
        // Persson et al. (2026, Env. Sci. & Technology) found mechanically recycled
        // polyester sheds *more* microplastic than virgin polyester after 2-3 recycling
        // cycles (see docs/fabric-score-sources.md, ref [14]) - don't recommend it as a
        // lower-shedding swap, only as a landfill-diversion one.
        similarity:
          'Diverts plastic from landfill. Doesn\'t shed less than virgin polyester - some studies found multi-cycle rPET sheds more.',
      },
      {
        name: 'Recycled nylon',
        similarity: 'Stretch and moisture-wicking. Better for sportswear than cotton.',
      },
      {
        name: 'Tencel / lyocell blend',
        similarity: 'Soft drape with closed-loop processing. Good for flowy pieces.',
      },
    ],
    reuse: {
      resale: 'Note odor and wear on listings. Athletic wear has steady demand.',
      donate: 'Confirm programs accept synthetics; not all drives do.',
      upcycle: 'Stuffing for pillows, pet beds, or craft insulation.',
    },
  },
  Nylon: {
    ecoAlternatives: [
      {
        name: 'Recycled nylon (Econyl)',
        similarity: 'Stretch, strength, and quick-dry. Made from nets and waste.',
      },
      {
        name: 'Recycled PET blend',
        similarity:
          'Durable and abrasion-resistant, and diverts plastic from landfill - but (same as recycled polyester) doesn\'t shed less than virgin material.',
      },
      {
        name: 'Organic cotton (low-intensity)',
        similarity: 'Natural option when stretch matters less. Breathable in tropical heat.',
      },
    ],
    reuse: {
      resale: 'List sportswear and bags separately with clear photos of wear.',
      donate: 'Limited acceptance. Prefer upcycle if heavily worn.',
      upcycle: 'Straps, cords, and patch reinforcements for bags.',
    },
  },
  Acrylic: {
    ecoAlternatives: [
      {
        name: 'Recycled acrylic knit',
        similarity: 'Lightweight warmth. Some brands offer recycled knits; check labels.',
      },
      {
        name: 'Wool blend',
        similarity: 'Natural insulation for short cool seasons vs. pure acrylic.',
      },
      {
        name: 'Cotton knit',
        similarity: 'Breathable everyday knits. Less heat-trapping in PH weather.',
      },
    ],
    reuse: {
      resale: 'Budget knitwear market. Disclose pilling and stretch loss.',
      donate: 'Craft groups may take acrylic yarn from unraveled garments.',
      upcycle: 'Amigurumi stuffing, draft stoppers, or pet blankets.',
    },
  },
  Spandex: {
    ecoAlternatives: [
      {
        name: 'Recycled elastane blends',
        similarity: 'Stretch and recovery. Some activewear lines use recycled spandex.',
      },
      {
        name: 'Cotton-spandex blend (GOTS)',
        similarity: 'Natural-dominant stretch for jeans and tees. Check fiber ratio on tags.',
      },
      {
        name: 'Loose linen or cotton',
        similarity: 'Non-stretch option when fit recovery matters less in tropical heat.',
      },
    ],
    reuse: {
      resale: 'List activewear and stretch denim with clear fiber notes.',
      donate: 'Confirm programs accept synthetic blends.',
      upcycle: 'Hair ties, elastic bands, or craft stretch panels.',
    },
  },
  Rayon: {
    ecoAlternatives: [
      {
        name: 'Tencel / lyocell',
        similarity: 'Flowy, lightweight drape. Gentler closed-loop cellulose processing.',
      },
      {
        name: 'Cotton voile',
        similarity: 'Soft blouse hand-feel. Breathable for dresses and tops.',
      },
      {
        name: 'Abaca',
        similarity: 'Philippine plant fiber with comparable breathability for formal wear.',
      },
    ],
    reuse: {
      resale: 'Flowy dresses and blouses sell well. Note shrink history if known.',
      donate: 'General textile drives usually accept rayon blends.',
      upcycle: 'Lining fabric, scarves, or craft backing.',
    },
  },
  Leather: {
    ecoAlternatives: [
      {
        name: 'Recycled leather (verified)',
        similarity: 'Durable bags and belts. Look for certified recycled hide labels.',
      },
      {
        name: 'Plant-based leather (verified)',
        similarity: 'Vegan structure for bags and shoes.',
      },
      {
        name: 'Heavy cotton canvas',
        similarity: 'Natural alternative for totes and outerwear.',
      },
    ],
    reuse: {
      resale: 'Vintage leather market. Photograph grain, seams, and odor.',
      donate: 'Craft groups may accept clean leather scraps.',
      upcycle: 'Patches, bookmarks, or small accessory panels.',
    },
  },
  Suede: {
    ecoAlternatives: [
      {
        name: 'Recycled suede (verified)',
        similarity: 'Napped finish. Check certified recycled sources in premium secondhand.',
      },
      {
        name: 'Microfiber suede',
        similarity: 'Synthetic napped option without animal hide. Common in budget footwear.',
      },
      {
        name: 'Brushed cotton twill',
        similarity: 'Soft matte texture for casual layers without animal material.',
      },
    ],
    reuse: {
      resale: 'Note nap direction and wear. Suede buyers inspect texture closely.',
      donate: 'Limited acceptance. Prefer upcycle if heavily stained.',
      upcycle: 'Small pouches, patches, or craft appliqué.',
    },
  },
  Abaca: {
    ecoAlternatives: [
      {
        name: 'Cotton-linen blend',
        similarity: 'Softer everyday drape for warm climate pieces.',
      },
      {
        name: 'Linen',
        similarity: 'Breathable warm climate apparel. European flax with similar airiness.',
      },
      {
        name: 'Sisal / maguey blends',
        similarity: 'Strong ropes, bags, and home textiles from other PH plant fibers.',
      },
    ],
    reuse: {
      resale: 'List as Philippine abaca or sinamay to craft and formal-wear buyers.',
      donate: 'Weaving cooperatives may accept clean plant-fiber yardage.',
      upcycle: 'Placemats, coasters, lampshades, or bag panels.',
    },
  },
};

const MIXED_FIBER_GUIDANCE: EcoGuidance = {
  ecoAlternatives: [
    {
      name: 'Natural-dominant blend',
      similarity: 'Everyday comfort when labels are unclear. Choose cotton, linen, or PH fiber tags.',
    },
    {
      name: 'Recycled blended yarn',
      similarity: 'Mixed performance with less virgin synthetic. Ask sellers about fiber content.',
    },
      {
        name: 'Single-fiber rescan',
        similarity: 'Clearer match for alternatives. Rescan one fabric area in even lighting.',
      },
  ],
  reuse: {
    resale: 'Verify fiber type before listing. Buyers ask for composition on blends.',
    donate: 'Donate only after a clearer scan or label check.',
    upcycle: 'Test a small swatch before cutting into a project.',
  },
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
