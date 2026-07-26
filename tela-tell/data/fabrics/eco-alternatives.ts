import type { EcoAlternative, FabricComposition } from '@/data/scans/mock-data';
import { resolveFabricAlias, type SupportedFabric } from '@/data/fabrics/fabrics';

export type EcoGuidance = {
  ecoAlternatives: EcoAlternative[];
  recycledAwareness: string;
  reuse: {
    resale: string;
    donate: string;
    upcycle: string;
  };
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
    recycledAwareness:
      'Check for GOTS or recycled cotton tags. Verify fiber on blends before reselling.',
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
        similarity: 'Warm layers with loft. RWS labels appear in imported ukay.',
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
    recycledAwareness:
      'Wool is rare in Philippine ukay. Store with moth protection; felted scraps suit crafters.',
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
    recycledAwareness:
      'Heritage silk in ukay is often underpriced. Inspect for snags and yellowing.',
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
    recycledAwareness:
      'Linen wrinkles in humidity. Note care when listing on ukay.',
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
        similarity: 'Durable activewear from plastic bottles. Common in PH secondhand.',
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
    recycledAwareness:
      'Synthetics shed microplastics in wash. Use a Guppyfriend bag and air-dry.',
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
        similarity: 'Durable and abrasion-resistant. Good for bags and jackets.',
      },
      {
        name: 'Organic cotton (low-intensity)',
        similarity: 'Natural option when stretch matters less. Breathable in tropical heat.',
      },
    ],
    recycledAwareness:
      'Check elasticity and seams on nylon activewear before buying to resell.',
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
    recycledAwareness:
      'Acrylic knits pill quickly in ukay. Price accordingly and photograph texture.',
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
    recycledAwareness:
      'Spandex is almost always blended. Check labels; stretch-heavy synthetics shed more.',
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
    recycledAwareness:
      'Rayon weakens when wet. Wash gently; shrinkage is common on ukay finds.',
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
    recycledAwareness:
      'Leather ages with humidity. Condition before resale and note scuffs honestly.',
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
    recycledAwareness:
      'Suede stains easily in humid storage. Brush nap and disclose water marks.',
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
        similarity: 'Softer everyday drape for warm-climate pieces.',
      },
      {
        name: 'Linen',
        similarity: 'Breathable warm-climate apparel. European flax with similar airiness.',
      },
      {
        name: 'Sisal / maguey blends',
        similarity: 'Strong ropes, bags, and home textiles from other PH plant fibers.',
      },
    ],
    recycledAwareness:
      'Support Mindanao abaca weavers when buying new. In ukay, look for sinamay and barong panels.',
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
  recycledAwareness:
    'Mixed ukay finds are common. Rescan under even light or check the garment tag first.',
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

export function getDetectedFiberName(
  dominantFabric: string,
  compositions?: FabricComposition[],
): string {
  return resolvePrimaryFiber(dominantFabric, compositions) ?? 'this material';
}

export function getEcoGuidance(
  dominantFabric: string,
  compositions?: FabricComposition[],
): EcoGuidance {
  const primary = resolvePrimaryFiber(dominantFabric, compositions);

  if (!primary) {
    return MIXED_FIBER_GUIDANCE;
  }

  return ECO_GUIDANCE_BY_FIBER[primary];
}

export function formatDetectedLabel(dominantFabric: string): string {
  const trimmed = dominantFabric.trim();
  if (/^detected:/i.test(trimmed)) {
    return trimmed;
  }

  return `Primary material: ${trimmed}`;
}

export function getEcoAlternativeText(alternative: EcoAlternative): string {
  return alternative.similarity ?? alternative.description ?? '';
}
